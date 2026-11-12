// ==========================================
// STORAGE · LOCALSTORAGE + MIGRACIONES
// ==========================================
const Storage = {
  MAX_BACKUP_BYTES: 12 * 1024 * 1024,
  MAX_IMPORT_BYTES: 50 * 1024 * 1024,
  HISTORY_CLEANUP_KEY: "nicoGym_history_cleanup_before_2026-10-01_v1",
  HISTORY_CLEANUP_BACKUP_KEY: "nicoGym_history_backup_before_2026-10-01_v1",

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
    this.limpiarHistorialAnterior("2026-10-01");
    return this;
  },

  limpiarHistorialAnterior(fechaMinima) {
    try {
      if (["done", "restored"].includes(localStorage.getItem(this.HISTORY_CLEANUP_KEY))) return { aplicada: false };
      const original = STATE.historialEntrenos;
      const fechaValida = (fecha) => {
        if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
        const fechaLocal = new Date(`${fecha}T00:00:00`);
        return Number.isFinite(fechaLocal.getTime()) && UI.formatFecha(fechaLocal) === fecha;
      };
      // Las fechas de la aplicación son YYYY-MM-DD, generadas en calendario local.
      // La comparación de cadena evita desplazar una sesión por la zona horaria.
      const eliminadas = original.filter((sesion) => fechaValida(sesion?.fecha) && sesion.fecha < fechaMinima);
      if (!localStorage.getItem(this.HISTORY_CLEANUP_BACKUP_KEY)) {
        localStorage.setItem(this.HISTORY_CLEANUP_BACKUP_KEY, JSON.stringify({
          version: 1,
          fechaCorte: fechaMinima,
          creadoEn: new Date().toISOString(),
          sesiones: eliminadas,
        }));
      }
      if (eliminadas.length) {
        const eliminarSet = new Set(eliminadas);
        STATE.historialEntrenos = original.filter((sesion) => !eliminarSet.has(sesion));
        if (!this._save()) {
          STATE.historialEntrenos = original;
          UI.toast("No se limpió el historial porque no se pudo guardar el cambio. Hay una copia de seguridad.", "error");
          return { aplicada: false, error: "save" };
        }
      }
      localStorage.setItem(this.HISTORY_CLEANUP_KEY, "done");
      if (eliminadas.length) {
        console.info(`Limpieza de historial completada: ${eliminadas.length} sesiones anteriores a ${fechaMinima} respaldadas y retiradas.`);
        UI.toast(`${eliminadas.length} ${eliminadas.length === 1 ? "sesión antigua respaldada y retirada" : "sesiones antiguas respaldadas y retiradas"}. Se conserva el historial desde octubre de 2026.`, "success");
      }
      return { aplicada: true, eliminadas: eliminadas.length };
    } catch (error) {
      console.error("No se pudo preparar la limpieza selectiva del historial:", error);
      if (typeof UI !== "undefined" && UI.toast)
        UI.toast("No se limpió el historial: no se pudo crear la copia de seguridad.", "error");
      return { aplicada: false, error: "backup" };
    }
  },

  restaurarHistorialAnterior() {
    try {
      const raw = localStorage.getItem(this.HISTORY_CLEANUP_BACKUP_KEY);
      if (!raw) return { restaurada: false, error: "backup-missing" };
      const backup = JSON.parse(raw);
      if (backup?.version !== 1 || !Array.isArray(backup.sesiones))
        return { restaurada: false, error: "backup-invalid" };
      const original = STATE.historialEntrenos;
      const claves = new Set(original.map((sesion) => `${sesion.fecha}|${sesion.dia || ""}`));
      const nuevas = backup.sesiones.filter((sesion) => !claves.has(`${sesion.fecha}|${sesion.dia || ""}`));
      STATE.historialEntrenos = [...original, ...nuevas].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      if (!this._save()) {
        STATE.historialEntrenos = original;
        return { restaurada: false, error: "save" };
      }
      localStorage.setItem(this.HISTORY_CLEANUP_KEY, "restored");
      return { restaurada: true, sesiones: nuevas.length };
    } catch (error) {
      console.error("No se pudo restaurar la copia previa del historial:", error);
      return { restaurada: false, error: "restore" };
    }
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
      } else if (version === 3) {
        // La rutina base se ha renovado para el gimnasio; limpia las antiguas
        // personalizaciones para que el nuevo plan se aplique al actualizar.
        d.rutinasPersonalizadas = {};
        d.schemaVersion = 4;
        version = 4;
        cambio = true;
      } else if (version === 4) {
        // Aplica el nuevo reparto muscular con ejercicios de máquinas y poleas.
        d.rutinasPersonalizadas = {};
        d.schemaVersion = 5;
        version = 5;
        cambio = true;
      } else if (version === 5) {
        // Aplica los bloques reducidos de cuatro o cinco ejercicios por día.
        d.rutinasPersonalizadas = {};
        d.schemaVersion = 6;
        version = 6;
        cambio = true;
      } else if (version === 6) {
        // Sustituye el curl en polea del martes por su variante con mancuernas.
        if (Array.isArray(d.rutinasPersonalizadas?.martes)) {
          d.rutinasPersonalizadas.martes = d.rutinasPersonalizadas.martes.map((item) =>
            Array.isArray(item) && item[0] === "curl-biceps-polea"
              ? ["alternating-dumbbell-curl", item[1], "10-15 por lado"]
              : item,
          );
        }
        d.schemaVersion = 7;
        version = 7;
        cambio = true;
      } else if (version === 7) {
        // Cambia el cruce de dos poleas del viernes por aperturas con mancuernas.
        if (Array.isArray(d.rutinasPersonalizadas?.viernes)) {
          d.rutinasPersonalizadas.viernes = d.rutinasPersonalizadas.viernes.map((item) =>
            Array.isArray(item) && item[0] === "cruce-poleas"
              ? ["aperturas", item[1], "10-15"]
              : item,
          );
        }
        d.schemaVersion = 8;
        version = 8;
        cambio = true;
      } else if (version === 8) {
        // El miércoles deja gemelos y patada de glúteo para incluir ambos movimientos de cadera.
        if (Array.isArray(d.rutinasPersonalizadas?.miercoles)) {
          d.rutinasPersonalizadas.miercoles = d.rutinasPersonalizadas.miercoles.flatMap((item) => {
            if (!Array.isArray(item)) return [];
            if (item[0] === "patada-gluteo-polea") return [];
            if (item[0] === "gemelos-prensa-piernas") {
              return [
                ["abductores-maquina", 3, "12-15"],
                ["aductores-maquina", 3, "12-15"],
              ];
            }
            return [item];
          });
          const ordenMiercoles = new Map([
            ["prensa-piernas-maquina", 0],
            ["curl-femoral-sentado", 1],
            ["extension-cuadriceps-maquina", 2],
            ["abductores-maquina", 3],
            ["aductores-maquina", 4],
          ]);
          d.rutinasPersonalizadas.miercoles.sort(
            (a, b) => (ordenMiercoles.get(a[0]) ?? 99) - (ordenMiercoles.get(b[0]) ?? 99),
          );
        }
        d.schemaVersion = 9;
        version = 9;
        cambio = true;
      } else if (version === 9) {
        const reemplazos = {
          "curl-biceps-maquina": "curl-scott-supino-barra-z",
          "alternating-dumbbell-curl": "curl-v-polea-baja",
        };
        Object.keys(d.rutinasPersonalizadas || {}).forEach((dia) => {
          if (!Array.isArray(d.rutinasPersonalizadas[dia])) return;
          d.rutinasPersonalizadas[dia] = d.rutinasPersonalizadas[dia].map((item) =>
            Array.isArray(item) && reemplazos[item[0]]
              ? [reemplazos[item[0]], item[1], item[2]]
              : item,
          );
        });
        d.schemaVersion = 10;
        version = 10;
        cambio = true;
      } else if (version === 10) {
        const reemplazoPressInclinado = "press-banca-barra";
        Object.keys(d.rutinasPersonalizadas || {}).forEach((dia) => {
          if (!Array.isArray(d.rutinasPersonalizadas[dia])) return;
          d.rutinasPersonalizadas[dia] = d.rutinasPersonalizadas[dia].map((item) =>
            Array.isArray(item) && item[0] === "press-inclinado-maquina"
              ? [reemplazoPressInclinado, item[1], item[2]]
              : item,
          );
        });
        d.schemaVersion = 11;
        version = 11;
        cambio = true;
      } else if (version === 11) {
        const rutinaPropuesta = {
          martes: [
            ["prensa-piernas-maquina", 3, "8-12"],
            ["curl-femoral-sentado", 3, "10-15"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["abductores-maquina", 3, "12-15"],
          ],
          miercoles: [
            ["jalon-polea-al-pecho", 3, "8-12"],
            ["remo-sentado-polea", 3, "8-12"],
            ["remo-pecho-apoyado-maquina", 3, "8-12"],
            ["curl-scott-supino-barra-z", 3, "10-15"],
            ["curl-v-polea-baja", 3, "10-15"],
          ],
          jueves: [
            ["prensa-piernas-maquina", 3, "8-12"],
            ["curl-femoral-sentado", 3, "10-15"],
            ["aductores-maquina", 3, "12-15"],
            ["gemelos-prensa-piernas", 3, "12-20"],
          ],
          viernes: [
            ["press-inclinado", 3, "8-12"],
            ["aperturas", 3, "10-15"],
            ["remo-pecho-apoyado-maquina", 3, "8-12"],
            ["elevacion-lateral-polea", 3, "12-15 por lado"],
            ["aperturas-inversas-maquina", 3, "12-15"],
          ],
        };
        d.rutinasPersonalizadas = {
          ...(d.rutinasPersonalizadas || {}),
          ...rutinaPropuesta,
        };
        d.schemaVersion = 12;
        version = 12;
        cambio = true;
      } else if (version === 12) {
        d.rutinaNuevaDesde = "2026-11-01";
        d.schemaVersion = 13;
        version = 13;
        cambio = true;
      } else if (version === 13) {
        d.rutinaNuevaDesde = "2026-11-01";
        d.schemaVersion = 14;
        version = 14;
        cambio = true;
      } else if (version === 14) {
        Object.keys(d.rutinasPersonalizadas || {}).forEach((dia) => {
          if (!Array.isArray(d.rutinasPersonalizadas[dia])) return;
          d.rutinasPersonalizadas[dia] = d.rutinasPersonalizadas[dia].map((item) =>
            Array.isArray(item) && item[0] === "press-banca-barra"
              ? ["press-inclinado", item[1], item[2]]
              : item,
          );
        });
        d.schemaVersion = 15;
        version = 15;
        cambio = true;
      } else if (version === 15) {
        d.rutinasPersonalizadas = {
          ...(d.rutinasPersonalizadas || {}),
          lunes: [
            ["press-pecho-maquina", 3, "8-12"],
            ["aperturas-peck-deck", 2, "10-15"],
            ["press-hombros-maquina", 2, "8-12"],
            ["elevacion-lateral-polea", 2, "12-15 por lado"],
            ["extension-triceps-polea", 2, "10-15"],
          ],
          martes: [
            ["prensa-piernas-maquina", 3, "8-12"],
            ["curl-femoral-sentado", 3, "10-15"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["abductores-maquina", 3, "12-15"],
          ],
          miercoles: [],
          jueves: [
            ["aductores-maquina", 3, "12-15"],
            ["gemelos-prensa-piernas", 3, "12-20"],
            ["extension-triceps-polea-sobre-cabeza", 3, "10-15"],
          ],
          viernes: [
            ["press-inclinado", 3, "8-12"],
            ["aperturas", 3, "10-15"],
            ["remo-pecho-apoyado-maquina", 3, "8-12"],
            ["elevacion-lateral-polea", 3, "12-15 por lado"],
            ["aperturas-inversas-maquina", 3, "12-15"],
          ],
          sabado: [],
          domingo: [
            ["jalon-polea-al-pecho", 3, "8-12"],
            ["remo-sentado-polea", 3, "8-12"],
            ["remo-pecho-apoyado-maquina", 3, "8-12"],
            ["curl-scott-supino-barra-z", 3, "10-15"],
            ["curl-v-polea-baja", 3, "10-15"],
          ],
        };
        d.rutinaNuevaDesde = "2026-11-01";
        d.schemaVersion = 16;
        version = 16;
        cambio = true;
      } else if (version === 16) {
        d.rutinasPersonalizadas = {
          lunes: [
            ["press-pecho-maquina", 3, "8-12"],
            ["aperturas-peck-deck", 2, "10-15"],
            ["press-hombros-maquina", 2, "8-12"],
            ["elevacion-lateral-polea", 2, "12-15 por lado"],
            ["extension-triceps-polea", 2, "10-15"],
          ],
          martes: [
            ["prensa-piernas-maquina", 3, "8-12"],
            ["curl-femoral-sentado", 3, "10-15"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["abductores-maquina", 3, "12-15"],
          ],
          miercoles: [],
          jueves: [
            ["aductores-maquina", 3, "12-15"],
            ["gemelos-prensa-piernas", 3, "12-20"],
            ["extension-triceps-polea-sobre-cabeza", 3, "10-15"],
            ["extension-triceps-polea-unilateral", 3, "10-15 por lado"],
          ],
          viernes: [
            ["jalon-polea-al-pecho", 3, "8-12"],
            ["remo-sentado-polea", 3, "8-12"],
            ["remo-pecho-apoyado-maquina", 3, "8-12"],
            ["curl-scott-supino-barra-z", 3, "10-15"],
            ["curl-v-polea-baja", 3, "10-15"],
          ],
          sabado: [],
          domingo: [],
        };
        d.rutinaNuevaDesde = "2026-10-29";
        d.schemaVersion = 17;
        version = 17;
        cambio = true;
      } else if (version === 17) {
        d.cardioRegistros = Array.isArray(d.cardioRegistros) ? d.cardioRegistros : [];
        d.schemaVersion = 18;
        version = 18;
        cambio = true;
      } else if (version === 18) {
        // Activa la distribución Torso/Pierna de cuatro días acordada.
        d.rutinasPersonalizadas = {
          lunes: [
            ["press-pecho-maquina", 3, "8-12"],
            ["remo-sentado-polea", 3, "8-12"],
            ["press-hombros-maquina", 3, "8-12"],
            ["curl-v-polea-baja", 3, "10-15"],
            ["extension-triceps-polea", 3, "10-15"],
          ],
          martes: [
            ["prensa-piernas-maquina", 3, "8-12"],
            ["curl-femoral-sentado", 3, "10-15"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["abductores-maquina", 3, "12-15"],
          ],
          miercoles: [],
          jueves: [
            ["aperturas-peck-deck", 3, "10-15"],
            ["jalon-polea-al-pecho", 3, "8-12"],
            ["remo-pecho-apoyado-maquina", 3, "8-12"],
            ["elevacion-lateral-polea", 3, "12-15 por lado"],
            ["curl-scott-supino-barra-z", 3, "10-15"],
            ["extension-triceps-polea-sobre-cabeza", 3, "10-15"],
          ],
          viernes: [
            ["curl-femoral-sentado", 3, "10-15"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["aductores-maquina", 3, "12-15"],
            ["gemelos-prensa-piernas", 3, "12-20"],
          ],
          sabado: [],
          domingo: [],
        };
        d.rutinaNuevaDesde = "2026-10-29";
        // Los checks usan la posición del ejercicio; el nuevo orden los invalida.
        d.checks = {};
        d.schemaVersion = 19;
        version = 19;
        cambio = true;
      } else if (version === 19) {
        const jueves = d.rutinasPersonalizadas?.jueves;
        if (Array.isArray(jueves)) {
          const yaTieneCurlV = jueves.some(
            (item) => Array.isArray(item) && item[0] === "curl-biceps-agarre-v",
          );
          d.rutinasPersonalizadas.jueves = jueves.flatMap((item) => {
            if (!Array.isArray(item) || item[0] !== "curl-scott-supino-barra-z")
              return [item];
            return yaTieneCurlV
              ? []
              : [["curl-biceps-agarre-v", item[1], item[2]]];
          });
        }
        d.schemaVersion = 20;
        version = 20;
        cambio = true;
      } else if (version === 20) {
        const jueves = d.rutinasPersonalizadas?.jueves;
        if (Array.isArray(jueves)) {
          d.rutinasPersonalizadas.jueves = jueves.filter(
            (item) => !Array.isArray(item) || item[0] !== "elevacion-lateral-polea",
          );
        }
        d.schemaVersion = 21;
        version = 21;
        cambio = true;
      } else if (version === 21) {
        const sesionLunes = d.historialEntrenos?.find(
          (sesion) => sesion?.fecha === "2026-11-09" && sesion?.dia === "lunes",
        );
        if (Array.isArray(sesionLunes?.ejercicios)) {
          const reemplazosPorId = {
            "press-pecho-maquina": {
              id: "aperturas-peck-deck",
              nombre: "Aperturas en peck deck",
            },
            "remo-sentado-polea": {
              id: "remo-pecho-apoyado-maquina",
              nombre: "Remo con pecho apoyado en máquina",
            },
          };
          const reemplazosPorNombre = {
            "Press de pecho en máquina": reemplazosPorId["press-pecho-maquina"],
            "Remo sentado en polea": reemplazosPorId["remo-sentado-polea"],
          };
          sesionLunes.ejercicios.forEach((ejercicio) => {
            const reemplazo = reemplazosPorId[ejercicio?.exerciseId] ||
              reemplazosPorNombre[ejercicio?.nombre];
            if (!reemplazo) return;
            ejercicio.exerciseId = reemplazo.id;
            ejercicio.nombre = reemplazo.nombre;
          });
        }
        d.schemaVersion = 22;
        version = 22;
        cambio = true;
      } else if (version === 22) {
        const sesionesLunes = (d.historialEntrenos || []).filter(
          (sesion) =>
            sesion?.dia === "lunes" &&
            ["2026-11-09", "2026-11-10"].includes(sesion.fecha),
        );
        const reemplazosPorId = {
          "press-pecho-maquina": {
            id: "aperturas-peck-deck",
            nombre: "Aperturas en peck deck",
          },
          "remo-sentado-polea": {
            id: "remo-pecho-apoyado-maquina",
            nombre: "Remo con pecho apoyado en máquina",
          },
        };
        const reemplazosPorNombre = {
          "Press de pecho en máquina": reemplazosPorId["press-pecho-maquina"],
          "Remo sentado en polea": reemplazosPorId["remo-sentado-polea"],
        };
        sesionesLunes.forEach((sesion) => {
          (sesion.ejercicios || []).forEach((ejercicio) => {
            const reemplazo = reemplazosPorId[ejercicio?.exerciseId] ||
              reemplazosPorNombre[ejercicio?.nombre];
            if (!reemplazo) return;
            ejercicio.exerciseId = reemplazo.id;
            ejercicio.nombre = reemplazo.nombre;
          });
        });

        const semana = this._getSemanaKey(new Date(2026, 10, 9, 12));
        const juevesPersonalizado = Array.isArray(d.rutinasPersonalizadas?.jueves)
          ? d.rutinasPersonalizadas.jueves
          : ROUTINES.jueves;
        const reemplazosJueves = {
          "aperturas-peck-deck": "press-pecho-maquina",
          "remo-pecho-apoyado-maquina": "remo-sentado-polea",
        };
        const rutinaJueves = juevesPersonalizado.map(([id, series, reps]) => [
          reemplazosJueves[id] || id,
          series,
          reps,
        ]);
        if (!d.rutinasTemporales || typeof d.rutinasTemporales !== "object")
          d.rutinasTemporales = {};
        d.rutinasTemporales[semana] = {
          ...(d.rutinasTemporales[semana] || {}),
          jueves: rutinaJueves,
        };

        d.schemaVersion = 23;
        version = 23;
        cambio = true;
      } else if (version === 23) {
        const semanaActual = this._getSemanaKey(new Date());
        const semanaAjustada = this._getSemanaKey(new Date(2026, 10, 9, 12));
        if (semanaActual === semanaAjustada && d.checks && typeof d.checks === "object") {
          Object.keys(d.checks).forEach((clave) => {
            if (clave.startsWith("jueves-")) delete d.checks[clave];
          });
        }
        d.schemaVersion = 24;
        version = 24;
        cambio = true;
      } else if (version === 24) {
        const reemplazarCurlJueves = (rutina) => {
          if (!Array.isArray(rutina)) return rutina;
          return rutina.map((item) =>
            Array.isArray(item) &&
              ["curl-biceps-agarre-v", "curl-v-polea-baja"].includes(item[0])
              ? ["curl-inverso-polea-barra", item[1], item[2]]
              : item,
          );
        };
        if (Array.isArray(d.rutinasPersonalizadas?.jueves)) {
          d.rutinasPersonalizadas.jueves = reemplazarCurlJueves(
            d.rutinasPersonalizadas.jueves,
          );
        }
        const semanaActual = this._getSemanaKey(new Date());
        const rutinaTemporalJueves = d.rutinasTemporales?.[semanaActual]?.jueves;
        if (Array.isArray(rutinaTemporalJueves)) {
          d.rutinasTemporales[semanaActual].jueves =
            reemplazarCurlJueves(rutinaTemporalJueves);
        }
        d.schemaVersion = 25;
        version = 25;
        cambio = true;
      } else if (version === 25) {
        const ordenJueves = [
          "press-pecho-maquina",
          "jalon-polea-al-pecho",
          "remo-sentado-polea",
          "remo-pecho-apoyado-maquina",
          "aperturas-peck-deck",
          "curl-inclinado-alterno-supinacion",
          "extension-triceps-polea-sobre-cabeza",
        ];
        const actualizarRutinaJueves = (rutina) => {
          if (!Array.isArray(rutina)) return rutina;
          return rutina
            .map((item, index) => {
              const ejercicio = Array.isArray(item) ? item[0] : null;
              const reemplazo = [
                "curl-biceps-agarre-v",
                "curl-v-polea-baja",
                "curl-inverso-polea-barra",
              ].includes(ejercicio)
                ? "curl-inclinado-alterno-supinacion"
                : ejercicio;
              return {
                item: Array.isArray(item)
                  ? [reemplazo, item[1], item[2]]
                  : item,
                indice: index,
              };
            })
            .sort((a, b) => {
              const indiceA = Array.isArray(a.item)
                ? ordenJueves.indexOf(a.item[0])
                : -1;
              const indiceB = Array.isArray(b.item)
                ? ordenJueves.indexOf(b.item[0])
                : -1;
              const ordenA = indiceA < 0 ? ordenJueves.length : indiceA;
              const ordenB = indiceB < 0 ? ordenJueves.length : indiceB;
              return ordenA - ordenB || a.indice - b.indice;
            })
            .map(({ item }) => item);
        };
        if (Array.isArray(d.rutinasPersonalizadas?.jueves)) {
          d.rutinasPersonalizadas.jueves = actualizarRutinaJueves(
            d.rutinasPersonalizadas.jueves,
          );
        }
        const semanaActual = this._getSemanaKey(new Date());
        const rutinaTemporalJueves = d.rutinasTemporales?.[semanaActual]?.jueves;
        if (Array.isArray(rutinaTemporalJueves)) {
          d.rutinasTemporales[semanaActual].jueves =
            actualizarRutinaJueves(rutinaTemporalJueves);
        }
        if (d.checks && typeof d.checks === "object") {
          Object.keys(d.checks).forEach((clave) => {
            if (clave.startsWith("jueves-")) delete d.checks[clave];
          });
        }
        d.schemaVersion = 26;
        version = 26;
        cambio = true;
      } else if (version === 26) {
        const reemplazarExtensionJueves = (rutina) => {
          if (!Array.isArray(rutina)) return rutina;
          return rutina.map((item) => {
            if (
              !Array.isArray(item) ||
              item[0] !== "extension-triceps-polea-sobre-cabeza"
            ) {
              return item;
            }
            return ["patada-triceps-polea-baja", item[1], "10-15 por lado"];
          });
        };
        if (Array.isArray(d.rutinasPersonalizadas?.jueves)) {
          d.rutinasPersonalizadas.jueves = reemplazarExtensionJueves(
            d.rutinasPersonalizadas.jueves,
          );
        }
        const semanaActual = this._getSemanaKey(new Date());
        const rutinaTemporalJueves = d.rutinasTemporales?.[semanaActual]?.jueves;
        if (Array.isArray(rutinaTemporalJueves)) {
          d.rutinasTemporales[semanaActual].jueves =
            reemplazarExtensionJueves(rutinaTemporalJueves);
        }
        if (d.checks && typeof d.checks === "object") {
          Object.keys(d.checks).forEach((clave) => {
            if (clave.startsWith("jueves-")) delete d.checks[clave];
          });
        }
        d.schemaVersion = 27;
        version = 27;
        cambio = true;
      } else if (version === 27) {
        const rutinasActualizadas = {
          lunes: [
            ["press-pecho-maquina", 3, "8-12"],
            ["remo-sentado-polea", 3, "8-12"],
            ["press-hombros-maquina", 3, "8-12"],
            ["curl-v-polea-baja", 4, "10-15"],
            ["extension-triceps-polea", 3, "10-15"],
          ],
          martes: [
            ["prensa-piernas-maquina", 3, "8-12"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["curl-femoral-sentado", 3, "10-15"],
            ["abductores-maquina", 3, "12-15"],
          ],
          jueves: [
            ["press-pecho-maquina", 3, "8-12"],
            ["jalon-polea-al-pecho", 3, "8-12"],
            ["remo-sentado-polea", 3, "8-12"],
            ["curl-inclinado-alterno-supinacion", 4, "10-15"],
            ["extension-triceps-polea-sobre-cabeza", 3, "10-15"],
          ],
          viernes: [
            ["curl-femoral-sentado", 3, "10-15"],
            ["extension-cuadriceps-maquina", 3, "10-15"],
            ["aductores-maquina", 3, "12-15"],
            ["gemelos-prensa-piernas", 3, "12-20"],
          ],
        };
        Object.keys(rutinasActualizadas).forEach((dia) => {
          if (Array.isArray(d.rutinasPersonalizadas?.[dia])) {
            d.rutinasPersonalizadas[dia] = rutinasActualizadas[dia];
          }
        });

        const semanaActual = this._getSemanaKey(new Date());
        if (!d.rutinasTemporales || typeof d.rutinasTemporales !== "object")
          d.rutinasTemporales = {};
        d.rutinasTemporales[semanaActual] = {
          ...(d.rutinasTemporales[semanaActual] || {}),
          jueves: rutinasActualizadas.jueves,
        };
        if (d.checks && typeof d.checks === "object") {
          Object.keys(d.checks).forEach((clave) => {
            if (clave.startsWith("jueves-")) delete d.checks[clave];
          });
        }
        d.schemaVersion = 28;
        version = 28;
        cambio = true;
      } else if (version === 28) {
        const juevesPermanente = [
          ["jalon-polea-al-pecho", 3, "8-12"],
          ["remo-pecho-apoyado-maquina", 3, "8-12"],
          ["aperturas-peck-deck", 3, "10-15"],
          ["curl-inclinado-alterno-supinacion", 4, "10-15"],
          ["extension-triceps-polea-sobre-cabeza", 3, "10-15"],
        ];
        if (Array.isArray(d.rutinasPersonalizadas?.jueves)) {
          d.rutinasPersonalizadas.jueves = juevesPermanente;
        }
        d.schemaVersion = 29;
        version = 29;
        cambio = true;
      } else if (version === 29) {
        const cambiarRemo = (rutina, anterior, nuevo) =>
          rutina.map((item) =>
            Array.isArray(item)
              ? [item[0] === anterior ? nuevo : item[0], item[1], item[2]]
              : item,
          );
        if (Array.isArray(d.rutinasPersonalizadas?.lunes)) {
          d.rutinasPersonalizadas.lunes = cambiarRemo(
            d.rutinasPersonalizadas.lunes,
            "remo-sentado-polea",
            "remo-pecho-apoyado-maquina",
          );
        }
        if (Array.isArray(d.rutinasPersonalizadas?.jueves)) {
          d.rutinasPersonalizadas.jueves = cambiarRemo(
            d.rutinasPersonalizadas.jueves,
            "remo-pecho-apoyado-maquina",
            "remo-sentado-polea",
          );
        }
        d.schemaVersion = 30;
        version = 30;
        cambio = true;
      } else if (version === 30) {
        const ordenJueves = [
          "aperturas-peck-deck",
          "jalon-polea-al-pecho",
          "remo-sentado-polea",
          "curl-inclinado-alterno-supinacion",
          "extension-triceps-polea-sobre-cabeza",
        ];
        if (Array.isArray(d.rutinasPersonalizadas?.jueves)) {
          d.rutinasPersonalizadas.jueves = d.rutinasPersonalizadas.jueves
            .map((item, indice) => ({ item, indice }))
            .sort((a, b) => {
              const idA = Array.isArray(a.item) ? a.item[0] : null;
              const idB = Array.isArray(b.item) ? b.item[0] : null;
              const ordenA = ordenJueves.indexOf(idA);
              const ordenB = ordenJueves.indexOf(idB);
              return (ordenA < 0 ? ordenJueves.length : ordenA) -
                (ordenB < 0 ? ordenJueves.length : ordenB) ||
                a.indice - b.indice;
            })
            .map(({ item }) => item);
        }
        d.schemaVersion = 31;
        version = 31;
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
    if (!Array.isArray(STATE.cardioRegistros)) STATE.cardioRegistros = [];
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
    ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].forEach((dia) => {
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
    const semanaActual = this._getSemanaKey(new Date());
    const temporales = STATE.rutinasTemporales;
    STATE.rutinasTemporales = {};
    if (temporales && typeof temporales === "object" && !Array.isArray(temporales)) {
      const rutinasSemana = temporales[semanaActual];
      if (rutinasSemana && typeof rutinasSemana === "object" && !Array.isArray(rutinasSemana)) {
        const idsValidos = new Set(getExerciseDatabase().map((ej) => ej.id));
        const diasValidos = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
        const rutinasNormalizadas = {};
        diasValidos.forEach((dia) => {
          const rutina = rutinasSemana[dia];
          if (!Array.isArray(rutina)) return;
          rutinasNormalizadas[dia] = rutina
            .filter((item, indice, lista) =>
              Array.isArray(item) &&
              typeof item[0] === "string" &&
              idsValidos.has(item[0]) &&
              lista.findIndex((otro) => Array.isArray(otro) && otro[0] === item[0]) === indice
            )
            .map(([id, series, reps]) => [
              id,
              Number.isFinite(Number(series)) && Number(series) > 0 ? Number(series) : 3,
              String(reps || "12"),
            ]);
        });
        if (Object.keys(rutinasNormalizadas).length)
          STATE.rutinasTemporales[semanaActual] = rutinasNormalizadas;
      }
    }
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
    const fechaInicio = STATE.ajustes?.fechaInicioNoFumar || CONFIG.FECHA_INICIO_NO_FUMAR;
    if (!fechaInicio) return;
    let c = 0;
    const f = new Date(`${fechaInicio}T00:00:00`);
    if (!Number.isFinite(f.getTime())) return;
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
      return true;
    } catch (err) {
      console.error("No se pudo guardar el estado local:", err);
      this._saveFailurePending = true;
      const limpiarAviso = () => { this._saveFailurePending = false; };
      if (typeof queueMicrotask === "function") queueMicrotask(limpiarAviso);
      else Promise.resolve().then(limpiarAviso);
      if (typeof UI !== "undefined" && UI.toast)
        UI.toast("❌ No se pudieron guardar los datos", "error");
      return false;
    }
  },

  resetearSemana() {
    const hoy = new Date();
    const semanaActual = this._getSemanaKey(hoy);
    const ultimaSemana = localStorage.getItem("ultimaSemana");
    if (ultimaSemana !== semanaActual) {
      // El domingo es día comodín: si se completó entonces la rutina del lunes,
      // conserva esos checks para que esa sesión cuente en la semana que empieza.
      const inicioSemana = new Date(hoy);
      inicioSemana.setHours(0, 0, 0, 0);
      inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
      const domingoAnterior = new Date(inicioSemana);
      domingoAnterior.setDate(inicioSemana.getDate() - 1);
      const fechaDomingoAnterior = UI.formatFecha(domingoAnterior);
      const checksLunes = {};
      const sesionLunesDomingo = STATE.historialEntrenos.find(
        (sesion) => sesion.fecha === fechaDomingoAnterior && sesion.dia === "lunes",
      );
      if (sesionLunesDomingo) {
        Object.entries(STATE.checks || {}).forEach(([clave, valor]) => {
          if (clave.startsWith("lunes-") && valor === true) checksLunes[clave] = true;
        });
      }
      STATE.checks = checksLunes;
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
    if (estado.altura !== undefined && estado.altura !== null) validarNumero(estado.altura, "altura", 80);
    if (estado.altura !== undefined && estado.altura !== null && Number(estado.altura) > 250)
      throw new Error("Altura fuera de rango");

    for (const campo of ["mediciones", "historialEntrenos", "cardioRegistros", "diasNoFumar", "diasEntrenados", "records", "objetivos"]) {
      if (estado[campo] !== undefined && !Array.isArray(estado[campo]))
        throw new Error(`Campo inválido: ${campo}`);
    }
    for (const campo of ["checks", "evolution", "config", "ajustes", "diasEspeciales", "rutinasPersonalizadas", "rutinasTemporales", "pesosAjustados"]) {
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

    (estado.cardioRegistros || []).forEach((registro, index) => {
      if (!esObjeto(registro)) throw new Error(`Registro de cardio inválido: ${index + 1}`);
      validarFecha(registro.fecha, `cardioRegistros[${index}].fecha`);
      validarTexto(registro.maquina, `cardioRegistros[${index}].maquina`, 80);
      validarNumero(registro.minutos, `cardioRegistros[${index}].minutos`, 1);
      if (!Number.isInteger(Number(registro.minutos)) || Number(registro.minutos) > 600)
        throw new Error(`Duración de cardio inválida: ${index + 1}`);
      validarNumero(registro.distancia, `cardioRegistros[${index}].distancia`, 0, true);
      if (registro.distancia !== null && registro.distancia !== undefined && Number(registro.distancia) > 500)
        throw new Error(`Distancia de cardio inválida: ${index + 1}`);
    });

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
        if (ejercicio.pesos !== undefined) {
          if (!Array.isArray(ejercicio.pesos) || ejercicio.pesos.length > 100)
            throw new Error("Pesos de series invÃ¡lidos");
          ejercicio.pesos.forEach((peso, serie) => {
            validarNumero(peso, `peso de la serie ${serie + 1}`, 0);
            if (Number(peso) > 500) throw new Error("Peso de serie fuera de rango");
          });
        }
        if (ejercicio.seriesCalentamiento !== undefined && ![0, 1].includes(Number(ejercicio.seriesCalentamiento)))
          throw new Error("Indicador de calentamiento invÃ¡lido");
        if (ejercicio.unidad !== undefined && !["reps", "segundos"].includes(ejercicio.unidad))
          throw new Error("Unidad de serie invÃ¡lida");
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
    if (estado.ajustes?.altura !== undefined && estado.ajustes.altura !== null)
      validarNumero(estado.ajustes.altura, "ajustes.altura", 80);
    if (estado.ajustes?.objetivo !== undefined && estado.ajustes.objetivo !== null)
      validarNumero(estado.ajustes.objetivo, "ajustes.objetivo", 0.1);
    if (estado.ajustes?.fechaInicioNoFumar) {
      validarFecha(estado.ajustes.fechaInicioNoFumar, "ajustes.fechaInicioNoFumar");
    }
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
      if (!esObjeto(pendiente) || !["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].includes(pendiente.dia))
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
          cardioRegistros: "array",
          diasNoFumar: "array",
          diasEntrenados: "array",
          checks: "object",
          records: "array",
          evolution: "object",
          config: "object",
          ajustes: "object",
          materialDisponible: "array",
          rutinasPersonalizadas: "object",
          rutinasTemporales: "object",
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
        const fotosNoIncluidas = datos.fotosProgreso?.disponibles === false;
        if (fotosProgreso && !fotosNoIncluidas) {
          try {
            await Fotos.restaurarBackup(fotosProgreso);
            fotosRestauradas = true;
          } catch (err) {
            console.warn("No se pudieron restaurar las fotos:", err);
          }
        }
        this._save();
        UI.toast(
          fotosNoIncluidas
            ? "✅ Datos importados; se conservaron las fotos actuales porque el backup no las incluía"
            : fotosProgreso && !fotosRestauradas
            ? "⚠️ Datos importados; no se pudieron restaurar las fotos"
            : "✅ Datos importados correctamente",
          fotosProgreso && !fotosRestauradas && !fotosNoIncluidas ? "error" : "success",
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
