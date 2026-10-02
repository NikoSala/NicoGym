// ==========================================
// OBJETIVOS DE SERIES Y REPETICIONES
// ==========================================

const PROGRESION = {
  SERIES_OBJETIVO: 4,
  REPS_OBJETIVO: 12,

  estimar1RM(peso, reps) {
    const p = Number(peso) || 0;
    const r = Number(reps) || 0;

    if (p <= 0 || r <= 0) return 0;

    return p * (1 + r / 30);
  },
};
