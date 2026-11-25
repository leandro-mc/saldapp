# SaldApp — Frontend

> Read in English: [README.md](README.md)

Aplicación web para dividir gastos grupales. Creas un grupo, agregas integrantes y gastos, y ves de un vistazo quién le debe a quién. Backend complementario: [saldapp-backend](https://github.com/leandro-mc/saldapp-backend).

## Vista previa

<p>
  <img src="docs/screenshots/home.png" width="800" alt="Pantalla principal">
</p>
<p>
  <img src="docs/screenshots/open-group.png" width="800" alt="Grupo abierto">
</p>
<p>
  <img src="docs/screenshots/closed-group.png" width="800" alt="Grupo cerrado">
</p>

## Funciones

- Crear y gestionar grupos, integrantes y gastos
- Balance en vivo por integrante y plan de liquidación con el mínimo de pagos
- Los grupos cerrados pasan a una vista de solo lectura
- Estados de carga, error y confirmación manejados de forma consistente

## Tecnologías

- React 19 y Vite
- React Router 7
- Axios con un interceptor global que normaliza los errores de la API
- Tailwind CSS 4
- ESLint

## Cómo ejecutarlo

Requisitos: Node.js 22+ y el [backend](https://github.com/leandro-mc/saldapp-backend) corriendo en `http://localhost:8080`.

```bash
git clone https://github.com/leandro-mc/saldapp-frontend.git
cd saldapp-frontend
cp .env.example .env     # VITE_API_BASE_URL apunta al backend
npm install
npm run dev              # http://localhost:5173
```

## Modo demo (sin backend)

Con `VITE_DEMO_MODE=true` la app corre sin backend: un backend simulado en el navegador responde con grupos de ejemplo y un aviso lo indica. Sirve para publicar el frontend (p. ej. en Vercel) como portafolio. Cambiar de modo exige recompilar y volver a desplegar. Guía completa, configuración de Vercel y limitaciones en [docs/demo-mode.md](docs/demo-mode.md). Las decisiones de interfaz y accesibilidad están en [docs/ux-research.md](docs/ux-research.md).

```bash
VITE_DEMO_MODE=true npm run dev
npm test        # pruebas del cálculo, con paridad contra el backend Java
```

## Estructura

```
src/
├── pages/        # HomePage, GroupPage
├── components/   # UI por dominio: group, expense, integrant, settlement, shared
├── hooks/        # Lógica de datos y estado (useGroup, useExpense, ...)
├── services/     # Llamadas a la API por recurso
├── config/       # Variables de entorno (env.js) y cliente Axios
├── demo/         # Backend simulado del modo demo (solo se carga con VITE_DEMO_MODE=true)
└── utils/        # Dinero, fechas, parseo de errores
tests/            # node --test: cálculo, API simulada y fixtures generados con Java
```
