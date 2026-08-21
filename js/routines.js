// ==========================================
// RUTINAS · CONFIGURACIÓN POR DÍA
// Los ejercicios son únicos; la rutina decide
// cuándo se usan y cuántas series/repeticiones.
// ==========================================

const ROUTINES = {
  lunes: [
    ["press-plano", 4, 12],
    ["press-inclinado", 4, 12],
    ["aperturas", 4, 12],
    ["alternating-dumbbell-curl", 4, 12],
    ["hammer-curl", 4, 12],
  ],

  martes: [
    ["barbell-row", 4, 12],
    ["one-arm-dumbbell-row", 4, 12],
    ["remo-banco-inclinado", 4, 12],
    ["dumbbell-pullover", 4, 12],
    ["dumbbell-reverse-fly", 4, 12],
    ["dumbbell-shrug", 4, 12],
    ["reverse-dumbbell-curl", 4, 12],
    ["dumbbell-zottman-curl", 4, 12],
  ],

  miercoles: [
    ["press-militar", 4, 12],
    ["elevaciones-laterales", 4, 12],
    ["elevaciones-frontales", 4, 12],
    ["press-cerrado", 4, 12],
    ["extension-triceps-tumbado", 4, 12],
  ],

  jueves: [
    ["incline-dumbbell-curl", 4, 12],
    ["dumbbell-zottman-curl", 4, 12],
    ["dumbbell-preacher-curl", 4, 12],
    ["dumbbell-spider-curl", 4, 12],
    ["dumbbell-tate-press", 4, 12],
    ["extension-triceps-cabeza", 4, 12],
    ["jm-press", 4, 12],
    ["patada-triceps", 4, 12],
  ],

  viernes: [
    ["press-plano", 4, 12],
    ["one-arm-dumbbell-row", 4, 12],
    ["press-militar", 4, 12],
    ["elevaciones-laterales", 4, 12],
  ],
};

// ==========================================
// OBTENER RUTINA DEL DÍA
// ==========================================

function getRutinaDelDia(dia) {
  return ROUTINES[dia] || [];
}

// ==========================================
// OBTENER EJERCICIOS COMPLETOS DEL DÍA
// ==========================================

function getEjerciciosPorDia(dia) {
  const db = getExerciseDatabase();

  return getRutinaDelDia(dia)
    .map(([id, series, reps]) => {
      const base = db.find((e) => e.id === id);

      if (!base) return null;

      return {
        ...base,
        dia,
        series,
        reps: String(reps),
      };
    })
    .filter(Boolean);
}
