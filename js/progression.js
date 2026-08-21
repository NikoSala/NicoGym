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

    if (!analisis.detalle.length) {
      return {
        ...analisis,
        titulo: "",
        mensaje: "",
        recomendaciones: [],
      };
    }

    // ----------------------------------------------
    // SEMANA BASE
    // ----------------------------------------------
    if (this.esSemanaBase()) {
      return {
        ...analisis,

        titulo: "Semana de referencia",

        mensaje:
          "Esta semana sirve para establecer tus pesos iniciales. No se propone subir ni bajar carga. Mantén el mismo peso durante las 4 series de cada ejercicio y registra las repeticiones conseguidas.",

        recomendaciones: analisis.detalle.map((x) => ({
          nombre: x.ejercicio.nombre,

          pesoActual: Number(x.registro?.peso) || 0,

          siguientePeso: null,

          texto: x.registro?.peso
            ? `Peso base: ${x.registro.peso} kg. Mantén esta carga durante las 4 series y registra las repeticiones.`
            : "Elige un peso inicial que puedas mantener durante las 4 series.",
        })),
      };
    }

    // ----------------------------------------------
    // TODAVÍA NO SE HAN COMPLETADO 4x12
    // ----------------------------------------------
    if (!analisis.completo) {
      return {
        ...analisis,

        titulo: "Consolida el peso",

        mensaje: `La prioridad es completar ${this.SERIES_OBJETIVO}×${this.REPS_OBJETIVO} con el mismo peso antes de aumentar la carga.`,

        recomendaciones: analisis.incompletos.map((x) => ({
          nombre: x.ejercicio.nombre,

          pesoActual: Number(x.registro?.peso) || 0,

          siguientePeso: null,

          texto: x.registro?.peso
            ? `Mantén ${x.registro.peso} kg y trata de aumentar las repeticiones hasta conseguir 4×12.`
            : "Registra el peso utilizado y busca una carga que puedas mantener durante las 4 series.",
        })),
      };
    }

    // ----------------------------------------------
    // 4x12 COMPLETADO
    // ----------------------------------------------
    const recomendaciones = analisis.detalle.map((x) => {
      const peso = Number(x.registro?.peso) || 0;

      return {
        nombre: x.ejercicio.nombre,

        pesoActual: peso,

        siguientePeso: null,

        incremento: null,

        texto: `Has completado 4×12 con ${peso} kg. El siguiente objetivo será consolidar esta carga y, cuando corresponda, pasar a una carga físicamente disponible superior.`,
      };
    });

    return {
      ...analisis,

      titulo: "4×12 completado · preparado para progresar",

      mensaje: `Has conseguido ${this.SERIES_OBJETIVO}×${this.REPS_OBJETIVO}. La siguiente progresión se decidirá utilizando las cargas reales disponibles de tu material.`,

      recomendaciones,
    };
  },
};
