# AGENTS.md — Diario de Estudio
Web para registrar sesiones de estudio y motivarse con la racha de días seguidos. Uso personal; el usuario está aprendiendo a programar. Se construye poco a poco (`prompts/prompt.md` describe la versión 1).

## Stack y estructura
- HTML, CSS y JavaScript puro. Sin frameworks, librerías, package manager, build ni tests. No es un repo git.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y localStorage). Solo estos tres archivos.
- `prompts/prompt.md`: especificación original; consúltala para saber el alcance.

## Comandos
- Tests: `node --test`
- Ejecutar: abrir `index.html` con doble clic (`file://`). En Windows: `start index.html`.

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 

## Convenciones
- Toda la interfaz en español; nombres de variables y funciones también en español (`calcularRacha`, `formatearFecha`).
- Código simple y legible para principiantes; pocos comentarios, solo donde no sea obvio.
- Sin módulos ES (`type="module"` falla en `file://`), sin `fetch` de archivos locales.
- Referencia de estilo: `app.js`.

## Reglas de dominio / trampas conocidas
- Racha (`calcularRacha`): días consecutivos con al menos una sesión que terminan hoy. Si hoy no hay sesión pero ayer sí, la racha sigue viva.
- Mejor racha (`calcularMejorRacha`): mayor secuencia de días consecutivos con sesión en todo el historial. Se calcula a partir de las sesiones, no se guarda. Para comparar días consecutivos, usar `Date` a las 12:00 + `setDate` + `formatearFecha`, nunca restar timestamps.
- Editar sesión: modifica `fecha`, `tema` y `minutos` de la sesión con ese `id`, sin cambiar el `id` ni el formato de los datos. Reutiliza el formulario (`idEditando`).
- Borrar sesión: elimina una sola sesión por `id` (`borrarSesion`), siempre tras `confirm()`. No hay borrado en bloque.
- Fechas siempre locales, nunca UTC: no usar `toISOString()`. Usar `formatearFecha` (`AAAA-MM-DD`).
- localStorage: clave `diarioEstudioSesiones`, sesiones con forma `{id, fecha, tema, minutos}`.
- localStorage: clave `diarioEstudioObjetivoSemanal`, entero 1–10080 guardado como número; valor inválido o ausente = sin objetivo.
- Validación: tema obligatorio, minutos enteros > 0.

## Forma de trabajar
- Cambios pequeños y enfocados; no añadir nada que el usuario no haya pedido.
- Para cambios que afecten a varios archivos o a la lógica de la racha, explica el plan antes de tocar código.
- Al terminar: resumen corto, pasos para probarlo y decisiones tomadas por tu cuenta que el usuario deba revisar.

## Límites
- ✅ Siempre: mantener textos en español, usar fechas locales, mantener el funcionamiento con doble clic, actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: añadir dependencias, crear archivos nuevos, cambiar la clave o el formato de los datos en localStorage.
- 🚫 Nunca: usar frameworks, librerías, servidores o pasos de compilación; usar UTC para fechas; borrar datos guardados del usuario sin que lo pida y confirme explícitamente (solo una sesión cada vez, nunca en bloque).

## Verificación
- Abrir `index.html` en el navegador: añadir una sesión de hoy (racha 1), añadir ayer y anteayer (racha 3), recargar (los datos persisten), probar tema vacío y minutos 0 (mensaje de error).
- Borrar una sesión: cancelar la confirmación no cambia nada; aceptarla la elimina, recalcula las rachas y persiste al recargar.
- Revisar la consola del navegador: sin errores.
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la
vista móvil. 

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales). 