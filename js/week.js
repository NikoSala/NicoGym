// ==========================================
// SEMANA - PESTAÑA RUTINA
// ==========================================
const Semana = {
  render() {
    const c = document.getElementById("semanaContainer");
    if (!c) return;

    const hoy = new Date();
    const hoyDia = hoy.getDay();

    const dias = [
      {
        key: "lunes",
        nombre: "LUNES",
        icono: "🔵",
        grupo: "Pecho + Bíceps · 5 ejercicios + cinta",
      },
      {
        key: "martes",
        nombre: "MARTES",
        icono: "🟢",
        grupo: "Espalda + Trapecio + Antebrazo · 8 ejercicios",
      },
      {
        key: "miercoles",
        nombre: "MIÉRCOLES",
        icono: "🟣",
        grupo: "Hombros + Tríceps · 5 ejercicios + cinta",
      },
      {
        key: "jueves",
        nombre: "JUEVES",
        icono: "🟠",
        grupo: "Bíceps + Antebrazo · 8 ejercicios",
      },
      {
        key: "viernes",
        nombre: "VIERNES",
        icono: "🔵",
        grupo: "Pecho + Espalda + Tríceps · 6 ejercicios",
      },
    ];

    const diaMap = {
      1: "lunes",
      2: "martes",
      3: "miercoles",
      4: "jueves",
      5: "viernes",
      6: "sabado",
      0: "domingo",
    };
    const diaActualKey = diaMap[hoyDia];

    let html = `<div class="rutina-semana-intro"><span>Tu plan semanal</span><small>Selecciona un día para ver sus ejercicios</small></div><div class="rutina-semana-grid">`;

    dias.forEach((dia, indice) => {
      const esHoy = dia.key === diaActualKey;
      const esDescanso = dia.key === "sabado" || dia.key === "domingo";
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + indice - ((hoyDia + 6) % 7));
      const completado = !esDescanso && STATE.diasEntrenados.includes(UI.formatFecha(fecha));
      let ejercicios = [];

      if (!esDescanso) {
        ejercicios = getEjerciciosPorDia(dia.key);
      }
      const ejerciciosCompletados = ejercicios.reduce(
        (total, _, ejercicioIndex) =>
          total + (STATE.checks[`${dia.key}-${ejercicioIndex}`] ? 1 : 0),
        0,
      );

      const claseDia = esHoy ? "rutina-dia hoy" : "rutina-dia";
      const claseDescanso = esDescanso ? " descanso" : "";

      html += `<article class="${claseDia}${claseDescanso}">`;
      html += `<div class="rd-header">`;
      html += `<div><span class="rd-dia">${dia.icono} ${dia.nombre}</span>`;
      html += `<div class="rd-grupo">${dia.grupo}</div></div>`;
      html += `<span class="rd-estado ${completado ? "completado" : esHoy ? "actual" : esDescanso ? "reposo" : "pendiente"}">${completado ? "HECHO" : esHoy ? "HOY" : esDescanso ? "DESCANSO" : "PENDIENTE"}</span>`;
      html += `</div>`;

      if (esDescanso) {
        html += `<div class="rd-ejercicios">`;
        if (dia.key === "sabado") {
          html += `Descanso`;
        }
        html += `</div>`;
      } else {
        html += `<div class="rd-progreso"><span>Progreso</span><strong>${ejerciciosCompletados}/${ejercicios.length}</strong><i><b style="width:${ejercicios.length ? Math.round((ejerciciosCompletados / ejercicios.length) * 100) : 0}%"></b></i></div>`;
        html += `<div class="rd-ejercicios">`;
        ejercicios.forEach((ej, index) => {
          const nombreEspanol = getNombreEspanol(ej.nombre);
          html += `
            <div class="rd-ejercicio" style="cursor:pointer;" onclick="Semana.verHistorialEjercicio('${ej.nombre}')">
              <span class="rd-numero">${index + 1}.</span> 
              ${nombreEspanol}
              <span style="float:right;color:var(--text-muted);font-size:10px;">📊</span>
            </div>
          `;
        });
        html += `</div>`;
        html += `<button class="rd-ver-btn" onclick="Semana.verDia('${dia.key}')">Ver rutina <span>→</span></button>`;
      }

      html += `</article>`;
    });

    html += `</div>`;
    c.innerHTML = html;
  },

  verDia(dia) {
    APP.navegar("rutinas");
    setTimeout(() => Rutinas._seleccionarDia(dia), 0);
  },

  verHistorialEjercicio(nombreEjercicio) {
    // Buscar todas las sesiones donde aparece este ejercicio
    const sesiones = STATE.historialEntrenos
      .filter(ent => ent.ejercicios.some(ej => ej.nombre === nombreEjercicio))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (sesiones.length === 0) {
      Modal.abrir(`
        <h3>📊 Historial de ${nombreEjercicio}</h3>
        <div style="text-align:center;padding:16px;color:var(--text-secondary);">
          No hay sesiones registradas para este ejercicio todavía.
        </div>
      `);
      return;
    }

    const historialHtml = sesiones.map((ent, index) => {
      const registro = ent.ejercicios.find(ej => ej.nombre === nombreEjercicio);
      const fecha = UI.formatearFecha(ent.fecha);
      const peso = registro?.peso || '--';
      const reps = registro?.reps || '--';
      const series = registro?.series || 0;
      const repsTotales = registro?.repsTotales || 0;
      const volumen = (Number(peso) || 0) * repsTotales;

      return `
        <div style="padding:10px;border-bottom:1px solid var(--border);${index === 0 ? 'background:rgba(255,255,255,0.03);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;font-size:13px;">📅 ${fecha}</span>
            ${index === 0 ? '<span style="font-size:10px;color:var(--primary);background:var(--primary-dim);padding:2px 8px;border-radius:99px;">ÚLTIMA SESIÓN</span>' : ''}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px;font-size:11px;">
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:6px;border-radius:8px;">
              <div style="color:var(--text-muted);font-size:9px;">PESO</div>
              <div style="font-weight:700;color:var(--text);">${peso} kg</div>
            </div>
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:6px;border-radius:8px;">
              <div style="color:var(--text-muted);font-size:9px;">REPS</div>
              <div style="font-weight:700;color:var(--text);">${reps}</div>
            </div>
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:6px;border-radius:8px;">
              <div style="color:var(--text-muted);font-size:9px;">VOLUMEN</div>
              <div style="font-weight:700;color:var(--text);">${volumen.toFixed(0)} kg</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--text-secondary);">
            <span>Series: ${series}</span>
            <span>Total reps: ${repsTotales}</span>
          </div>
        </div>
      `;
    }).join('');

    Modal.abrir(`
      <h3>📊 Historial de ${nombreEjercicio}</h3>
      <div style="max-height:60vh;overflow-y:auto;margin-top:10px;">
        ${historialHtml}
      </div>
    `);
  },
};