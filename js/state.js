// ==========================================
// STATE
// ==========================================
const STATE = {
  schemaVersion: 3,
  nombre: "Nico",
  altura: CONFIG.ALTURA,
  mediciones: [],
  historialEntrenos: [],
  diasNoFumar: [],
  diasEntrenados: [],
  checks: {},
  records: [],
  evolution: {
    initialWeight: 0,
    currentWeight: 0,
    initialWaist: 0,
    currentWaist: 0,
    totalWorkouts: 0,
    daysWithoutSmoking: 0,
  },
  ajustes: {},
  config: { temporizadorDescanso: false },
  _cargado: false,
  ultimasMediciones: null,
  entrenamientoPendiente: null,
  pesosAjustados: {},
  diasEspeciales: {}, // Formato: { "2026-08-27": "vacaciones" | "lesionado" }
  objetivos: [],
  rutinasPersonalizadas: {},
  materialDisponible: [
    { id: "mancuernas-ajustables", nombre: "Mancuernas ajustables", detalle: "Hasta 20 kg (según indicas)", activo: true },
    { id: "banco-ajustable", nombre: "Banco ajustable EverYkip", detalle: "Posiciones de inclinación por confirmar", activo: true },
    { id: "torre-dominadas-fondos", nombre: "Torre de dominadas y fondos", detalle: "Disponible en casa; actualmente sin usar", activo: false },
  ],
};

let diaActivo = "lunes";
let modoEntrenoActivo = false;
let ejerciciosEntreno = [];
let idxEjercicioActual = 0;
let temporizadorDescanso = null;
let tiempoDescanso = 0;
let startTimeEntreno = null;
let recordsConseguidos = [];
let cardioCompletado = false;
let totalPesoLevantadoEntreno = 0;
let totalVolumenEntreno = 0;
let totalSeriesEntreno = 0;
let totalRepsEntreno = 0;
let msgCompletadoTimeout = null;
let seriesActualesEntreno = [];
let pesoActualEntreno = 0;
let ejercicioIniciadoAt = null;
