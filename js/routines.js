// ==========================================
// RUTINAS · CONFIGURACIÓN POR DÍA
// Los ejercicios son únicos; la rutina decide cuándo y cómo se usan.
// ==========================================
const ROUTINES = {
    lunes: [
        ['press-plano', 4, 12, 90],
        ['press-inclinado', 4, 12, 90],
        ['aperturas', 4, 12, 60],
        ['press-militar', 4, 12, 90],
        ['elevaciones-laterales', 4, 12, 60]
    ],
    martes: [
        ['barbell-row', 4, 12, 90],
        ['one-arm-dumbbell-row', 4, 12, 90],
        ['dumbbell-reverse-fly', 4, 12, 60],
        ['dumbbell-shrug', 4, 12, 60],
        ['alternating-dumbbell-curl', 4, 12, 60],
        ['hammer-curl', 4, 12, 60],
        ['reverse-dumbbell-curl', 4, 12, 60],
        ['remo-banco-inclinado', 4, 12, 90]
    ],
    miercoles: [
        ['elevaciones-frontales', 4, 12, 60],
        ['extension-triceps-cabeza', 4, 12, 60],
        ['press-cerrado', 4, 12, 60],
        ['dumbbell-pullover', 4, 12, 60],
        ['dumbbell-squeeze-press', 4, 12, 60]
    ],
    jueves: [
        ['incline-dumbbell-curl', 4, 12, 60],
        ['dumbbell-zottman-curl', 4, 12, 60],
        ['dumbbell-preacher-curl', 4, 12, 60],
        ['dumbbell-spider-curl', 4, 12, 60],
        ['dumbbell-tate-press', 4, 12, 60],
        ['aperturas', 4, 12, 60],
        ['hammer-curl', 4, 12, 60],
        ['extension-triceps-cabeza', 4, 12, 60]
    ],
    viernes: [
        ['press-plano', 4, 12, 90],
        ['one-arm-dumbbell-row', 4, 12, 90],
        ['press-militar', 4, 12, 90],
        ['elevaciones-laterales', 4, 12, 60]
    ]
};

function getRutinaDelDia(dia) {
    return ROUTINES[dia] || [];
}

function getEjerciciosPorDia(dia) {
    const db = getExerciseDatabase();
    return getRutinaDelDia(dia)
        .map(([id, series, reps, descanso]) => {
            const base = db.find(e => e.id === id);
            if (!base) return null;
            return { ...base, dia, series, reps: String(reps), descanso };
        })
        .filter(Boolean);
}
