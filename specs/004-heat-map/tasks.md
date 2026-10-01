# Tareas 004 — Mapa de calor de estudio
Spec: `spec.md`. Plan: `plan.md`. Regla: no pasar a la siguiente tarea con `node --test` en rojo.
Cada tarea dura unos 20-30 min como máximo.

## Fase 0 — Decisiones previas
- [x] **T0. Resolver los puntos abiertos** (RF: —)
  Confirmar con el usuario: crear `logica.js` y `logica.test.js`; paleta (azul bolígrafo propuesto) y marca de "hoy" (borde propuesto); idioma del código (español propuesto); semana actual como una de las 12 columnas.
  **Hecho cuando:** las cuatro respuestas están anotadas en `spec.md` (Dudas abiertas resueltas) y `plan.md` (sección 0) sin `[NECESITA ACLARACIÓN]` pendientes.

## Fase 1 — Lógica pura con tests (`logica.js`, `logica.test.js`)
- [x] **T1. Crear `logica.js` con `formatearFecha` y su test** (RF-12)
  Crear ambos archivos. `formatearFecha` es la actual, con el export condicional a Node. Test: rellena ceros y no cambia de día a las 23:59.
  **Hecho cuando:** `node --test` pasa en verde con los tests de `formatearFecha` y el archivo no usa `toISOString()`.

- [x] **T2. `sumarMinutosPorDia`** (RF-3, RF-13)
  Escribir primero los tests: suma el mismo día, separa días, lista vacía, ignora fecha mal formada, minutos texto/`NaN`/negativos/0, y no modifica la entrada. Después la función.
  **Hecho cuando:** `node --test` en verde y un test comprueba que el array de entrada queda idéntico tras llamar a la función.

- [x] **T3. `calcularNivel`** (RF-4)
  Tests de límites: 0, 1, 29, 29.5, 30, 59, 60, 119, 120, 500. Después la función con las constantes de tramos `[30, 60, 120]`.
  **Hecho cuando:** `node --test` en verde y todos los límites devuelven el nivel esperado (0, 1, 1, 1, 2, 2, 3, 3, 4, 4).

- [x] **T4. `construirMapaCalor`: forma de la cuadrícula** (RF-1, RF-11, RF-12)
  Tests: 12 semanas × 7 días, 84 fechas distintas y consecutivas, cada semana empieza en lunes, sin sesiones todo es nivel 0. Implementar con `Date` a las 12:00, `setDate` y `SEMANAS_MAPA = 12`.
  **Hecho cuando:** `node --test` en verde y, con `hoy = 2026-10-01`, la primera casilla es el lunes `2026-07-13` y la última de la matriz es el domingo `2026-10-04`.

- [x] **T5. `construirMapaCalor`: hoy y días futuros** (RF-2, RF-6)
  Tests: `esHoy` solo en la casilla de hoy; días posteriores con `futuro` y minutos 0 aunque haya sesiones; hoy lunes (una casilla no futura en la última semana); hoy domingo (semana completa).
  **Hecho cuando:** `node --test` en verde y una sesión con fecha futura no cambia el nivel de ninguna casilla.

- [x] **T6. `construirMapaCalor`: asignación de minutos y niveles** (RF-3, RF-4)
  Tests: varias sesiones del mismo día se suman; el nivel sigue los tramos; sesiones fuera de las 12 semanas no aparecen en ninguna casilla.
  **Hecho cuando:** `node --test` en verde y un día con 20 + 15 min sale con 35 min y nivel 2.

- [x] **T7. `construirMapaCalor`: casos límite de fechas** (RF-1, RF-12)
  Tests: cruce de fin de año, 29 de febrero (por ejemplo `hoy = 2028-03-02`) y semanas con cambio de horario de verano (marzo y octubre) sin saltar ni repetir días.
  **Hecho cuando:** `node --test` en verde y en cada caso las 84 fechas son consecutivas y únicas.

- [x] **T8. `textoDiaMapa`** (RF-7)
  Tests: con estudio (`"2026-09-30: 45 min"`), sin estudio (`"…: sin estudio"`) y futuro (`"…: aún no ha llegado"`). Después la función.
  **Hecho cuando:** `node --test` en verde con los tres formatos exactos.

