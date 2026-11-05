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

    const sesiones = STATE.historialEntrenos
      .map((sesion, indice) => ({ sesion, indice }))
      .sort((a, b) => new Date(b.sesion.fecha) - new Date(a.sesion.fecha));
    const totalVolumen = sesiones.reduce(
      (total, { sesion }) => total + this._volumenSesion(sesion),
      0,
    );
    const ultima = sesiones[0]?.sesion;
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
          ${sesiones.length ? sesiones.map(({ sesion, indice }) => this._renderSesion(sesion, indice)).join("") : '<div class="agenda-empty">Todavía no hay entrenamientos registrados.</div>'}
        </div>
      </section>
    `;
  },

  _renderSesion(sesion, indiceSesion) {
    const ejercicios = (sesion.ejercicios || []).filter(
      (ejercicio) => ejercicio.tipo !== "caminata",
    );
    const volumen = this._volumenSesion(sesion);
    const notas = sesion.notas?.trim();
    const nombreDia = Object.prototype.hasOwnProperty.call(CONFIG.NOMBRES_DIAS, sesion.dia)
      ? CONFIG.NOMBRES_DIAS[sesion.dia]
      : sesion.dia || "Sesión";

    return `
      <article class="historial-sesion history-timeline-item">
        <div class="history-session-heading">
          <div><strong>${escapeHTML(nombreDia)}</strong><span>${UI.formatearFecha(sesion.fecha)}</span></div>
          <i class="fa-solid fa-dumbbell"></i>
        </div>
        <div class="history-session-metrics">
          <span><strong>${ejercicios.length}</strong> ejercicios</span>
          <span><strong>${ejercicios.reduce((total, ejercicio) => total + (Number(ejercicio.series) || 0), 0)}</strong> series</span>
          <span><strong>${Math.round(volumen).toLocaleString("es-ES")}</strong> kg volumen</span>
        </div>
        <div class="history-exercise-list">
          ${ejercicios.length ? ejercicios.map((ejercicio) => {
            const indiceEjercicio = sesion.ejercicios.indexOf(ejercicio);
            return `<div class="history-exercise-item">
              <span>${escapeHTML(ejercicio.nombre)}</span>
              <strong>${this._resumenSeries(ejercicio)}</strong>
              <button type="button" class="btn btn-ghost btn-sm history-edit-button" onclick="Historial.editarEjercicio(${indiceSesion}, ${indiceEjercicio})" aria-label="Editar ${escapeHTML(ejercicio.nombre)}">Editar</button>
            </div>`;
          }).join("") : '<div class="history-empty-session">Solo cardio o sesión sin ejercicios de fuerza.</div>'}
        </div>
        ${notas ? `<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);font-size:12px;"><strong>Nota:</strong> ${this._escapar(notas)}</div>` : ""}
      </article>
    `;
  },

  editarEjercicio(indiceSesion, indiceEjercicio) {
    const sesion = STATE.historialEntrenos[indiceSesion];
    const ejercicio = sesion?.ejercicios?.[indiceEjercicio];
    if (!ejercicio || ejercicio.tipo === "caminata") {
      UI.toast("No se encontró el ejercicio que quieres editar", "error");
      return;
    }

    const parsed = parseReps(ejercicio.reps);
    const cantidadSeries = parsed.valid
      ? parsed.series.length
      : Math.max(1, Number(ejercicio.series) || 1);
    const repeticiones = parsed.valid
      ? parsed.series
      : Array.from({ length: cantidadSeries }, () => 1);
    const pesos = obtenerPesosSeries(ejercicio, repeticiones);
    const unidad = ejercicio.unidad === "segundos" ? "segundos" : "repeticiones";

    Modal.abrir(`
      <h3>Editar ${escapeHTML(ejercicio.nombre)}</h3>
      <p style="font-size:12px;color:var(--text-secondary);margin:8px 0 12px;">${escapeHTML(UI.formatearFecha(sesion.fecha))} · Modifica el peso y las ${unidad} de cada serie.</p>
      <form id="historyExerciseEditForm" novalidate>
        <div class="history-edit-series">
          ${repeticiones.map((reps, indice) => `
            <div class="history-edit-series-row">
              <strong>Serie ${indice + 1}</strong>
              <label>Peso (kg)<input class="input" type="number" min="0" max="500" step="0.1" inputmode="decimal" data-edit-weight value="${this._escapar(pesos[indice])}" required></label>
              <label>${unidad === "segundos" ? "Segundos" : "Repeticiones"}<input class="input" type="number" min="1" max="100" step="1" inputmode="numeric" data-edit-reps value="${this._escapar(reps)}" required></label>
            </div>
          `).join("")}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">
          <button type="button" class="btn btn-ghost" data-edit-cancel>Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar cambios</button>
        </div>
      </form>
    `);

    const contenido = document.getElementById("modalGlobalContent");
    contenido.querySelector("[data-edit-cancel]").addEventListener("click", () => Modal.cerrar());
    contenido.querySelector("#historyExerciseEditForm").addEventListener("submit", (event) => {
      event.preventDefault();
      this._guardarEdicion(indiceSesion, indiceEjercicio);
    });
  },

  _guardarEdicion(indiceSesion, indiceEjercicio) {
    const sesion = STATE.historialEntrenos[indiceSesion];
    const ejercicio = sesion?.ejercicios?.[indiceEjercicio];
    const contenido = document.getElementById("modalGlobalContent");
    if (!ejercicio || !contenido) {
      UI.toast("No se encontró el ejercicio que quieres editar", "error");
      return;
    }

    const textosPeso = [...contenido.querySelectorAll("[data-edit-weight]")].map((input) => input.value.trim());
    const textosReps = [...contenido.querySelectorAll("[data-edit-reps]")].map((input) => input.value.trim());
    const pesos = textosPeso.map(Number);
    const repeticiones = textosReps.map(Number);
    if (
      !pesos.length ||
      pesos.length !== repeticiones.length ||
      textosPeso.some((valor) => valor === "") ||
      textosReps.some((valor) => valor === "") ||
      pesos.some((peso) => !Number.isFinite(peso) || peso < 0 || peso > 500) ||
      repeticiones.some((reps) => !Number.isInteger(reps) || reps < 1 || reps > 100)
    ) {
      UI.toast("Revisa los pesos (0–500 kg) y las repeticiones de cada serie", "error");
      return;
    }

    const original = { ...ejercicio };
    ejercicio.pesos = pesos;
    ejercicio.peso = pesos[pesos.length - 1];
    ejercicio.reps = repeticiones.join(",");
    ejercicio.series = repeticiones.length;
    ejercicio.repsTotales = repeticiones.reduce((total, reps) => total + reps, 0);
    ejercicio.timestamp = Date.now();
    if (ejercicio.tipoCarga && typeof WEIGHTS !== "undefined") {
      const configuracionCarga = WEIGHTS.buscar(ejercicio.peso, ejercicio.tipoCarga);
      ejercicio.configuracionCarga = configuracionCarga ? { ...configuracionCarga } : null;
      ejercicio.discos = configuracionCarga
        ? {
            ...(configuracionCarga.discosPorLado || {}),
            ...(configuracionCarga.discosPorExtremo || {}),
          }
        : {};
    }

    if (!Storage._save()) {
      Object.assign(ejercicio, original);
      return;
    }

    Modal.cerrar();
    this.render();
    UI.toast("Registro del ejercicio actualizado", "success");
  },

  _volumenSesion(sesion) {
    return (sesion.ejercicios || []).reduce((total, ejercicio) => {
      if (ejercicio.tipo === "caminata") return total;
      return total + obtenerVolumenEjercicio(ejercicio);
    }, 0);
  },

  _resumenSeries(ejercicio) {
    return escapeHTML(obtenerResumenSeries(ejercicio));
  },
};
