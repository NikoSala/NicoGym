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
        grupo: "Brazos · 8 ejercicios",
      },
      {
        key: "viernes",
        nombre: "VIERNES",
        icono: "🔵",
        grupo: "Torso completo · 4 ejercicios + cinta",
      },
      { key: "sabado", nombre: "SÁBADO", icono: "🚶", grupo: "Caminata" },
      { key: "domingo", nombre: "DOMINGO", icono: "😌", grupo: "Descanso" },
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

    let html = `<div class="rutina-semana">`;

    dias.forEach((dia) => {
      const esHoy = dia.key === diaActualKey;
      const esDescanso = dia.key === "sabado" || dia.key === "domingo";
      let ejercicios = [];

      if (!esDescanso) {
        ejercicios = getEjerciciosPorDia(dia.key);
      }

      const claseDia = esHoy ? "rutina-dia hoy" : "rutina-dia";
      const claseDescanso = esDescanso ? " descanso" : "";

      html += `<div class="${claseDia}${claseDescanso}">`;
      html += `<div class="rd-header">`;
      html += `<div><span class="rd-dia">${dia.icono} ${dia.nombre}</span>`;
      html += `<div class="rd-grupo">${dia.grupo}</div></div>`;
      if (esHoy) {
        html += `<span style="font-size:11px;color:var(--primary);font-weight:600;">HOY</span>`;
      }
      html += `</div>`;

      if (esDescanso) {
        html += `<div class="rd-ejercicios">`;
        if (dia.key === "sabado") {
          html += `Descanso`;
        }
        html += `</div>`;
      } else {
        html += `<div class="rd-ejercicios">`;
        ejercicios.forEach((ej, index) => {
          const nombreEspanol = getNombreEspanol(ej.nombre);
          html += `<div class="rd-ejercicio"><span class="rd-numero">${index + 1}.</span> ${nombreEspanol}</div>`;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    html += `</div>`;
    c.innerHTML = html;
  },
};
