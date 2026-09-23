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
  const personalizadas = STATE.rutinasPersonalizadas;
  if (personalizadas && Object.prototype.hasOwnProperty.call(personalizadas, dia)) {
    return Array.isArray(personalizadas[dia]) ? personalizadas[dia] : [];
  }
  return ROUTINES[dia] || [];
}

function getResumenRutinaDelDia(dia) {
  const ejercicios = getEjerciciosPorDia(dia);
  const grupos = [...new Set(ejercicios.map((ej) => ej.grupo).filter(Boolean))];
  return ejercicios.length
    ? `${grupos.join(" + ")} · ${ejercicios.length} ejercicios`
    : "Sin ejercicios asignados";
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

const DAY_KEYS_ROUTINE = ["lunes", "martes", "miercoles", "jueves", "viernes"];

const RutinaEditor = {
  toggle(ejercicioId, dia) {
    if (!DAY_KEYS_ROUTINE.includes(dia)) return;
    if (STATE.entrenamientoPendiente?.dia === dia) {
      UI.toast("Pausa o termina ese entrenamiento antes de editar su rutina", "error");
      return;
    }
    const ejercicio = getExerciseDatabase().find((ej) => ej.id === ejercicioId);
    if (!ejercicio) return;

    const actual = Object.prototype.hasOwnProperty.call(STATE.rutinasPersonalizadas, dia)
      ? STATE.rutinasPersonalizadas[dia]
      : (ROUTINES[dia] || []);
    const existe = actual.some(([id]) => id === ejercicioId);
    STATE.rutinasPersonalizadas[dia] = existe
      ? actual.filter(([id]) => id !== ejercicioId)
      : [...actual, [ejercicioId, Number(ejercicio.series) || 3, String(ejercicio.reps || "12")]];

    Object.keys(STATE.checks).forEach((clave) => {
      if (clave.startsWith(`${dia}-`)) delete STATE.checks[clave];
    });
    Storage._save();
    ExerciseLibrary.render();
    UI.toast(existe ? "Ejercicio quitado de la rutina" : "Ejercicio añadido a la rutina", "success");
  },
};
