# Tareas 005 — Objetivo semanal de estudio
Spec: `spec.md`. Plan: `plan.md`. Regla: no pasar a la siguiente tarea con `node --test` en rojo.
Sin archivos nuevos ni dependencias. **Al terminar cada tarea, actualizar `MEMORY.md`** (máximo ~50 líneas).
En las tareas [L] se escriben primero los tests en `logica.test.js` y después la función en `logica.js`.

- [x] **T1. `validarObjetivo`** [L] (RF-1, RF-2)
  Archivos: `logica.test.js`, `logica.js`.
  Tests primero: válidos `"1"`, `"300"`, `" 300 "`, `"10080"`; inválidos `""`, `"   "`, `"0"`, `"-5"`, `"2.5"`, `"1e3"`, `"10081"`, `"abc"`, `null`. Después la función y las constantes 1 y 10080; exportarla.
  **Hecho cuando:** `node --test` en verde, los 4 válidos devuelven `{ valido: true, valor }` con el número correcto y todos los inválidos `{ valido: false }`.

- [x] **T2. `leerObjetivoGuardado`** [L] (RF-19)
  Archivos: `logica.test.js`, `logica.js`.
  Tests primero: `"300"` → 300; `null`, `""`, `"\"300\""`, `"2.5"`, `"0"`, `"NaN"`, `"10081"`, `"{"`, `"[300]"`, `"null"` → `null`. Después la función (con `try/catch` y sin tocar localStorage); exportarla.
  **Hecho cuando:** `node --test` en verde y ninguna entrada inválida lanza una excepción.

- [x] **T3. `calcularLunes`** [L] (RF-11, RF-21)
  Archivos: `logica.test.js`, `logica.js`.
  Tests primero: lunes → mismo día; miércoles; domingo `2026-10-04` → `2026-09-28`; `2027-01-01` → `2026-12-28`; `2028-03-01` → `2028-02-28`; semanas con cambio de horario (`2026-03-29` → `2026-03-23`, `2026-10-25` → `2026-10-19`, `2026-11-01` → `2026-10-26`); no modifica `hoy`; ignora la hora (23:59 y 00:00). Después la función con `Date` a las 12:00 y `setDate`; exportarla.
  **Hecho cuando:** `node --test` en verde con todos los casos, sin `toISOString()` ni resta de timestamps.

- [x] **T4. `calcularMinutosSemana`** [L] (RF-12, RF-21)
  Archivos: `logica.test.js`, `logica.js`.
  Tests primero: suma varios días y sesiones del mismo día; incluye lunes y hoy; excluye el domingo anterior y los días futuros; sin sesiones → 0; ignora `2026-02-30`, `"hola"`, minutos texto/`NaN`/negativos/0/decimales y elementos que no son sesiones; no modifica la entrada; hoy lunes (solo cuenta hoy). Después la función; exportarla.
  **Hecho cuando:** `node --test` en verde y con `hoy = 2026-10-02` una sesión del 2026-10-03 no suma y una del 2026-09-28 sí.

- [x] **T5. `calcularProgresoSemanal`** [L] (RF-13, RF-14, RF-15)
  Archivos: `logica.test.js`, `logica.js`.
  Tests primero: `0/1` → 0 %, no cumplido; `150/300` → 50 %; `299/300` → 100 %, `cumplido: false`; `300/300` → 100 %, cumplido; `350/300` → 117 %, `anchoBarra` 100, texto `"350 / 300 min (117 %)"`. Después la función (usa `calcularMinutosSemana`); exportarla.
  **Hecho cuando:** `node --test` en verde y el caso 299/300 devuelve `porcentaje` 100 con `cumplido` false.

- [x] **T6. HTML y CSS del bloque "Objetivo semanal"** [UI] (RF-3, RF-7, RF-14, RF-15, RF-16)
  Archivos: `index.html`, `styles.css`.
  Añadir la sección entre `.racha` y `.mapa` con formulario, errores, botón "Quitar objetivo" oculto, texto de "sin objetivo", contenedor de progreso (texto, barra con `role="progressbar"`, mensaje de cumplido) con los textos exactos de la spec. Estilos con las variables existentes; la barra y el mensaje se comprueban modificando temporalmente el DOM desde la consola.
  **Hecho cuando:** la sección se ve con el diseño "cuaderno" (campo, botón, texto de "sin objetivo"), la barra se ve vacía, a medias y llena y el mensaje de cumplido se ve resaltado al forzarlo desde la consola, sin errores en consola. Se comprueba con Chrome DevTools, también a 320 px sin scroll horizontal.

