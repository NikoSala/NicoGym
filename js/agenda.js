// ==========================================
// AGENDA
// ==========================================
const Agenda = {
  mesMostrado: new Date(),
  fechaSeleccionada: UI.getHoy(),

  render() {
    const container = document.getElementById("agendaContainer");
    if (!container) return;

    const mes = new Date(this.mesMostrado);
    mes.setDate(1);
    const nombreMes = mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    const primerDia = (mes.getDay() + 6) % 7;
    const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const totalCeldas = Math.ceil((primerDia + diasMes) / 7) * 7;
    const celdas = [];

    for (let i = 0; i < totalCeldas; i++) {
      const numero = i - primerDia + 1;
      if (numero < 1 || numero > diasMes) {
        celdas.push('<div class="agenda-day agenda-day-empty"></div>');
        continue;
      }
      const fecha = new Date(mes.getFullYear(), mes.getMonth(), numero);
      const fechaKey = UI.formatFecha(fecha);
      const eventos = this._eventosDeFecha(fecha, fechaKey);
      const clases = ["agenda-day"];
      if (fechaKey === UI.getHoy()) clases.push("agenda-day-today");
      if (fechaKey === this.fechaSeleccionada) clases.push("agenda-day-selected");
      if (eventos.some((evento) => evento.tipo === "completado")) clases.push("agenda-day-done");
      
      // --- NUEVO: Colores para días especiales ---
      const estadoEspecial = STATE.diasEspeciales?.[fechaKey];
      if (estadoEspecial === 'vacaciones') clases.push("agenda-day-vacaciones");
      if (estadoEspecial === 'lesionado') clases.push("agenda-day-lesionado");
      celdas.push(`
        <button class="${clases.join(" ")}" onclick="Agenda.seleccionar('${fechaKey}')">
          <span class="agenda-day-number">${numero}</span>
          <span class="agenda-day-events">${eventos.map((evento) => `<span class="agenda-event agenda-event-${evento.tipo}" title="${evento.texto}">${evento.icono}</span>`).join("")}</span>
        </button>
      `);
    }

    const detalle = this._detalleFecha(this.fechaSeleccionada);
    container.innerHTML = `
      <section class="card agenda-card">
        <div class="card-title"><span>📅 Agenda</span><span class="agenda-month-count">${this._contarEventosMes(mes, diasMes)} eventos</span></div>
        <div class="agenda-calendar-header">
          <button class="btn btn-ghost btn-sm" aria-label="Mes anterior" onclick="Agenda.cambiarMes(-1)">‹</button>
          <strong>${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</strong>
          <button class="btn btn-ghost btn-sm" aria-label="Mes siguiente" onclick="Agenda.cambiarMes(1)">›</button>
        </div>
        <div class="agenda-weekdays"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
        <div class="agenda-calendar-grid">${celdas.join("")}</div>
        <div class="agenda-legend"><span><i class="agenda-dot agenda-dot-workout"></i> Entreno</span><span><i class="agenda-dot agenda-dot-update"></i> Actualización</span><span><i class="agenda-dot agenda-dot-done"></i> Completado</span></div>
      </section>
      <section class="card agenda-detail-card">
        <div class="card-title">${detalle.titulo}</div>
        <div class="agenda-detail-list">${detalle.html}</div>
      </section>
    `;
  },

  cambiarMes(delta) {
    this.mesMostrado.setMonth(this.mesMostrado.getMonth() + delta);
    this.render();
  },

  seleccionar(fecha) {
    this.fechaSeleccionada = fecha;
    this.mesMostrado = new Date(`${fecha}T00:00:00`);
    this.render();
  },

  _eventosDeFecha(fecha, fechaKey) {
    const eventos = [];
    const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dia = nombres[fecha.getDay()];
    const finDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
    const entrenado = STATE.diasEntrenados.includes(fechaKey);
    if (!finDeSemana && getEjerciciosPorDia(dia).length > 0) {
      eventos.push({ tipo: entrenado ? "completado" : "entreno", icono: entrenado ? "✓" : "●", texto: entrenado ? "Entrenamiento completado" : "Entrenamiento previsto" });
    }
    if (getTipoActualizacion(fechaKey)) eventos.push({ tipo: "actualizacion", icono: "◆", texto: "Actualización de progreso" });
    return eventos;
  },

  _contarEventosMes(mes, diasMes) {
    let total = 0;
    for (let dia = 1; dia <= diasMes; dia++) {
      const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia);
      total += this._eventosDeFecha(fecha, UI.formatFecha(fecha)).length;
    }
    return total;
  },

  _detalleFecha(fechaKey) {
    const fecha = new Date(`${fechaKey}T00:00:00`);
    const eventos = this._eventosDeFecha(fecha, fechaKey);
    const titulo = fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const dia = nombres[fecha.getDay()];
    const elementos = [];

    // --- NUEVO: Estado especial del día ---
    const estadoEspecial = STATE.diasEspeciales?.[fechaKey] || "normal";
    
    elementos.push(`
      <div style="padding:8px;background:rgba(0,0,0,0.15);border-radius:var(--radius-sm);margin-bottom:8px;">
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:5px;">Marcar día como:</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          <button class="btn btn-sm ${estadoEspecial === 'normal' ? 'btn-primary' : 'btn-ghost'}" 
            onclick="Agenda.marcarDia('${fechaKey}', 'normal')">
            ✅ Normal
          </button>
          <button class="btn btn-sm ${estadoEspecial === 'vacaciones' ? 'btn-primary' : 'btn-ghost'}" 
            onclick="Agenda.marcarDia('${fechaKey}', 'vacaciones')">
            🏖️ Vacaciones
          </button>
          <button class="btn btn-sm ${estadoEspecial === 'lesionado' ? 'btn-primary' : 'btn-ghost'}" 
            onclick="Agenda.marcarDia('${fechaKey}', 'lesionado')">
            🤕 Lesionado
          </button>
        </div>
      </div>
    `);

    // --- Continúa con la lógica existente ---
    if (eventos.some((evento) => evento.tipo === "completado")) elementos.push('<div class="agenda-detail-item"><span>✅</span><span>Entrenamiento completado</span></div>');
    else if (eventos.some((evento) => evento.tipo === "entreno") && estadoEspecial === 'normal') elementos.push(`<div class="agenda-detail-item"><span>💪</span><span>Entrenamiento previsto: ${CONFIG.TIPOS_RUTINA[dia]}</span></div><button class="btn btn-primary btn-block" onclick="APP.navegar('rutinas')">Ir a entrenar</button>`);
    else if (eventos.some((evento) => evento.tipo === "entreno") && estadoEspecial === 'vacaciones') elementos.push('<div class="agenda-detail-item"><span>🏖️</span><span>Vacaciones - No entrenar</span></div>');
    else if (eventos.some((evento) => evento.tipo === "entreno") && estadoEspecial === 'lesionado') elementos.push('<div class="agenda-detail-item"><span>🤕</span><span>Lesionado - Descanso recomendado</span></div>');
    else if (fecha.getDay() === 0 || fecha.getDay() === 6) elementos.push('<div class="agenda-detail-item"><span>😌</span><span>Día de descanso</span></div>');

    const tipo = getTipoActualizacion(fechaKey);
    if (tipo) {
      const texto = tipo === "completa" ? "Peso, mediciones y fotos" : tipo === "mediciones" ? "Peso y mediciones" : "Solo peso";
      elementos.push(`<div class="agenda-detail-item"><span>📊</span><span>Actualización: ${texto}</span></div><button class="btn btn-ghost btn-block" onclick="APP.navegar('peso')">Registrar progreso</button>`);
    }
    if (elementos.length === 0) elementos.push('<div class="agenda-empty">Sin eventos para este día.</div>');
    return { titulo, html: elementos.join("") };
  },
  marcarDia(fechaKey, estado) {
    if (!STATE.diasEspeciales) STATE.diasEspeciales = {};
    
    if (estado === 'normal') {
      delete STATE.diasEspeciales[fechaKey];
    } else {
      STATE.diasEspeciales[fechaKey] = estado;
    }
    
    Storage._save();
    this.render();
    APP.renderizarTodo();
    
    const mensaje = estado === 'vacaciones' ? '🏖️ Día marcado como vacaciones' : estado === 'lesionado' ? '🤕 Día marcado como lesionado' : '✅ Día marcado como normal';
    UI.toast(mensaje, 'info');
  },
};