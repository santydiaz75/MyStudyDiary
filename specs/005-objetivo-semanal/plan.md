# Plan 005 — Objetivo semanal de estudio
Spec: `spec.md` (aprobada). Regla: no avanzar con `node --test` en rojo. Sin archivos nuevos ni dependencias.

## 1. Archivos a tocar
| Archivo | Cambio | RF |
|---|---|---|
| `logica.js` | Funciones puras nuevas y su export a Node | 1, 2, 11, 12, 13, 19, 21 |
| `logica.test.js` | Tests de cada función nueva (se escriben primero) | 1, 2, 11, 12, 13, 19, 21 |
| `index.html` | Bloque "Objetivo semanal" entre `.racha` y `.mapa` | 3, 5, 7, 14, 15, 16 |
| `styles.css` | Estilos del bloque y de la barra (variables de color existentes) | 14, 15, 16 |
| `app.js` | Lectura/escritura en localStorage, `pintarObjetivo()`, eventos del formulario y de quitar | 3–10, 14–18, 20, 22 |
| `MEMORY.md` | Se actualiza al terminar cada tarea | — |

`diarioEstudioSesiones` y la forma `{id, fecha, tema, minutos}` no se tocan (RF-22).

## 2. Funciones puras en `logica.js` (todas reciben "hoy" como `Date`, igual que `construirMapaCalor`)
- `validarObjetivo(texto)` → `{ valido: true, valor: 300 }` o `{ valido: false }`. Recorta espacios y acepta solo `/^\d+$/` con valor entre 1 y 10080. Rechaza vacío, decimales, negativos, `0`, `1e3`, texto y `10081`. Constantes `OBJETIVO_MIN = 1` y `OBJETIVO_MAX = 10080`. (RF-1, RF-2)
- `leerObjetivoGuardado(textoGuardado)` → número o `null`. Recibe el texto crudo de localStorage (o `null`), hace `JSON.parse` dentro de `try` y devuelve el valor solo si es un número entero entre 1 y 10080. Cadena (`"\"300\""`), decimal, `0`, `NaN`, fuera de rango, `null` o JSON roto → `null`. (RF-19)
- `calcularLunes(hoy)` → texto `AAAA-MM-DD` del lunes de esa semana. `Date` a las 12:00, `(getDay() + 6) % 7` y `setDate`, igual que `construirMapaCalor`; sin restar timestamps; no modifica `hoy`. (RF-11, RF-21)
- `calcularMinutosSemana(sesiones, hoy)` → suma de minutos de las sesiones válidas con `lunes <= fecha <= hoy` (comparando textos `AAAA-MM-DD`). Es válida si es un objeto con fecha `AAAA-MM-DD` real (se comprueba con ida y vuelta por `Date` y `formatearFecha`) y minutos enteros > 0. No modifica la entrada. (RF-12, RF-21)
- `calcularProgresoSemanal(sesiones, objetivo, hoy)` → `{ minutos, objetivo, porcentaje, anchoBarra, cumplido, texto }`.
  - `porcentaje = Math.round(minutos / objetivo * 100)` (puede pasar de 100).
  - `anchoBarra = Math.min(porcentaje, 100)`.
  - `cumplido = minutos >= objetivo` (minutos, no porcentaje redondeado).
  - `texto = "X / Y min (P %)"`, p. ej. `"350 / 300 min (117 %)"`. (RF-13, RF-14, RF-15)

Se exportan las cinco más las constantes necesarias en el bloque `if (typeof module !== "undefined")`.

