# Modo demo — SaldApp Frontend

Permite publicar el frontend **sin backend** (por ejemplo en Vercel) para que cualquiera pueda probar la app con datos ficticios. Una sola variable decide el modo:

| `VITE_DEMO_MODE` | Comportamiento |
|------------------|----------------|
| `true` | Ninguna petición sale a la red. Un backend simulado dentro del propio navegador responde con grupos de ejemplo y se muestra un aviso arriba. |
| cualquier otro valor (por defecto) | Comportamiento normal contra el backend real (`VITE_API_BASE_URL`). |

> Vite incrusta las variables `VITE_*` **al compilar**. Cambiar de modo exige volver a compilar y desplegar (`npm run build`, o un nuevo deploy en Vercel); no basta con cambiar la variable en un sitio ya publicado.

## Activarlo

En local:

```bash
VITE_DEMO_MODE=true npm run dev                      # desarrollo
VITE_DEMO_MODE=true npm run build && npm run preview # lo mismo que se publica
```

O en un archivo `.env` (ver `.env.example`): `VITE_DEMO_MODE=true`. Con Docker: `docker build --build-arg VITE_DEMO_MODE=true -t saldapp-frontend-demo .`

## Desplegar en Vercel

| Ajuste | Valor |
|--------|-------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Variable de entorno | `VITE_DEMO_MODE=true` |
| `VITE_API_BASE_URL` | no definirla |

`frontend/vercel.json` redirige cualquier ruta a `index.html`, necesario para que recargar `/groups/1` funcione (react-router resuelve las rutas en el navegador).

## Pasar a backend real

Definí `VITE_DEMO_MODE=false` (o quitala) y `VITE_API_BASE_URL=https://tu-backend`, y volvé a desplegar. En un build de producción sin demo y sin `VITE_API_BASE_URL` la app falla al cargar con el mensaje `Missing VITE_API_BASE_URL ...` en la consola, en lugar de apuntar en silencio a otro lado. El backend debe permitir el origen del frontend en CORS (`CORS_ALLOWED_ORIGINS`).

Con el demo inactivo el código del demo **no** forma parte de `dist/`.

## Cómo funciona

- **Una sola fuente de configuración**: `src/config/env.js` es el único módulo que lee `import.meta.env`. Expone `isDemoMode`, `apiBaseUrl` y `loadDemo`, la única puerta de entrada al código demo (importación dinámica; por eso no queda en el bundle cuando el demo está apagado).
- **Sin tocar services, hooks ni componentes**: en modo demo `httpClient` usa un `adapter` de axios (`src/demo/mockAdapter.js`) que enruta `MÉTODO + ruta` a handlers en memoria (`src/demo/api`). Como el adapter está *debajo* de los interceptores, respuestas y errores pasan por el mismo `response.data` y `parseApiError` que las reales. Una ruta sin handler responde `501` y avisa con `console.warn`.
- **Estado**: se guarda en `localStorage` con la clave `saldapp-demo:v1` (si cambia la forma del estado se sube la versión y los navegadores vuelven a los datos iniciales). Si `localStorage` no está disponible, el estado vive en memoria durante la sesión. Nada se comparte entre visitantes. "Restablecer datos de demo" (en el aviso) borra la clave y recarga.
- **Datos de ejemplo** (`src/demo/data/seedGroups.js`): un viaje con 7 personas y varios pagadores, una casa compartida y un asado ya cerrado y saldado. En la página de inicio, la sección "Grupos de ejemplo" da acceso directo a cada uno porque la app no tiene listado de grupos. Los ids son globales (como las secuencias de la base de datos), así que un grupo nuevo es el `#4`.
- **Cálculo con paridad con el backend** (`src/demo/domain`): dinero en centavos enteros (redondeo `HALF_UP` como `BigDecimal`), reparto igual con los centavos sobrantes sin asignar, y `SettlementCalculator` portado junto con el orden de iteración de `HashMap` y el desempate de `PriorityQueue` de Java, de los que depende el orden de salida.
- **Contrato del backend**: formas de respuesta, mensajes de validación, reglas del grupo cerrado (409), cuerpos de error y latencia artificial de 150–400 ms.

## Pruebas

```bash
npm test    # node --test, sin dependencias nuevas
```

- `tests/settlementCalculator.test.js`: portado de `SettlementCalculatorTest.java`.
- Pruebas de paridad (`settlementCalculator`, `balanceCalculator`): 240 escenarios cuyo resultado esperado sale de **ejecutar el `SettlementCalculator.java` real** y una copia de la lógica de balances con `HashMap`/`BigDecimal` (`tests/oracle`). Los fixtures están versionados; para regenerarlos hace falta un JDK: `node tests/oracle/generate-fixtures.mjs`.
- `tests/mockApi.test.js`: la API simulada a través de axios real y `parseApiError`, con valores calculados a mano (balances, pagos sugeridos, errores 400/404/409/500/501).

## Diferencias conocidas con el backend

El backend no se ejecutó para construir esto: el cálculo se contrastó con el código Java real (ver arriba); validaciones y errores se derivaron de leer el código y de los comportamientos por defecto de Spring y Jackson.

- Si un campo incumple dos restricciones a la vez (p. ej. descripción vacía), el backend las une con coma en un orden no definido (Hibernate Validator devuelve un `Set`); el demo usa siempre el mismo orden.
- Un gasto con más de 2 decimales se guarda redondeado (`HALF_UP`, `NUMERIC(12,2)`). El backend devuelve el valor sin redondear en la respuesta del propio POST/PATCH; el demo siempre devuelve el valor guardado. Un monto que no cabe en la columna responde 500, como el backend.
- Los listados sin `ORDER BY` (integrantes, gastos de un integrante) dependen de la base de datos; el demo los devuelve por id.
- No se emula el crecimiento anticipado de la tabla de `HashMap` cuando 9 o más ids de un mismo grupo caen en el mismo bucket (no puede ocurrir con los ids del demo).
- Ids de ruta: se aceptan los de `Long` (`007` vale 7) y los demás dan 500 como en el backend, pero no se emulan formas que solo entiende Spring (como `0x10`). Si el cuerpo y la ruta son inválidos a la vez, el demo informa primero la ruta.
- `endDate` de un grupo cerrado tiene precisión de milisegundos; el backend, la de su base de datos.
- El estado es por navegador: sin concurrencia, sin usuarios y con el límite de `localStorage`. Las sumas usan enteros de JavaScript (seguros hasta ~9×10¹³ en unidades).
- Un build sin demo conserva en el CSS las clases de Tailwind usadas por el aviso (unos pocos bytes); no hay JavaScript ni textos del demo.
