// ==========================================
// APP - FUNCIONAMIENTO GENERAL
// ==========================================

// ==========================================
// CONFIGURACIÓN
// ==========================================
const CONFIG = {
  VERSION: "5.1",
  ALTURA: 165,
  PESO_OBJETIVO: 75,
  STORAGE_KEY: "nicoGym",
  FECHA_INICIO_NO_FUMAR: new Date(2026, 1, 22),
  FECHA_REFERENCIA_MEDICIONES: "2026-07-20",
  FECHA_ACTIVACION_PROTEINA: new Date(2026, 7, 1),
  COMIDAS: [
    { hora: "08:00", nombre: "Café", icono: "☕" },
    { hora: "10:30", nombre: "Batido proteína", icono: "🥛" },
    { hora: "14:00", nombre: "Comida", icono: "🍗" },
    { hora: "17:00", nombre: "Merienda", icono: "🥪" },
    { hora: "20:00", nombre: "Cena", icono: "🍽" },
  ],
};

const TIPOS_RUTINA = {
  lunes: "Espalda / Bíceps",
  martes: "Pecho / Hombro",
  miercoles: "Tríceps / Cardio",
  jueves: "Espalda / Bíceps",
  viernes: "Pecho / Hombro",
  sabado: "Pierna / Antebrazo",
  domingo: "Descanso",
};

const NOMBRES_DIAS = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
};

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

let diaActivo = "lunes";
let userData = { nombre: "Nico", altura: CONFIG.ALTURA };

// ==========================================
// STATE
// ==========================================
const STATE = {
  mediciones: [],
  historialEntrenos: [],
  diasNoFumar: [],
  diasEntrenados: [],
  checks: {},
  logros: [],
  ajustes: {},
  recordatorios: {
    freqMediciones: 2,
    freqFotos: 4,
    ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES,
    ultimasFotos: null,
  },
  habitos: {
    creatina: { activo: true, dias: [] },
    proteina: { activo: false, dias: [] },
  },
  records: [],
  evolution: {
    startDate: "06/06/2026",
    currentWeight: 84.2,
    initialWeight: 84.2,
    currentWaist: 109,
    initialWaist: 109,
    totalWorkouts: 0,
    daysWithoutSmoking: 0,
  },
  nutricion: {
    agua: 0,
    suplementos: { creatina: false, proteina: false },
    ultimoDia: null,
    imagen: null,
  },
};

// ==========================================
// STORAGE
// ==========================================
const STORAGE = {
  init() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      Object.assign(STATE, d);
      if (!STATE.recordatorios)
        STATE.recordatorios = {
          freqMediciones: 2,
          freqFotos: 4,
          ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES,
          ultimasFotos: null,
        };
      if (!STATE.habitos)
        STATE.habitos = {
          creatina: { activo: true, dias: [] },
          proteina: { activo: false, dias: [] },
        };
      if (!STATE.records) STATE.records = [];
      if (!STATE.evolution) {
        STATE.evolution = {
          startDate: "06/06/2026",
          currentWeight:
            STATE.mediciones.length > 0
              ? STATE.mediciones[STATE.mediciones.length - 1].peso
              : 84.2,
          initialWeight:
            STATE.mediciones.length > 0 ? STATE.mediciones[0].peso : 84.2,
          currentWaist:
            STATE.mediciones.length > 0
              ? STATE.mediciones[STATE.mediciones.length - 1].cintura
              : 109,
          initialWaist:
            STATE.mediciones.length > 0 ? STATE.mediciones[0].cintura : 109,
          totalWorkouts: STATE.diasEntrenados.length || 0,
          daysWithoutSmoking: 0,
        };
      }
      if (!STATE.nutricion) {
        STATE.nutricion = {
          agua: 0,
          suplementos: { creatina: false, proteina: false },
          ultimoDia: null,
          imagen: null,
        };
      }
      const hoy = UI.getHoyStr();
      if (STATE.nutricion.ultimoDia !== hoy) {
        STATE.nutricion.agua = 0;
        STATE.nutricion.ultimoDia = hoy;
        STATE.nutricion.suplementos = { creatina: false, proteina: false };
      }
    }
    let c = 0;
    const f = new Date(CONFIG.FECHA_INICIO_NO_FUMAR);
    const h = new Date();
    while (f <= h) {
      if (!STATE.diasNoFumar.includes(UI.formatFechaLocal(f))) c++;
      f.setDate(f.getDate() + 1);
    }
    STATE.evolution.daysWithoutSmoking = c;
    this._save();
  },
  _save() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(STATE));
  },
  resetAll() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    location.reload();
  },
  exportar() {
    const blob = new Blob([JSON.stringify(STATE, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nicogym_backup.json";
    a.click();
    UI.toast("✅ Datos exportados", "success");
  },
  importar(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target.result);
        Object.assign(STATE, datos);
        this._save();
        UI.toast("✅ Datos importados", "success");
        APP.renderizarTodo();
      } catch (err) {
        UI.toast("❌ Error al importar", "error");
      }
    };
    reader.readAsText(file);
  },
};

