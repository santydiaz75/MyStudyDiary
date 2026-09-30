const CLAVE = "diarioEstudioSesiones";

const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const textoError = document.getElementById("error");
const textoRacha = document.getElementById("racha");
const textoMejorRacha = document.getElementById("mejor-racha");
const lista = document.getElementById("lista");
const textoVacio = document.getElementById("vacio");

const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("boton-guardar");
const botonCancelar = document.getElementById("boton-cancelar");

let sesiones = cargarSesiones();
let idEditando = null;

// Devuelve una fecha local como texto "AAAA-MM-DD" (sin usar UTC)
function formatearFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return anio + "-" + mes + "-" + dia;
}

function cargarSesiones() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(datos) ? datos : [];
  } catch (e) {
    return [];
  }
}

function guardarSesiones() {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

function calcularRacha() {
  const dias = new Set(sesiones.map((s) => s.fecha));
  const dia = new Date();
  dia.setHours(12, 0, 0, 0);

  // Si hoy no hay sesión, la racha sigue viva si ayer sí hubo
  if (!dias.has(formatearFecha(dia))) {
    dia.setDate(dia.getDate() - 1);
  }

  let racha = 0;
  while (dias.has(formatearFecha(dia))) {
    racha++;
    dia.setDate(dia.getDate() - 1);
  }
  return racha;
}

function calcularMejorRacha() {
  const dias = Array.from(new Set(sesiones.map((s) => s.fecha))).sort();

  let mejor = 0;
  let actual = 0;
  let anterior = null;
  dias.forEach((texto) => {
    if (anterior !== null) {
      const siguiente = new Date(anterior + "T12:00:00");
      siguiente.setDate(siguiente.getDate() + 1);
      actual = formatearFecha(siguiente) === texto ? actual + 1 : 1;
    } else {
      actual = 1;
    }
    if (actual > mejor) mejor = actual;
    anterior = texto;
  });
  return mejor;
}

function empezarEdicion(sesion) {
  idEditando = sesion.id;
  campoFecha.value = sesion.fecha;
  campoTema.value = sesion.tema;
  campoMinutos.value = sesion.minutos;
  textoError.textContent = "";
  tituloFormulario.textContent = "Editar sesión";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  formulario.scrollIntoView({ behavior: "smooth" });
  campoTema.focus();
}

function cancelarEdicion() {
  idEditando = null;
  campoFecha.value = formatearFecha(new Date());
  campoTema.value = "";
  campoMinutos.value = "";
  textoError.textContent = "";
  tituloFormulario.textContent = "Nueva sesión";
  botonGuardar.textContent = "Guardar sesión";
  botonCancelar.hidden = true;
}

function mostrarFecha(texto) {
  const partes = texto.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function pintar() {
  const rachaActual = calcularRacha();
  const mejor = Math.max(calcularMejorRacha(), rachaActual);
  textoRacha.textContent = rachaActual;
  textoMejorRacha.textContent =
    "Mejor racha: " + mejor + (mejor === 1 ? " día" : " días");

  const ordenadas = sesiones.slice().sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return b.id - a.id;
  });

  lista.innerHTML = "";
  ordenadas.forEach((s) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const tema = document.createElement("div");
    tema.className = "sesion-tema";
    tema.textContent = s.tema;
    const fecha = document.createElement("div");
    fecha.className = "sesion-fecha";
    fecha.textContent = mostrarFecha(s.fecha);
    info.append(tema, fecha);

    const minutos = document.createElement("div");
    minutos.className = "sesion-minutos";
    minutos.textContent = s.minutos + " min";

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.className = "boton-secundario boton-editar";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => empezarEdicion(s));

    const derecha = document.createElement("div");
    derecha.className = "sesion-derecha";
    derecha.append(minutos, botonEditar);

    li.append(info, derecha);
    lista.appendChild(li);
  });

  textoVacio.hidden = sesiones.length > 0;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha) {
    textoError.textContent = "Elige una fecha.";
    return;
  }
  if (!tema) {
    textoError.textContent = "Escribe el tema que has estudiado.";
    return;
  }
  if (!Number.isInteger(minutos) || minutos <= 0) {
    textoError.textContent = "Los minutos deben ser un número mayor que 0.";
    return;
  }

  textoError.textContent = "";
  if (idEditando !== null) {
    const sesion = sesiones.find((s) => s.id === idEditando);
    if (sesion) {
      sesion.fecha = fecha;
      sesion.tema = tema;
      sesion.minutos = minutos;
    }
    guardarSesiones();
    cancelarEdicion();
    pintar();
    return;
  }

  sesiones.push({ id: Date.now(), fecha: fecha, tema: tema, minutos: minutos });
  guardarSesiones();
  pintar();

  campoTema.value = "";
  campoMinutos.value = "";
  campoTema.focus();
});

botonCancelar.addEventListener("click", cancelarEdicion);

campoFecha.value = formatearFecha(new Date());
pintar();
