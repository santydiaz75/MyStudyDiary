# Plan 004 — Mapa de calor de estudio
Spec: `specs/004-heat-map/spec.md`. Constitución: `docs/constitution.md`.

## 0. Decisiones previas (RESUELTAS por el usuario)
- **Archivos nuevos** `logica.js` y `logica.test.js`: aprobados.
- **Paleta:** azul bolígrafo. **Hoy:** borde oscuro.
- **Idioma del código:** español (la constitución dice inglés; queda como discrepancia a corregir en la constitución, no en el código).
- **RF-1:** 12 columnas, la última es la semana actual (puede estar incompleta). Son 84 casillas.
- **Archivos nuevos** (`logica.js`, `logica.test.js`): `AGENTS.md` dice "pregunta antes de crear archivos". Son necesarios para cumplir los principios 3 y 4 (lógica pura y testeable con `node --test`), porque hoy la lógica de `app.js` usa DOM y `localStorage` y no se puede importar desde Node.
- **Dudas abiertas de la spec** (principio 2: se para y se pregunta): paleta de los 5 niveles y marca de "hoy". Este plan propone una opción por defecto (sección 5) pendiente de confirmación.
- **Idioma del código**: la constitución dice "código en inglés"; `AGENTS.md` y el código existente usan nombres en español. El plan usa español (coherente con `app.js`). Hay que confirmarlo.
- **Interpretación de RF-1**: "12 semanas hasta la semana actual" se toma como **12 columnas, la última es la semana actual (puede estar incompleta)**. Sus días futuros salen atenuados (RF-6). Son 84 casillas.

## 1. Archivos
| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logica.js` | Crear | Funciones puras del mapa (sin DOM ni localStorage, "hoy" como parámetro). Incluye `formatearFecha`, que se mueve desde `app.js`. Exporta a Node con un `if (typeof module !== "undefined")` | RF-1 a 4, 6, 7, 11, 12 |
| `logica.test.js` | Crear | Tests con `node:test` y `node:assert` | todos los de lógica |
| `app.js` | Modificar | Quitar `formatearFecha` (pasa a `logica.js`). Añadir `pintarMapaCalor()` y llamarla desde `pintar()`. Sin tocar `calcularRacha`, `calcularMejorRacha`, etc. | RF-5, 7, 8, 9, 10 |
| `index.html` | Modificar | Nueva sección del mapa y `<script src="logica.js">` **antes** de `app.js` | RF-1, 8 |
| `styles.css` | Modificar | Cuadrícula, 5 niveles de color, futuro, hoy, leyenda | RF-5, 6, 8 |
| `MEMORY.md` | Modificar | Al terminar, estado y decisiones | — |

No cambian la clave `diarioEstudioSesiones` ni el formato de datos (RF-13): el mapa solo lee `sesiones`.

## 2. Funciones puras (`logica.js`)
Todas reciben `hoy` (un `Date`) cuando lo necesitan y nunca llaman a `new Date()` sin argumentos. Ninguna usa `toISOString()` (RF-12).

1. `formatearFecha(fecha)` → `"AAAA-MM-DD"` en hora local. Es la que ya existe, movida. (RF-12)
2. `sumarMinutosPorDia(sesiones)` → objeto `{ "AAAA-MM-DD": minutosTotales }`. (RF-3)
   - Ignora sesiones inválidas: fecha que no cumple `^\d{4}-\d{2}-\d{2}$`, o minutos no numéricos, no finitos o ≤ 0. No modifica el array.
3. `calcularNivel(minutos)` → `0..4`. (RF-4)
   - `0` si minutos ≤ 0; `1` si < 30; `2` si < 60; `3` si < 120; `4` si ≥ 120. Con `<` y no con enteros, los decimales (29,5) caen en un tramo.
4. `construirMapaCalor(sesiones, hoy)` → matriz de 12 semanas × 7 días. (RF-1, 2, 3, 4, 6, 11)
   - Cada día: `{ fecha, minutos, nivel, futuro, esHoy }`.
5. `textoDiaMapa(dia)` → texto del detalle. (RF-7)
   - Pasado o hoy con estudio: `"2026-09-30: 45 min"`; sin estudio: `"2026-09-30: sin estudio"`; futuro: `"2026-10-03: aún no ha llegado"`.

Constantes de `logica.js`: `SEMANAS_MAPA = 12` y los límites de los tramos `[30, 60, 120]`. Las usan la lógica y la leyenda.

## 3. Algoritmo del mapa (pseudocódigo)
```
construirMapaCalor(sesiones, hoy):
  totales   = sumarMinutosPorDia(sesiones)
  textoHoy  = formatearFecha(hoy)
  dia       = copia de hoy a las 12:00          // evita errores de horario de verano
  diaSemana = (dia.getDay() + 6) % 7            // lunes=0 ... domingo=6
  dia.setDate(dia.getDate() - diaSemana)        // lunes de la semana actual
  dia.setDate(dia.getDate() - 7 * (SEMANAS_MAPA - 1))   // lunes de la primera semana

  semanas = []
  repetir SEMANAS_MAPA veces:
    semana = []
    repetir 7 veces:
      texto  = formatearFecha(dia)
      futuro = texto > textoHoy                // comparación de texto AAAA-MM-DD
      minutos = futuro ? 0 : (totales[texto] || 0)
      semana.añadir({ fecha: texto, minutos, nivel: calcularNivel(minutos),
                      futuro, esHoy: texto === textoHoy })
      dia.setDate(dia.getDate() + 1)           // nunca sumar milisegundos
    semanas.añadir(semana)
  devolver semanas
