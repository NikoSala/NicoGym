// ==========================================
// APP
// ==========================================
const APP = {
  _cardioMostrado: false,
  init() {
    const loading = document.getElementById("loadingScreen");
    loading.style.display = "flex";

    Storage.init();
    const reset = Storage.resetearSemana();
    if (reset)
      UI.toast("🔄 Nueva semana. ¡A marcar los ejercicios!", "success");

    this._cargarAjustesBasicos();
    this._renderDashboardInicial();

    setTimeout(() => {
      loading.classList.add("fade-out");
      setTimeout(() => {
        loading.style.display = "none";
      }, 500);
    }, 300);

    setTimeout(() => {
      this._cargarDatosCompletos();
    }, 100);

    document.addEventListener("click", (e) => {
      const bell = document.getElementById("bellWrap");
      const drop = document.getElementById("notifDropdown");
      if (bell && drop && !bell.contains(e.target))
        drop.classList.remove("open");
    });

    return this;
  },

  _cargarAjustesBasicos() {
    const a = STATE.ajustes || {};
    if (a.nombre) STATE.nombre = a.nombre;
    if (a.altura) STATE.altura = a.altura;
    if (a.objetivo) CONFIG.PESO_OBJETIVO = a.objetivo;
    // Cargar preferencia del temporizador: si no existe, false por defecto
    if (STATE.config && STATE.config.temporizadorDescanso !== undefined) {
      CONFIG.TEMPORIZADOR_DESCANSO = STATE.config.temporizadorDescanso;
    } else {
      CONFIG.TEMPORIZADOR_DESCANSO = false;
      if (STATE.config) STATE.config.temporizadorDescanso = false;
    }
    const dia = UI.getDiaNombre();
    diaActivo = dia === "domingo" ? "lunes" : dia;
  },

  _renderDashboardInicial() {
    UI.actualizarTopBar();
    Dashboard.render();
    Notificaciones.render();
  },

  _cargarDatosCompletos() {
    if (STATE.mediciones.length > 0) {
      STATE.evolution.initialWeight = STATE.mediciones[0].peso;
      STATE.evolution.currentWeight =
        STATE.mediciones[STATE.mediciones.length - 1].peso;
      STATE.evolution.initialWaist = STATE.mediciones[0].cintura;
      STATE.evolution.currentWaist =
        STATE.mediciones[STATE.mediciones.length - 1].cintura;
      STATE.evolution.totalWorkouts = STATE.diasEntrenados.length || 0;
    }
    Storage._save();
    Dashboard.render();
    STATE._cargado = true;
  },

  renderizarTodo() {
    UI.actualizarTopBar();
    Dashboard.render();
  },

  navegar(id) {
    if (modoEntrenoActivo) {
      if (id === "inicio") {
        this._pausarEntreno();
        return;
      }

      UI.toast("⚠️ Termina o pausa el entrenamiento primero", "error");
      return;
    }

    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    const page = document.getElementById(`page-${id}`);
    if (page) page.classList.add("active");

    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    const map = { inicio: 0, rutinas: 1, semana: 2, peso: 3, estadisticas: 4 };
    const btns = document.querySelectorAll(".nav-btn");
    if (map[id] !== undefined && btns[map[id]])
      btns[map[id]].classList.add("active");

    document
      .querySelectorAll(".side-menu .menu-item")
      .forEach((m) => m.classList.toggle("active", m.dataset.page === id));

    if (document.getElementById("sideMenu").classList.contains("open"))
      UI.toggleMenu();
    window.scrollTo(0, 0);

    switch (id) {
      case "rutinas":
        Rutinas.render();
        break;
      case "semana":
        Semana.render();
        break;
      case "peso":
        Peso.render();
        break;
      case "agenda":
        Agenda.render();
        break;
      case "records":
        Records.render();
        break;
      case "estadisticas":
        Estadisticas.render();
        break;
      case "fotos":
        Fotos.render();
        break;
      case "ajustes":
        Ajustes.render();
        break;
      case "inicio":
      default:
        Dashboard.render();
        break;
    }
  },

  confirmarReset() {
    UI.confirmar("¿Borrar TODOS los datos? No se puede deshacer.", () =>
      Storage.resetAll(),
    );
  },

  // ==========================================
  // CALENDARIO DE ACTUALIZACIONES
  // ==========================================
  obtenerTipoActualizacion() {
    const hoy = new Date();
    return getTipoActualizacion(hoy);
  },

  obtenerProximaActualizacion() {
    return getProximaActualizacion();
  },

  // ==========================================
  // MODO ENTRENO GUIADO
  // ==========================================
  iniciarEntreno(dia) {
    const ejercicios = getEjerciciosPorDia(dia);
    if (ejercicios.length === 0) {
      UI.toast("No hay ejercicios para este día", "error");
      return;
    }

    const pendiente = STATE.entrenamientoPendiente;
    const semanaActual = Storage._getSemanaKey(new Date());

    if (
      pendiente &&
      pendiente.semana === semanaActual &&
      pendiente.dia === dia &&
      pendiente.dia === UI.getDiaNombre()
    ) {
      modoEntrenoActivo = true;

      ejerciciosEntreno = pendiente.ejerciciosEntreno.map((e) => ({ ...e }));

      idxEjercicioActual = Math.min(
        Math.max(Number(pendiente.idxEjercicioActual) || 0, 0),
        Math.max(ejerciciosEntreno.length - 1, 0),
      );

      recordsConseguidos = [...(pendiente.recordsConseguidos || [])];
      cardioCompletado = pendiente.cardioCompletado === true;
      this._cardioMostrado = false;

      startTimeEntreno = pendiente.startTimeEntreno || Date.now();
      totalPesoLevantadoEntreno =
        Number(pendiente.totalPesoLevantadoEntreno) || 0;
      totalVolumenEntreno = Number(pendiente.totalVolumenEntreno) || 0;
      totalSeriesEntreno = Number(pendiente.totalSeriesEntreno) || 0;
      totalRepsEntreno = Number(pendiente.totalRepsEntreno) || 0;

      seriesActualesEntreno = [];
      pesoActualEntreno = 0;

      document.getElementById("modoEntreno").classList.add("open");
      document.getElementById("meTitulo").textContent =
        `🏋️ ${CONFIG.NOMBRES_DIAS[dia]}`;
      document.getElementById("meCompletadoMsg").classList.add("hidden");

      this._mostrarEjercicio();

      UI.toast("▶️ Entrenamiento reanudado", "success");
      return;
    }

    if (STATE.diasEntrenados.includes(UI.getHoy())) {
      UI.toast("✅ Este entrenamiento ya fue completado hoy", "success");
      return;
    }
    if (["sabado", "domingo"].includes(dia)) {
      UI.toast("🚶 Este día no tiene entrenamiento guiado", "info");
      return;
    }

    modoEntrenoActivo = true;
    ejerciciosEntreno = ejercicios.map((e) => ({ ...e }));
    if (CONFIG.DIAS_CINTA.includes(dia)) {
      ejerciciosEntreno.push({
        nombre: "Caminata en cinta",
        grupo: "Cardio suave",
        dia: dia,
        esCaminata: true,
        series: 1,
        reps: `${CONFIG.MIN_CINTA}–${CONFIG.MAX_CINTA} min`,
        descanso: 0,
        descripcion:
          "Camina a un ritmo cómodo durante 15–20 minutos. Con el tiempo iremos aumentando poco a poco el ritmo o la duración.",
        material: ["Cinta de correr"],
        intensidadMuscular: {},
      });
    }
    idxEjercicioActual = 0;
    recordsConseguidos = [];
    cardioCompletado = false;
    this._cardioMostrado = false;
    startTimeEntreno = Date.now();
    totalPesoLevantadoEntreno = 0;
    totalVolumenEntreno = 0;
    totalSeriesEntreno = 0;
    totalRepsEntreno = 0;
    seriesActualesEntreno = [];
    pesoActualEntreno = 0;

    document.getElementById("modoEntreno").classList.add("open");
    document.getElementById("meTitulo").textContent =
      `🏋️ ${CONFIG.NOMBRES_DIAS[dia]}`;
    document.getElementById("meCompletadoMsg").classList.add("hidden");
    this._mostrarEjercicio();
  },

  _mostrarEjercicio() {
    if (idxEjercicioActual >= ejerciciosEntreno.length) {
      this._finalizarEntreno();
      return;
    }

    const ej = ejerciciosEntreno[idxEjercicioActual];
    const total = ejerciciosEntreno.length;

    if (ej.esCaminata) {
      const progreso = this._calcularProgresoGlobal();
      this._mostrarCaminataComoEjercicio(ej, total, progreso);
      return;
    }

    const hoy = UI.getHoy();
    const entrenamiento = STATE.historialEntrenos.find(
      (e) => e.fecha === hoy && e.dia === ej.dia,
    );
    const registro = entrenamiento?.ejercicios?.find(
      (e) => e.nombre === ej.nombre,
    );
    const parsed = registro
      ? parseReps(registro.reps)
      : { valid: true, series: [] };
    seriesActualesEntreno = parsed.valid ? [...parsed.series] : [];
    pesoActualEntreno =
      Number(registro?.peso) ||
      Number(this._getUltimoEntreno(ej.nombre)?.peso) ||
      0;
    ejercicioIniciadoAt = Date.now();

    const progreso = this._calcularProgresoGlobal();
    document.getElementById("meProgresoTexto").textContent =
      `${idxEjercicioActual + 1} / ${total}`;
    document.getElementById("meProgresoFill").style.width = `${progreso}%`;
    document.getElementById("meProgresoInfo").textContent =
      `${progreso}% · ${seriesActualesEntreno.length}/${PROGRESION.SERIES_OBJETIVO} series`;
    document.getElementById("meCompletadoMsg").classList.add("hidden");

    const ultimo = this._getUltimoEntreno(ej.nombre);
    const record = Records.getRecord(ej.nombre);
    const dificultadColor = getDificultadColor(ej.dificultad);
    const dificultadTexto = getDificultadTexto(ej.dificultad);
    const intensidad = ej.intensidadMuscular || {};
    const objetivoDia = PROGRESION.recomendarDia(
      ej.dia,
      getEjerciciosPorDia(ej.dia),
      entrenamiento,
    );
    const body = document.getElementById("meBody");
    const seriesHtml = Array.from(
      { length: PROGRESION.SERIES_OBJETIVO },
      (_, i) => {
        const valor = seriesActualesEntreno[i];
        return `<div class="me-serie-chip ${valor ? "done" : ""}"><span>Serie ${i + 1}</span><strong>${valor ? valor + " reps" : "—"}</strong></div>`;
      },
    ).join("");

    body.innerHTML = `
                    <div class="me-ejercicio-card">
                      ${this._controlesNavegacion()}
                        <div class="me-ej-numero">Ejercicio ${idxEjercicioActual + 1} de ${total}</div>
                        <div class="me-ej-nombre">${ej.nombre}</div>
                        <div class="me-ej-grupo">${ej.grupo}</div>
                        ${ej.urlGif ? `<div class="me-ej-img-wrap"><img src="${ej.urlGif}" class="me-ej-img" onclick="UI.abrirLightbox(this.src)" alt="${ej.nombre}" loading="lazy"></div>` : `<div class="me-ej-img-fallback">💪</div>`}
                        <div class="me-ej-descripcion">${ej.descripcion}</div>
                        <div class="me-ej-dificultad"><span class="dif-label">Dificultad</span> ${dificultadColor} ${dificultadTexto}</div>
                        ${ej.material?.length ? `<div class="me-ej-material">${ej.material.map((m) => `<span class="mat-tag">✔ ${m}</span>`).join("")}</div>` : ""}
                        ${
                          Object.keys(intensidad).length
                            ? `<div class="me-ej-musculos">${Object.entries(
                                intensidad,
                              )
                                .map(
                                  ([musculo, valor]) =>
                                    `<div class="musc-row"><span class="musc-name">${musculo}</span><div class="musc-bar"><div class="musc-fill" style="width:${Math.min(valor, 100)}%;"></div></div></div>`,
                                )
                                .join("")}</div>`
                            : ""
                        }
                        ${
                          ej.consejos
                            ? `<div class="me-ej-consejos"><div class="me-ej-consejo-titulo">💡 Consejos</div><div class="me-ej-consejo-texto">${ej.consejos
                                .split("\n")
                                .filter((c) => c.trim())
                                .map((c) => "• " + c.trim())
                                .join("<br>")}</div></div>`
                            : ""
                        }
                        ${
                          ej.errores
                            ? `<div class="me-ej-errores"><div class="me-ej-error-titulo">❌ Evita</div><div class="me-ej-error-texto">${ej.errores
                                .split("\n")
                                .filter((e) => e.trim())
                                .map((e) => "• " + e.trim())
                                .join("<br>")}</div></div>`
                            : ""
                        }
                        <div class="me-ej-datos"><span>🎯 Objetivo: <strong>${PROGRESION.SERIES_OBJETIVO} × ${PROGRESION.REPS_OBJETIVO}</strong></span><span>⏱ ${ej.descanso}s descanso</span></div>
                        ${ultimo ? `<div class="me-ej-ultimo">Último: <strong>${ultimo.peso} kg</strong> · ${ultimo.reps}</div>` : ""}
                        ${record ? `<div class="me-ej-record">🏆 Récord: <strong>${record.weight} kg × ${record.reps}</strong> · 1RM est. ${PROGRESION.estimar1RM(record.weight, record.reps).toFixed(1)} kg</div>` : ""}
                        <div class="me-series-grid">${seriesHtml}</div>
                        <div class="me-ej-inputs">
                            <div class="me-input-group"><label>Peso (kg)</label><input type="number" id="mePeso" step="0.5" min="0.5" value="${pesoActualEntreno || ""}" placeholder="0" ${seriesActualesEntreno.length ? "readonly" : ""}></div>
                            <div class="me-input-group"><label>Repeticiones de esta serie</label><input type="number" id="meRepsSerie" min="1" max="100" step="1" placeholder="${PROGRESION.REPS_OBJETIVO}"></div>
                        </div>
                        <div class="me-ej-botones">
                            <button class="btn btn-success" onclick="APP._guardarSerie()"><i class="fa-solid fa-check"></i> Guardar serie ${Math.min(seriesActualesEntreno.length + 1, PROGRESION.SERIES_OBJETIVO)}</button>
                        </div>
                        ${objetivoDia.completo ? `<div class="me-progresion-hint">💪 El último día completaste 4×12 en todo el entrenamiento. Al terminar hoy podrás recibir una recomendación de carga.</div>` : ""}
                    </div>
                `;
    document.getElementById("modoEntreno").scrollTop = 0;
    document.getElementById("meRepsSerie")?.focus();
  },

  _controlesNavegacion() {
    const esPrimero = idxEjercicioActual === 0;
    const esUltimo = idxEjercicioActual === ejerciciosEntreno.length - 1;

    return `
          <div class="me-navegacion" aria-label="Navegación entre ejercicios">
              <button
                  class="btn btn-ghost me-nav-btn"
                  type="button"
                  onclick="APP._navegarEjercicio(-1)"
                  ${esPrimero ? "disabled" : ""}
                  aria-label="Ejercicio anterior">
                  <i class="fa-solid fa-arrow-left"></i> Anterior
              </button>

              <button
                  class="btn btn-ghost me-nav-btn"
                  type="button"
                  onclick="APP._navegarEjercicio(1)"
                  ${esUltimo ? "disabled" : ""}
                  aria-label="Ejercicio siguiente">
                  Siguiente <i class="fa-solid fa-arrow-right"></i>
              </button>
          </div>`;
  },

  _navegarEjercicio(direccion) {
    const siguienteIndice = idxEjercicioActual + direccion;
    if (siguienteIndice < 0 || siguienteIndice >= ejerciciosEntreno.length)
      return;
    idxEjercicioActual = siguienteIndice;
    document.getElementById("meCompletadoMsg").classList.add("hidden");
    this._mostrarEjercicio();
  },

  _guardarSerie() {
    const ej = ejerciciosEntreno[idxEjercicioActual];
    const peso = parseFloat(document.getElementById("mePeso")?.value);
    const reps = parseInt(document.getElementById("meRepsSerie")?.value, 10);

    if (!Number.isFinite(peso) || peso <= 0) {
      UI.toast("Introduce un peso válido", "error");
      return;
    }
    if (!Number.isInteger(reps) || reps < 1 || reps > 100) {
      UI.toast("Introduce entre 1 y 100 repeticiones", "error");
      return;
    }
    if (seriesActualesEntreno.length >= PROGRESION.SERIES_OBJETIVO) {
      UI.toast("Este ejercicio ya está completado", "info");
      return;
    }

    pesoActualEntreno = peso;
    seriesActualesEntreno.push(reps);

    const hoy = UI.getHoy();
    const dia = ej.dia;
    let entrenamiento = STATE.historialEntrenos.find(
      (e) => e.fecha === hoy && e.dia === dia,
    );
    if (!entrenamiento) {
      entrenamiento = {
        fecha: hoy,
        dia,
        tipo: CONFIG.TIPOS_RUTINA[dia] || dia.toUpperCase(),
        ejercicios: [],
      };
      STATE.historialEntrenos.push(entrenamiento);
    }
    let registro = entrenamiento.ejercicios.find((e) => e.nombre === ej.nombre);
    if (!registro) {
      registro = {
        nombre: ej.nombre,
        peso,
        reps: "",
        tipo: "mancuerna",
        discos: {},
        series: 0,
        repsTotales: 0,
      };
      entrenamiento.ejercicios.push(registro);
    }
    registro.peso = peso;
    registro.reps = seriesActualesEntreno.join(",");
    registro.series = seriesActualesEntreno.length;
    registro.repsTotales = seriesActualesEntreno.reduce((a, b) => a + b, 0);
    registro.timestamp = Date.now();

    this._recalcularTotalesSesion();
    const ejerciciosDia = getEjerciciosPorDia(dia);
    const idxEjercicio = ejerciciosDia.findIndex((e) => e.id === ej.id);
    if (
      idxEjercicio >= 0 &&
      seriesActualesEntreno.length >= PROGRESION.SERIES_OBJETIVO
    )
      STATE.checks[`${dia}-${idxEjercicio}`] = true;

    if (seriesActualesEntreno.length >= PROGRESION.SERIES_OBJETIVO) {
      const totalReps = registro.repsTotales;
      const date = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      if (Records.actualizar(ej.nombre, peso, totalReps, date)) {
        recordsConseguidos.push(ej.nombre);
        UI.toast("🏆 ¡Nuevo récord!", "success");
      }
      Storage._save();
      this._mostrarMensajeCompletado(`${ej.nombre} · 4 series completadas`);
      idxEjercicioActual++;
      seriesActualesEntreno = [];
      pesoActualEntreno = 0;
      if (idxEjercicioActual >= ejerciciosEntreno.length)
        setTimeout(
          () => this._finalizarEntreno(),
          CONFIG.TIEMPO_MSG_COMPLETADO + 300,
        );
      else if (CONFIG.TEMPORIZADOR_DESCANSO)
        setTimeout(() => this._mostrarDescanso(), CONFIG.TIEMPO_MSG_COMPLETADO);
      else
        setTimeout(
          () => this._mostrarEjercicio(),
          CONFIG.TIEMPO_MSG_COMPLETADO,
        );
    } else {
      Storage._save();
      UI.toast(
        `Serie ${seriesActualesEntreno.length}/${PROGRESION.SERIES_OBJETIVO} guardada`,
        "success",
      );
      this._mostrarEjercicio();
    }
  },

  _recalcularTotalesSesion() {
    totalPesoLevantadoEntreno = 0;
    totalVolumenEntreno = 0;
    totalSeriesEntreno = 0;
    totalRepsEntreno = 0;
    const hoy = UI.getHoy();
    const dia = ejerciciosEntreno[0]?.dia;
    const entrenamiento = STATE.historialEntrenos.find(
      (e) => e.fecha === hoy && e.dia === dia,
    );
    (entrenamiento?.ejercicios || []).forEach((ej) => {
      if (ej.tipo === "caminata") return;
      const parsed = parseReps(ej.reps);
      if (!parsed.valid) return;
      totalPesoLevantadoEntreno +=
        (Number(ej.peso) || 0) * parsed.series.length;
      totalVolumenEntreno += (Number(ej.peso) || 0) * parsed.total;
      totalSeriesEntreno += parsed.series.length;
      totalRepsEntreno += parsed.total;
    });
  },

  _calcularProgresoGlobal() {
    const fuerza = ejerciciosEntreno.filter((e) => !e.esCaminata);
    const totalObjetivo = Math.max(
      1,
      fuerza.length * PROGRESION.SERIES_OBJETIVO +
        ejerciciosEntreno.filter((e) => e.esCaminata).length,
    );
    const hoy = UI.getHoy();
    const dia = ejerciciosEntreno[0]?.dia;
    const entrenamiento = STATE.historialEntrenos.find(
      (e) => e.fecha === hoy && e.dia === dia,
    );
    let completadas = 0;
    fuerza.forEach((ej) => {
      const r = entrenamiento?.ejercicios?.find((x) => x.nombre === ej.nombre);
      const p = r ? parseReps(r.reps) : { valid: false, series: [] };
      if (p.valid)
        completadas += Math.min(PROGRESION.SERIES_OBJETIVO, p.series.length);
    });
    if (cardioCompletado) completadas++;
    return Math.min(100, Math.round((completadas / totalObjetivo) * 100));
  },

  _mostrarMensajeCompletado(nombre) {
    const msg = document.getElementById("meCompletadoMsg");
    msg.textContent = `✔ ${nombre} completado`;
    msg.classList.remove("hidden");
    if (msgCompletadoTimeout) clearTimeout(msgCompletadoTimeout);
  },

  _mostrarDescanso() {
    const ej = ejerciciosEntreno[idxEjercicioActual];
    const descanso = ej.descanso || 60;
    tiempoDescanso = descanso;

    const body = document.getElementById("meBody");
    body.innerHTML = `
                    <div class="me-descanso">
                        <div style="font-size:22px;margin-bottom:6px;">⏱️</div>
                        <div class="me-timer" id="meTimer">${tiempoDescanso}</div>
                        <div class="me-timer-label">Descanso antes del siguiente ejercicio</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">Próximo: ${ej.nombre}</div>
                        <button class="btn btn-primary me-siguiente" onclick="APP._saltarDescanso()">
                            <i class="fa-solid fa-forward"></i> Saltar descanso
                        </button>
                    </div>
                `;

    if (temporizadorDescanso) clearInterval(temporizadorDescanso);
    temporizadorDescanso = setInterval(() => {
      tiempoDescanso--;
      const el = document.getElementById("meTimer");
      if (el) el.textContent = tiempoDescanso;
      if (tiempoDescanso <= 0) {
        clearInterval(temporizadorDescanso);
        temporizadorDescanso = null;
        document.getElementById("meCompletadoMsg").classList.add("hidden");
        APP._mostrarEjercicio();
      }
    }, 1000);
  },

  _saltarDescanso() {
    if (temporizadorDescanso) {
      clearInterval(temporizadorDescanso);
      temporizadorDescanso = null;
    }
    document.getElementById("meCompletadoMsg").classList.add("hidden");
    this._mostrarEjercicio();
  },

  _mostrarCaminataComoEjercicio(ej, total, progreso) {
    const body = document.getElementById("meBody");
    document.getElementById("meProgresoTexto").textContent =
      `${idxEjercicioActual + 1} / ${total}`;
    document.getElementById("meProgresoFill").style.width = `${progreso}%`;
    document.getElementById("meProgresoInfo").textContent =
      `${progreso}% · Último ejercicio`;
    document.getElementById("meCompletadoMsg").classList.add("hidden");
    body.innerHTML = `
                    <div class="me-caminata-card">
                        <div class="me-ej-numero">Ejercicio ${idxEjercicioActual + 1} de ${total}</div>
                        <div class="me-caminata-icon"><i class="fa-solid fa-person-walking"></i></div>
                        <div class="me-caminata-tag">Cardio suave</div>
                        <div class="me-caminata-title">Caminata en cinta</div>
                        <div class="me-caminata-time">${CONFIG.MIN_CINTA}–${CONFIG.MAX_CINTA} minutos · andando</div>
                        <div class="me-caminata-note">Mantén un ritmo cómodo. Con el tiempo iremos aumentando poco a poco el ritmo o la duración.</div>
                        <button class="btn btn-primary btn-block" onclick="APP._completarCaminataComoEjercicio()">
                            <i class="fa-solid fa-check"></i> He terminado la caminata
                        </button>
                        ${this._controlesNavegacion()}
                    </div>`;
    document.getElementById("modoEntreno").scrollTop = 0;
  },

  _completarCaminataComoEjercicio() {
    const ej = ejerciciosEntreno[idxEjercicioActual];
    const hoy = UI.getHoy();
    let entrenamientoExistente = STATE.historialEntrenos.find(
      (e) => e.fecha === hoy && e.dia === ej.dia,
    );
    const registroCardio = {
      nombre: ej.nombre,
      tipo: "caminata",
      minutos: `${CONFIG.MIN_CINTA}-${CONFIG.MAX_CINTA}`,
      notas: "",
    };
    if (entrenamientoExistente) {
      const existente = entrenamientoExistente.ejercicios.find(
        (e) => e.nombre === ej.nombre,
      );
      if (existente) Object.assign(existente, registroCardio);
      else entrenamientoExistente.ejercicios.push(registroCardio);
    } else {
      STATE.historialEntrenos.push({
        fecha: hoy,
        dia: ej.dia,
        tipo: CONFIG.TIPOS_RUTINA[ej.dia] || ej.dia.toUpperCase(),
        ejercicios: [registroCardio],
      });
    }
    cardioCompletado = true;
    Storage._save();
    this._mostrarMensajeCompletado(ej.nombre);
    idxEjercicioActual++;
    setTimeout(
      () => this._finalizarEntreno(),
      CONFIG.TIEMPO_MSG_COMPLETADO + 200,
    );
  },

  _finalizarEntreno() {
    if (temporizadorDescanso) {
      clearInterval(temporizadorDescanso);
      temporizadorDescanso = null;
    }
    if (msgCompletadoTimeout) clearTimeout(msgCompletadoTimeout);

    const tiempoEmpleado = Math.max(
      1,
      Math.round((Date.now() - startTimeEntreno) / 60000),
    );
    const dia = ejerciciosEntreno[0]?.dia || "";
    const hoyStr = UI.getHoy();
    const ejerciciosDia = getEjerciciosPorDia(dia);
    const entrenamiento = STATE.historialEntrenos.find(
      (e) => e.fecha === hoyStr && e.dia === dia,
    );
    const recomendacion = PROGRESION.recomendarDia(
      dia,
      ejerciciosDia,
      entrenamiento,
    );

    if (!STATE.diasEntrenados.includes(hoyStr))
      STATE.diasEntrenados.push(hoyStr);
    STATE.progresion[dia] = {
      ultimaFecha: hoyStr,
      completo: recomendacion.completo,
      targetReps: PROGRESION.REPS_OBJETIVO,
      siguienteReps: recomendacion.completo
        ? PROGRESION.REPS_SIGUIENTE
        : PROGRESION.REPS_OBJETIVO,
      recomendaciones: recomendacion.recomendaciones,
      timestamp: Date.now(),
    };
    STATE.entrenamientoPendiente = null;
    Storage._save();

    const body = document.getElementById("meBody");
    body.innerHTML = `
                    <div class="me-completado-final">
                        <div class="me-feliz">🏆</div>
                        <div class="me-titulo">¡Entrenamiento completado!</div>
                        <div class="me-sub">${CONFIG.NOMBRES_DIAS[dia]} · ${tiempoEmpleado} min${CONFIG.DIAS_CINTA.includes(dia) ? " · 🚶 Cinta 15–20 min" : ""}</div>
                        <div class="me-resumen-grid">
                            <div class="me-res-item"><div class="me-res-valor">${ejerciciosDia.length}</div><div class="me-res-label">Ejercicios</div></div>
                            <div class="me-res-item"><div class="me-res-valor">${totalSeriesEntreno}</div><div class="me-res-label">Series</div></div>
                            <div class="me-res-item"><div class="me-res-valor">${totalRepsEntreno}</div><div class="me-res-label">Repeticiones</div></div>
                            <div class="me-res-item"><div class="me-res-valor">${totalPesoLevantadoEntreno.toFixed(1)}</div><div class="me-res-label">Carga × series (kg)</div></div>
                            <div class="me-res-item"><div class="me-res-valor">${Math.round(totalVolumenEntreno)}</div><div class="me-res-label">Volumen (kg)</div></div>
                            <div class="me-res-item"><div class="me-res-valor">${recordsConseguidos.length}</div><div class="me-res-label">Récords</div></div>
                        </div>
                        <div class="me-progresion-card ${recomendacion.completo ? "ok" : "keep"}">
                            <div class="me-progresion-title">💪 ${recomendacion.titulo}</div>
                            <div class="me-progresion-text">${recomendacion.mensaje}</div>
                            <div class="me-progresion-list">
                                ${recomendacion.recomendaciones.map((r) => `<div class="me-progresion-row"><span>${r.nombre}</span><strong>${r.texto}</strong></div>`).join("")}
                            </div>
                            ${recomendacion.completo ? `<div class="me-progresion-next">Objetivo de la próxima sesión: <strong>4×${PROGRESION.REPS_SIGUIENTE}</strong> si el aumento de carga se siente cómodo.</div>` : ""}
                        </div>
                        ${recordsConseguidos.length ? `<div class="me-records"><div class="me-rec-titulo">🏆 Nuevos récords</div><div class="me-rec-item">${recordsConseguidos.join(", ")}</div></div>` : ""}
                        <button class="btn btn-primary btn-block" onclick="APP._salirEntreno()" style="margin-top:10px;"><i class="fa-solid fa-check"></i> Finalizar entrenamiento</button>
                    </div>`;
    document.getElementById("meProgresoTexto").textContent = "¡Completado!";
    document.getElementById("meProgresoFill").style.width = "100%";
    document.getElementById("meProgresoInfo").textContent = "100%";
    document.getElementById("meCompletadoMsg").classList.add("hidden");
    APP.renderizarTodo();
    if (typeof confetti === "function")
      confetti({ particleCount: 120, spread: 70 });
    UI.toast("🎉 ¡Entrenamiento completado!", "success");
  },
  _pausarEntreno() {
    if (!modoEntrenoActivo || !ejerciciosEntreno.length) return;

    if (temporizadorDescanso) {
      clearInterval(temporizadorDescanso);
      temporizadorDescanso = null;
    }

    STATE.entrenamientoPendiente = {
      semana: Storage._getSemanaKey(new Date()),
      dia: ejerciciosEntreno[0]?.dia || null,
      idxEjercicioActual,
      ejerciciosEntreno: ejerciciosEntreno.map((e) => ({ ...e })),
      cardioCompletado,
      startTimeEntreno,
      recordsConseguidos: [...recordsConseguidos],
      totalPesoLevantadoEntreno,
      totalVolumenEntreno,
      totalSeriesEntreno,
      totalRepsEntreno,
    };

    Storage._save();

    modoEntrenoActivo = false;
    document.getElementById("modoEntreno")?.classList.remove("open");

    this.renderizarTodo();
    this.navegar("inicio");
    UI.toast(
      "💾 Entrenamiento guardado. Puedes reanudarlo después.",
      "success",
    );
  },
  _salirEntreno() {
    modoEntrenoActivo = false;
    ejerciciosEntreno = [];
    idxEjercicioActual = 0;
    recordsConseguidos = [];
    cardioCompletado = false;
    this._cardioMostrado = false;
    totalPesoLevantadoEntreno = 0;
    totalVolumenEntreno = 0;
    totalSeriesEntreno = 0;
    totalRepsEntreno = 0;
    seriesActualesEntreno = [];
    pesoActualEntreno = 0;

    if (temporizadorDescanso) {
      clearInterval(temporizadorDescanso);
      temporizadorDescanso = null;
    }
    if (msgCompletadoTimeout) clearTimeout(msgCompletadoTimeout);
    document.getElementById("modoEntreno").classList.remove("open");
    APP.renderizarTodo();
    APP.navegar("inicio");
  },

  _getUltimoEntreno(nombre) {
    const ord = [...STATE.historialEntrenos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
    for (const e of ord) {
      const ej = e.ejercicios.find((x) => x.nombre === nombre);
      if (ej) return { fecha: e.fecha, peso: ej.peso, reps: ej.reps };
    }
    return null;
  },
};