## 3. Interfaz (`index.html`, `styles.css`, `app.js`)
**HTML** (`<section class="tarjeta objetivo">`, tras `.racha` y antes de `.mapa`):
- `<h2>Objetivo semanal</h2>`.
- `<form id="formulario-objetivo" novalidate>` con `<label for="objetivo-minutos">Minutos por semana</label>`, `<input type="number" id="objetivo-minutos" min="1" max="10080" step="1">`, `<p id="error-objetivo" class="error" role="alert">`, botón `Guardar objetivo` (`id="boton-guardar-objetivo"`) y botón `Quitar objetivo` (`id="boton-quitar-objetivo"`, `class="boton-secundario"`, `hidden`).
- `<p id="objetivo-vacio">Aún no tienes objetivo semanal. Fíjalo para ver tu progreso.</p>`.
- `<div id="objetivo-progreso" hidden>` con `<p id="objetivo-texto">`, la barra (`<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del objetivo semanal">` con un `<span class="barra-relleno">` dentro) y `<p id="objetivo-cumplido" hidden>¡Objetivo cumplido!</p>`.

**CSS:** `.barra` (fondo de papel/tinta suave), `.barra-relleno` con el azul bolígrafo y `width` en `%` puesto desde JS, mensaje de cumplido con el resaltador amarillo. El botón "Quitar objetivo" reutiliza `.boton-secundario`. Sin desbordar a 320 px.

**`app.js`:**
- `CLAVE_OBJETIVO = "diarioEstudioObjetivoSemanal"`. Se guarda el número como texto JSON (`"300"` en el almacén, es decir `JSON.stringify(300)`).
- `let objetivo = leerObjetivoGuardado(localStorage.getItem(CLAVE_OBJETIVO))` (dentro de `try`, por si el acceso a localStorage falla → `null`).
- `guardarObjetivo(valor)` y `quitarObjetivoGuardado()` usan `try/catch` y devuelven `true/false`.
- `pintarObjetivo()` (llamada desde `pintar()`, que ya se invoca al añadir, editar, borrar y cargar): muestra/oculta el texto "sin objetivo", el progreso, el mensaje de cumplido y el botón "Quitar", y pone `aria-valuenow` y el ancho de la barra.
- `rellenarFormularioObjetivo()`: pone el valor actual en el campo; se llama al cargar, tras guardar y tras quitar (no en cada `pintar()`, para no pisar lo que la persona esté escribiendo).
- Submit del formulario del objetivo: `validarObjetivo(campo.value)`; error → `#error-objetivo`; si no, `guardarObjetivo`; si falla, error de guardado y estado anterior.
- "Quitar objetivo": `confirm("¿Quitar el objetivo semanal? Tus sesiones no se borrarán.")`; cancelar → no hace nada; aceptar → `quitarObjetivoGuardado()`.
- El formulario del objetivo no usa `idEditando` ni `textoError`: cada formulario tiene su propio estado y su propio mensaje de error.

## 4. Decisiones y alternativas descartadas
| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Funciones nuevas en `logica.js` | Ponerlas en `app.js` | La constitución exige lógica pura testeable con `node --test`; `app.js` toca el DOM. |
| `calcularMinutosSemana` con su propio filtro de sesión válida (entero, fecha real) | Reutilizar `sumarMinutosPorDia` | Esa acepta decimales y fechas como `2026-13-45`; la spec pide enteros y fecha real. No se modifica `sumarMinutosPorDia` (código aprobado en la spec 004). |
| Comparar fechas como texto `AAAA-MM-DD` | Comparar objetos `Date` o restar timestamps | El texto ordena bien y evita problemas de horario de verano. |
| `hoy` como `Date` | `hoy` como texto | Coherente con `construirMapaCalor`; se pasa `new Date()` desde `app.js`. |
| Valor guardado como número JSON (`300`) | Guardar `{minutos: 300}` | Más simple; la validación de lectura rechaza cualquier otra forma. |
| `leerObjetivoGuardado` recibe el texto crudo | Que lea localStorage directamente | Así es pura y testeable sin DOM ni localStorage. |
| Mismo formulario para fijar y cambiar | Botón "Editar objetivo" aparte | Menos código y menos botones (spec RF-6). |
| Campo rellenado solo al cargar/guardar/quitar | Rellenarlo en cada `pintar()` | Añadir una sesión no debe borrar lo que se esté escribiendo en el objetivo. |
| Texto `"X / Y min (P %)"` generado en `logica.js` | Componerlo en `app.js` | Es testeable y el formato queda fijado en un solo sitio. |
| `cumplido` por minutos | `cumplido` por porcentaje redondeado | 299/300 redondea a 100 % pero no está cumplido (spec). |
| Barra con ancho `anchoBarra` y `aria-valuenow` | Solo color | El progreso no depende solo del color (requisito no funcional). |

