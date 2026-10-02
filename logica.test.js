const test = require("node:test");
const assert = require("node:assert");
const {
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
} = require("./logica.js");

// Aplana la matriz de semanas en una lista de 84 días
function aplanar(semanas) {
  return semanas.reduce((todos, semana) => todos.concat(semana), []);
}

// Comprueba que las fechas son únicas y consecutivas día a día
function comprobarConsecutivas(dias) {
  const primera = dias[0].fecha.split("-").map(Number);
  dias.forEach((dia, i) => {
    const esperada = new Date(primera[0], primera[1] - 1, primera[2] + i, 12);
    assert.strictEqual(dia.fecha, formatearFecha(esperada));
  });
}

// ---------- T1: formatearFecha (RF-12) ----------

test("formatearFecha rellena con ceros mes y día", () => {
  assert.strictEqual(formatearFecha(new Date(2026, 0, 5)), "2026-01-05");
});

test("formatearFecha no cambia de día a las 23:59", () => {
  assert.strictEqual(
    formatearFecha(new Date(2026, 9, 1, 23, 59, 59)),
    "2026-10-01"
  );
});

test("formatearFecha no cambia de día a las 00:00", () => {
  assert.strictEqual(formatearFecha(new Date(2026, 9, 1, 0, 0, 0)), "2026-10-01");
});

// ---------- T2: sumarMinutosPorDia (RF-3, RF-13) ----------

test("sumarMinutosPorDia suma varias sesiones del mismo día", () => {
  const sesiones = [
    { id: 1, fecha: "2026-10-01", tema: "A", minutos: 20 },
    { id: 2, fecha: "2026-10-01", tema: "B", minutos: 15 },
  ];
  assert.deepStrictEqual(sumarMinutosPorDia(sesiones), { "2026-10-01": 35 });
});

test("sumarMinutosPorDia separa días distintos", () => {
  const sesiones = [
    { id: 1, fecha: "2026-10-01", tema: "A", minutos: 20 },
    { id: 2, fecha: "2026-10-02", tema: "B", minutos: 40 },
  ];
  assert.deepStrictEqual(sumarMinutosPorDia(sesiones), {
    "2026-10-01": 20,
    "2026-10-02": 40,
  });
});

test("sumarMinutosPorDia con lista vacía devuelve objeto vacío", () => {
  assert.deepStrictEqual(sumarMinutosPorDia([]), {});
});

test("sumarMinutosPorDia ignora fechas mal formadas", () => {
  const sesiones = [
    { id: 1, fecha: "2026-9-3", tema: "A", minutos: 10 },
    { id: 2, fecha: "", tema: "B", minutos: 10 },
    { id: 3, fecha: null, tema: "C", minutos: 10 },
    { id: 4, tema: "D", minutos: 10 },
  ];
  assert.deepStrictEqual(sumarMinutosPorDia(sesiones), {});
});

test("sumarMinutosPorDia ignora minutos no válidos", () => {
  const f = "2026-10-01";
  const sesiones = [
    { id: 1, fecha: f, tema: "A", minutos: "30" },
    { id: 2, fecha: f, tema: "B", minutos: NaN },
    { id: 3, fecha: f, tema: "C", minutos: -5 },
    { id: 4, fecha: f, tema: "D", minutos: 0 },
    { id: 5, fecha: f, tema: "E", minutos: Infinity },
    { id: 6, fecha: f, tema: "F" },
    { id: 7, fecha: f, tema: "G", minutos: 25 },
  ];
  assert.deepStrictEqual(sumarMinutosPorDia(sesiones), { [f]: 25 });
});

test("sumarMinutosPorDia ignora elementos que no son sesiones", () => {
  assert.deepStrictEqual(sumarMinutosPorDia([null, undefined, 5, "x"]), {});
});

test("sumarMinutosPorDia no modifica la lista de entrada", () => {
  const sesiones = [
    { id: 1, fecha: "2026-10-01", tema: "A", minutos: 20 },
    { id: 2, fecha: "mal", tema: "B", minutos: "x" },
  ];
  const copia = JSON.parse(JSON.stringify(sesiones));
  sumarMinutosPorDia(sesiones);
  assert.deepStrictEqual(sesiones, copia);
});

// ---------- T3: calcularNivel (RF-4) ----------

