# rr-management-frontend

## Proposito

Frontend del proyecto `rr-management`.

Debe ofrecer una experiencia de escritorio clara para operar el club y sustituir el uso actual de Excel para el ambito del MVP.

## Stack esperado

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- MUI
- Recharts

## Alcance del MVP

- login
- dashboard general
- dashboard por equipo
- listado y ficha de personas
- alta de personas
- asignacion de equipos
- gestion deportiva

## Referencias de UI

Este proyecto no depende de wireframes.

Las referencias validas son:

- dashboards y reportes de Excel que ya funcionan;
- identidad del club;
- web oficial;
- reglas funcionales ya cerradas.

## Fuente de verdad documental

Antes de tocar pantallas o UX, revisar:

- `../Documentation/00_contexto_proyecto.md`
- `../Documentation/02_mvp_especificacion.md`
- `../Documentation/03_arquitectura_tecnica.md`

## Reglas clave

- escritorio primero;
- tablas, filtros y formularios claros;
- MUI como base, tema del club por encima;
- no mover negocio al cliente;
- no meter v2 dentro del MVP.

## API y desarrollo local

- por defecto el frontend apunta de forma directa a `http://localhost:9081/api/v1`;
- si quieres cambiar ese host, crea un `.env` a partir de `.env.example`;
- valor recomendado en local: `VITE_API_BASE_URL=http://localhost:9081/api/v1`;
- el backend debe tener CORS con credenciales habilitado para `http://localhost:5173` porque la autenticacion es por sesion/cookie.

## Tarea base actual

- `../Tasks/task-monorepo-bootstrap.md`
- `../Tasks/task-mvp-core-domain.md`
