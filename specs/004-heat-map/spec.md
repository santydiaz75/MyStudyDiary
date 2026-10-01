# Spec 004 — Mapa de calor de estudio
Estado: implementada
## Contexto y objetivo
La racha y la fila de las 7 últimas casillas solo muestran el pasado inmediato. El mapa de calor, al estilo GitHub, permite ver de un vistazo la constancia de las últimas 12 semanas y cuánto se estudió cada día: cuanto más minutos, más intenso el color. Refuerza la motivación, que es el propósito del diario.
## Usuarios / actores
Una única persona usuaria que registra sus sesiones de estudio (uso personal).
## Historias de usuario
- H1: Como estudiante quiero ver un mapa de calor de las últimas 12 semanas para identificar de un vistazo mis días de estudio y mis huecos.
- H2: Como estudiante quiero que el color refleje los minutos estudiados cada día para saber qué días trabajé más.
- H3: Como estudiante quiero consultar la fecha y los minutos exactos de un día para no depender solo del color.
## Requisitos funcionales (criterios de aceptación en EARS)
- RF-1: EL SISTEMA mostrará una cuadrícula con las últimas 12 semanas completas hasta la semana actual, con una columna por semana y una fila por día de la semana, empezando en lunes.
- RF-2: EL SISTEMA mostrará una casilla por cada día, incluido el día de hoy, que será la última casilla con fecha no futura.
- RF-3: EL SISTEMA sumará los minutos de todas las sesiones de un mismo día para determinar su total diario.
- RF-4: EL SISTEMA asignará a cada día un nivel de intensidad según su total diario con tramos fijos: nivel 0 (0 min), nivel 1 (1–29), nivel 2 (30–59), nivel 3 (60–119), nivel 4 (120 o más).
- RF-5: CUANDO un día tenga nivel mayor, EL SISTEMA mostrará su casilla con un color más intenso; el nivel 0 se verá como casilla vacía.
- RF-6: SI una casilla corresponde a un día posterior a hoy, ENTONCES EL SISTEMA la mostrará atenuada/vacía y no la coloreará aunque existan sesiones con esa fecha.
- RF-7: CUANDO la persona usuaria pase el ratón o toque una casilla, EL SISTEMA mostrará la fecha y los minutos totales de ese día (por ejemplo, "2026-09-30: 45 min" o "sin estudio").
- RF-8: EL SISTEMA mostrará etiquetas de los días de la semana y una leyenda que explique los niveles de intensidad.
- RF-9: CUANDO se añada, edite o borre una sesión, EL SISTEMA actualizará el mapa de calor sin recargar la página.
- RF-10: CUANDO se cargue la página, EL SISTEMA mostrará el mapa con las sesiones guardadas.
- RF-11: SI no hay ninguna sesión, ENTONCES EL SISTEMA mostrará la cuadrícula con todas las casillas vacías.
- RF-12: EL SISTEMA usará siempre fechas locales, nunca UTC.
- RF-13: EL SISTEMA no modificará los datos guardados ni su formato.
## Requisitos no funcionales
- Funciona abriendo `index.html` con doble clic, sin dependencias.
- Interfaz en español y coherente con el diseño "cuaderno" actual.
- Legible en móvil sin desbordar la pantalla.
- El color no es la única vía de información (RF-7, RF-8).
- Los cálculos son funciones puras que reciben "hoy" como parámetro y se prueban con `node --test`.
## Casos límite
- Varias sesiones el mismo día: se suman.
- Sesiones fuera de las 12 semanas: no se muestran, pero no se pierden.
- Sesiones con fecha futura: no se pintan (RF-6); siguen guardadas.
- Hoy a mitad de semana: los días restantes de la semana actual son futuros y salen atenuados.
- Cambio de horario de verano: el recuento de 12 semanas no debe saltarse ni repetir días.
- Datos corruptos (minutos no numéricos o fecha inválida): se ignoran en el cálculo sin romper la página ni borrar datos.
- Un día con un solo minuto debe verse distinto de un día sin estudio.
## Fuera de alcance
- Elegir otro rango (año, meses) o desplazarse por el tiempo.
- Pulsar una casilla para filtrar, editar o rellenar el formulario.
- Niveles relativos al máximo o configurables.
- Exportar o compartir el mapa; etiquetas de meses; domingo como primer día.
## Criterios de finalización
- Todos los RF tienen test en verde con `node --test` para la lógica.
- Demo manual: añadir sesiones de distintas duraciones y días, ver los colores por tramos, editar y borrar con actualización inmediata, recargar y comprobar persistencia, revisar vista móvil y consola sin errores.
## Dudas abiertas
Ninguna. Decisiones tomadas:
- Paleta: tonos de azul bolígrafo para los 5 niveles.
- El día de hoy se marca con un borde oscuro.
- Semana actual: la última de las 12 columnas (puede estar incompleta; sus días futuros salen atenuados).
- Los archivos `logica.js` y `logica.test.js` están aprobados (se citan aquí solo como registro de la decisión).
- Idioma del código: español, igual que el resto del proyecto.