// ==========================================
// UI - FUNCIONES GENERALES
// ==========================================
const UI = {
  toast(msg, tipo = "info") {
    const t = document.createElement("div");
    t.className = `toast-msg toast-${tipo}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },
  confirmar(msg, cb) {
    const id = "confirmModal";
    document.getElementById(id)?.remove();
    const h = `<div id="${id}" class="modal-overlay"><div class="modal-panel"><h3>${msg}</h3><button class="btn btn-danger" onclick="document.getElementById('${id}').remove();(${cb.toString()})()">Confirmar</button><button class="btn btn-ghost" onclick="document.getElementById('${id}').remove()">Cancelar</button></div></div>`;
    document.body.insertAdjacentHTML("beforeend", h);
  },
  toggleMenu() {
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("sideOverlay");
    menu.classList.toggle("open");
    overlay.classList.toggle("open");
  },
  toggleNotif() {
    document.getElementById("notifDropdown").classList.toggle("open");
  },
  cerrarLightbox() {
    document.getElementById("lightbox").classList.remove("active");
  },
  abrirLightbox(src) {
    document.getElementById("lightboxImg").src = src;
    document.getElementById("lightbox").classList.add("active");
  },
  getHoyStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },
  formatFechaLocal(f) {
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
  },
  actualizarTopBar() {
    const p =
      STATE.mediciones.length > 0
        ? STATE.mediciones[STATE.mediciones.length - 1].peso
        : "--";
    document.getElementById("topPesoDisplay").textContent = p + " kg";
    document.getElementById("topObjetivo").textContent = CONFIG.PESO_OBJETIVO;
    let c = 0,
      f = new Date(CONFIG.FECHA_INICIO_NO_FUMAR),
      h = new Date();
    while (f <= h) {
      if (!STATE.diasNoFumar.includes(UI.formatFechaLocal(f))) c++;
      f.setDate(f.getDate() + 1);
    }
    document.getElementById("topDiasSinFumar").textContent = c;
  },
  actualizarCampana() {
    const notifs = Notificaciones.generar();
    const badge = document.getElementById("bellBadge");
    if (notifs.length > 0) {
      badge.classList.remove("hidden");
      badge.textContent = notifs.length;
    } else {
      badge.classList.add("hidden");
    }
  },
  formatearCambio(valor, unidad, invertir) {
    if (Math.abs(valor) < 0.05)
      return `<span class="neutral">0 ${unidad}</span>`;
    const mejora = invertir ? valor < 0 : valor > 0;
    const clase = mejora ? "positive" : "negative";
    const signo = valor > 0 ? "+" : "";
    return `<span class="${clase}">${signo}${valor.toFixed(1)} ${unidad}</span>`;
  },
};

// ==========================================
// FUNCIONES AUX
// ==========================================
function getProximoDomingo(desdeFecha, cadaSemanas) {
  const desde = new Date(desdeFecha);
  const hoy = new Date();
  let p = new Date(desde);
  while (p <= hoy) {
    p.setDate(p.getDate() + 7 * cadaSemanas);
  }
  while (p.getDay() !== 0) {
    p.setDate(p.getDate() + 1);
  }
  return p;
}

function getDiasHasta(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fecha.setHours(0, 0, 0, 0);
  return Math.round((fecha - hoy) / 86400000);
}

const Calculos = {
  getRacha() {
    let r = 0,
      h = new Date();
    for (let i = 0; i < 100; i++) {
      let f = new Date(h);
      f.setDate(h.getDate() - i);
      if (STATE.diasEntrenados.includes(UI.formatFechaLocal(f))) r++;
      else break;
    }
    return r;
  },
  getEntrenosSemana() {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - hoy.getDay() + 1);
    inicio.setHours(0, 0, 0, 0);
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      dias.push(UI.formatFechaLocal(d));
    }
    return STATE.diasEntrenados.filter((f) => dias.includes(f)).length;
  },
  getEntrenosMes() {
    const hoy = new Date();
    return STATE.diasEntrenados.filter((f) => {
      const d = new Date(f);
      return (
        d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()
      );
    }).length;
  },
};

// ==========================================
// NOTIFICACIONES
// ==========================================
const Notificaciones = {
  generar() {
    const notifs = [];
    const hoy = new Date();
    if (!STATE.nutricion.suplementos.creatina) {
      notifs.push({
        id: "creatina",
        icono: "💊",
        texto: "Toma la creatina (18:20)",
      });
    }
    if (
      hoy >= CONFIG.FECHA_ACTIVACION_PROTEINA &&
      !STATE.nutricion.suplementos.proteina
    ) {
      notifs.push({
        id: "proteina",
        icono: "🥛",
        texto: "Batido de proteínas (10:30)",
      });
    }
    const freqMed = STATE.recordatorios.freqMediciones || 2;
    const pm = getProximoDomingo(
      STATE.recordatorios.ultimaMedicion || CONFIG.FECHA_REFERENCIA_MEDICIONES,
      freqMed,
    );
    if (getDiasHasta(new Date(pm)) <= 1) {
      notifs.push({
        id: "medicion",
        icono: "📏",
        texto: "Mañana toca medición",
      });
    }
    const freqFotos = STATE.recordatorios.freqFotos || 4;
    const pf = getProximoDomingo(
      STATE.recordatorios.ultimasFotos || CONFIG.FECHA_REFERENCIA_MEDICIONES,
      freqFotos,
    );
    if (getDiasHasta(new Date(pf)) <= 1) {
      notifs.push({ id: "fotos", icono: "📸", texto: "Mañana toca fotos" });
    }
    return notifs;
  },
  render() {
    const lista = document.getElementById("notifList");
    const notifs = this.generar();
    if (notifs.length === 0) {
      lista.innerHTML = '<div class="notif-empty">Sin notificaciones</div>';
    } else {
      lista.innerHTML = notifs
        .map(
          (n) =>
            `<div class="notif-item"><span class="ni-icon">${n.icono}</span><span class="ni-text">${n.texto}</span></div>`,
        )
        .join("");
    }
    UI.actualizarCampana();
  },
};

// ==========================================
// APP - NAVEGACIÓN Y CICLO DE VIDA
// ==========================================
const APP = {
  version: CONFIG.VERSION,
  iniciar() {
    STORAGE.init();
    Ajustes.cargar();
    Ajustes.cargarRecordatorios();
    EvolutionManager.update();
    this.renderizarTodo();
    this.eventos();
    setInterval(() => {
      if (
        document.getElementById("page-nutricion").classList.contains("active")
      ) {
        Nutricion.renderComida();
      }
    }, 30000);
    document.addEventListener("click", (e) => {
      const bell = document.getElementById("bellWrap");
      const drop = document.getElementById("notifDropdown");
      if (bell && drop && !bell.contains(e.target)) {
        drop.classList.remove("open");
      }
    });
  },
  eventos() {
    document
      .getElementById("importFile")
      .addEventListener("change", function () {
        STORAGE.importar(this);
      });
    document.getElementById("versionDisplay").textContent = this.version;
    document.getElementById("medFecha").value = UI.getHoyStr();
    document.getElementById("fechaFotos").value = UI.getHoyStr();
    const diasMap = {
      0: "domingo",
      1: "lunes",
      2: "martes",
      3: "miercoles",
      4: "jueves",
      5: "viernes",
      6: "sabado",
    };
    diaActivo = diasMap[new Date().getDay()] || "lunes";
    if (diaActivo === "domingo") diaActivo = "lunes";
    Biblioteca.init();
  },
  renderizarTodo() {
    UI.actualizarTopBar();
    Dashboard.render();
    Rutinas.cargarTabs();
    Rutinas.actualizarProgreso();
    Composicion.renderHistorial();
    EvolutionManager.render();
    RecordsManager.render();
    Nutricion.render();
    Notificaciones.render();
    if (
      document.getElementById("page-biblioteca").classList.contains("active")
    ) {
      Biblioteca.renderizar();
    }
  },
  navegar(id) {
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    const page = document.getElementById(`page-${id}`);
    if (page) page.classList.add("active");

    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    const map = { inicio: 0, rutinas: 1, composicion: 2, estadisticas: 3 };
    if (map[id] !== undefined) {
      const btns = document.querySelectorAll(".nav-btn");
      if (btns[map[id]]) btns[map[id]].classList.add("active");
    } else {
      const btns = document.querySelectorAll(".nav-btn");
      if (btns[4]) btns[4].classList.add("active");
    }

    document
      .querySelectorAll(".side-menu .menu-item")
      .forEach((m) => m.classList.remove("active"));
    document.querySelectorAll(".side-menu .menu-item").forEach((m) => {
      const txt = m.textContent.trim().toLowerCase();
      if (
        txt.includes(id) ||
        (id === "nutricion" && txt.includes("nutrición")) ||
        (id === "biblioteca" && txt.includes("biblioteca"))
      ) {
        m.classList.add("active");
      }
    });

    if (document.getElementById("sideMenu").classList.contains("open")) {
      UI.toggleMenu();
    }

    window.scrollTo(0, 0);

    if (id === "inicio") Dashboard.render();
    if (id === "rutinas") {
      Rutinas.cargarTabs();
      Rutinas.actualizarProgreso();
    }
    if (id === "composicion") Composicion.renderHistorial();
    if (id === "estadisticas") EvolutionManager.render();
    if (id === "progreso-fotos") Fotos.cargarSelectores();
    if (id === "records") RecordsManager.render();
    if (id === "nutricion") Nutricion.render();
    if (id === "biblioteca") Biblioteca.renderizar();
    if (id === "ajustes") {
      Ajustes.cargar();
      Ajustes.cargarRecordatorios();
    }
    if (id === "rutinas") {
      setTimeout(() => {
        const diasMap = {
          0: "domingo",
          1: "lunes",
          2: "martes",
          3: "miercoles",
          4: "jueves",
          5: "viernes",
          6: "sabado",
        };
        diaActivo = diasMap[new Date().getDay()] || "lunes";
        if (diaActivo === "domingo") diaActivo = "lunes";
        const tabs = document.querySelectorAll(".dtab");
        const idx = [
          "lunes",
          "martes",
          "miercoles",
          "jueves",
          "viernes",
          "sabado",
        ].indexOf(diaActivo);
        if (tabs[idx]) tabs[idx].click();
      }, 100);
    }
  },
  confirmarReset() {
    UI.confirmar(
      "¿Borrar TODOS los datos? Esta acción no se puede deshacer.",
      () => {
        STORAGE.resetAll();
      },
    );
  },
};

// ==========================================
// INICIO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  APP.iniciar();
});
