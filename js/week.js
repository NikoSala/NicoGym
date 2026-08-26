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
        grupo: "Bíceps + Tríceps · 8 ejercicios",
      },
      {
        key: "viernes",
        nombre: "VIERNES",
        icono: "🔵",
        grupo: "Hombros + Brazos · 5 ejercicios + cinta",
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
          html += `<div class="rd-ejercicio"><span class="rd-numero">${index + 1}.</span> ${nombreEspanol}</div>`;
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
};