- [x] **T7. Mostrar el progreso desde los datos** [UI] (RF-7, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-22)
  Archivo: `app.js`.
  Añadir `CLAVE_OBJETIVO = "diarioEstudioObjetivoSemanal"`, carga con `leerObjetivoGuardado` (dentro de `try`), `pintarObjetivo()` y su llamada desde `pintar()`. Mostrar o ocultar "sin objetivo", progreso, barra (`width` y `aria-valuenow`), mensaje de cumplido y botón "Quitar". Aún sin guardar desde el formulario: para probar, escribir el valor en localStorage desde DevTools.
  **Hecho cuando:** con DevTools, sin clave → texto "sin objetivo"; con `300` y sesiones de la semana → `X / Y min (P %)` correcto y barra proporcional; con valor corrupto (`"abc"`, `0`, `10081`, `{`) → "sin objetivo" sin errores; añadir, editar y borrar una sesión actualiza el progreso al instante; el mensaje aparece al llegar al objetivo y desaparece al borrar la sesión; `diarioEstudioSesiones` sin cambios.

- [x] **T8. Fijar y cambiar el objetivo** [UI] (RF-3, RF-4, RF-5, RF-6, RF-20, RF-22)
  Archivo: `app.js`.
  Evento `submit` de `#formulario-objetivo` con `validarObjetivo`, `guardarObjetivo` (con `try/catch`), `rellenarFormularioObjetivo()` (al cargar, tras guardar y tras quitar) y mensajes de `#error-objetivo`. No usar `idEditando` ni `#error`.
  **Hecho cuando:** con DevTools, `300` (y ` 300 `) se guarda y sobrevive a recargar; guardar el mismo valor es válido; vacío, `0`, `-5`, `2.5`, `1e3` y `10081` muestran `Introduce un número entero de minutos entre 1 y 10080.` y no cambian el objetivo; al cambiar el valor el progreso se recalcula y el campo aparece relleno al recargar; forzar un fallo de `localStorage.setItem` muestra `No se pudo guardar el objetivo. Inténtalo de nuevo.` sin romper la página; editar una sesión no altera el formulario del objetivo ni sus errores.

- [x] **T9. Quitar el objetivo con confirmación** [UI] (RF-7, RF-8, RF-9, RF-10, RF-20)
  Archivo: `app.js`.
  Evento del botón "Quitar objetivo": `confirm("¿Quitar el objetivo semanal? Tus sesiones no se borrarán.")`; cancelar no hace nada; aceptar llama a `quitarObjetivoGuardado()` (con `try/catch`), vacía el campo y repinta.
  **Hecho cuando:** con DevTools, cancelar deja objetivo, campo y pantalla igual; aceptar elimina solo la clave `diarioEstudioObjetivoSemanal` (las sesiones siguen intactas), vuelve a "sin objetivo", el botón desaparece y el estado persiste tras recargar; forzar un fallo de `removeItem` muestra el error de guardado y mantiene el objetivo en pantalla.

- [ ] **T10. Verificación final y cierre** [L + UI] _(parcial: `node --test` 50/50 verde y MEMORY.md actualizado; falta el recorrido en navegador)_ (todos los RF)
  Archivos: `MEMORY.md`, `spec.md` (marcar criterios de finalización).
  Ejecutar `node --test`. Recorrer con Chrome DevTools el flujo completo de la spec: fijar, cambiar y quitar (aceptando y cancelando); entradas válidas e inválidas; añadir, editar y borrar sesiones; llegar al objetivo y salir de él (299/300, 300/300, 350/300, borrar la última sesión, subir el objetivo); sesión futura que no cuenta; recargar; vista móvil a 375 px y 320 px; consola sin errores ni avisos; `diarioEstudioSesiones` con el mismo formato `{id, fecha, tema, minutos}`. Actualizar `MEMORY.md` (estado v8, decisiones con su porqué, errores a evitar) y proponer si algo debe pasar a `AGENTS.md` (nueva clave `diarioEstudioObjetivoSemanal`).
  **Hecho cuando:** `node --test` en verde, todos los puntos de la demo comprobados, consola limpia, `MEMORY.md` actualizado (máximo ~50 líneas) y estado de la spec listo para que la persona usuaria la marque como implementada.

## Trazabilidad RF → tareas
| RF | Tipo | Tareas |
|---|---|---|
| 1 | L | T1, T10 |
| 2 | L | T1, T10 |
| 3 | UI | T6, T8 |
| 4 | UI | T8, T10 |
| 5 | UI | T8, T10 |
| 6 | UI | T8, T10 |
| 7 | UI | T6, T7, T9 |
| 8 | UI | T9 |
| 9 | UI | T9 |
| 10 | UI | T9 |
| 11 | L | T3 |
| 12 | L | T4 |
| 13 | L | T5 |
| 14 | UI | T5, T6, T7 |
| 15 | UI | T5, T6, T7 |
| 16 | UI | T6, T7 |
| 17 | UI | T7, T10 |
| 18 | UI | T7, T10 |
| 19 | L | T2, T7 |
| 20 | UI | T8, T9 |
| 21 | L | T3, T4, T10 |
| 22 | UI | T7, T8, T10 |