```
- Fechas futuras: no se pintan pero tampoco se borran, porque `totales` solo se lee (RF-6, RF-13).
- Sesiones fuera de rango no entran en ninguna casilla y siguen guardadas.
- Sin sesiones, todo queda en nivel 0 (RF-11).

## 4. Interfaz (`index.html` y `app.js`)
**Estructura HTML** (nueva `<section class="tarjeta">` entre la racha y el formulario):
```
<h2>Últimas 12 semanas</h2>
<div class="mapa">
  <div class="mapa-etiquetas">  L M X J V S D  </div>   (RF-8)
  <div id="mapa-calor" class="mapa-cuadricula"></div>      (RF-1)
</div>
<p id="mapa-detalle" aria-live="polite">Toca un día para ver sus minutos.</p>   (RF-7)
<div class="mapa-leyenda"> Menos [5 casillas] Más · 0 · 1–29 · 30–59 · 60–119 · 120+ min </div>   (RF-8)
```
**`pintarMapaCalor()`** en `app.js`:
1. `semanas = construirMapaCalor(sesiones, new Date())`.
2. Vacía `#mapa-calor` y crea un `span` por día, recorriendo semana a semana. (RF-9, 10)
3. A cada casilla: clase `nivel-N`, clase `futuro` o `hoy` si corresponde, `title` con `textoDiaMapa(dia)`, `aria-label` igual y `tabindex="0"` si no es futura. (RF-5, 6, 7)
4. Eventos `mouseenter`, `focus` y `click` escriben `textoDiaMapa(dia)` en `#mapa-detalle`. (RF-7)
5. `pintar()` la llama junto a `pintarUltimosDias()`, así se actualiza al cargar y tras añadir, editar o borrar sin recargar. (RF-9, 10)

**Cuadrícula en CSS**: `display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 1fr); grid-template-columns: repeat(12, 1fr)`. El orden natural de la matriz (semana tras semana, lunes a domingo) rellena columnas. Casillas con `aspect-ratio: 1` para que quepan en móvil sin scroll horizontal.

## 5. Colores y estados (propuesta pendiente de confirmar)
- Rampa de azul bolígrafo, sobre las variables existentes: `nivel-0` papel con borde `--linea`; `nivel-1` `#d6def5`; `nivel-2` `#a9baee`; `nivel-3` `#6b86dc`; `nivel-4` `var(--boli)`.
- `futuro`: borde discontinuo y opacidad reducida, distinto del nivel 0.
- `hoy`: reutiliza el borde `--tinta` de `.casilla-hoy`.
- El color no es la única vía: el texto de detalle y la leyenda con minutos lo complementan.

