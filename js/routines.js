// ==========================================
// RUTINAS · CONFIGURACIÓN POR DÍA
// Los ejercicios son únicos; la rutina decide
// cuándo se usan y cuántas series/repeticiones.
// ==========================================

const ROUTINES = {
  lunes: [
    ["press-plano", 4, 12],
    ["aperturas", 3, 15],
    ["press-arnold-mancuernas", 3, 12],
    ["elevaciones-laterales", 3, 15],
    ["press-frances-inclinado-alterno", 3, 12],
    ["extension-triceps-cabeza", 3, 15],
  ],

  martes: [
    ["barbell-row", 4, 12],
    ["one-arm-dumbbell-row", 4, 12],
    ["remo-supinacion", 3, 12],
    ["dumbbell-pullover", 3, 15],
    ["alternating-dumbbell-curl", 3, 12],
    ["hammer-curl", 3, 12],
  ],

  miercoles: [
    ["sentadilla", 4, 12],
    ["sentadilla-bulgara", 3, 12],
    ["peso-muerto-rumano", 4, 12],
    ["zancada", 3, 12],
    ["hip-thrust", 3, 15],
    ["elevacion-gemelos", 4, 20],
  ],

  jueves: [
    ["curl-inclinado-neutro-alterno", 3, 12],
    ["curl-supinacion-barra", 3, 12],
    ["curl-concentrado-supinacion", 3, 15],
    ["press-frances-inclinado-alterno", 3, 12],
    ["extension-triceps-cabeza", 3, 15],
    ["press-cerrado-mancuernas", 3, 12],
  ],

  viernes: [
    ["press-alterno-banco", 4, 12],
    ["aperturas-declinadas", 3, 15],
    ["press-banca-giro", 3, 12],
    ["press-militar", 4, 12],
    ["dumbbell-reverse-fly", 3, 15],
    ["elevaciones-laterales", 3, 15],
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
