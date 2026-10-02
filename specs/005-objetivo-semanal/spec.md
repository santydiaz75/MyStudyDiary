# Spec 005 — Objetivo semanal de estudio
Estado: borrador
## Contexto y objetivo
La racha y el mapa de calor muestran la constancia, pero no dan una meta concreta de cantidad. Un objetivo semanal de minutos permite a la persona usuaria fijar cuánto quiere estudiar cada semana y ver cuánto lleva, lo que refuerza la motivación para cumplirlo, que es el propósito del diario.
## Usuarios / actores
Una única persona usuaria que registra sus sesiones de estudio (uso personal).
## Historias de usuario
- H1: Como estudiante quiero fijar cuántos minutos quiero estudiar cada semana para tener una meta clara.
- H2: Como estudiante quiero ver cuántos minutos llevo esta semana frente a mi objetivo para saber cuánto me falta.
- H3: Como estudiante quiero un aviso claro cuando cumplo el objetivo para sentirme recompensado.
- H4: Como estudiante quiero poder cambiar o quitar el objetivo para adaptarlo a mi situación.
## Definiciones
- Semana: de lunes a domingo, en fechas locales (nunca UTC).
- Minutos de la semana (X): suma de los minutos de las sesiones válidas con fecha entre el lunes de la semana actual y hoy, ambos incluidos. Las fechas posteriores a hoy no cuentan.
- Sesión válida: tiene fecha con formato `AAAA-MM-DD` real y minutos numéricos enteros mayores que 0. Las demás no cuentan, pero no se borran ni se modifican.
- Objetivo (Y): un único valor global en minutos, aplicado a la semana actual. No hay histórico por semana.
- Porcentaje (P): `Math.round(X / Y * 100)`. El texto muestra el porcentaje real (puede superar 100 %); la barra se limita visualmente al 100 %.
- Objetivo cumplido: X >= Y (comparando minutos, no el porcentaje redondeado).
- Valor válido de objetivo: entero positivo entre 1 y 10080.
## Textos exactos de la interfaz
- Sin objetivo: `Aún no tienes objetivo semanal. Fíjalo para ver tu progreso.`
- Progreso: `X / Y min (P %)`, por ejemplo `350 / 300 min (117 %)`.
- Cumplido: `¡Objetivo cumplido!`
- Error de validación: `Introduce un número entero de minutos entre 1 y 10080.`
- Error al guardar o quitar: `No se pudo guardar el objetivo. Inténtalo de nuevo.`
- Confirmación al quitar: `¿Quitar el objetivo semanal? Tus sesiones no se borrarán.`
- Botones: `Guardar objetivo` y `Quitar objetivo`.
## Ubicación
Un bloque propio "Objetivo semanal", debajo de las estadísticas existentes (racha, mejor racha, días del mes) y antes del mapa de calor. Contiene el formulario, el mensaje de error, el progreso, la barra y el mensaje de cumplido. El mensaje de error aparece junto al formulario del objetivo, no en el de sesiones.
## Requisitos funcionales (criterios de aceptación en EARS)
Tipo: [L] lógica pura, con test `node --test`; [UI] interfaz, verificada a mano con Chrome DevTools.

