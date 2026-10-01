# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y lista de
sesiones.
- v2: "Mejor racha" mostrada bajo la racha actual (`calcularMejorRacha` en `app.js`).
- v3: editar sesiones con botón "Editar" en cada fila (reutiliza el formulario).
- v4: borrar sesiones con botón "Borrar" y confirmación (`borrarSesion` en `app.js`).
- v5: "Días estudiados este mes" bajo la mejor racha (`calcularDiasEsteMes` en `app.js`).
- v6: rediseño "cuaderno" (papel, tinta, azul bolígrafo, resaltador amarillo) y fila de
las 7 últimas casillas de días (`pintarUltimosDias` en `app.js`). Solo fuentes del
sistema (Georgia para títulos).
- v7: mapa de calor de 12 semanas (spec/plan/tasks en `specs/004-heat-map/`). Lógica pura
en `logica.js` (`construirMapaCalor`, `calcularNivel`, ...) con 34 tests en
`logica.test.js` (`node --test`); `pintarMapaCalor` en `app.js`. Spec 004 validada y
APROBADA por el usuario: estado "implementada".
- Datos en localStorage.
- `docs/constitution.md` creado (6 principios innegociables), aprobado por el usuario.
- `README.md` añadido a petición del usuario (describe el proyecto).
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha se calcula al vuelo desde las sesiones y no se guarda: no cambia el
formato de localStorage.
- Las fechas futuras cuentan en la mejor racha. Singular "1 día".
- Edición: se reutiliza el formulario y la sesión se identifica por `id` (variable
`idEditando`); el `id` no cambia. Sin confirmación (hay botón "Cancelar").
- Borrado: el usuario lo autorizó (una sesión cada vez). Usa `confirm()` porque es
irreversible; sin deshacer ni "borrar todo". Las rachas se recalculan solas.
- Días del mes: días distintos con sesión en el mes local actual; las fechas futuras
NO cuentan (a diferencia de la mejor racha). Se calcula al vuelo, sin guardarse.
- Mapa: 12 columnas, la última es la semana actual (incompleta); lunes primero. Niveles
por tramos fijos (<30, <60, <120, >=120). Días futuros atenuados y sin color. Paleta azul
boli y "hoy" con borde: confirmadas por el usuario (T0). Código en español (la
constitución dice inglés: discrepancia pendiente de corregir allí).
- `logica.js` se carga antes de `app.js` y exporta a Node con `if (typeof module ...)`.
Solo `formatearFecha` se movió allí; las rachas siguen en `app.js`.
- Detalle del día en `#mapa-detalle` (no solo `title`): en móvil `title` no funciona.
## Aprendizajes y errores a evitar
- `resize_page` no cambia el viewport real: usar `emulate` con `viewport` para móvil.
- El mes se compara con el prefijo "AAAA-MM" del texto de la fecha, sin crear `Date`.
- Para comparar días consecutivos no restar timestamps (horario de verano): usar
Date a las 12:00, `setDate` y `formatearFecha`.
- El estilo global de `button` es ancho completo: los botones pequeños necesitan
sobrescribirlo (`.boton-editar`, `.boton-borrar`).
- Al borrar, si es la sesión en edición (`idEditando`), hay que cancelar la edición.
## Próximos pasos
- Ideas no pedidas (solo vía `/sdd-change`): actualizar "hoy" pasada la medianoche,
casillas más grandes en móvil (hoy ~19 px a 320 px).
- Corregir en la constitución "código en inglés" (el proyecto usa español).