test("calcularNivel respeta los límites de los tramos", () => {
  const casos = [
    [0, 0],
    [1, 1],
    [29, 1],
    [29.5, 1],
    [30, 2],
    [59, 2],
    [60, 3],
    [119, 3],
    [120, 4],
    [500, 4],
  ];
  casos.forEach(([minutos, nivel]) => {
    assert.strictEqual(calcularNivel(minutos), nivel, minutos + " min");
  });
});

test("calcularNivel devuelve 0 para valores no válidos", () => {
  assert.strictEqual(calcularNivel(-10), 0);
  assert.strictEqual(calcularNivel(NaN), 0);
  assert.strictEqual(calcularNivel(undefined), 0);
});

// ---------- T4: construirMapaCalor, forma (RF-1, RF-11, RF-12) ----------

test("construirMapaCalor devuelve 12 semanas de 7 días", () => {
  const semanas = construirMapaCalor([], new Date(2026, 9, 1));
  assert.strictEqual(semanas.length, 12);
  semanas.forEach((semana) => assert.strictEqual(semana.length, 7));
});

test("construirMapaCalor empieza en lunes y termina en domingo", () => {
  const dias = aplanar(construirMapaCalor([], new Date(2026, 9, 1)));
  assert.strictEqual(dias[0].fecha, "2026-07-13");
  assert.strictEqual(dias[83].fecha, "2026-10-04");
});

test("construirMapaCalor: cada semana empieza en lunes", () => {
  const semanas = construirMapaCalor([], new Date(2026, 9, 1));
  semanas.forEach((semana) => {
    const partes = semana[0].fecha.split("-").map(Number);
    const lunes = new Date(partes[0], partes[1] - 1, partes[2], 12);
    assert.strictEqual(lunes.getDay(), 1);
  });
});

test("construirMapaCalor genera 84 fechas únicas y consecutivas", () => {
  const dias = aplanar(construirMapaCalor([], new Date(2026, 9, 1)));
  assert.strictEqual(dias.length, 84);
  assert.strictEqual(new Set(dias.map((d) => d.fecha)).size, 84);
  comprobarConsecutivas(dias);
});

test("construirMapaCalor sin sesiones deja todo en nivel 0", () => {
  const dias = aplanar(construirMapaCalor([], new Date(2026, 9, 1)));
  dias.forEach((dia) => {
    assert.strictEqual(dia.nivel, 0);
    assert.strictEqual(dia.minutos, 0);
  });
});

test("construirMapaCalor no modifica la fecha de hoy recibida", () => {
  const hoy = new Date(2026, 9, 1, 18, 30);
  const antes = hoy.getTime();
  construirMapaCalor([], hoy);
  assert.strictEqual(hoy.getTime(), antes);
});

// ---------- T5: hoy y días futuros (RF-2, RF-6) ----------

test("construirMapaCalor marca solo hoy y los días posteriores como futuros", () => {
  // 2026-10-01 es jueves
  const dias = aplanar(construirMapaCalor([], new Date(2026, 9, 1)));
  const marcadosHoy = dias.filter((d) => d.esHoy);
  assert.strictEqual(marcadosHoy.length, 1);
  assert.strictEqual(marcadosHoy[0].fecha, "2026-10-01");
  assert.strictEqual(marcadosHoy[0].futuro, false);

  const futuros = dias.filter((d) => d.futuro).map((d) => d.fecha);
  assert.deepStrictEqual(futuros, ["2026-10-02", "2026-10-03", "2026-10-04"]);
});

test("construirMapaCalor no colorea sesiones con fecha futura", () => {
  const sesiones = [
    { id: 1, fecha: "2026-10-03", tema: "A", minutos: 200 },
    { id: 2, fecha: "2099-01-01", tema: "B", minutos: 200 },
  ];
  const dias = aplanar(construirMapaCalor(sesiones, new Date(2026, 9, 1)));
  dias.forEach((dia) => {
    assert.strictEqual(dia.nivel, 0);
    assert.strictEqual(dia.minutos, 0);
  });
});

test("construirMapaCalor con hoy lunes: una sola casilla no futura en la última semana", () => {
  // 2026-09-28 es lunes
  const semanas = construirMapaCalor([], new Date(2026, 8, 28));
  const ultima = semanas[11];
  assert.strictEqual(ultima[0].fecha, "2026-09-28");
  assert.strictEqual(ultima[0].esHoy, true);
  assert.strictEqual(ultima.filter((d) => !d.futuro).length, 1);
});