- RF-1 [L]: EL SISTEMA validará el valor del objetivo: recortará los espacios de los extremos y solo aceptará enteros positivos entre 1 y 10080.
- RF-2 [L]: SI el valor está vacío, es decimal, negativo, 0, mayor que 10080, tiene notación científica (por ejemplo `1e3`) o no es un número, ENTONCES EL SISTEMA lo rechazará.
- RF-3 [UI]: EL SISTEMA ofrecerá un campo numérico y el botón "Guardar objetivo" para fijar el objetivo.
- RF-4 [UI]: CUANDO la persona usuaria guarde un valor válido, EL SISTEMA lo conservará entre recargas de la página y actualizará el progreso sin recargar. Guardar el mismo valor que ya había es válido.
- RF-5 [UI]: SI el valor es inválido, ENTONCES EL SISTEMA mostrará el error de validación junto al formulario del objetivo y no cambiará el objetivo guardado.
- RF-6 [UI]: EL SISTEMA usará el mismo formulario para fijar y para cambiar el objetivo, y lo rellenará con el valor actual cuando exista. Al cambiarlo, el nuevo valor sustituye al anterior.
- RF-7 [UI]: MIENTRAS haya un objetivo, EL SISTEMA mostrará el botón "Quitar objetivo"; MIENTRAS no haya objetivo, no lo mostrará.
- RF-8 [UI]: CUANDO la persona usuaria pulse "Quitar objetivo", EL SISTEMA pedirá confirmación con `confirm()`.
- RF-9 [UI]: SI la persona usuaria acepta la confirmación, ENTONCES EL SISTEMA eliminará solo el objetivo (nunca las sesiones), volverá al estado "sin objetivo" y lo conservará tras recargar.
- RF-10 [UI]: SI la persona usuaria cancela la confirmación, ENTONCES EL SISTEMA no cambiará nada (ni el objetivo ni la pantalla).
- RF-11 [L]: EL SISTEMA calculará el lunes de la semana de una fecha local, sin restar timestamps y usando `formatearFecha`.
- RF-12 [L]: EL SISTEMA calculará X sumando solo las sesiones válidas desde el lunes de la semana actual hasta hoy incluido; las futuras, las de semanas anteriores y las inválidas no cuentan.
- RF-13 [L]: EL SISTEMA calculará P con `Math.round(X / Y * 100)` y determinará "cumplido" con X >= Y.
- RF-14 [UI]: MIENTRAS haya un objetivo, EL SISTEMA mostrará el progreso `X / Y min (P %)` y una barra cuyo relleno equivale a P limitado al 100 %. La barra expondrá su valor a los lectores de pantalla.
- RF-15 [UI]: MIENTRAS X >= Y, EL SISTEMA mostrará `¡Objetivo cumplido!` con la barra llena. CUANDO X deje de ser >= Y (por borrar o editar sesiones, o por subir el objetivo), EL SISTEMA ocultará el mensaje.
- RF-16 [UI]: MIENTRAS no haya objetivo, EL SISTEMA mostrará el texto de "sin objetivo" y no mostrará barra, progreso ni mensaje de cumplido.
- RF-17 [UI]: CUANDO se añada, edite o borre una sesión, EL SISTEMA actualizará el progreso semanal sin recargar la página.
- RF-18 [UI]: CUANDO se cargue la página, EL SISTEMA mostrará el objetivo guardado y el progreso con las sesiones guardadas.
- RF-19 [L]: SI el valor guardado del objetivo es inválido (cadena no numérica, decimal, 0, NaN, fuera de rango o JSON roto), ENTONCES EL SISTEMA lo tratará como "sin objetivo", sin romper la página y sin tocar las sesiones.
- RF-20 [UI]: SI falla localStorage al guardar o quitar el objetivo, ENTONCES EL SISTEMA mostrará el error de guardado en español, mantendrá el estado anterior en pantalla y la aplicación seguirá funcionando.
- RF-21: EL SISTEMA usará siempre fechas locales y el formato `AAAA-MM-DD` de `formatearFecha`, nunca UTC.
- RF-22: EL SISTEMA guardará el objetivo en la clave nueva de localStorage `diarioEstudioObjetivoSemanal` y no modificará la clave `diarioEstudioSesiones` ni la forma `{id, fecha, tema, minutos}` de las sesiones.
## Requisitos no funcionales
- Funciona abriendo `index.html` con doble clic, sin dependencias.
- Interfaz en español y coherente con el diseño "cuaderno" actual.
- Legible en móvil sin desbordar la pantalla.
- El progreso no depende solo del color: siempre se muestra el texto con X, Y y P.
- Compatibilidad hacia atrás: quien no tenga la clave nueva ve "sin objetivo" y sus sesiones siguen intactas.
- Los cálculos son funciones puras que reciben "hoy" como parámetro y se prueban con `node --test`.
## Cambio en datos guardados (aprobado)
- Clave nueva de localStorage: `diarioEstudioObjetivoSemanal`. Guarda solo el número de minutos del objetivo.
- `diarioEstudioSesiones` y la forma `{id, fecha, tema, minutos}` NO cambian.
- La persona usuaria aprobó esta clave nueva, como exige `AGENTS.md`.
## Nota para el plan (restricción pedida por el usuario)
Las funciones puras (RF-1, 2, 11, 12, 13, 19) irán en el archivo de lógica existente (`logica.js`, con sus tests en `logica.test.js`), recibiendo "hoy" como parámetro. No se crean archivos nuevos.
## Casos límite
- Hoy es lunes: la semana solo incluye hoy. Hoy es domingo: la semana está completa.
- Lunes en el mes o año anterior: por ejemplo, hoy 1 de enero o 1 de marzo de un año bisiesto; el lunes se calcula bien (`setDate` sobre `Date` a las 12:00).
- Semana del cambio de horario: no se salta ni repite ningún día.
- Cambio de semana (domingo a lunes): X vuelve a 0 sin tocar sesiones ni objetivo.
- Varias sesiones el mismo día: se suman. Sesiones de otras semanas o futuras: no cuentan, siguen guardadas.
- X exactamente igual a Y: cumplido, 100 %.
- X mayor que Y: la barra se queda al 100 % y el texto muestra el valor real, por ejemplo `350 / 300 min (117 %)`.
- 299 / 300: P se muestra como 100 % pero SIN `¡Objetivo cumplido!` (el mensaje exige X >= Y).
- Objetivo 1 con 0 minutos: `0 / 1 min (0 %)`, barra vacía, sin mensaje.
- Borrar la última sesión con el objetivo cumplido: el mensaje desaparece y el progreso baja.
- Subir el objetivo por encima de X: el mensaje desaparece.
- `confirm()` cancelado al quitar: no cambia nada.
- Editar una sesión (`idEditando`) no interfiere con el formulario del objetivo, ni al revés: cada formulario conserva su estado y sus errores.
- Editar una sesión y moverla de semana: el progreso se recalcula.
- Valor guardado corrupto: "sin objetivo" (RF-19). Sesiones con minutos no válidos o fecha inválida: no cuentan (ni se borran).
- Entradas rechazadas: vacío, `0`, `-5`, `2.5`, `1e3`, `10081`, texto. Aceptadas: ` 300 ` (con espacios), `1`, `10080`.
## Fuera de alcance
- Histórico de objetivos o de semanas cumplidas, y objetivos distintos por semana.
- Objetivos diarios o mensuales.
- Otro primer día de la semana o ventana de "últimos 7 días".
- Notificaciones, sonidos o animaciones de celebración.
- Contar sesiones con fecha futura.
- Varias pestañas abiertas a la vez (no se sincronizan).
- Actualizar el progreso si pasa la medianoche con la página abierta (hay que recargar).
- Exportar o compartir el progreso.
## Criterios de finalización
- Todos los RF de tipo [L] tienen test en verde con `node --test`.
- Demo manual de los RF [UI] con Chrome DevTools: fijar, cambiar y quitar el objetivo (aceptando y cancelando el `confirm()`); valores inválidos y válidos de la lista de casos límite; añadir, editar y borrar sesiones con actualización inmediata; llegar al objetivo y ver el mensaje, y verlo desaparecer; recargar y comprobar persistencia; vista móvil.
- Consola del navegador sin errores.
- `MEMORY.md` actualizado.
## Dudas abiertas
Ninguna. Decisiones tomadas:
- Objetivo único y global, sin histórico; cambiarlo afecta solo a la vista de la semana actual.
- Semana de lunes a domingo, en fechas locales; las sesiones futuras no cuentan.
- Rango válido 1–10080; quitar el objetivo pide `confirm()`.
- Clave `diarioEstudioObjetivoSemanal`, aprobada por la persona usuaria.
