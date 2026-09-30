# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y lista de
sesiones.
- v2: "Mejor racha" mostrada bajo la racha actual (`calcularMejorRacha` en `app.js`).
- v3: editar sesiones con botón "Editar" en cada fila (reutiliza el formulario).
- Datos en localStorage.
- `README.md` añadido a petición del usuario (describe el proyecto).
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha se calcula al vuelo desde las sesiones y no se guarda: no cambia el
formato de localStorage.
- Las fechas futuras cuentan en la mejor racha. Singular "1 día".
- Edición: se reutiliza el formulario y la sesión se identifica por `id` (variable
`idEditando`); el `id` no cambia. Sin borrar (AGENTS.md prohíbe borrar datos) y sin
confirmación (hay botón "Cancelar").
## Aprendizajes y errores a evitar
- Para comparar días consecutivos no restar timestamps (horario de verano): usar
Date a las 12:00, `setDate` y `formatearFecha`.
- El estilo global de `button` es ancho completo: los botones pequeños necesitan
sobrescribirlo (`.boton-editar`).
## Próximos pasos
- (vacío por ahora)