test("construirMapaCalor con hoy domingo: la última semana está completa", () => {
  // 2026-10-04 es domingo
  const semanas = construirMapaCalor([], new Date(2026, 9, 4));
  const ultima = semanas[11];
  assert.strictEqual(ultima[6].fecha, "2026-10-04");
  assert.strictEqual(ultima[6].esHoy, true);
  assert.strictEqual(ultima.filter((d) => d.futuro).length, 0);
});

test("construirMapaCalor ignora la hora de hoy", () => {
  const a = construirMapaCalor([], new Date(2026, 9, 1, 0, 1));
  const b = construirMapaCalor([], new Date(2026, 9, 1, 23, 59));
  assert.deepStrictEqual(a, b);
});

// ---------- T6: minutos y niveles (RF-3, RF-4) ----------

test("construirMapaCalor suma las sesiones del mismo día y asigna nivel", () => {
  const sesiones = [
    { id: 1, fecha: "2026-09-30", tema: "A", minutos: 20 },
    { id: 2, fecha: "2026-09-30", tema: "B", minutos: 15 },
  ];
  const dias = aplanar(construirMapaCalor(sesiones, new Date(2026, 9, 1)));
  const dia = dias.find((d) => d.fecha === "2026-09-30");
  assert.strictEqual(dia.minutos, 35);
  assert.strictEqual(dia.nivel, 2);
});

test("construirMapaCalor asigna un nivel distinto según los tramos", () => {
  const sesiones = [
    { id: 1, fecha: "2026-09-26", tema: "A", minutos: 10 },
    { id: 2, fecha: "2026-09-27", tema: "A", minutos: 45 },
    { id: 3, fecha: "2026-09-28", tema: "A", minutos: 90 },
    { id: 4, fecha: "2026-09-29", tema: "A", minutos: 150 },
  ];
  const dias = aplanar(construirMapaCalor(sesiones, new Date(2026, 9, 1)));
  const nivel = (fecha) => dias.find((d) => d.fecha === fecha).nivel;
  assert.strictEqual(nivel("2026-09-25"), 0);
  assert.strictEqual(nivel("2026-09-26"), 1);
  assert.strictEqual(nivel("2026-09-27"), 2);
  assert.strictEqual(nivel("2026-09-28"), 3);
  assert.strictEqual(nivel("2026-09-29"), 4);
});

test("construirMapaCalor: hoy con estudio mantiene esHoy y su nivel", () => {
  const sesiones = [{ id: 1, fecha: "2026-10-01", tema: "A", minutos: 60 }];
  const dias = aplanar(construirMapaCalor(sesiones, new Date(2026, 9, 1)));
  const hoy = dias.find((d) => d.esHoy);
  assert.strictEqual(hoy.nivel, 3);
  assert.strictEqual(hoy.minutos, 60);
});

test("construirMapaCalor no muestra sesiones fuera de las 12 semanas", () => {
  const sesiones = [
    { id: 1, fecha: "2026-07-12", tema: "A", minutos: 100 },
    { id: 2, fecha: "2020-01-01", tema: "B", minutos: 100 },
  ];
  const dias = aplanar(construirMapaCalor(sesiones, new Date(2026, 9, 1)));
  dias.forEach((dia) => assert.strictEqual(dia.nivel, 0));
});

test("construirMapaCalor ignora sesiones corruptas sin fallar", () => {
  const sesiones = [
    { id: 1, fecha: "2026-09-30", tema: "A", minutos: "x" },
    { id: 2, fecha: "basura", tema: "B", minutos: 50 },
    { id: 3, fecha: "2026-09-30", tema: "C", minutos: 10 },
  ];
  const dias = aplanar(construirMapaCalor(sesiones, new Date(2026, 9, 1)));
  const dia = dias.find((d) => d.fecha === "2026-09-30");
  assert.strictEqual(dia.minutos, 10);
});

// ---------- T7: casos límite de fechas (RF-1, RF-12) ----------

test("construirMapaCalor cruza el fin de año sin saltos", () => {
  const dias = aplanar(construirMapaCalor([], new Date(2026, 0, 10)));
  assert.strictEqual(dias.length, 84);
  assert.ok(dias.some((d) => d.fecha === "2025-12-31"));
  assert.ok(dias.some((d) => d.fecha === "2026-01-01"));
  comprobarConsecutivas(dias);
});

test("construirMapaCalor incluye el 29 de febrero de un año bisiesto", () => {
  const dias = aplanar(construirMapaCalor([], new Date(2028, 2, 2)));
  assert.ok(dias.some((d) => d.fecha === "2028-02-29"));
  assert.ok(!dias.some((d) => d.fecha === "2028-02-30"));
  comprobarConsecutivas(dias);
});

