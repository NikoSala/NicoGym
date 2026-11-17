// Progresión independiente por ejercicio. La carga nunca se modifica aquí:
// se informa de la decisión y la persona comprueba los incrementos de su máquina.
const PROGRESION = {
  SERIES_OBJETIVO: 3,
  REPS_MINIMAS: 8,
  REPS_OBJETIVO: 12,
  SESIONES_PARA_SUBIR: 2,
  SESIONES_PARA_BAJAR: 2,

  estimar1RM(peso, reps) {
    const p = Number(peso) || 0;
    const r = Number(reps) || 0;
    if (p <= 0 || r <= 0) return 0;
    return p * (1 + r / 30);
  },
};

const ExerciseProgression = {
  ejerciciosActivos() {
    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const porId = new Map();
    dias.forEach((dia) => getEjerciciosPorDia(dia).forEach((ej) => {
      if (!porId.has(ej.id)) porId.set(ej.id, ej);
    }));
    return [...porId.values()];
  },

  _coincide(registro, ejercicio) {
    return coincideRegistroEjercicio(registro, ejercicio);
  },

  historial(ejercicio) {
    return (STATE.historialEntrenos || [])
      .map((sesion) => {
        const registro = (sesion.ejercicios || []).find((ej) => this._coincide(ej, ejercicio));
        if (!registro || registro.tipo === "caminata" || registro.unidad === "segundos") return null;
        const parsed = parseReps(registro.reps);
        if (!parsed.valid) return null;
        const offset = Math.min(Number(registro.seriesCalentamiento) || 0, parsed.series.length);
        const reps = parsed.series.slice(offset);
        const pesos = obtenerPesosSeries(registro, parsed.series).slice(offset);
        return { fecha: sesion.fecha, dia: sesion.dia, registro, reps, pesos };
      })
      .filter(Boolean)
      .sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  },

  evaluar(ejercicio) {
    const cargaInversa = ejercicio.progresionCargaInversa === true;
    const historial = this.historial(ejercicio);
    const ultimo = historial[historial.length - 1];
    if (!ultimo) return {
      estado: "sin-datos", etiqueta: "SIN DATOS",
      motivo: "Aún no hay sesiones registradas para este ejercicio.", ultimo: null, historial,
    };

    const ultimosDos = historial.slice(-PROGRESION.SESIONES_PARA_SUBIR);
    const mismoPesoEnCadaSesion = (sesion) => sesion.pesos.length === sesion.reps.length &&
      sesion.pesos.length > 0 && sesion.pesos.every((peso) => peso === sesion.pesos[0]);
    const dosSesionesTope = ultimosDos.length === PROGRESION.SESIONES_PARA_SUBIR &&
      ultimosDos.every((sesion) => sesion.reps.length === PROGRESION.SERIES_OBJETIVO &&
        sesion.reps.every((reps) => reps >= PROGRESION.REPS_OBJETIVO) &&
        sesion.registro.tecnicaCorrecta === true && mismoPesoEnCadaSesion(sesion)) &&
      ultimosDos[0].pesos[0] === ultimosDos[1].pesos[0];
    if (dosSesionesTope) {
      if (cargaInversa && ultimo.pesos[0] === 0) return {
        estado: "mantener", etiqueta: "MANTENER",
        motivo: "Ya haces las dominadas sin asistencia. Mantén la técnica y progresa en repeticiones antes de añadir carga.", ultimo, historial,
      };
      return {
        estado: "subir", etiqueta: cargaInversa ? "MENOS AYUDA" : "SUBIR",
        motivo: cargaInversa
          ? "Has consolidado 3 series de 12 repeticiones con técnica correcta en dos sesiones. Puedes reducir un poco la asistencia."
          : "Has consolidado 3 series de 12 repeticiones con técnica correcta en dos sesiones. Puedes probar el siguiente escalón disponible.",
        ultimo, historial,
      };
    }

    const dosSesionesBajoMinimo = historial.length >= PROGRESION.SESIONES_PARA_BAJAR &&
      historial.slice(-PROGRESION.SESIONES_PARA_BAJAR).every((sesion) =>
        sesion.reps.length < PROGRESION.SERIES_OBJETIVO || sesion.reps.some((reps) => reps < PROGRESION.REPS_MINIMAS));
    if (dosSesionesBajoMinimo) return {
      estado: "bajar", etiqueta: cargaInversa ? "MÁS AYUDA" : "BAJAR",
      motivo: cargaInversa
        ? "En dos sesiones seguidas no se alcanzó el mínimo de 8 repeticiones en todas las series. Considera seleccionar más asistencia."
        : "En dos sesiones seguidas no se alcanzó el mínimo de 8 repeticiones en todas las series. Considera reducir la carga.",
      ultimo, historial,
    };

    return {
      estado: "mantener", etiqueta: "MANTENER",
      motivo: ultimo.reps.length < PROGRESION.SERIES_OBJETIVO
        ? cargaInversa
          ? "Aún no hay tres series completas para valorar el rango. Mantén la asistencia y completa la sesión."
          : "Aún no hay tres series completas para valorar el rango. Mantén la carga y completa la sesión."
        : ultimo.reps.every((reps) => reps >= PROGRESION.REPS_OBJETIVO)
          ? cargaInversa && ultimo.pesos[0] === 0
            ? "Ya haces las dominadas sin asistencia. Mantén la técnica y progresa en repeticiones antes de añadir carga."
            : cargaInversa
              ? "El máximo se alcanzó en la última sesión, pero falta otra sesión consolidada con técnica correcta antes de recomendar reducir la asistencia."
              : "El máximo se alcanzó en la última sesión, pero falta otra sesión consolidada con técnica correcta antes de recomendar subir."
          : ultimo.reps.some((reps) => reps < PROGRESION.REPS_MINIMAS)
            ? cargaInversa
              ? "Una sesión aislada por debajo del mínimo no basta para recomendar más asistencia. Mantén y vuelve a valorar en la próxima sesión."
              : "Una sesión aislada por debajo del mínimo no basta para recomendar bajar. Mantén y vuelve a valorar en la próxima sesión."
            : cargaInversa
              ? "Sigue trabajando dentro del rango de 8–12 repeticiones y conserva la asistencia."
              : "Sigue trabajando dentro del rango de 8–12 repeticiones y conserva la carga.",
      ultimo, historial,
    };
  },

  resumenHTML(ejercicio) {
    const resultado = this.evaluar(ejercicio);
    const ultimo = resultado.ultimo;
    const etiquetaCarga = ejercicio.progresionCargaInversa ? "Última asistencia" : "Último peso";
    const unidadCarga = ejercicio.progresionCargaInversa ? "kg de asistencia" : "kg";
    const detalle = ultimo
      ? `<div class="exercise-progress-last"><strong>${etiquetaCarga}: ${escapeHTML(ultimo.registro.peso ?? ultimo.pesos[ultimo.pesos.length - 1] ?? "--")} ${unidadCarga}</strong><span>${escapeHTML(UI.formatearFecha(ultimo.fecha))} · ${ultimo.reps.map((reps, i) => `Serie ${i + 1}: ${reps} reps · ${ultimo.pesos[i]} ${unidadCarga}`).join(" · ")}</span></div>`
      : "";
    return `<div class="exercise-progress-summary"><span class="exercise-progress-badge ${resultado.estado}">${resultado.etiqueta}</span><div>${detalle}<small><strong>Motivo:</strong> ${escapeHTML(resultado.motivo)}</small></div></div>`;
  },
};
