# Hoy — Daily Check-In

Un lugar simple para escribir el día y arrastrar lo pendiente.

**Hoy** es una app de diario minimalista construida con Next.js 16 y React 19.
Cada día tiene notas (markdown con vista previa) y tareas. Las tareas pendientes
se pueden arrastrar a días futuros; al hacerlo, el día origen las suelta y el
destino las recibe marcadas como "arrastrada".

Todo se guarda **localmente en el navegador** (localStorage). No hay servidor,
ni cuentas, ni telemetría. La app funciona 100% offline.

## Características

- Notas en markdown por día con pestañas de escritura y vista previa.
- Tareas con check / descheck / eliminar.
- Mover tareas a mañana, en 2, 3 o 7 días.
- Sidebar con todos los días que tengan contenido, badge "hoy" y
  contador de tareas pendientes por día.
- Sección "Vienen después" con las próximas 6 jornadas y sus pendientes.
- Modo claro/oscuro automático según el sistema.
- 100% client-side, sin backend.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [react-markdown](https://github.com/remarkjs/react-markdown)

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Qué hace                                  |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                    |
| `npm run build`     | Build de producción                       |
| `npm run start`     | Servidor de producción (tras `build`)     |
| `npm run typecheck` | `tsc --noEmit`                            |
| `npm run lint`      | Linter de Next.js                         |

## Estructura

```
src/
  app/
    layout.tsx        # layout raíz (fuentes Geist, lang=es)
    page.tsx          # página principal: sidebar + notas + tareas + resumen
    globals.css       # tailwind v4 + tema claro/oscuro
  components/
    Sidebar.tsx       # listado de días con badges
    NotesEditor.tsx   # editor markdown con tabs
    Tasks.tsx         # lista de tareas y mover a futuro
  lib/
    types.ts          # tipos: AppState, Day, Task
    store.ts          # useStore() + persistencia en localStorage
    date.ts           # helpers de fecha (todayKey, addDays, format…)
```

## Decisiones de diseño

- **Fechas como string `YYYY-MM-DD`** (`src/lib/date.ts`) — evita líos de zona
  horaria al guardar en localStorage. Todas las funciones trabajan con la fecha
  local del usuario.
- **Hidratación explícita** (`src/lib/store.ts`) — `useStore` arranca con estado
  vacío en SSR y se hidrata en `useEffect`, evitando mismatches.
- **Mover tarea es no destructivo** — la tarea original se quita del día origen
  y aparece al final del día destino con `movedTo` apuntando a su nuevo hogar.
  Si vuelve a su `createdOn`, la marca desaparece.
- **Sin base de datos** — el estado vive en `localStorage` bajo la clave
  `hoy:state:v1`. El `:v1` permite migraciones futuras cambiando el sufijo.

## Privacidad

Todo queda en tu navegador. Si borras los datos del sitio o cambias de
navegador/dispositivo, no hay forma de recuperarlos. Haz export si quieres
respaldo (no incluido todavía — ver roadmap).

## Roadmap

- [ ] Export / import a JSON.
- [ ] Búsqueda full-text en notas.
- [ ] Sincronización opcional vía backend.

## Licencia

MIT.