## 5. Estrategia de tests (`node --test`, en `logica.test.js`)
Se escriben antes que cada función y se ejecutan con `node --test`. Los RF [UI] no tienen test automático: se verifican con Chrome DevTools.

- **`validarObjetivo`** (RF-1, RF-2): válidos `"1"`, `"300"`, `" 300 "`, `"10080"`; inválidos `""`, `"   "`, `"0"`, `"-5"`, `"2.5"`, `"1e3"`, `"10081"`, `"abc"`, `"3 0"`, `null`, `undefined`.
- **`leerObjetivoGuardado`** (RF-19): `"300"` → 300; `null`, `""`, `"\"300\""`, `"2.5"`, `"0"`, `"NaN"`, `"10081"`, `"{"`, `"[300]"`, `"null"` → `null`.
- **`calcularLunes`** (RF-11, RF-21): hoy lunes `2026-09-28` → mismo día; miércoles; domingo `2026-10-04` → `2026-09-28`; `2027-01-01` → `2026-12-28`; `2028-03-01` → `2028-02-28` (bisiesto); semanas con cambio de horario (`2026-03-29` → `2026-03-23`, `2026-10-25` → `2026-10-19`, `2026-11-01` → `2026-10-26`); no modifica `hoy`; ignora la hora (23:59 y 00:00).
- **`calcularMinutosSemana`** (RF-12, RF-21): varias sesiones y varios días se suman; incluye lunes y hoy; excluye domingo anterior y días futuros; sin sesiones → 0; ignora fecha inválida (`2026-02-30`, `"hola"`), minutos texto/`NaN`/negativos/0/decimales y elementos que no son sesiones; no modifica la entrada.
- **`calcularProgresoSemanal`** (RF-13, RF-14, RF-15): `0/1` → 0 %, no cumplido; `299/300` → 100 %, `cumplido: false`; `300/300` → 100 %, cumplido; `350/300` → 117 %, `anchoBarra` 100, texto `"350 / 300 min (117 %)"`; `150/300` → 50 %.

## 6. Cobertura de RF
| RF | Tipo | Dónde se cubre |
|---|---|---|
| 1, 2 | L | `validarObjetivo` |
| 3 | UI | HTML del formulario + submit |
| 4, 5, 6 | UI | submit, `guardarObjetivo`, `rellenarFormularioObjetivo` |
| 7 | UI | `pintarObjetivo` (visibilidad) + botón "Quitar" |
| 8, 9, 10 | UI | evento de "Quitar objetivo" con `confirm()` |
| 11 | L | `calcularLunes` |
| 12 | L | `calcularMinutosSemana` |
| 13 | L | `calcularProgresoSemanal` |
| 14, 15, 16 | UI (texto y `cumplido` salen de la lógica) | `pintarObjetivo`, HTML y CSS |
| 17, 18 | UI | `pintar()` ya se llama al añadir/editar/borrar y al cargar |
| 19 | L | `leerObjetivoGuardado` (+ carga en `app.js`) |
| 20 | UI | `try/catch` en guardar y quitar |
| 21 | L + UI | `calcularLunes`, `calcularMinutosSemana`; `app.js` solo usa `new Date()` y `formatearFecha` |
| 22 | UI | clave `diarioEstudioObjetivoSemanal`; revisar en DevTools que `diarioEstudioSesiones` no cambia |

## 7. Riesgos y notas
- La constitución dice "código en inglés" pero el proyecto usa español (discrepancia ya registrada en `MEMORY.md`); se sigue el español.
- Fuera de alcance: varias pestañas y medianoche con la página abierta; no se prevé nada para ello.
- El `confirm()` bloquea el navegador automatizado: en DevTools se gestiona con el diálogo (aceptar y cancelar) o sobrescribiendo `window.confirm` para la prueba.
