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
      <section class="card">
        <div class="card-title">📚 Historial de entrenamientos</div>
        <div class="dash-grid">
          <div class="dash-stat"><div class="num primary">${sesiones.length}</div><div class="label">Sesiones</div></div>
          <div class="dash-stat"><div class="num green">${Math.round(totalVolumen).toLocaleString("es-ES")}</div><div class="label">Volumen total (kg)</div></div>
          <div class="dash-stat"><div class="num orange">${ultimaFecha}</div><div class="label">Última sesión</div></div>
        </div>
      </section>
      <section class="card">
        <div class="card-title">Sesiones guardadas</div>
        <div id="historialSesiones">
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
      <article class="historial-sesion" style="padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
          <strong>${nombreDia}</strong>
          <span style="font-size:11px;color:var(--text-secondary);">${UI.formatearFecha(sesion.fecha)}</span>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin:6px 0;color:var(--text-secondary);font-size:11px;">
          <span>${ejercicios.length} ejercicios</span>
          <span>${ejercicios.reduce((total, ejercicio) => total + (Number(ejercicio.series) || 0), 0)} series</span>
          <span>${Math.round(volumen).toLocaleString("es-ES")} kg de volumen</span>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);">
          ${ejercicios.length ? ejercicios.map((ejercicio) => `<div style="padding:3px 0;">${ejercicio.nombre} · ${ejercicio.peso || "--"} kg · ${ejercicio.reps || "--"} reps</div>`).join("") : '<div>Solo cardio o sesión sin ejercicios de fuerza.</div>'}
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
