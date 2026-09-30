# Diario de Estudio

Web sencilla para registrar tus sesiones de estudio y motivarte con la racha de días seguidos. Es de uso personal y está hecha con HTML, CSS y JavaScript puro, sin frameworks ni dependencias.

## Qué puedes hacer
- **Registrar sesiones** con fecha, tema y minutos. La fecha se puede cambiar para anotar días pasados.
- **Ver la racha actual**: los días consecutivos con al menos una sesión que terminan hoy. Si hoy todavía no has estudiado pero ayer sí, la racha sigue viva.
- **Ver la mejor racha**: la secuencia de días consecutivos más larga de todo tu historial.
- **Editar sesiones** con el botón «Editar» de cada fila. Las rachas se recalculan solas.
- **Consultar la lista** de sesiones, de la más reciente a la más antigua.

Validación: el tema es obligatorio y los minutos deben ser un número entero mayor que 0.

## Cómo usarlo
No hay que instalar nada. Abre `index.html` con doble clic (`file://`). En Windows también puedes ejecutar `start index.html` desde la carpeta del proyecto.

## Estructura
| Archivo | Contenido |
| --- | --- |
| `index.html` | Estructura de la página |
| `styles.css` | Estilos |
| `app.js` | Lógica (rachas, edición) y guardado en localStorage |
| `prompts/` | Especificación de la versión 1 y prompts de cada mejora |
| `AGENTS.md` | Reglas del proyecto para el asistente de código |
| `MEMORY.md` | Estado del proyecto y decisiones tomadas |

## Datos
Todo se guarda en el `localStorage` de tu navegador, con la clave `diarioEstudioSesiones`. Cada sesión tiene esta forma:

```json
{ "id": 1700000000000, "fecha": "2026-09-30", "tema": "JavaScript", "minutos": 45 }
```

Los datos no salen de tu equipo. Si borras los datos del navegador, se pierden las sesiones.

## Notas técnicas
- Las fechas son siempre locales (`AAAA-MM-DD`), nunca UTC.
- La racha y la mejor racha se calculan al vuelo a partir de las sesiones; no se guardan.
- No se usan módulos ES ni `fetch`, para que funcione con doble clic.
