// ==========================================
// HISTORIAL DE SESIONES
// ==========================================
const Historial = {
  _escapar(valor) {
    return String(valor)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  render() {
    const container = document.getElementById("historialContainer");
    if (!container) return;

    const sesiones = [...STATE.historialEntrenos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
    const totalVolumen = sesiones.reduce(
      (total, sesion) => total + this._volumenSesion(sesion),
      0,
    );
    const ultima = sesiones[0];
    const ultimaFecha = ultima ? UI.formatearFecha(ultima.fecha) : "--";

    container.innerHTML = `
      <section class="history-page-header">
        <div><span class="history-page-kicker">ENTRENAMIENTOS</span><h1>Tu historial</h1><p>Cada sesión cuenta para construir tu progreso.</p></div>
        <i class="fa-solid fa-clock-rotate-left history-page-icon"></i>
      </section>
      <section class="card history-summary-card">
        <div class="card-title">Resumen acumulado</div>
        <div class="dash-grid">
          <div class="dash-stat"><div class="num primary">${sesiones.length}</div><div class="label">Sesiones</div></div>
          <div class="dash-stat"><div class="num green">${Math.round(totalVolumen).toLocaleString("es-ES")}</div><div class="label">Volumen total (kg)</div></div>
          <div class="dash-stat"><div class="num orange">${ultimaFecha}</div><div class="label">Última sesión</div></div>
        </div>
      </section>
      <section class="card history-list-card">
        <div class="history-list-heading"><div><span class="history-page-kicker">REGISTRO</span><h2>Sesiones guardadas</h2></div><span class="history-list-count">${sesiones.length}</span></div>
        <div id="historialSesiones" class="history-timeline">
          ${sesiones.length ? sesiones.map((sesion) => this._renderSesion(sesion)).join("") : '<div class="agenda-empty">Todavía no hay entrenamientos registrados.</div>'}
        </div>
      </section>
    `;
  },

  _renderSesion(sesion) {
    const ejercicios = (sesion.ejercicios || []).filter(
      (ejercicio) => ejercicio.tipo !== "caminata",
    );
    const volumen = this._volumenSesion(sesion);
    const notas = sesion.notas?.trim();
    const nombreDia = CONFIG.NOMBRES_DIAS[sesion.dia] || sesion.dia || "Sesión";

    return `
      <article class="historial-sesion history-timeline-item">
        <div class="history-session-heading">
          <div><strong>${nombreDia}</strong><span>${UI.formatearFecha(sesion.fecha)}</span></div>
          <i class="fa-solid fa-dumbbell"></i>
        </div>
        <div class="history-session-metrics">
          <span><strong>${ejercicios.length}</strong> ejercicios</span>
          <span><strong>${ejercicios.reduce((total, ejercicio) => total + (Number(ejercicio.series) || 0), 0)}</strong> series</span>
          <span><strong>${Math.round(volumen).toLocaleString("es-ES")}</strong> kg volumen</span>
        </div>
        <div class="history-exercise-list">
          ${ejercicios.length ? ejercicios.map((ejercicio) => `<div><span>${ejercicio.nombre}</span><strong>${ejercicio.peso || "--"} kg · ${ejercicio.reps || "--"} reps</strong></div>`).join("") : '<div class="history-empty-session">Solo cardio o sesión sin ejercicios de fuerza.</div>'}
        </div>
        ${notas ? `<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);font-size:12px;"><strong>Nota:</strong> ${this._escapar(notas)}</div>` : ""}
      </article>
    `;
  },

  _volumenSesion(sesion) {
    return (sesion.ejercicios || []).reduce((total, ejercicio) => {
      if (ejercicio.tipo === "caminata") return total;
      const reps = parseReps(ejercicio.reps);
      return reps.valid ? total + (Number(ejercicio.peso) || 0) * reps.total : total;
    }, 0);
  },
};
