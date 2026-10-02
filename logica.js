const SEMANAS_MAPA = 12;
const LIMITES_NIVEL = [30, 60, 120];
const OBJETIVO_MIN = 1;
const OBJETIVO_MAX = 10080;

// Devuelve una fecha local como texto "AAAA-MM-DD" (sin usar UTC)
function formatearFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

// Suma los minutos de cada día. Ignora las sesiones con datos no válidos
function sumarMinutosPorDia(sesiones) {
  const totales = {};
  sesiones.forEach((s) => {
    if (!s || typeof s !== "object") return;
    if (typeof s.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s.fecha)) return;
    if (typeof s.minutos !== "number" || !Number.isFinite(s.minutos)) return;
    if (s.minutos <= 0) return;
    totales[s.fecha] = (totales[s.fecha] || 0) + s.minutos;
  });
  return totales;
}

// Nivel de intensidad de 0 a 4 según los minutos del día
function calcularNivel(minutos) {
  if (!(minutos > 0)) return 0;
  let nivel = 1;
  LIMITES_NIVEL.forEach((limite) => {
    if (minutos >= limite) nivel++;
  });
  return nivel;
}

// Devuelve SEMANAS_MAPA semanas (lunes a domingo); la última es la semana de "hoy"
function construirMapaCalor(sesiones, hoy) {
  const totales = sumarMinutosPorDia(sesiones);
  const textoHoy = formatearFecha(hoy);

  const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 12);
  const diaSemana = (dia.getDay() + 6) % 7;
  dia.setDate(dia.getDate() - diaSemana - 7 * (SEMANAS_MAPA - 1));

  const semanas = [];
  for (let s = 0; s < SEMANAS_MAPA; s++) {
    const semana = [];
    for (let d = 0; d < 7; d++) {
      const texto = formatearFecha(dia);
      const futuro = texto > textoHoy;
      const minutos = futuro ? 0 : totales[texto] || 0;
      semana.push({
        fecha: texto,
        minutos: minutos,
        nivel: calcularNivel(minutos),
        futuro: futuro,
        esHoy: texto === textoHoy,
      });
      dia.setDate(dia.getDate() + 1);
    }
    semanas.push(semana);
  }
  return semanas;
}

// Texto que se muestra al consultar un día del mapa
function textoDiaMapa(dia) {
  if (dia.futuro) return dia.fecha + ": aún no ha llegado";
  if (dia.minutos > 0) return dia.fecha + ": " + dia.minutos + " min";
  return dia.fecha + ": sin estudio";
}

// Valida el objetivo semanal escrito: entero entre OBJETIVO_MIN y OBJETIVO_MAX
function validarObjetivo(texto) {
  if (typeof texto !== "string") return { valido: false };
  const limpio = texto.trim();
  if (!/^\d+$/.test(limpio)) return { valido: false };
  const valor = Number(limpio);
  if (valor < OBJETIVO_MIN || valor > OBJETIVO_MAX) return { valido: false };
  return { valido: true, valor: valor };
}

// Lee el texto guardado en localStorage: devuelve el objetivo o null si no es válido
function leerObjetivoGuardado(textoGuardado) {
  try {
    const valor = JSON.parse(textoGuardado);
    if (typeof valor !== "number" || !Number.isInteger(valor)) return null;
    if (valor < OBJETIVO_MIN || valor > OBJETIVO_MAX) return null;
    return valor;
  } catch (error) {
    return null;
  }
}

// Devuelve el lunes de la semana de "hoy" como texto "AAAA-MM-DD"
function calcularLunes(hoy) {
  const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 12);
  const diaSemana = (dia.getDay() + 6) % 7;
  dia.setDate(dia.getDate() - diaSemana);
  return formatearFecha(dia);
}

// Suma los minutos de las sesiones válidas desde el lunes de la semana de "hoy" hasta hoy
function calcularMinutosSemana(sesiones, hoy) {
  const lunes = calcularLunes(hoy);
  const textoHoy = formatearFecha(hoy);
  let total = 0;
  sesiones.forEach((s) => {
    if (!s || typeof s !== "object") return;
    if (typeof s.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s.fecha)) return;
    if (!Number.isInteger(s.minutos) || s.minutos <= 0) return;
    const [anio, mes, dia] = s.fecha.split("-").map(Number);
    if (formatearFecha(new Date(anio, mes - 1, dia, 12)) !== s.fecha) return;
    if (s.fecha < lunes || s.fecha > textoHoy) return;
    total += s.minutos;
  });
  return total;
}

// Progreso hacia el objetivo semanal: minutos, porcentaje, ancho de barra, cumplido y texto
function calcularProgresoSemanal(sesiones, objetivo, hoy) {
  const minutos = calcularMinutosSemana(sesiones, hoy);
  const porcentaje = Math.round((minutos / objetivo) * 100);
  return {
    minutos: minutos,
    objetivo: objetivo,
    porcentaje: porcentaje,
    anchoBarra: Math.min(porcentaje, 100),
    cumplido: minutos >= objetivo,
    texto: minutos + " / " + objetivo + " min (" + porcentaje + " %)",
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    formatearFecha,
    sumarMinutosPorDia,
    calcularNivel,
    construirMapaCalor,
    textoDiaMapa,
    validarObjetivo,
    leerObjetivoGuardado,
    calcularLunes,
    calcularMinutosSemana,
    calcularProgresoSemanal,
    OBJETIVO_MIN,
    OBJETIVO_MAX,
  };
}
