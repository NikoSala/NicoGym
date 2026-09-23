// ==========================================
// DASHBOARD
// ==========================================
const Dashboard = {
  render() {
    const c = document.getElementById("dashboardContainer");
    if (!c) return;

    const hoy = new Date();
    const horas = hoy.getHours();
    let saludo = "Buenos días";
    if (horas >= 14 && horas < 21) saludo = "Buenas tardes";
    if (horas >= 21 || horas < 6) saludo = "Buenas noches";

    const dia = UI.getDiaNombre();
    const entrenadoHoy = STATE.diasEntrenados.includes(UI.getHoy());
    const ejercicios = getEjerciciosPorDia(dia);

    const peso =
      STATE.mediciones.length > 0
        ? STATE.mediciones[STATE.mediciones.length - 1].peso
        : "--";
    const obj = CONFIG.PESO_OBJETIVO;
    let pctObjetivo = 0;
    if (STATE.mediciones.length > 0) {
      const primero = STATE.mediciones[0].peso;
      const ultimo = STATE.mediciones[STATE.mediciones.length - 1].peso;
      const total = primero - obj;
      if (total > 0)
        pctObjetivo = Math.min(
          100,
          Math.round(((primero - ultimo) / total) * 100),
        );
    }

    let ultimoEntreno = "Nunca";
    if (STATE.diasEntrenados.length > 0) {
      const ultimo = [...STATE.diasEntrenados].sort().reverse()[0];
      const diff = Math.round((new Date() - new Date(ultimo)) / 86400000);
      if (diff === 0) ultimoEntreno = "Hoy";
      else if (diff === 1) ultimoEntreno = "Ayer";
      else if (diff < 7) ultimoEntreno = `Hace ${diff} días`;
      else ultimoEntreno = UI.formatearFecha(ultimo);
    }

    const entrenamientoPendiente = STATE.entrenamientoPendiente;
    const diaHoy = UI.getDiaNombre();

    const hayEntrenamientoPendiente =
      entrenamientoPendiente &&
      entrenamientoPendiente.dia === diaHoy &&
      Array.isArray(entrenamientoPendiente.ejerciciosEntreno) &&
      entrenamientoPendiente.ejerciciosEntreno.length > 0;
    const ejerciciosHoy = getEjerciciosPorDia(diaHoy);

    let ejerciciosCompletadosHoy = 0;

    if (Array.isArray(ejerciciosHoy) && STATE.checks) {
      ejerciciosHoy.forEach((_, idx) => {
        if (STATE.checks[`${diaHoy}-${idx}`] === true) {
          ejerciciosCompletadosHoy++;
        }
      });
    }

    const totalEjerciciosHoy = Array.isArray(ejerciciosHoy)
      ? ejerciciosHoy.length
      : 0;
    const ultimaMedicion = STATE.mediciones.length > 0
      ? STATE.mediciones[STATE.mediciones.length - 1]
      : null;
    const medicionAnterior = STATE.mediciones.length > 1
      ? STATE.mediciones[STATE.mediciones.length - 2]
      : null;
    const cambioPeso = medicionAnterior
      ? Number((Number(ultimaMedicion.peso) - Number(medicionAnterior.peso)).toFixed(1))
      : null;
    const cambioPesoTexto = cambioPeso === null
      ? "Sin medición anterior"
      : `${cambioPeso > 0 ? "+" : ""}${cambioPeso.toFixed(1)} kg`;
    const cinturaTexto = ultimaMedicion?.cintura > 0
      ? `${ultimaMedicion.cintura} cm`
      : "--";
    const progresoEntreno = totalEjerciciosHoy > 0
      ? Math.round((ejerciciosCompletadosHoy / totalEjerciciosHoy) * 100)
      : 0;
    let mensajeProgreso = "";

    if (
      totalEjerciciosHoy > 0 &&
      ejerciciosCompletadosHoy > 0 &&
      !entrenadoHoy
    ) {
      if (ejerciciosCompletadosHoy >= totalEjerciciosHoy - 1) {
        mensajeProgreso = "⚡ Último esfuerzo";
      } else {
        mensajeProgreso = `🔥 ${ejerciciosCompletadosHoy} de ${totalEjerciciosHoy} ejercicios`;
      }
    }

    const nombresDias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const etiquetasDias = ["L", "M", "X", "J", "V", "S", "D"];
    const frasesMotivadoras = [
      "La constancia de hoy construye tu fuerza de mañana.",
      "Un paso más también cuenta.",
      "Entrena con intención, descansa con orgullo.",
      "Tu mejor marca empieza con una decisión.",
      "No necesitas hacerlo perfecto, sólo seguir avanzando.",
      "Cada repetición suma.",
      "Hazlo por la persona en la que te estás convirtiendo.",
    ];
    const fraseMotivadora = frasesMotivadoras[hoy.getDay() === 0 ? 6 : hoy.getDay() - 1];
    const inicioSemana = new Date(hoy);
    inicioSemana.setHours(0, 0, 0, 0);
    inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const diasSemana = nombresDias.map((diaNombre, indice) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + indice);
      const fechaKey = UI.formatFecha(fecha);
      const descanso = indice > 4;
      const completado = STATE.diasEntrenados.includes(fechaKey);
      return { diaNombre, etiqueta: etiquetasDias[indice], fechaKey, descanso, completado, esHoy: fechaKey === UI.getHoy() };
    });
    // --- NUEVO: Calcular consistencia considerando días especiales ---
    const diasExentos = diasSemana.filter(diaSemana => {
      const estado = STATE.diasEspeciales?.[diaSemana.fechaKey];
      return estado === 'vacaciones' || estado === 'lesionado';
    }).length;
    
    const entrenamientosObjetivoSemana = Math.max(1, 5 - diasExentos);
    const entrenamientosSemana = diasSemana.filter((diaSemana) => diaSemana.completado).length;
    const porcentajeConsistencia = Math.min(100, Math.round((entrenamientosSemana / entrenamientosObjetivoSemana) * 100));
    
    let semaforo;
    if (diasExentos > 0) {
      semaforo = { clase: "amarillo", titulo: "Semana ajustada", texto: `${diasExentos} día(s) marcado(s) como exento(s)` };
    } else {
      semaforo = porcentajeConsistencia >= 80
        ? { clase: "verde", titulo: "Buen ritmo", texto: "Vas cumpliendo la semana" }
        : porcentajeConsistencia >= 50
          ? { clase: "amarillo", titulo: "Puedes remontar", texto: "Todavía estás a tiempo" }
          : { clase: "rojo", titulo: "Semana pendiente", texto: "Empieza con el entrenamiento de hoy" };
    }

    const bloqueSemana = `
      <section class="dashboard-week-card card semaforo-${semaforo.clase}">
        <div class="dashboard-section-heading">
          <div>
            <span class="dashboard-kicker">ESTA SEMANA</span>
            <h2>Tu ritmo</h2>
          </div>
          <span class="dashboard-week-score">${porcentajeConsistencia}%</span>
        </div>
        <div class="dashboard-week-status"><span class="semaforo-luz"></span><strong>${semaforo.titulo}</strong><span>${semaforo.texto}</span></div>
        <div class="semaforo-track"><span style="width:${porcentajeConsistencia}%"></span></div>
        <div class="dashboard-week-footer">
          <span>${entrenamientosSemana}/${entrenamientosObjetivoSemana} entrenos</span>
          <span>Objetivo semanal</span>
        </div>
        <div class="dashboard-week-days" aria-label="Días de la semana">
          ${diasSemana.map((diaSemana) => `
            <button class="dashboard-week-day${diaSemana.esHoy ? " actual" : ""}${diaSemana.completado ? " hecho" : ""}${diaSemana.descanso ? " descanso" : ""}" onclick="APP.navegar('agenda'); setTimeout(() => Agenda.seleccionar('${diaSemana.fechaKey}'), 100);" aria-label="${diaSemana.diaNombre}">
              <span>${diaSemana.etiqueta}</span>
              <strong>${diaSemana.completado ? "✓" : diaSemana.descanso ? "·" : "—"}</strong>
            </button>
          `).join("")}
        </div>
      </section>
    `;
    const accionesRapidas = `
      <div class="dashboard-quick-actions" aria-label="Acciones rápidas">
        <button class="accion-rapida" onclick="APP.navegar('fotos')">
          <i class="fa-solid fa-camera"></i>
          <span>Fotos</span>
        </button>
        <button class="accion-rapida" onclick="APP.navegar('peso')">
          <i class="fa-solid fa-scale-balanced"></i>
          <span>Peso</span>
        </button>
        <button class="accion-rapida" onclick="APP.navegar('historial')">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Historial</span>
        </button>
      </div>
    `;
    
    // ===== MINI CALENDARIO =====
    const miniCalendario = this._renderMiniCalendario();
    
    const bloqueEntrenamiento = hayEntrenamientoPendiente
      ? `
        <section class="dashboard-workout-card dashboard-workout-paused">
          <div class="dashboard-workout-topline"><span class="dashboard-kicker">ENTRENAMIENTO EN CURSO</span><span class="dashboard-status-pill">Pausado</span></div>
          <div class="dashboard-workout-day">${CONFIG.NOMBRES_DIAS[entrenamientoPendiente.dia] || entrenamientoPendiente.dia}</div>
          <h1>${CONFIG.TIPOS_RUTINA[entrenamientoPendiente.dia] || "Entrenamiento"}</h1>
          <div class="dashboard-workout-meta"><span><i class="fa-solid fa-dumbbell"></i> ${totalEjerciciosHoy} ejercicios</span><span><i class="fa-solid fa-chart-simple"></i> ${ejerciciosCompletadosHoy}/${totalEjerciciosHoy} completados</span></div>
          <div class="dashboard-progress"><span style="width:${progresoEntreno}%"></span></div>
          <button class="dashboard-primary-action" onclick="APP.iniciarEntreno('${entrenamientoPendiente.dia}')"><i class="fa-solid fa-play"></i> Continuar entrenamiento</button>
        </section>
      `
      : dia === "sabado" || dia === "domingo"
        ? `
          <section class="dashboard-workout-card dashboard-workout-rest">
            <span class="dashboard-kicker">HOY</span>
            <div class="dashboard-workout-day">${UI.getDiaSemanaNombre(hoy)}</div>
            <h1>Día de descanso</h1>
            <p>Hoy toca recuperar para volver con energía.</p>
          </section>
        `
        : `
          <section class="dashboard-workout-card">
            <div class="dashboard-workout-topline"><span class="dashboard-kicker">ENTRENAMIENTO DE HOY</span><span class="dashboard-status-pill">${entrenadoHoy ? "Completado" : "Pendiente"}</span></div>
            <div class="dashboard-workout-day">${UI.getDiaSemanaNombre(hoy)}</div>
            <h1>${CONFIG.TIPOS_RUTINA[dia]}</h1>
            <div class="dashboard-workout-meta"><span><i class="fa-solid fa-dumbbell"></i> ${totalEjerciciosHoy} ejercicios</span><span><i class="fa-solid fa-list-check"></i> ${ejerciciosCompletadosHoy}/${totalEjerciciosHoy} completados</span></div>
            <div class="dashboard-progress"><span style="width:${progresoEntreno}%"></span></div>
            <div class="dashboard-workout-progress-label">${progresoEntreno}% de la sesión</div>
            <button class="dashboard-primary-action" onclick="${entrenadoHoy ? "APP.navegar('historial')" : `APP.iniciarEntreno('${dia}')`}"><i class="fa-solid ${entrenadoHoy ? "fa-clock-rotate-left" : "fa-play"}"></i> ${entrenadoHoy ? "Ver entrenamiento" : ejerciciosCompletadosHoy > 0 ? "Continuar entrenamiento" : "Comenzar entrenamiento"}</button>
          </section>
        `;

    const bloqueCuerpo = `
      <section class="dashboard-body-card card card-accent">
        <div class="dashboard-section-heading">
          <div><span class="dashboard-kicker">PROGRESO CORPORAL</span><h2>Tu evolución</h2></div>
          <button class="dashboard-inline-action" onclick="APP.navegar('peso')">Ver peso <i class="fa-solid fa-arrow-right"></i></button>
        </div>
        ${ultimaMedicion ? `
          <div class="dashboard-body-stats">
            <div><strong>${peso} kg</strong><span>Peso actual</span></div>
            <div><strong class="${cambioPeso !== null && cambioPeso < 0 ? "positive" : ""}">${cambioPesoTexto}</strong><span>Desde última medición</span></div>
            <div><strong>${cinturaTexto}</strong><span>Cintura</span></div>
            <div><strong>${obj} kg</strong><span>Objetivo · ${pctObjetivo}%</span></div>
          </div>
        ` : `
          <div class="dashboard-empty-state"><i class="fa-solid fa-scale-balanced"></i><div><strong>Aún no hay mediciones</strong><span>Registra tu peso para empezar a ver tu evolución.</span></div><button class="dashboard-inline-action" onclick="APP.navegar('peso')">Registrar peso</button></div>
        `}
      </section>
    `;

    const bloqueActividad = `
      <section class="dashboard-activity-card card">
        <div class="dashboard-section-heading"><div><span class="dashboard-kicker">ACTIVIDAD</span><h2>Tu recorrido</h2></div><i class="fa-solid fa-arrow-trend-up dashboard-heading-icon"></i></div>
        <div class="dashboard-activity-row"><span>Último entrenamiento</span><strong>${ultimoEntreno}</strong></div>
        <div class="dashboard-activity-row"><span>Sesiones registradas</span><strong>${STATE.historialEntrenos.length || 0}</strong></div>
        <div class="dashboard-activity-row"><span>Objetivos activos</span><strong>${STATE.objetivos?.length || 0}</strong></div>
        ${STATE.historialEntrenos.length === 0 ? '<p class="dashboard-muted-note">Cuando completes tu primera sesión aparecerá aquí.</p>' : ""}
      </section>
    `;

    c.innerHTML = `
      <div class="dashboard-layout">
        <header class="dashboard-header">
          <div class="dashboard-brand-line"><span class="dashboard-brand-dot"></span><span>NicoGym</span></div>
          <div class="saludo">${saludo}, <span>${STATE.nombre}</span></div>
          <div class="saludo-dia">${UI.getDiaSemanaNombre(hoy)} · ${hoy.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</div>
          <p class="frase-motivadora">${fraseMotivadora}</p>
        </header>
        <main class="dashboard-main-column">
          ${bloqueEntrenamiento}
          ${bloqueSemana}
          ${bloqueCuerpo}
        </main>
        <aside class="dashboard-side-column">
          ${miniCalendario}
          ${bloqueActividad}
          ${accionesRapidas}
        </aside>
      </div>
    `;
  },

  // ==========================================
  // MINI CALENDARIO
  // ==========================================
     _renderMiniCalendario() {
    const hoy = new Date();
    const mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const primerDia = (mes.getDay() + 6) % 7;
    const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const totalCeldas = Math.ceil((primerDia + diasMes) / 7) * 7;
    
    const nombreMes = mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    
    let celdas = "";
    for (let i = 0; i < totalCeldas; i++) {
      const numero = i - primerDia + 1;
      if (numero < 1 || numero > diasMes) {
        celdas += '<div class="mini-cal-empty"></div>';
        continue;
      }
      
      const fecha = new Date(mes.getFullYear(), mes.getMonth(), numero);
      const fechaKey = UI.formatFecha(fecha);
      const esHoy = fechaKey === UI.getHoy();
      const estadoEspecial = STATE.diasEspeciales?.[fechaKey];
      const completado = STATE.diasEntrenados.includes(fechaKey);
      
      let clase = "mini-cal-day";
      if (esHoy) clase += " mini-cal-hoy";
      if (estadoEspecial === 'vacaciones') clase += " mini-cal-vacaciones";
      if (estadoEspecial === 'lesionado') clase += " mini-cal-lesionado";
      if (completado) clase += " mini-cal-completado";
      
      celdas += `
        <button class="${clase}" onclick="APP.navegar('agenda'); setTimeout(() => Agenda.seleccionar('${fechaKey}'), 100);">
          ${numero}
        </button>
      `;
    }
    
    return `
      <div class="mini-calendario-card" onclick="APP.navegar('agenda')">
        <div class="mini-cal-header">
          <span>📅 ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</span>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
        <div class="mini-cal-grid">
          <span class="mini-cal-weekday">L</span><span class="mini-cal-weekday">M</span><span class="mini-cal-weekday">X</span><span class="mini-cal-weekday">J</span><span class="mini-cal-weekday">V</span><span class="mini-cal-weekday">S</span><span class="mini-cal-weekday">D</span>
          ${celdas}
        </div>
      </div>
    `;
  },
};