test("construirMapaCalor no se salta ni repite días en cambios de horario", () => {
  const fechasHoy = [
    new Date(2026, 2, 8),
    new Date(2026, 2, 29),
    new Date(2026, 2, 30),
    new Date(2026, 9, 25),
    new Date(2026, 9, 26),
    new Date(2026, 10, 1),
    new Date(2026, 10, 2),
    new Date(2026, 5, 10),
    new Date(2027, 2, 28),
  ];
  fechasHoy.forEach((hoy) => {
    const dias = aplanar(construirMapaCalor([], hoy));
    assert.strictEqual(dias.length, 84);
    assert.strictEqual(new Set(dias.map((d) => d.fecha)).size, 84);
    comprobarConsecutivas(dias);
  });
});

// ---------- T8: textoDiaMapa (RF-7) ----------

test("textoDiaMapa muestra los minutos de un día con estudio", () => {
  const dia = { fecha: "2026-09-30", minutos: 45, nivel: 2, futuro: false, esHoy: false };
  assert.strictEqual(textoDiaMapa(dia), "2026-09-30: 45 min");
});

test("textoDiaMapa indica que no hubo estudio", () => {
  const dia = { fecha: "2026-09-29", minutos: 0, nivel: 0, futuro: false, esHoy: false };
  assert.strictEqual(textoDiaMapa(dia), "2026-09-29: sin estudio");
});

test("textoDiaMapa indica que el día futuro aún no ha llegado", () => {
  const dia = { fecha: "2026-10-03", minutos: 0, nivel: 0, futuro: true, esHoy: false };
  assert.strictEqual(textoDiaMapa(dia), "2026-10-03: aún no ha llegado");
});

test("validarObjetivo acepta enteros entre 1 y 10080 (con espacios)", () => {
  assert.deepStrictEqual(validarObjetivo("1"), { valido: true, valor: 1 });
  assert.deepStrictEqual(validarObjetivo("300"), { valido: true, valor: 300 });
  assert.deepStrictEqual(validarObjetivo(" 300 "), { valido: true, valor: 300 });
  assert.deepStrictEqual(validarObjetivo("10080"), { valido: true, valor: 10080 });
});

test("validarObjetivo rechaza vacío, 0, negativos, decimales, notación científica, rango y texto", () => {
  ["", "   ", "0", "-5", "2.5", "1e3", "10081", "abc", "3 0", null, undefined].forEach((entrada) => {
    assert.deepStrictEqual(validarObjetivo(entrada), { valido: false }, String(entrada));
  });
});

test("leerObjetivoGuardado devuelve el número guardado", () => {
  assert.strictEqual(leerObjetivoGuardado("300"), 300);
});

test("leerObjetivoGuardado devuelve null con datos corruptos o fuera de rango", () => {
  [null, "", '"300"', "2.5", "0", "NaN", "10081", "{", "[300]", "null"].forEach((entrada) => {
    assert.doesNotThrow(() => leerObjetivoGuardado(entrada), String(entrada));
    assert.strictEqual(leerObjetivoGuardado(entrada), null, String(entrada));
  });
});

test("calcularLunes devuelve el lunes de la semana de hoy", () => {
  const casos = [
    [new Date(2026, 8, 28), "2026-09-28"],
    [new Date(2026, 8, 30), "2026-09-28"],
    [new Date(2026, 9, 4), "2026-09-28"],
    [new Date(2027, 0, 1), "2026-12-28"],
    [new Date(2028, 2, 1), "2028-02-28"],
    [new Date(2026, 2, 29), "2026-03-23"],
    [new Date(2026, 9, 25), "2026-10-19"],
    [new Date(2026, 10, 1), "2026-10-26"],
  ];
  casos.forEach(([hoy, esperado]) => {
    assert.strictEqual(calcularLunes(hoy), esperado, formatearFecha(hoy));
  });
});

test("calcularLunes no modifica hoy e ignora la hora", () => {
  const hoy = new Date(2026, 9, 2, 23, 59);
  const copia = hoy.getTime();
  assert.strictEqual(calcularLunes(hoy), "2026-09-28");
  assert.strictEqual(hoy.getTime(), copia);
  assert.strictEqual(calcularLunes(new Date(2026, 9, 2, 0, 0)), "2026-09-28");
});

