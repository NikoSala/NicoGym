// ==========================================
// STORAGE · LOCALSTORAGE + MIGRACIONES
// ==========================================
const Storage = {
  MAX_BACKUP_BYTES: 12 * 1024 * 1024,
  MAX_IMPORT_BYTES: 50 * 1024 * 1024,

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
        version = 2;
        cambio = true;
      } else if (version === 2) {
        d.schemaVersion = 3;
        version = 3;
        cambio = true;
      } else {
        break;
      }
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
    if (!Array.isArray(STATE.materialDisponible)) STATE.materialDisponible = [];
    STATE.materialDisponible = STATE.materialDisponible
      .filter((item) => item && typeof item === "object" && !Array.isArray(item))
      .map((item, index) => ({
        id: String(item.id || `material-${index + 1}`),
        nombre: String(item.nombre || "Material").trim().slice(0, 80) || "Material",
        detalle: String(item.detalle || "").trim().slice(0, 180),
        activo: item.activo !== false,
      }));
    if (!Array.isArray(STATE.historialEntrenos)) STATE.historialEntrenos = [];
    if (!Array.isArray(STATE.diasNoFumar)) STATE.diasNoFumar = [];
    if (!Array.isArray(STATE.diasEntrenados)) STATE.diasEntrenados = [];
    if (!STATE.checks || typeof STATE.checks !== "object") STATE.checks = {};
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
    if (
      !STATE.rutinasPersonalizadas ||
      typeof STATE.rutinasPersonalizadas !== "object" ||
      Array.isArray(STATE.rutinasPersonalizadas)
    ) STATE.rutinasPersonalizadas = {};
    ["lunes", "martes", "miercoles", "jueves", "viernes"].forEach((dia) => {
      const rutina = STATE.rutinasPersonalizadas[dia];
      if (rutina === undefined) return;
      if (!Array.isArray(rutina)) {
        delete STATE.rutinasPersonalizadas[dia];
        return;
      }
      const idsValidos = new Set(getExerciseDatabase().map((ej) => ej.id));
      STATE.rutinasPersonalizadas[dia] = rutina.filter((item, indice, lista) =>
        Array.isArray(item) &&
        typeof item[0] === "string" &&
        idsValidos.has(item[0]) &&
        lista.findIndex((otro) => Array.isArray(otro) && otro[0] === item[0]) === indice
      ).map(([id, series, reps]) => [
        id,
        Number.isFinite(Number(series)) && Number(series) > 0 ? Number(series) : 3,
        String(reps || "12"),
      ]);
    });
    if (
      STATE.entrenamientoPendiente !== null &&
      (typeof STATE.entrenamientoPendiente !== "object" ||
        Array.isArray(STATE.entrenamientoPendiente))
    ) {
      STATE.entrenamientoPendiente = null;
    }
    if (STATE.ultimasMediciones === undefined) STATE.ultimasMediciones = null;
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

  async resetAll() {
    try {
      if (typeof Fotos !== "undefined") await Fotos.borrarTodo();
      const clavesApp = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      ).filter((clave) =>
        clave === CONFIG.STORAGE_KEY ||
        clave.startsWith(`${CONFIG.STORAGE_KEY}_`) ||
        clave === "ultimaSemana" ||
        clave.startsWith("nicoGymAi"),
      );
      clavesApp.forEach((clave) => localStorage.removeItem(clave));
      ["nicoGymAiEndpoint", "nicoGymAiAccessToken"].forEach((clave) =>
        sessionStorage.removeItem(clave),
      );
      location.reload();
    } catch (err) {
      console.error("No se pudieron borrar todos los datos:", err);
      UI.toast("No se pudieron borrar todos los datos. Inténtalo de nuevo.", "error");
    }
  },

  _validarEstadoImportado(estado) {
    const esObjeto = (valor) =>
      valor && typeof valor === "object" && !Array.isArray(valor);
    const validarTexto = (valor, campo, maximo) => {
      if (typeof valor !== "string" || valor.length > maximo)
        throw new Error(`Texto inválido: ${campo}`);
    };
    const validarFecha = (valor, campo) => {
      if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor))
        throw new Error(`Fecha inválida: ${campo}`);
      const fecha = new Date(`${valor}T00:00:00Z`);
      if (!Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor)
        throw new Error(`Fecha inválida: ${campo}`);
    };
    const validarNumero = (valor, campo, minimo = 0, opcional = false) => {
      if (opcional && (valor === null || valor === undefined || valor === "")) return;
      if (
        typeof valor === "boolean" ||
        !Number.isFinite(Number(valor)) ||
        Number(valor) < minimo
      ) throw new Error(`Número inválido: ${campo}`);
    };

    if (!esObjeto(estado)) throw new Error("Estado de backup no válido");
    if (estado.nombre !== undefined) validarTexto(estado.nombre, "nombre", 80);
    if (estado.altura !== undefined) validarNumero(estado.altura, "altura", 80);
    if (estado.altura !== undefined && Number(estado.altura) > 250)
      throw new Error("Altura fuera de rango");

    for (const campo of ["mediciones", "historialEntrenos", "diasNoFumar", "diasEntrenados", "records", "objetivos"]) {
      if (estado[campo] !== undefined && !Array.isArray(estado[campo]))
        throw new Error(`Campo inválido: ${campo}`);
    }
    for (const campo of ["checks", "evolution", "config", "ajustes", "diasEspeciales", "rutinasPersonalizadas", "pesosAjustados"]) {
      if (estado[campo] !== undefined && !esObjeto(estado[campo]))
        throw new Error(`Campo inválido: ${campo}`);
    }

    (estado.mediciones || []).forEach((medicion, index) => {
      if (!esObjeto(medicion)) throw new Error(`Medición inválida: ${index + 1}`);
      validarFecha(medicion.fecha, `mediciones[${index}].fecha`);
      validarNumero(medicion.peso, `mediciones[${index}].peso`, 0.1);
      ["grasaPorcentaje", "masaMuscular", "masaMagra", "grasaVisceral", "cintura"]
        .forEach((campo) => validarNumero(medicion[campo], campo, 0, true));
    });
    ["diasNoFumar", "diasEntrenados"].forEach((campo) =>
      (estado[campo] || []).forEach((fecha, index) =>
        validarFecha(fecha, `${campo}[${index}]`),
      ),
    );

    (estado.historialEntrenos || []).forEach((sesion, index) => {
      if (!esObjeto(sesion) || (sesion.ejercicios !== undefined && !Array.isArray(sesion.ejercicios)))
        throw new Error(`Sesión inválida: ${index + 1}`);
      validarFecha(sesion.fecha, `historialEntrenos[${index}].fecha`);
      validarTexto(sesion.dia, `historialEntrenos[${index}].dia`, 40);
      if (sesion.ejercicios === undefined) sesion.ejercicios = [];
      (sesion.ejercicios || []).forEach((ejercicio, indice) => {
        if (!esObjeto(ejercicio))
          throw new Error(`Ejercicio inválido en sesión ${index + 1}`);
        validarTexto(ejercicio.nombre, `ejercicios[${indice}].nombre`, 120);
        if (ejercicio.peso !== undefined)
          validarNumero(ejercicio.peso, "peso del ejercicio", 0, true);
        if (ejercicio.reps !== undefined && typeof ejercicio.reps !== "string" && typeof ejercicio.reps !== "number")
          throw new Error("Repeticiones inválidas");
        if (typeof ejercicio.reps === "string" && ejercicio.reps.length > 400)
          throw new Error("Repeticiones demasiado largas");
      });
    });

    (estado.records || []).forEach((record, index) => {
      if (!esObjeto(record)) throw new Error(`Récord inválido: ${index + 1}`);
      validarTexto(record.exerciseName, `records[${index}].exerciseName`, 120);
      validarNumero(record.weight, "peso del récord", 0);
      validarNumero(record.reps, "repeticiones del récord", 0);
      if (typeof record.date !== "string" || record.date.length > 20)
        throw new Error("Fecha de récord inválida");
    });

    (estado.objetivos || []).forEach((objetivo, index) => {
      if (!esObjeto(objetivo)) throw new Error(`Objetivo inválido: ${index + 1}`);
      validarTexto(objetivo.nombre, `objetivos[${index}].nombre`, 120);
      validarTexto(objetivo.descripcion || "", `objetivos[${index}].descripcion`, 500);
      if (!["peso", "ejercicio"].includes(objetivo.tipo))
        throw new Error(`Tipo de objetivo inválido: ${index + 1}`);
      validarNumero(objetivo.pesoObjetivo, "peso objetivo", 0.1);
      if (objetivo.nombreEjercicio !== null && objetivo.nombreEjercicio !== undefined)
        validarTexto(objetivo.nombreEjercicio, "nombreEjercicio", 120);
    });

    if (estado.ajustes?.nombre !== undefined)
      validarTexto(estado.ajustes.nombre, "ajustes.nombre", 80);
    if (estado.ajustes?.altura !== undefined)
      validarNumero(estado.ajustes.altura, "ajustes.altura", 80);
    if (estado.ajustes?.objetivo !== undefined)
      validarNumero(estado.ajustes.objetivo, "ajustes.objetivo", 0.1);
    if (estado.evolution) {
      ["initialWeight", "currentWeight", "initialWaist", "currentWaist", "totalWorkouts", "daysWithoutSmoking"]
        .forEach((campo) => validarNumero(estado.evolution[campo], `evolution.${campo}`, 0, true));
    }
    if (estado.ultimasMediciones !== null && estado.ultimasMediciones !== undefined) {
      if (!esObjeto(estado.ultimasMediciones))
        throw new Error("Última medición inválida");
      ["grasaPorcentaje", "masaMuscular", "masaMagra", "grasaVisceral", "cintura"]
        .forEach((campo) => validarNumero(estado.ultimasMediciones[campo], campo, 0, true));
    }
    if (estado.pesosAjustados) {
      Object.entries(estado.pesosAjustados).forEach(([ejercicio, peso]) => {
        validarTexto(ejercicio, "nombre del ejercicio ajustado", 120);
        validarNumero(peso, "peso ajustado", 0.1);
      });
    }
    if (estado.entrenamientoPendiente !== null && estado.entrenamientoPendiente !== undefined) {
      const pendiente = estado.entrenamientoPendiente;
      if (!esObjeto(pendiente) || !["lunes", "martes", "miercoles", "jueves", "viernes"].includes(pendiente.dia))
        throw new Error("Entrenamiento pendiente inválido");
      if (pendiente.semana !== undefined && (typeof pendiente.semana !== "string" || !/^\d{4}-W\d{2}$/.test(pendiente.semana)))
        throw new Error("Semana del entrenamiento pendiente inválida");
      if (pendiente.idxEjercicioActual !== undefined) validarNumero(pendiente.idxEjercicioActual, "índice del entrenamiento", 0);
      if (pendiente.idxEjercicioActual !== undefined && !Number.isInteger(Number(pendiente.idxEjercicioActual)))
        throw new Error("Índice del entrenamiento inválido");
      if (pendiente.recordsConseguidos !== undefined) {
        if (!Array.isArray(pendiente.recordsConseguidos))
          throw new Error("Récords pendientes inválidos");
        pendiente.recordsConseguidos.forEach((nombre) =>
          validarTexto(nombre, "nombre del récord pendiente", 120),
        );
      }
      ["totalPesoLevantadoEntreno", "totalVolumenEntreno", "totalSeriesEntreno", "totalRepsEntreno"]
        .forEach((campo) => validarNumero(pendiente[campo], campo, 0, true));
    }
    if (estado.diasEspeciales) {
      Object.entries(estado.diasEspeciales).forEach(([fecha, estadoDia]) => {
        validarFecha(fecha, "diasEspeciales");
        if (!["vacaciones", "lesionado"].includes(estadoDia))
          throw new Error("Estado de día especial inválido");
      });
    }
    return estado;
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
    if (file.size > this.MAX_IMPORT_BYTES) {
      UI.toast("❌ El archivo supera el límite de importación de 50 MB", "error");
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
        const datosEstado = this._validarEstadoImportado(esNuevo ? datos.state : datos);
        const campos = {
          mediciones: "array",
          historialEntrenos: "array",
          diasNoFumar: "array",
          diasEntrenados: "array",
          checks: "object",
          records: "array",
          evolution: "object",
          config: "object",
          ajustes: "object",
          materialDisponible: "array",
          rutinasPersonalizadas: "object",
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
        if (datos.fotosProgreso !== undefined && !fotosProgreso)
          throw new Error("Formato de fotos del backup no válido");
        (fotosProgreso || []).forEach((dia) => {
          if (!dia || typeof dia !== "object" || Array.isArray(dia))
            throw new Error("Registro de fotos inválido");
          if (typeof dia.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dia.fecha))
            throw new Error("Fecha de foto inválida");
          ["frente", "espalda", "izquierda", "derecha"].forEach((lado) => {
            const imagen = dia[lado];
            if (imagen === null || imagen === undefined) return;
            if (
              typeof imagen !== "string" || imagen.length > this.MAX_IMPORT_BYTES ||
              !/^data:image\/(?:jpeg|png|webp);base64,[a-z\d+/]+=*$/i.test(imagen)
            ) throw new Error(`Imagen de backup inválida: ${lado}`);
          });
        });
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
