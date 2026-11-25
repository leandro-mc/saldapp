# Investigación y mejoras de UX/UI — SaldApp Frontend

Rediseño de la distribución y la usabilidad de la interfaz, hecho en la rama `feat/demo-mode`. Este documento resume en qué se basó, qué se encontró, qué se decidió y qué se verificó (y qué no).

## 1. Método

1. **Investigación**: pautas de accesibilidad, de formularios y de tablas en móvil, más el patrón de las apps de gastos compartidos.
2. **Auditoría** de la interfaz existente en escritorio (1366 px) y móvil (390 px): capturas, lectura del código y [axe-core](https://github.com/dequelabs/axe-core) (reglas WCAG 2.0/2.1/2.2 A y AA, más buenas prácticas).
3. **Implementación** por bloques, cada uno verificado en Chrome (headless) antes de subirse.

## 2. Qué se tomó de la investigación

| Fuente | Qué se aplicó |
|--------|---------------|
| [WCAG 2.2 – Tamaño mínimo del objetivo (2.5.8)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) y [2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | Mínimo de 24×24 px (AA) y, como meta para pantallas táctiles, 44×44 px: todos los botones miden 44 px en móvil. |
| [NN/g – Placeholders en campos de formulario](https://www.nngroup.com/articles/form-design-placeholders/), [Deque](https://www.deque.com/blog/accessible-forms-the-problem-with-placeholders/), [Baymard](https://baymard.com/research-articles/mobile-forms-avoid-inline-labels) | Etiquetas siempre visibles y asociadas al campo; el placeholder solo da un ejemplo; la ayuda va en texto visible, no escondida. |
| [Chrome – Tablas responsivas](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-atoms/responsive-table), [Smashing](https://smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1), [Accessibility Developer Guide](https://accessibility-developer-guide.com/examples/tables/responsive) | Con pocas columnas y acciones por fila, mostrar filas apiladas es más usable en móvil que una tabla con scroll horizontal. |
| Apps de gastos compartidos (Splitwise, Tricount) | Patrón conocido: resumen del grupo, saldos por persona, una acción principal para agregar un gasto y la liquidación a la vista. Se tomó como referencia general de organización, no se copió ninguna pantalla. |
| Heurísticas de usabilidad de Nielsen (visibilidad del estado, prevención de errores, reconocer antes que recordar) | Confirmaciones tras cada acción, errores junto al campo, explicar antes de que algo falle, acciones destructivas separadas y confirmadas. |

## 3. Hallazgos de la auditoría

| Problema | Evidencia |
|----------|-----------|
| No había forma de volver al inicio desde un grupo | Sin cabecera ni enlace. |
| Cada cambio vaciaba la página entera con un "Cargando…" | `refresh()` activaba `loading` y la página desmontaba todo: se perdían foco, scroll y formularios. |
| En móvil las acciones (Editar, Eliminar, Detalles) quedaban fuera de pantalla | La columna "Acciones" estaba en una tabla con scroll horizontal. |
| Acciones diminutas y pegadas | 71 objetivos por debajo de 24 px según axe. |
| Al abrir los gastos de alguien aparecía una tercera columna | Tabla de integrantes comprimida (nombres partidos en 2 líneas, acciones en 3). |
| Etiquetas sin asociar a su campo, y errores genéricos en inglés al final del formulario | 6 campos sin etiqueta accesible; errores de la API mostrados como `payedBy: ...`. |
| La liquidación, lo que más interesa, estaba oculta tras un botón | Un recuadro casi vacío con "Ver liquidación actual". |
| Los grupos de ejemplo quedaban bajo un formulario largo, y el aviso de demo ocupaba 154 px fijos en móvil | Capturas. |
| Textos y detalles | `Total €-0.03`, "Correspondiente P/P", "(optional)", "Descripcion", `<html lang="en">`, título "saldapp-frontend", clases con errores de tipeo (`clasName`, `focus-ring-1`). |
| Sin semántica de página | Sin `<main>` ni encabezado `h1`/`h2` coherentes. |

## 4. Decisiones

- **Estructura de la página de grupo**: cabecera (dónde estás, estado, acciones del grupo) → tres cifras (total, cuota por persona, integrantes) → acciones frecuentes → cuerpo en dos columnas: balances y gastos a la izquierda, "Cómo saldar las cuentas" a la derecha (fija al desplazarse en pantallas anchas). En móvil, una columna en ese mismo orden.
- **Filas en lugar de tablas** para balances, gastos y pagos. Cada fila dice qué es cada número ("Pagó €…", "Recibe"/"Debe") y las acciones caben siempre.
- **"Recibe / Debe / Al día" además del color y el signo**, para no depender de distinguir verde de rojo.
- **Formularios en ventanas modales** (`<dialog>` nativo: foco atrapado, Escape, fondo inerte, foco que vuelve al botón que la abrió). Agregar mantiene la ventana abierta y confirma cada alta para cargar varios gastos o personas seguidos; editar se cierra al guardar.
- **Validación por campo**: los errores evidentes se detectan al instante y en español; los que devuelve la API se muestran junto a su campo; el foco va al primer campo inválido.
- **Refresco en segundo plano**: lo que depende de un cambio se vuelve a leer sin sustituir la página por un cargador. Los hooks mantienen `loading` solo para la primera carga.
- **Liquidación siempre visible**, en vez de oculta tras un botón.
- **Eliminar un integrante con gastos se explica antes de intentarlo**; los fallos de otras acciones se muestran dentro del diálogo.
- **Aviso de demo**: alineado con el contenido; en móvil son dos líneas cortas y las acciones se abren a demanda.
- **Home**: en modo demo los grupos de ejemplo van primero (es la entrada más rápida); luego crear y entrar por ID.
- **Cabecera con enlace al inicio, enlace "Saltar al contenido", `<main>`, `lang="es"`, título de pestaña por grupo.**

## 5. Resultados medidos

axe-core sobre inicio, grupo abierto, grupo con gastos desplegados y grupo cerrado, en escritorio y móvil:

| | Antes | Después |
|--|-------|---------|
| Nodos con problemas (suma de las 8 combinaciones) | 354 | 0 |

**Cómo leer esa cifra**: 252 de los 354 nodos eran de la regla `region`, que nace de una sola causa (no había `<main>`). Los problemas distintos eran: tamaño de objetivo (71 nodos), etiquetas y selects sin nombre (12), orden de encabezados (6), landmark principal (8), contraste (2), cabecera de tabla vacía (2) y región con scroll sin acceso por teclado (1).

Otros datos verificados en Chrome: sin desbordamiento horizontal en ninguna pantalla a 390 px; aviso de demo de 77 px de alto en móvil (antes 154 px, medido en la captura original); la página no se remonta al agregar, editar o eliminar (comprobado conservando referencias a nodos del DOM); en modo demo, cero peticiones XHR/fetch durante el flujo completo.

## 6. Qué no se verificó

- **Lectores de pantalla reales** (NVDA, VoiceOver, TalkBack): solo reglas automáticas y semántica revisada en el código. axe detecta una parte de los problemas de accesibilidad, no todos.
- **Safari y Firefox**, ni dispositivos reales: solo Chrome headless en dos tamaños. En particular, Safari no enfoca los botones al hacer clic, y allí el foco vuelve al `body` al cerrar una ventana si el botón no tenía el foco.
- No hay usuarios reales en esta evaluación: es una revisión experta, no una prueba de usabilidad.
- Los scripts de verificación (Puppeteer + axe-core) no están versionados para no añadir dependencias; el proyecto no tiene pruebas de interfaz.

## 7. Pendientes recomendados

- **Lista de todos los gastos del grupo**: hoy solo se ven los gastos de un integrante a la vez, porque el backend no expone `GET /groups/{id}/expenses`. Es la mejora de usabilidad de mayor valor que queda y requiere un endpoint nuevo.
- **Mensajes de la API en inglés** ("Description must be between 4 and 500 characters"): hoy se muestran tal cual junto al campo. Lo ideal es devolver códigos de error y traducirlos en el frontend.
- **Rama `frontend/agents-mejorar-interfaz-gastos`**: tiene un commit sin integrar que toca los mismos archivos (formularios, `IntegrantsSection`, `GroupPage`, un `Modal`). Habrá conflictos al combinarla con esta; conviene decidir cuál prevalece (ver `docs/decisiones-pendientes.md`).
- Recordar el integrante seleccionado en la URL para poder compartir o recargar esa vista.