test("calcularMinutosSemana suma la semana, incluye lunes y hoy, excluye domingo anterior y futuros", () => {
  const hoy = new Date(2026, 9, 2, 23, 59);
  const sesiones = [
    { id: 1, fecha: "2026-09-27", tema: "a", minutos: 100 },
    { id: 2, fecha: "2026-09-28", tema: "a", minutos: 30 },
    { id: 3, fecha: "2026-09-28", tema: "b", minutos: 20 },
    { id: 4, fecha: "2026-10-01", tema: "c", minutos: 15 },
    { id: 5, fecha: "2026-10-02", tema: "d", minutos: 5 },
    { id: 6, fecha: "2026-10-03", tema: "e", minutos: 200 },
  ];
  assert.strictEqual(calcularMinutosSemana(sesiones, hoy), 70);
});

test("calcularMinutosSemana sin sesiones devuelve 0", () => {
  assert.strictEqual(calcularMinutosSemana([], new Date(2026, 9, 2)), 0);
});

test("calcularMinutosSemana ignora datos no válidos", () => {
  const f = "2026-10-01";
  const sesiones = [
    { fecha: "2026-02-30", minutos: 10 },
    { fecha: "hola", minutos: 10 },
    { fecha: f, minutos: "10" },
    { fecha: f, minutos: NaN },
    { fecha: f, minutos: -5 },
    { fecha: f, minutos: 0 },
    { fecha: f, minutos: 2.5 },
    null,
    undefined,
    42,
    "texto",
    { fecha: f },
    { fecha: f, minutos: 7 },
  ];
  assert.strictEqual(calcularMinutosSemana(sesiones, new Date(2026, 9, 2)), 7);
});

test("calcularMinutosSemana no modifica la entrada", () => {
  const sesiones = [{ id: 1, fecha: "2026-10-01", tema: "a", minutos: 10 }];
  const copia = JSON.stringify(sesiones);
  calcularMinutosSemana(sesiones, new Date(2026, 9, 2));
  assert.strictEqual(JSON.stringify(sesiones), copia);
});

test("calcularMinutosSemana con hoy lunes solo cuenta hoy", () => {
  const sesiones = [
    { fecha: "2026-09-27", minutos: 50 },
    { fecha: "2026-09-28", minutos: 25 },
    { fecha: "2026-09-29", minutos: 40 },
  ];
  assert.strictEqual(calcularMinutosSemana(sesiones, new Date(2026, 8, 28)), 25);
});

// Semana de prueba: hoy = viernes 2026-10-02, lunes = 2026-09-28
function progreso(minutos, objetivo) {
  const sesiones = [{ fecha: "2026-09-29", minutos: minutos }];
  return calcularProgresoSemanal(sesiones, objetivo, new Date(2026, 9, 2));
}

test("calcularProgresoSemanal 0/1 es 0 % y no cumplido", () => {
  const p = calcularProgresoSemanal([], 1, new Date(2026, 9, 2));
  assert.strictEqual(p.minutos, 0);
  assert.strictEqual(p.porcentaje, 0);
  assert.strictEqual(p.anchoBarra, 0);
  assert.strictEqual(p.cumplido, false);
  assert.strictEqual(p.texto, "0 / 1 min (0 %)");
});

test("calcularProgresoSemanal 150/300 es 50 %", () => {
  const p = progreso(150, 300);
  assert.strictEqual(p.porcentaje, 50);
  assert.strictEqual(p.anchoBarra, 50);
  assert.strictEqual(p.cumplido, false);
});

test("calcularProgresoSemanal 299/300 redondea a 100 % pero no está cumplido", () => {
  const p = progreso(299, 300);
  assert.strictEqual(p.porcentaje, 100);
  assert.strictEqual(p.cumplido, false);
});

test("calcularProgresoSemanal 300/300 es 100 % y cumplido", () => {
  const p = progreso(300, 300);
  assert.strictEqual(p.porcentaje, 100);
  assert.strictEqual(p.cumplido, true);
});

test("calcularProgresoSemanal 350/300 pasa de 100 % pero la barra se limita", () => {
  const p = progreso(350, 300);
  assert.strictEqual(p.minutos, 350);
  assert.strictEqual(p.objetivo, 300);
  assert.strictEqual(p.porcentaje, 117);
  assert.strictEqual(p.anchoBarra, 100);
  assert.strictEqual(p.cumplido, true);
  assert.strictEqual(p.texto, "350 / 300 min (117 %)");
});
