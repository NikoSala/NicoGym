// ==========================================
// PROGRESIÓN
// ==========================================
// Sistema:
// 1. La primera semana sirve como semana BASE.
// 2. No se recomienda subir ni bajar peso durante esa semana.
// 3. La progresión se basa primero en repeticiones.
// 4. El peso se mantiene durante las 4 series de un ejercicio.
// 5. Cuando se consolida 4x12, se podrá proponer una nueva carga.
// 6. Las cargas propuestas deberán existir físicamente según el material.
// 7. No se utiliza RIR.
// ==========================================

const PROGRESION = {
  SERIES_OBJETIVO: 4,
  REPS_OBJETIVO: 12,
  REPS_SIGUIENTE: 15,

  // --------------------------------------------------
  // SEMANA BASE
  // --------------------------------------------------
  // Durante la primera semana de uso del sistema no
  // hacemos recomendaciones de carga.
  semanaBase: null,

  establecerSemanaBase() {
    if (!this.semanaBase) {
      this.semanaBase = Storage._getSemanaKey(new Date());
    }

    return this.semanaBase;
  },

  esSemanaBase() {
    return Storage._getSemanaKey(new Date()) === this.semanaBase;
  },

  // --------------------------------------------------
  // 1RM ESTIMADO
  // --------------------------------------------------
  estimar1RM(peso, reps) {
    const p = Number(peso) || 0;
    const r = Number(reps) || 0;

    if (p <= 0 || r <= 0) return 0;

    return p * (1 + r / 30);
  },

  // --------------------------------------------------
  // ANALIZAR REGISTRO DE UN EJERCICIO
  // --------------------------------------------------
  analizarRegistroEjercicio(registro) {
    if (!registro || !registro.reps) {
      return {
        completo: false,
        series: [],
        total: 0,
        mejor1RM: 0,
      };
    }

    const parsed = parseReps(registro.reps);

    if (!parsed.valid) {
      return {
        completo: false,
        series: [],
        total: 0,
        mejor1RM: 0,
      };
    }

    const series = parsed.series;

    return {
      completo:
        series.length >= this.SERIES_OBJETIVO &&
        series
          .slice(0, this.SERIES_OBJETIVO)
          .every((r) => r >= this.REPS_OBJETIVO),

      series,
      total: parsed.total,

      mejor1RM: this.estimar1RM(registro.peso, Math.max(...series, 0)),
    };
  },

  // --------------------------------------------------
  // ANALIZAR EL DÍA COMPLETO
  // --------------------------------------------------
  analizarDia(dia, ejercicios, entrenamiento) {
    const fuerza = ejercicios.filter((e) => !e.esCaminata);
    const registros = entrenamiento?.ejercicios || [];

    const detalle = fuerza.map((ej) => {
      const reg = registros.find((r) => r.nombre === ej.nombre);

      const analisis = this.analizarRegistroEjercicio(reg);

      return {
        ejercicio: ej,
        registro: reg,
        ...analisis,
      };
    });

    const completo = detalle.length > 0 && detalle.every((x) => x.completo);

    const incompletos = detalle.filter((x) => !x.completo);

    return {
      dia,
      detalle,
      completo,
      incompletos,
    };
  },

  // --------------------------------------------------
  // RECOMENDACIÓN DEL DÍA
  // --------------------------------------------------
  recomendarDia(dia, ejercicios, entrenamiento) {
    const analisis = this.analizarDia(dia, ejercicios, entrenamiento);

    return {
      ...analisis,
      completo: false,
      titulo: "Entrenamiento registrado",
      mensaje:
        "Se guardan el peso, las series y las repeticiones en el historial. Las sugerencias automáticas de progresión están desactivadas.",
      recomendaciones: [],
    };
  },
};