## Fase 2 — Integrar en la aplicación
- [x] **T9. Cargar `logica.js` y mover `formatearFecha`** (RF-12, RF-13)
  En `index.html`, añadir `<script src="logica.js">` antes de `app.js`. Quitar `formatearFecha` de `app.js`. No tocar nada más.
  **Hecho cuando:** al abrir `index.html` con doble clic la racha, la mejor racha, los días del mes y las 7 casillas funcionan igual que antes y la consola no muestra errores.

- [x] **T10. HTML de la sección del mapa** (RF-1, RF-7, RF-8)
  Añadir la sección con el título, las etiquetas L M X J V S D, el contenedor `#mapa-calor`, el texto `#mapa-detalle` (`aria-live`) y la leyenda con los tramos de minutos.
  **Hecho cuando:** la sección aparece en la página con etiquetas, texto de ayuda y leyenda, sin errores en consola (todavía sin casillas).

- [x] **T11. Estilos de la cuadrícula y la leyenda** (RF-1, RF-5, RF-6, RF-8)
  CSS con rejilla de 12 columnas × 7 filas rellenada por columnas, casillas cuadradas, los 5 niveles de color, estilos `futuro` y `hoy`, y leyenda. Usar las variables de color existentes.
  **Hecho cuando:** al añadir temporalmente casillas de ejemplo en el DOM desde la consola del navegador, se ven los 5 niveles distintos, el futuro atenuado y el día de hoy marcado.

- [x] **T12. `pintarMapaCalor()` y enlace con `pintar()`** (RF-1, RF-2, RF-5, RF-6, RF-9, RF-10, RF-11)
  Crear las casillas desde `construirMapaCalor(sesiones, new Date())` con clases `nivel-N`, `futuro` y `hoy`. Llamarla desde `pintar()`.
  **Hecho cuando:** al abrir la página se ven 84 casillas (12 columnas); sin sesiones todas están vacías; al añadir una sesión de hoy aparece coloreada sin recargar.

- [x] **T13. Detalle del día: `title`, ratón, foco y toque** (RF-7)
  Añadir `title`, `aria-label`, `tabindex="0"` (no en futuras) y eventos `mouseenter`, `focus` y `click` que escriben `textoDiaMapa(dia)` en `#mapa-detalle`.
  **Hecho cuando:** al pasar el ratón, enfocar con Tab o tocar una casilla, el detalle muestra la fecha y los minutos correctos.

## Fase 3 — Verificación y cierre
- [x] **T14. Verificación funcional en el navegador** (RF-3, RF-4, RF-5, RF-6, RF-9, RF-10, RF-11, RF-13)
  Con Chrome DevTools: añadir sesiones de 20, 45, 90 y 150 min (más una futura y dos el mismo día), comprobar niveles, editar fecha y minutos, borrar con confirmación, recargar.
  **Hecho cuando:** los colores siguen los tramos, editar y borrar actualizan el mapa al instante, la sesión futura no se colorea, los datos persisten al recargar y `localStorage` conserva el mismo formato `{id, fecha, tema, minutos}`.

- [x] **T15. Verificación de móvil, accesibilidad y consola** (RF-1, RF-7, RF-8)
  Vista móvil (por ejemplo 375 px y 320 px) con Chrome DevTools, navegación con Tab y revisión de consola.
  **Hecho cuando:** no hay scroll horizontal, las casillas son tocables, el detalle se lee en móvil y la consola no tiene errores ni avisos.

- [x] **T16. Cierre: tests, memoria y spec** (todos los RF)
  Ejecutar `node --test`, actualizar `MEMORY.md` (estado v7, decisiones con su porqué, errores a evitar, máximo ~50 líneas) y marcar los criterios de finalización de la spec.
  **Hecho cuando:** `node --test` en verde, `MEMORY.md` actualizado y proponer al usuario si algo debe pasar a `AGENTS.md` (por ejemplo, la existencia de `logica.js`).

## Trazabilidad RF → tareas
| RF | Tareas |
|---|---|
| 1 | T4, T7, T10, T11, T12, T15 |
| 2 | T5, T12 |
| 3 | T2, T6, T14 |
| 4 | T3, T6, T14 |
| 5 | T11, T12, T14 |
| 6 | T5, T11, T12, T14 |
| 7 | T8, T10, T13, T15 |
| 8 | T10, T11, T15 |
| 9 | T12, T14 |
| 10 | T12, T14 |
| 11 | T4, T12, T14 |
| 12 | T1, T4, T7, T9 |
| 13 | T2, T9, T14 |
