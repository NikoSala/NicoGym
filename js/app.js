// ==========================================
// APP
// ==========================================
const APP = {
  _cardioMostrado: false,
  pesoSesionEntreno: 0,
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

      ejerciciosEntreno = ejercicios.map((e) => ({ ...e }));

      idxEjercicioActual = Math.min(
        Math.max(Number(pendiente.idxEjercicioActual) || 0, 0),
        Math.max(ejerciciosEntreno.length - 1, 0),
      );

      recordsConseguidos = [...(pendiente.recordsConseguidos || [])];
      cardioCompletado = pendiente.cardioCompletado === true;
      this._cardioMostrado = false;
      this.pesoSesionEntreno = Number(pendiente.pesoSesionEntreno) || 0;
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
      // Elegir la carga antes de comenzar el entrenamiento.
      // Todavía no iniciamos el modo entreno hasta confirmar.
      if (!this.pesoSesionEntreno) {
        this._mostrarSelectorCargaInicio(dia);
        return;
      }

      modoEntrenoActivo = true;
      ejerciciosEntreno = ejercicios.map((e) => ({ ...e }));

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
    _mostrarSelectorCargaInicio(dia) {
    const ejercicios = getEjerciciosPorDia(dia);
    const primerEjercicio = ejercicios.find((e) => !e.esCaminata);

    if (!primerEjercicio) {
      UI.toast("No hay ejercicios de fuerza para seleccionar carga", "error");
      return;
    }

    const tipo = primerEjercicio.tipoCarga;

    if (
      typeof WEIGHTS === "undefined" ||
      !tipo ||
      typeof WEIGHTS.obtenerConfiguraciones !== "function"
    ) {
      UI.toast("No se ha podido cargar la configuración de pesos", "error");
      return;
    }

    const configuraciones = WEIGHTS.obtenerConfiguraciones(tipo);

    if (!configuraciones.length) {
      UI.toast("No hay pesos disponibles para este ejercicio", "error");
      return;
    }

    const primeraConfiguracion = configuraciones[0];

    const body = document.getElementById("meBody");

    document.getElementById("meTitulo").textContent =
      `🏋️ Preparar entrenamiento · ${CONFIG.NOMBRES_DIAS[dia]}`;

    document.getElementById("meCompletadoMsg").classList.add("hidden");

    body.innerHTML = `
    <div class="me-selector-peso-page">

      <div class="me-selector-peso-header">
        <div class="me-selector-peso-kicker">
          🏋️ PREPARACIÓN DEL ENTRENAMIENTO
        </div>

        <div class="me-selector-peso-title">
          Selecciona el peso
        </div>

        <div class="me-selector-peso-subtitle">
          ${primerEjercicio.nombre}
        </div>
      </div>

      <div class="me-selector-peso-layout">

        <!-- COLUMNA IZQUIERDA -->
        <div class="me-selector-peso-left">

          <div class="me-selector-peso-section-title">
            <i class="fa-solid fa-dumbbell"></i>
            ${
              tipo === WEIGHTS.TIPOS.UNA_MANCUERNA
                ? "PESO DE LA MANCUERNA"
                : tipo === WEIGHTS.TIPOS.DOS_MANCUERNAS
                  ? "PESO POR MANCUERNA"
                  : "PESO DE LA BARRA"
            }
          </div>

          <label class="me-peso-selector-wrap" for="mePesoInicio">
            <span class="me-peso-selector-label">Peso a utilizar</span>
            <span class="me-peso-selector-control">
              <i class="fa-solid fa-weight-hanging"></i>
              <select id="mePesoInicio">
                ${configuraciones
                  .map(
                    (config, index) => `
                      <option value="${config.peso}" ${index === 0 ? "selected" : ""}>
                        ${config.peso} kg
                      </option>
                    `,
                  )
                  .join("")}
              </select>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
          </label>

          <div class="me-peso-info">
            <i class="fa-solid fa-circle-info"></i>
            <span>
              Todos los pesos están calculados<br>
              según tu kit disponible
            </span>
          </div>

        </div>

        <!-- COLUMNA DERECHA -->
        <div class="me-selector-peso-right">

          <div class="me-preview-header">
            <i class="fa-regular fa-eye"></i>
            VISTA PREVIA DEL PESO SELECCIONADO
          </div>

          <div
            id="meCargaVisualInicio"
            class="me-selector-preview"
          >
            ${this._renderVisualCarga(primeraConfiguracion, tipo)}
          </div>

        </div>

      </div>

      <!-- CONFIRMACIÓN -->
      <div class="me-selector-confirmacion">

        <div class="me-carga-confirmacion-titulo">
          ¿Has colocado este peso en real?
        </div>

        <div id="mePesoConfirmacion" class="me-carga-sesion">
          <strong>🏋️ ${primeraConfiguracion.peso} kg</strong>
        </div>

      </div>

      <!-- BOTÓN -->
      <button
        type="button"
        class="btn btn-success btn-block me-selector-confirmar"
        id="btnConfirmarCarga"
      >
        <i class="fa-solid fa-check"></i>
        Confirmar y empezar
      </button>

    </div>
  `;

  document.getElementById("modoEntreno").classList.add("open");

  // ==========================================
  // SELECTOR DE PESO
  // ==========================================

  let pesoSeleccionado = Number(primeraConfiguracion.peso);

  const selectorPeso = document.getElementById("mePesoInicio");
  const visual = document.getElementById("meCargaVisualInicio");
  const confirmacion = document.getElementById("mePesoConfirmacion");
  const boton = document.getElementById("btnConfirmarCarga");

  // Selección inicial
  this.pesoSesionEntreno = pesoSeleccionado;
  pesoActualEntreno = pesoSeleccionado;

  // Al seleccionar un peso
  selectorPeso.addEventListener("change", () => {
  const peso = Number(selectorPeso.value);

  if (!Number.isFinite(peso) || peso <= 0) {
  return;
  }

  pesoSeleccionado = peso;

  // Guardar peso
  this.pesoSesionEntreno = peso;
  pesoActualEntreno = peso;

  // Buscar configuración
  const config = this._buscarConfiguracionCarga(tipo, peso);

  if (!config) {
  UI.toast("No existe configuración para este peso", "error");
  return;
  }

  // Actualizar dibujo
  if (visual) {
  visual.innerHTML = this._renderVisualCarga(config, tipo);
  }

  // Actualizar texto
  if (confirmacion) {
  confirmacion.innerHTML = `
  <strong>🏋️ ${peso} kg</strong>
  `;
  }
  });

  // ==========================================
  // BOTÓN CONFIRMAR Y EMPEZAR
  // ==========================================

  boton.addEventListener("click", () => {
  const peso = Number(pesoSeleccionado);

  if (!Number.isFinite(peso) || peso <= 0) {
  UI.toast("Selecciona un peso válido", "error");
  return;
  }

  const config = this._buscarConfiguracionCarga(tipo, peso);

  if (!config) {
  UI.toast("No existe configuración para este peso", "error");
  return;
  }

  // Guardar definitivamente el peso de la sesión
  this.pesoSesionEntreno = peso;
  pesoActualEntreno = peso;

  modoEntrenoActivo = true;
  ejerciciosEntreno = ejercicios.map((e) => ({ ...e }));

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

  document.getElementById("meTitulo").textContent =
  `🏋️ ${CONFIG.NOMBRES_DIAS[dia]}`;

  document.getElementById("meCompletadoMsg").classList.add("hidden");

  this._mostrarEjercicio();
  });

    document.getElementById("modoEntreno").scrollTop = 0;
  },
  _renderSelectorCarga(ej, pesoActual) {
    const tipo = ej.tipoCarga;

    if (!tipo || typeof WEIGHTS === "undefined") {
      return `
          <div class="me-input-group">
            <label>Peso (kg)</label>
            <input
              type="number"
              id="mePeso"
              step="0.5"
              min="0.5"
              value="${pesoActual || ""}"
              placeholder="0"
              ${seriesActualesEntreno.length ? "readonly" : ""}
            >
          </div>
        `;
    }

    const configuraciones = WEIGHTS.obtenerConfiguraciones(tipo);

    if (!configuraciones.length) {
      return `
          <div class="me-input-group">
            <label>Peso (kg)</label>
            <input
              type="number"
              id="mePeso"
              step="0.5"
              min="0.5"
              value="${pesoActual || ""}"
              placeholder="0"
              ${seriesActualesEntreno.length ? "readonly" : ""}
            >
          </div>
        `;
    }

        const opciones = configuraciones
      .map((config) => {
        let texto = `${config.peso} kg`;

        if (tipo === WEIGHTS.TIPOS.UNA_MANCUERNA) {
          texto += " · 1 mancuerna";
        }

        if (tipo === WEIGHTS.TIPOS.DOS_MANCUERNAS) {
          texto += " por mancuerna";
        }

        if (
          tipo === WEIGHTS.TIPOS.BARRA_LARGA &&
          config.modalidad === "dos_mancuernas_unidas"
        ) {
          texto += " · 2 mancuernas";
        }

        if (
          tipo === WEIGHTS.TIPOS.BARRA_LARGA &&
          config.modalidad === "discos_directos"
        ) {
          texto += " · discos directos";
        }

        return `
            <option
              value="${config.peso}"
              ${Math.abs(Number(config.peso) - Number(pesoActual)) < 0.001 ? "selected" : ""}
            >${texto}</option>
          `;
      })
      .join("");

    return `
        <div class="me-input-group">
          <label>
            ${
              tipo === WEIGHTS.TIPOS.UNA_MANCUERNA
                ? "Mancuerna"
                : tipo === WEIGHTS.TIPOS.DOS_MANCUERNAS
                  ? "Mancuernas"
                  : "Barra"
            }
          </label>

          <select
            id="mePeso"
            onchange="APP._actualizarVisualCarga('${tipo}')"
            ${seriesActualesEntreno.length ? "disabled" : ""}
          >
            ${opciones}
          </select>
          <div id="meCargaVisual">
            ${this._renderVisualCarga(
              this._buscarConfiguracionCarga(tipo, pesoActual),
              tipo,
            )}
          </div>
        </div>
      `;
  },
  _renderVisualCarga(config, tipo) {
    if (!config) return "";

    const discos = config.discosPorLado || config.discosPorExtremo || {};

    const d125 = Number(discos[1.25] || 0);
    const d150 = Number(discos[1.5] || 0);
    const d200 = Number(discos[2] || 0);

    /*
     * Cada disco se representa como un disco grueso de goma.
     * El tamaño visual aumenta ligeramente según su peso.
     */
    const crearDiscos = () => {
      let html = "";

      for (let i = 0; i < d125; i++) {
        html += `
          <span
            class="me-disco-real disco-125"
            title="Disco 1,25 kg"
            aria-label="Disco de 1,25 kg">
            <span class="me-disco-agujero"></span>
          </span>
        `;
      }

      for (let i = 0; i < d150; i++) {
        html += `
          <span
            class="me-disco-real disco-150"
            title="Disco 1,50 kg"
            aria-label="Disco de 1,50 kg">
            <span class="me-disco-agujero"></span>
          </span>
        `;
      }

      for (let i = 0; i < d200; i++) {
        html += `
          <span
            class="me-disco-real disco-200"
            title="Disco 2 kg"
            aria-label="Disco de 2 kg">
            <span class="me-disco-agujero"></span>
          </span>
        `;
      }

      return html;
    };

      const texto = this._textoConfiguracionCarga(config, tipo);
      const peso = Number(config.peso || 0);

    /* ==========================================
      UNA MANCUERNA
      ========================================== */
    if (tipo === WEIGHTS.TIPOS.UNA_MANCUERNA) {
      return `
        <div class="me-carga-visual me-carga-visual-movil">
          <div class="me-carga-dibujo me-dibujo-mancuerna-real">

            <div class="me-mancuerna-real">

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

              <div class="me-discos-reales me-discos-izq">
                ${crearDiscos()}
              </div>

              <div class="me-mango">
                <div class="me-mango-metal"></div>
                <div class="me-mango-rojo"></div>
                <div class="me-mango-metal"></div>
              </div>

              <div class="me-discos-reales me-discos-der">
                ${crearDiscos()}
              </div>

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

            </div>

          </div>

          <div class="me-carga-detalle">
            ${texto}
          </div>
        </div>
      `;
    }

    /* ==========================================
      DOS MANCUERNAS
      ========================================== */
    if (tipo === WEIGHTS.TIPOS.DOS_MANCUERNAS) {
      return `
        <div class="me-carga-visual me-carga-visual-movil">
          <div class="me-carga-dibujo me-dos-mancuernas-real">

            <div class="me-mancuerna-real">

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

              <div class="me-discos-reales me-discos-izq">
                ${crearDiscos()}
              </div>

              <div class="me-mango">
                <div class="me-mango-metal"></div>
                <div class="me-mango-rojo"></div>
                <div class="me-mango-metal"></div>
              </div>

              <div class="me-discos-reales me-discos-der">
                ${crearDiscos()}
              </div>

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

            </div>

            <div class="me-mancuerna-real">

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

              <div class="me-discos-reales me-discos-izq">
                ${crearDiscos()}
              </div>

              <div class="me-mango">
                <div class="me-mango-metal"></div>
                <div class="me-mango-rojo"></div>
                <div class="me-mango-metal"></div>
              </div>

              <div class="me-discos-reales me-discos-der">
                ${crearDiscos()}
              </div>

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

            </div>

          </div>

          <div class="me-carga-detalle">
            ${texto}
          </div>
        </div>
      `;
    }

    /* ==========================================
      BARRA LARGA
      ========================================== */
    if (tipo === WEIGHTS.TIPOS.BARRA_LARGA) {
      if (config.modalidad === "dos_mancuernas_unidas") {
        return `
          <div class="me-carga-visual me-carga-visual-movil">
            <div class="me-carga-dibujo me-barra-real">

              <div class="me-discos-reales me-discos-izq">
                ${crearDiscos()}
              </div>

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

              <div class="me-barra-centro-real">
                <div class="me-barra-agarre-rojo"></div>
              </div>

              <div class="me-cierre">
                <span></span>
                <span></span>
              </div>

              <div class="me-discos-reales me-discos-der">
                ${crearDiscos()}
              </div>

            </div>

            <div class="me-carga-detalle">
              ${texto}
            </div>
          </div>
        `;
      }

      return `
        <div class="me-carga-visual me-carga-visual-movil">
          <div class="me-carga-dibujo me-barra-real">

            <div class="me-discos-reales me-discos-izq">
              ${crearDiscos()}
            </div>

            <div class="me-cierre">
              <span></span>
              <span></span>
            </div>

            <div class="me-barra-centro-real">
              <div class="me-barra-agarre-rojo"></div>
            </div>

            <div class="me-cierre">
              <span></span>
              <span></span>
            </div>

            <div class="me-discos-reales me-discos-der">
              ${crearDiscos()}
            </div>

          </div>

          <div class="me-carga-detalle">
            ${texto}
          </div>
        </div>
      `;
    }

    return "";
  },
  _buscarConfiguracionCarga(tipo, peso) {
    if (
      typeof WEIGHTS === "undefined" ||
      !tipo ||
      typeof WEIGHTS.obtenerConfiguraciones !== "function"
    ) {
      return null;
    }

    const configuraciones = WEIGHTS.obtenerConfiguraciones(tipo);

    return (
      configuraciones.find(
        (config) => Math.abs(Number(config.peso) - Number(peso)) < 0.001,
      ) || null
    );
  },

  _actualizarVisualCarga(tipo) {
    const select = document.getElementById("mePeso");
    const contenedor = document.getElementById("meCargaVisual");

    if (!select) return;

    const peso = Number(select.value);

    if (!Number.isFinite(peso) || peso <= 0) {
      UI.toast("Selecciona un peso válido", "error");
      return;
    }

    // Guardamos el peso seleccionado para la sesión.
    this.pesoSesionEntreno = peso;
    pesoActualEntreno = peso;

    // Actualizamos la representación visual de los discos.
    if (contenedor) {
      const config = this._buscarConfiguracionCarga(tipo, peso);
      contenedor.innerHTML = this._renderVisualCarga(config, tipo);
    }
  },
  _obtenerOpcionesCarga(ej) {
    if (
      typeof WEIGHTS === "undefined" ||
      !ej?.tipoCarga ||
      typeof WEIGHTS.obtenerConfiguraciones !== "function"
    ) {
      return [];
    }

    return WEIGHTS.obtenerConfiguraciones(ej.tipoCarga);
  },

  _textoConfiguracionCarga(config, tipo) {
    if (!config) return "";

    const discos = config.discosPorLado || config.discosPorExtremo || {};

    const partes = [];

    if (discos[1.25]) partes.push(`1,25 kg × ${discos[1.25]}`);

    if (discos[1.5]) partes.push(`1,50 kg × ${discos[1.5]}`);

    if (discos[2]) partes.push(`2 kg × ${discos[2]}`);

    if (!partes.length) return "";

    const etiqueta = config.discosPorExtremo ? "por extremo" : "por lado";

    return `${partes.join(" · ")} ${etiqueta}`;
  },
  _mostrarEjercicio() {
    if (idxEjercicioActual >= ejerciciosEntreno.length) {
      this._finalizarEntreno();
      return;
    }

    const ej = ejerciciosEntreno[idxEjercicioActual];
    const total = ejerciciosEntreno.length;

    // ==========================================
    // CAMINATA
    // ==========================================
    if (ej.esCaminata) {
      const progreso = this._calcularProgresoGlobal();
      this._mostrarCaminataComoEjercicio(ej, total, progreso);
      return;
    }

    // ==========================================
    // DATOS DEL EJERCICIO
    // ==========================================

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

    seriesActualesEntreno = parsed.valid
      ? [...parsed.series]
      : [];

    // El peso YA ha sido elegido al iniciar la sesión.
    pesoActualEntreno = this.pesoSesionEntreno;

    ejercicioIniciadoAt = Date.now();

    // ==========================================
    // PROGRESO
    // ==========================================

    const progreso = this._calcularProgresoGlobal();

    document.getElementById("meProgresoTexto").textContent =
      `${idxEjercicioActual + 1} / ${total}`;

    document.getElementById("meProgresoFill").style.width =
      `${progreso}%`;

    document.getElementById("meProgresoInfo").textContent =
      `${progreso}% · ${seriesActualesEntreno.length}/${PROGRESION.SERIES_OBJETIVO} series`;

    document
      .getElementById("meCompletadoMsg")
      .classList.add("hidden");

    // ==========================================
    // INFORMACIÓN
    // ==========================================

    // ==========================================
    // SERIES
    // ==========================================

    const seriesHtml = Array.from(
      { length: PROGRESION.SERIES_OBJETIVO },
      (_, i) => {
        const valor = seriesActualesEntreno[i];

        return `
          <div class="me-workout-set-card ${valor ? "completed" : ""}">
            
            <div class="me-workout-set-header">
              <span class="me-workout-set-number">
                ${i + 1}
              </span>

              <strong>
                SERIE ${i + 1}
              </strong>

              ${
                valor
                  ? `<i class="fa-solid fa-check me-workout-set-check"></i>`
                  : ""
              }
            </div>

            <div class="me-workout-set-value">
              ${valor || "—"}
            </div>

            <div class="me-workout-set-label">
              reps
            </div>

          </div>
        `;
      },
    ).join("");

    const consejosHtml = ej.consejos
      ? ej.consejos
          .split("\n")
          .filter((consejo) => consejo.trim())
          .map((consejo) => `<li>${consejo.trim()}</li>`)
          .join("")
      : "<li>No hay consejos disponibles.</li>";

    const erroresHtml = ej.errores
      ? ej.errores
          .split("\n")
          .filter((error) => error.trim())
          .map((error) => `<li>${error.trim()}</li>`)
          .join("")
      : "<li>No hay errores registrados.</li>";

    // ==========================================
    // CONFIGURACIÓN DEL PESO
    // ==========================================

    const configuracionCarga =
      typeof WEIGHTS !== "undefined" && ej.tipoCarga
        ? this._buscarConfiguracionCarga(
            ej.tipoCarga,
            this.pesoSesionEntreno,
          )
        : null;

    const textoCarga = configuracionCarga
      ? this._textoConfiguracionCarga(
          configuracionCarga,
          ej.tipoCarga,
        )
      : "";

    let etiquetaCarga = "Carga seleccionada";

    if (
      typeof WEIGHTS !== "undefined" &&
      ej.tipoCarga === WEIGHTS.TIPOS.UNA_MANCUERNA
    ) {
      etiquetaCarga = "Carga seleccionada";
    } else if (
      typeof WEIGHTS !== "undefined" &&
      ej.tipoCarga === WEIGHTS.TIPOS.DOS_MANCUERNAS
    ) {
      etiquetaCarga = "Carga seleccionada";
    }

    // ==========================================
    // CUERPO PRINCIPAL
    // ==========================================

    const body = document.getElementById("meBody");

    body.innerHTML = `

      <div class="me-workout-redesign">

        <section class="me-workout-navigation">

          <button
            type="button"
            class="me-workout-nav-button"
            onclick="APP._navegarEjercicio(-1)"
            ${idxEjercicioActual === 0 ? "disabled" : ""}
          >
            <i class="fa-solid fa-arrow-left"></i>
            Anterior
          </button>

          <button
            type="button"
            class="me-workout-nav-button next"
            onclick="APP._navegarEjercicio(1)"
            ${
              idxEjercicioActual === ejerciciosEntreno.length - 1
                ? "disabled"
                : ""
            }
          >
            Siguiente
            <i class="fa-solid fa-arrow-right"></i>
          </button>

        </section>

        <div class="me-workout-main-card">

        <!-- =====================================
            CABECERA DEL EJERCICIO
            ===================================== -->

        <section class="me-workout-top-grid">

          <!-- INFORMACIÓN -->
          <div class="me-workout-title-card">

            <div class="me-workout-exercise-number">
              EJERCICIO ${idxEjercicioActual + 1} DE ${total}
            </div>

            <h1 class="me-workout-title">
              ${ej.nombre}
            </h1>

            <div class="me-workout-group">
              ${ej.grupo}
            </div>

            <details class="me-workout-tips">
              <summary>
                <i class="fa-solid fa-lightbulb"></i>
                Consejos rápidos
              </summary>
              <div class="me-workout-tips-content">
                <ul>${consejosHtml}</ul>
                <ul class="me-workout-tips-errors">${erroresHtml}</ul>
              </div>
            </details>

            <div class="me-workout-image-card">

              ${
                ej.urlGif
                  ? `
                    <img
                      src="${ej.urlGif}"
                      class="me-workout-exercise-image"
                      onclick="UI.abrirLightbox(this.src)"
                      alt="${ej.nombre}"
                      loading="lazy"
                    >

                    <button
                      type="button"
                      class="me-workout-image-button"
                      onclick="UI.abrirLightbox('${ej.urlGif}')"
                      aria-label="Ampliar animación del ejercicio"
                    >
                      <i class="fa-solid fa-expand"></i>
                    </button>
                  `
                  : `
                    <div class="me-workout-image-fallback">
                      <i class="fa-solid fa-dumbbell"></i>
                    </div>
                  `
              }

            </div>

          </div>


        </section>


        <!-- =====================================
            ZONA DE ENTRENAMIENTO
            ===================================== -->

        <section class="me-workout-training-grid">


          <!-- CARGA FIJA -->
          <div class="me-workout-load-card">

            <div class="me-workout-load-content">

              <div class="me-workout-load-title">
                <i class="fa-solid fa-dumbbell"></i>
                ${etiquetaCarga}
              </div>

              <div class="me-workout-load-value">
                ${this.pesoSesionEntreno} kg
              </div>

              <div class="me-workout-load-subtitle">
                ${
                  ej.tipoCarga ===
                  WEIGHTS?.TIPOS?.UNA_MANCUERNA
                    ? "mancuerna"
                    : "por mancuerna"
                }
              </div>

              ${
                textoCarga
                  ? `
                    <div class="me-workout-load-detail">
                      <i class="fa-solid fa-circle"></i>
                      ${textoCarga}
                    </div>
                  `
                  : ""
              }

            </div>


            ${
              configuracionCarga
                ? `
                  <div class="me-workout-load-image">
                    ${this._renderVisualCarga(
                      configuracionCarga,
                      ej.tipoCarga,
                    )}
                  </div>
                `
                : ""
            }

          </div>


          <!-- REPETICIONES -->
          <div class="me-workout-reps-card">

            <div class="me-workout-reps-title">
              REPETICIONES DE ESTA SERIE
            </div>

            <div class="me-workout-reps-row">

              <button
                type="button"
                class="me-workout-reps-button"
                onclick="APP._ajustarReps(-1)"
                aria-label="Restar repetición"
              >
                <i class="fa-solid fa-minus"></i>
              </button>

              <input
                type="number"
                id="meRepsSerie"
                class="me-workout-reps-input"
                min="1"
                max="100"
                step="1"
                value="${PROGRESION.REPS_OBJETIVO}"
              >

              <button
                type="button"
                class="me-workout-reps-button"
                onclick="APP._ajustarReps(1)"
                aria-label="Añadir repetición"
              >
                <i class="fa-solid fa-plus"></i>
              </button>

            </div>

            <div class="me-workout-reps-target">
              Objetivo: ${PROGRESION.SERIES_OBJETIVO} × ${PROGRESION.REPS_OBJETIVO} reps
            </div>

          </div>


          <!-- GUARDAR -->
          <button
            type="button"
            class="me-workout-save-button"
            onclick="APP._guardarSerie()"
          >

            <span class="me-workout-save-main">
              <i class="fa-solid fa-check"></i>
              Guardar serie ${Math.min(
                seriesActualesEntreno.length + 1,
                PROGRESION.SERIES_OBJETIVO
              )}
            </span>

            <span class="me-workout-save-sub">
              Serie ${Math.min(
                seriesActualesEntreno.length + 1,
                PROGRESION.SERIES_OBJETIVO
              )} de ${PROGRESION.SERIES_OBJETIVO}
            </span>

          </button>

        </section>

        </div>


        <!-- =====================================
            SERIES
            ===================================== -->

        <section class="me-workout-series-grid">

          ${seriesHtml}

        </section>


      </div>
    `;

    // ==========================================
    // SCROLL ARRIBA
    // ==========================================

    document.getElementById("modoEntreno").scrollTop = 0;

    // No hacemos autofocus para no abrir el teclado
    // accidentalmente en dispositivos táctiles.
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
  
  _ajustarReps(delta) {
    const input = document.getElementById("meRepsSerie");

    if (!input) return;

    let valor = parseInt(input.value, 10);

    if (!Number.isFinite(valor)) {
      valor = PROGRESION.REPS_OBJETIVO;
    }

    valor += delta;

    valor = Math.max(1, Math.min(100, valor));

    input.value = valor;
  },

  _guardarSerie() {
    const ej = ejerciciosEntreno[idxEjercicioActual];
    const peso = this.pesoSesionEntreno;
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

    const configuracionCarga =
      typeof WEIGHTS !== "undefined" && ej.tipoCarga
        ? WEIGHTS.buscar(peso, ej.tipoCarga)
        : null;

    if (!registro) {
      registro = {
        nombre: ej.nombre,
        peso,
        reps: "",
        tipoCarga: ej.tipoCarga || null,
        tipo: ej.tipoCarga || "mancuerna",
        discos: configuracionCarga
          ? {
              ...(configuracionCarga.discosPorLado || {}),
              ...(configuracionCarga.discosPorExtremo || {}),
            }
          : {},
        configuracionCarga: configuracionCarga
          ? { ...configuracionCarga }
          : null,
        series: 0,
        repsTotales: 0,
      };

      entrenamiento.ejercicios.push(registro);
    }

    registro.peso = peso;
    registro.tipoCarga = ej.tipoCarga || null;
    registro.configuracionCarga = configuracionCarga
      ? { ...configuracionCarga }
      : null;

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
      pesoSesionEntreno: this.pesoSesionEntreno,
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
    this.pesoSesionEntreno = 0;
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

};
