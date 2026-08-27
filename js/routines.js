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
    ["press-arnold-mancuernas", 4, 12],
    ["elevacion-lateral-inclinada-aislada", 4, 12],
    ["remo-menton-mancuernas", 4, 12],
    ["extensiones-inclinadas-mancuernas", 4, 12],
    ["press-frances-inclinado-alterno", 4, 12],
  ],

  jueves: [
    ["curl-inclinado-neutro-alterno", 4, 12],
    ["curl-aislado-hacia-abajo", 4, 12],
    ["curl-aislado-pronacion", 4, 12],
    ["curl-horizontal-giro", 4, 12],
    ["curl-concentrado-supinacion", 4, 12],
    ["curl-inverso-muneca", 4, 12],
    ["curl-muneca-neutro", 4, 12],
    ["rotacion-muneca", 4, 12],
  ],

   viernes: [
    ["press-alterno-banco", 4, 12],
    ["aperturas-declinadas", 4, 12],
    ["remo-supinacion", 4, 12],
    ["remo-deltoide-posterior", 4, 12],
    ["press-banca-giro", 4, 12],
    ["press-inclinado-aislado", 4, 12],
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
