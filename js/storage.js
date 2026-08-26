// ==========================================
// STORAGE · LOCALSTORAGE + MIGRACIONES
// ==========================================
const Storage = {
  MAX_BACKUP_BYTES: 12 * 1024 * 1024,

  init() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
    let debeGuardar = false;
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (!d || typeof d !== "object" || Array.isArray(d))
          throw new Error("Estado guardado no válido");
        const migrado = this.migrate(d);
        debeGuardar = this._ultimoCambioMigracion === true;
        Object.keys(STATE).forEach((clave) => {
          if (Object.prototype.hasOwnProperty.call(migrado, clave))
            STATE[clave] = migrado[clave];
        });
      } catch (err) {
        console.warn(
          "Estado local corrupto; se restauran valores iniciales.",
          err,
        );
        try {
          localStorage.setItem(
            CONFIG.STORAGE_KEY + "_corrupto_" + Date.now(),
            raw,
          );
        } catch (_) {}
        localStorage.removeItem(CONFIG.STORAGE_KEY);
      }
    }
    this._normalizarEstado();
    CONFIG.TEMPORIZADOR_DESCANSO = STATE.config.temporizadorDescanso === true;
    this._calcularDiasSinFumar();
    // Serializar todo el estado puede bloquear el hilo principal si hay mucho
    // historial. Solo se persiste al arrancar cuando realmente cambió algo.
    if (debeGuardar) this._save();
    return this;
  },

  migrate(data) {
    // `data` ya procede de JSON.parse al iniciar o de un backup validado. Evitar
    // clonarlo/serializarlo de nuevo ahorra trabajo apreciable con historiales largos.
    const d = data;
    let cambio = false;
    let version = Number(d.schemaVersion) || 1;
    while (version < CONFIG.STATE_SCHEMA_VERSION) {
      if (version === 1) {
        d.progresion = d.progresion || {};
        d.progresionConfig = d.progresionConfig || {
          semanaBase: null,
          ejerciciosBase: {},
        };
        version = 2;
        cambio = true;
      } else if (version === 2) {
        d.progresion = d.progresion || {};
        d.progresionConfig = d.progresionConfig || {
          semanaBase: null,
          ejerciciosBase: {},
        };
        d.schemaVersion = 3;
        version = 3;
        cambio = true;
      } else {
        break;
      }
    }
    if (!d.progresionConfig) {
      d.progresionConfig = { semanaBase: null, ejerciciosBase: {} };
      cambio = true;
    }
    if (d.schemaVersion !== CONFIG.STATE_SCHEMA_VERSION) {
      d.schemaVersion = CONFIG.STATE_SCHEMA_VERSION;
      cambio = true;
    }

    // Normaliza nombres antiguos duplicados de viernes a sus ejercicios únicos.
    const aliases = {
      "Press plano con mancuernas (viernes)": "Press plano con mancuernas",
      "Remo a una mano con mancuerna (viernes)": "One-Arm Dumbbell Row",
      "Press militar sentado (viernes)": "Press militar sentado",
      "Aperturas con mancuernas (viernes)": "Aperturas con mancuernas",
      "Elevaciones laterales (viernes)": "Elevaciones laterales",
      "Curl martillo (viernes)": "Hammer Curl",
      "Extensión de tríceps por encima de la cabeza (viernes)":
        "Extensión de tríceps por encima de la cabeza",
    };
    if (Array.isArray(d.historialEntrenos)) {
      d.historialEntrenos.forEach((ent) => {
        (ent.ejercicios || []).forEach((ej) => {
          if (aliases[ej.nombre]) {
            ej.nombre = aliases[ej.nombre];
            cambio = true;
          }
        });
      });
    }
    if (Array.isArray(d.records)) {
      d.records.forEach((r) => {
        if (aliases[r.exerciseName]) {
          r.exerciseName = aliases[r.exerciseName];
          cambio = true;
        }
      });
    }
    this._ultimoCambioMigracion = cambio;
    return d;
  },

  _normalizarEstado() {
    STATE.schemaVersion = CONFIG.STATE_SCHEMA_VERSION;
    if (!Array.isArray(STATE.mediciones)) STATE.mediciones = [];
    if (!Array.isArray(STATE.historialEntrenos)) STATE.historialEntrenos = [];
    if (!Array.isArray(STATE.diasNoFumar)) STATE.diasNoFumar = [];
    if (!Array.isArray(STATE.diasEntrenados)) STATE.diasEntrenados = [];
    if (!STATE.checks || typeof STATE.checks !== "object") STATE.checks = {};
    if (!STATE.recordatorios || typeof STATE.recordatorios !== "object")
      STATE.recordatorios = {};
    STATE.recordatorios.freqMediciones = Math.max(
      1,
      Number(STATE.recordatorios.freqMediciones) || 2,
    );
    STATE.recordatorios.freqFotos = Math.max(
      1,
      Number(STATE.recordatorios.freqFotos) || 4,
    );
    if (!STATE.recordatorios.ultimaMedicion)
      STATE.recordatorios.ultimaMedicion = CONFIG.FECHA_REFERENCIA_MEDICIONES;
    if (STATE.recordatorios.ultimoBackup !== null &&
        (typeof STATE.recordatorios.ultimoBackup !== "string" ||
          !Number.isFinite(new Date(STATE.recordatorios.ultimoBackup).getTime())))
      STATE.recordatorios.ultimoBackup = null;
    if (!STATE.records || !Array.isArray(STATE.records)) STATE.records = [];
    if (!STATE.evolution || typeof STATE.evolution !== "object")
      STATE.evolution = {};
    Object.assign(STATE.evolution, {
      initialWeight: Number(STATE.evolution.initialWeight) || 0,
      currentWeight: Number(STATE.evolution.currentWeight) || 0,
      initialWaist: Number(STATE.evolution.initialWaist) || 0,
      currentWaist: Number(STATE.evolution.currentWaist) || 0,
      totalWorkouts: Number(STATE.evolution.totalWorkouts) || 0,
      daysWithoutSmoking: Number(STATE.evolution.daysWithoutSmoking) || 0,
    });
    if (!STATE.ajustes || typeof STATE.ajustes !== "object") STATE.ajustes = {};
    if (!STATE.config || typeof STATE.config !== "object") STATE.config = {};
    if (typeof STATE.config.temporizadorDescanso !== "boolean")
      STATE.config.temporizadorDescanso = false;
    if (!STATE.progresion || typeof STATE.progresion !== "object")
      STATE.progresion = {};
    if (
      !STATE.progresionConfig ||
      typeof STATE.progresionConfig !== "object" ||
      Array.isArray(STATE.progresionConfig)
    ) {
      STATE.progresionConfig = {
        semanaBase: null,
        ejerciciosBase: {},
      };
    }
    if (
      !STATE.progresionConfig.ejerciciosBase ||
      typeof STATE.progresionConfig.ejerciciosBase !== "object" ||
      Array.isArray(STATE.progresionConfig.ejerciciosBase)
    ) {
      STATE.progresionConfig.ejerciciosBase = {};
    }
    if (
      STATE.entrenamientoPendiente !== null &&
      (typeof STATE.entrenamientoPendiente !== "object" ||
        Array.isArray(STATE.entrenamientoPendiente))
    ) {
      STATE.entrenamientoPendiente = null;
    }
    if (STATE.ultimoRegistroPeso === undefined) STATE.ultimoRegistroPeso = null;
    if (STATE.ultimasMediciones === undefined) STATE.ultimasMediciones = null;
    if (STATE.ultimasFotosGuardadas === undefined)
      STATE.ultimasFotosGuardadas = null;
  },

  _calcularDiasSinFumar() {
    let c = 0;
    const f = new Date(CONFIG.FECHA_INICIO_NO_FUMAR);
    const h = new Date();
    while (f <= h) {
      if (!STATE.diasNoFumar.includes(UI.formatFecha(f))) c++;
      f.setDate(f.getDate() + 1);
    }
    STATE.evolution.daysWithoutSmoking = c;
  },

  _save() {
    try {
      STATE.schemaVersion = CONFIG.STATE_SCHEMA_VERSION;
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(STATE));
    } catch (err) {
      console.error("No se pudo guardar el estado local:", err);
      if (typeof UI !== "undefined" && UI.toast)
        UI.toast("❌ No se pudieron guardar los datos", "error");
    }
  },

  resetearSemana() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const semanaActual = this._getSemanaKey(hoy);
    const ultimaSemana = localStorage.getItem("ultimaSemana");
    if (diaSemana === 1 && ultimaSemana !== semanaActual) {
      STATE.checks = {};
      STATE.entrenamientoPendiente = null;
      localStorage.setItem("ultimaSemana", semanaActual);
      this._save();
      return true;
    }
    return false;
  },

  _getSemanaKey(fecha) {
    const d = new Date(fecha);
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    const year = d.getFullYear();
    const week = Math.ceil(((d - new Date(year, 0, 1)) / 86400000 + 1) / 7);
    return `${year}-W${String(week).padStart(2, "0")}`;
  },

  resetAll() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    location.reload();
  },

  _sanearImportado(valor) {
    if (typeof valor === "string")
      return valor.replace(/<\/?[^>]+>/g, "");
    if (Array.isArray(valor)) return valor.map((item) => this._sanearImportado(item));
    if (valor && typeof valor === "object") {
      return Object.fromEntries(
        Object.entries(valor).map(([clave, item]) => [
          clave,
          this._sanearImportado(item),
        ]),
      );
    }
    return valor;
  },

  _resumenBackup(backup) {
    const state = backup.state || {};
    const diasFotos = backup.fotosProgreso?.diasFotos || [];
    return [
      `Fecha: ${new Date(backup.createdAt).toLocaleString("es-ES")}`,
      `Entrenamientos: ${(state.historialEntrenos || []).length}`,
      `Mediciones: ${(state.mediciones || []).length}`,
      `Días con fotos: ${diasFotos.length}`,
    ].join("\n");
  },

  async exportar() {
    try {
      let fotosProgreso = [];
      let fotosDisponibles = true;
      try {
        fotosProgreso = await Fotos.exportarBackup();
      } catch (err) {
        fotosDisponibles = false;
        console.warn("No se pudieron incluir las fotos en el backup:", err);
      }
      const backup = {
        version: CONFIG.BACKUP_VERSION,
        app: "NicoGym",
        createdAt: new Date().toISOString(),
        state: JSON.parse(JSON.stringify(STATE)),
        fotosProgreso: {
          version: 2,
          disponibles: fotosDisponibles,
          diasFotos: fotosProgreso,
        },
      };
      const contenido = JSON.stringify(backup, null, 2);
      const tamano = new Blob([contenido]).size;
      if (tamano > this.MAX_BACKUP_BYTES) {
        UI.toast("⚠️ El backup supera 12 MB; puede fallar al compartirlo", "error");
      }
      const blob = new Blob([contenido], {
        type: "application/json;charset=utf-8",
      });
      const fecha = new Date().toISOString().slice(0, 10);
      const nombre = `NicoGym_backup_${fecha}.json`;
      STATE.recordatorios.ultimoBackup = new Date().toISOString();
      this._save();

      const android = window.Android;
      if (android) {
        try {
          if (typeof android.exportBackup === "function") {
            android.exportBackup(contenido, nombre);
            UI.toast("✅ Backup enviado a Android", "success");
            return;
          }
          if (typeof android.saveBackup === "function") {
            android.saveBackup(contenido, nombre);
            UI.toast("✅ Backup enviado a Android", "success");
            return;
          }
        } catch (e) {
          console.warn("Puente Android no disponible:", e);
        }
      }

      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], nombre, { type: "application/json" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "Backup de NicoGym",
              files: [file],
            });
            UI.toast("✅ Backup compartido/guardado", "success");
            return;
          }
        } catch (e) {
          if (e?.name !== "AbortError")
            console.warn("Web Share no disponible:", e);
        }
      }

      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = nombre;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 3000);
      UI.toast(
        fotosDisponibles
          ? `✅ Backup generado (${fotosProgreso.length} días con fotos)`
          : "✅ Backup generado sin fotos",
        fotosDisponibles ? "success" : "error",
      );
    } catch (err) {
      console.error("Error al exportar:", err);
      UI.toast("❌ Error al exportar los datos", "error");
    }
  },

  importar(file) {
    if (!file) {
      UI.toast("❌ No se seleccionó ningún archivo", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const datos = JSON.parse(e.target.result);
        if (!datos || typeof datos !== "object" || Array.isArray(datos))
          throw new Error("Formato de backup no válido");
        const esNuevo =
          datos.app === "NicoGym" &&
          datos.state &&
          typeof datos.state === "object";
        if (esNuevo) {
          const v = Number(datos.version);
          if (!Number.isInteger(v) || v < 1 || v > CONFIG.BACKUP_VERSION)
            throw new Error("Versión de backup no compatible");
        }
        const datosEstado = this._sanearImportado(esNuevo ? datos.state : datos);
        const campos = {
          mediciones: "array",
          historialEntrenos: "array",
          diasNoFumar: "array",
          diasEntrenados: "array",
          checks: "object",
          recordatorios: "object",
          records: "array",
          evolution: "object",
          config: "object",
          ajustes: "object",
          progresion: "object",
          progresionConfig: "object",
        };
        for (const [campo, tipo] of Object.entries(campos)) {
          if (datosEstado[campo] === undefined) continue;
          const ok =
            tipo === "array"
              ? Array.isArray(datosEstado[campo])
              : datosEstado[campo] &&
                typeof datosEstado[campo] === "object" &&
                !Array.isArray(datosEstado[campo]);
          if (!ok) throw new Error(`Campo inválido: ${campo}`);
        }
        const fotosProgreso = Array.isArray(datos.fotosProgreso?.diasFotos)
          ? datos.fotosProgreso.diasFotos
          : Array.isArray(datos.fotosProgreso)
            ? datos.fotosProgreso
            : null;
        const resumen = esNuevo
          ? this._resumenBackup(datos)
          : "Backup antiguo sin resumen disponible.";
        if (!window.confirm(`¿Importar este backup?\n\n${resumen}`)) return;
        const estadoImportado = this.migrate(datosEstado);
        Object.keys(STATE).forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(estadoImportado, k))
            STATE[k] = estadoImportado[k];
        });
        this._normalizarEstado();
        CONFIG.TEMPORIZADOR_DESCANSO =
          STATE.config.temporizadorDescanso === true;
        let fotosRestauradas = false;
        if (fotosProgreso) {
          try {
            await Fotos.restaurarBackup(fotosProgreso);
            fotosRestauradas = true;
          } catch (err) {
            console.warn("No se pudieron restaurar las fotos:", err);
          }
        }
        this._save();
        UI.toast(
          fotosProgreso && !fotosRestauradas
            ? "⚠️ Datos importados; no se pudieron restaurar las fotos"
            : "✅ Datos importados correctamente",
          fotosProgreso && !fotosRestauradas ? "error" : "success",
        );
        APP.renderizarTodo();
      } catch (err) {
        console.error("Error al importar:", err);
        UI.toast(
          `❌ Error al importar: ${err.message || "formato inválido"}`,
          "error",
        );
      }
    };
    reader.onerror = () => UI.toast("❌ Error al leer el archivo", "error");
    reader.readAsText(file);
  },
};