## 6. Decisiones técnicas y alternativas descartadas
| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| Archivo `logica.js` con export condicional a Node | Cumple principios 1, 3 y 4 y sigue funcionando por `file://` | `type="module"` (falla en `file://`); testear `app.js` directamente (exige DOM y `localStorage`) |
| Mover solo `formatearFecha` y dejar el resto de `app.js` como está | Cambio pequeño y enfocado | Refactorizar rachas a `logica.js`: no está pedido y sube el riesgo |
| Tramos con `<` sobre el total | Cubren decimales y datos antiguos sin huecos | Rangos enteros 1–29, 30–59…: dejan huecos con 29,5 |
| Recorrer días con `Date` a las 12:00 y `setDate` | Evita saltos por horario de verano (regla del proyecto) | Restar milisegundos de 86 400 000 |
| Comparar fechas como texto `AAAA-MM-DD` | Orden lexicográfico = cronológico y sin zona horaria | Comparar `Date` o usar `toISOString()` (UTC) |
| Ignorar sesiones inválidas solo en el cálculo | Principio 5: nunca se borra ni se corrige nada | Limpiar `localStorage` de datos corruptos |
| Detalle en `#mapa-detalle` además de `title` | `title` no funciona al tocar en móvil ni con teclado | Solo `title` |
| Casillas con `tabindex` y `aria-label` | La información no depende del ratón | Casillas solo decorativas |
| Matriz semanas × días | La cuadrícula se rellena por columnas sin cálculo extra | Lista plana de 84 días con posición calculada en la interfaz |
| Un solo `pintarMapaCalor()` llamado desde `pintar()` | Reutiliza el flujo existente para RF-9 y RF-10 | Actualizar el mapa por separado en cada manejador |

## 7. Estrategia de tests (`node --test`)
Archivo `logica.test.js`, con `require("./logica.js")`, `node:test` y `node:assert`. Sin paquetes. Fechas de prueba fijas, por ejemplo `new Date(2026, 9, 1)`.

| Grupo | Casos | RF |
|---|---|---|
| `formatearFecha` | Rellena ceros; no cambia de día a las 23:59 | 12 |
| `sumarMinutosPorDia` | Suma varias sesiones del mismo día; separa días distintos; ignora fecha mal formada, minutos texto, `NaN`, negativos, 0; no modifica la entrada; lista vacía | 3, 13 |
| `calcularNivel` | Límites 0, 1, 29, 29.5, 30, 59, 60, 119, 120, 500 | 4 |
| `construirMapaCalor` — forma | 12 semanas × 7 días; 84 fechas distintas y consecutivas; la primera fila de cada semana es lunes | 1 |
| — hoy | Hoy en miércoles: `esHoy` solo en esa casilla y los días posteriores `futuro`; hoy lunes (1 casilla no futura); hoy domingo (semana completa) | 2, 6 |
| — datos | Niveles correctos por tramo; sesión futura no se pinta; sesión fuera de rango no aparece; sin sesiones todo nivel 0 y no futuro | 3, 4, 6, 11 |
| — fechas | Cruce de fin de año y 29 de febrero; semana con cambio de horario de verano (marzo y octubre) sin saltar ni repetir días | 1, 12 |
| `textoDiaMapa` | Con estudio, sin estudio y futuro | 7 |

**Fuera de `node --test`** (verificación manual con Chrome DevTools, como pide `AGENTS.md`): RF-5 (intensidad visible), parte visual de RF-7 (detalle al pasar, tocar o enfocar), RF-8 (etiquetas y leyenda), RF-9 y RF-10 (actualización y persistencia), vista móvil sin desbordar, consola sin errores.

## 8. Cobertura de RF
| RF | Cubierto por |
|---|---|
| 1 | `construirMapaCalor`; cuadrícula CSS; tests de forma |
| 2 | `construirMapaCalor` (`esHoy`); estilo `hoy` |
| 3 | `sumarMinutosPorDia` |
| 4 | `calcularNivel` |
| 5 | Clases `nivel-N` y rampa de color; verificación manual |
| 6 | Campo `futuro`; estilo `futuro` |
| 7 | `textoDiaMapa`, `title`, `#mapa-detalle`, foco y clic |
| 8 | Etiquetas y leyenda en HTML/CSS |
| 9 | `pintar()` llama a `pintarMapaCalor()` |
| 10 | Llamada inicial a `pintar()` al cargar |
| 11 | Mapa con todo nivel 0; test |
| 12 | Fechas locales con `setDate` y `formatearFecha`; tests de cruce |
| 13 | Funciones puras que solo leen; sin escrituras en `localStorage` |

## 9. Orden de implementación
1. Resolver la sección 0 con el usuario.
2. Escribir `logica.test.js` y `logica.js` hasta tener `node --test` en verde (principio 4: sin avanzar con tests en rojo).
3. Quitar `formatearFecha` de `app.js`, añadir `<script src="logica.js">` y comprobar que nada se rompe.
4. HTML, CSS y `pintarMapaCalor()`.
5. Verificar en el navegador (escritorio y móvil, consola) y actualizar `MEMORY.md`.
