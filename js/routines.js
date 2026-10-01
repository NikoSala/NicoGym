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
  _categoriasCompatibles(ejercicio) {
    const categoria = ejercicio.categoria;
    if (
      categoria === "Aislamiento" &&
      this._musculosPrincipales(ejercicio).has("deltoide posterior")
    ) return ["Aislamiento", "Remo"];

    const familias = {
      Press: ["Press", "Empuje"],
      Empuje: ["Empuje", "Press"],
      Apertura: ["Apertura"],
      Aislamiento: ["Aislamiento"],
      Curl: ["Curl"],
      Remo: ["Remo", "Tirón"],
      Tirón: ["Tirón", "Remo"],
      Sentadilla: ["Sentadilla", "Zancada", "Unilateral"],
      Zancada: ["Zancada", "Sentadilla", "Unilateral"],
      Unilateral: ["Unilateral", "Zancada", "Sentadilla"],
      "Peso muerto": ["Peso muerto", "Bisagra de cadera"],
      "Bisagra de cadera": ["Bisagra de cadera", "Peso muerto", "Glúteos"],
      Glúteos: ["Glúteos", "Bisagra de cadera"],
      Gemelo: ["Gemelo"],
      Core: ["Core", "Agarre y core"],
      "Agarre y core": ["Agarre y core", "Core"],
      Estabilidad: ["Estabilidad", "Unilateral"],
      Compuesto: ["Compuesto", "Press", "Empuje"],
    };
    return familias[categoria] || [categoria];
  },

  _grupoPrincipal(ejercicio) {
    const grupo = String(ejercicio.grupo || "").split("/")[0].trim();
    const normalizado = ExerciseLibrary._gruposMusculares({
      grupo,
      musculosPrincipales: [],
    })[0];
    return normalizado || grupo.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  },

  _musculosPrincipales(ejercicio) {
    const normalizar = (musculo) => {
      const nombre = String(musculo || "")
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (/deltoid.*(medio|lateral)/.test(nombre)) return "deltoide lateral";
      if (/deltoid.*posterior/.test(nombre)) return "deltoide posterior";
      if (/deltoid.*anterior/.test(nombre)) return "deltoide anterior";
      if (/deltoid/.test(nombre)) return "deltoide";
      if (/pectoral/.test(nombre)) return "pectoral";
      if (/triceps/.test(nombre)) return "triceps";
      if (/biceps/.test(nombre)) return "biceps";
      if (/braquiorradial|antebrazo/.test(nombre)) return "antebrazo";
      if (/braquial/.test(nombre)) return "braquial";
      if (/dorsal/.test(nombre)) return "dorsal";
      if (/romboid/.test(nombre)) return "romboides";
      if (/trapec/.test(nombre)) return "trapecio";
      if (/glute/.test(nombre)) return "gluteo";
      if (/cuadriceps/.test(nombre)) return "cuadriceps";
      if (/isquio|femoral/.test(nombre)) return "isquiotibiales";
      if (/gemelo|soleo/.test(nombre)) return "gemelos";
      if (/abdominal|oblicuo|core/.test(nombre)) return "core";
      return nombre;
    };
    return new Set((ejercicio.musculosPrincipales || []).map(normalizar));
  },

  _comparteMusculoPrincipal(ejercicioA, ejercicioB) {
    const musculosA = this._musculosPrincipales(ejercicioA);
    const musculosB = this._musculosPrincipales(ejercicioB);
    return !musculosA.size || !musculosB.size ||
      [...musculosA].some((musculo) => musculosB.has(musculo));
  },

  alternativas(ejercicioId, dia) {
    if (!DAY_KEYS_ROUTINE.includes(dia)) return [];
    const catalogo = getExerciseDatabase();
    const ejercicioActual = catalogo.find((ej) => ej.id === ejercicioId);
    if (!ejercicioActual) return [];
    const grupoActual = this._grupoPrincipal(ejercicioActual);
    const categoriasCompatibles = this._categoriasCompatibles(ejercicioActual);
    const idsAsignados = new Set(getRutinaDelDia(dia).map(([id]) => id));

    return catalogo
      .filter((ej) =>
        ej.id !== ejercicioId &&
        !idsAsignados.has(ej.id) &&
        this._grupoPrincipal(ej) === grupoActual &&
        categoriasCompatibles.includes(ej.categoria) &&
        this._comparteMusculoPrincipal(ejercicioActual, ej),
      )
      .sort((a, b) =>
        Number(a.categoria !== ejercicioActual.categoria) -
          Number(b.categoria !== ejercicioActual.categoria) ||
        a.nombre.localeCompare(b.nombre, "es"),
      );
  },

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

  reemplazar(ejercicioId, reemplazoId, dia) {
    if (!DAY_KEYS_ROUTINE.includes(dia)) return false;
    if (STATE.entrenamientoPendiente?.dia === dia) {
      UI.toast("Pausa o termina ese entrenamiento antes de editar su rutina", "error");
      return false;
    }

    const rutina = getRutinaDelDia(dia).map(([id, series, reps]) => [id, series, reps]);
    const indice = rutina.findIndex(([id]) => id === ejercicioId);
    const catalogo = getExerciseDatabase();
    const ejercicioActual = catalogo.find((ej) => ej.id === ejercicioId);
    const reemplazo = catalogo.find((ej) => ej.id === reemplazoId);
    if (indice < 0 || !ejercicioActual || !reemplazo) return false;
    if (
      this._grupoPrincipal(ejercicioActual) !== this._grupoPrincipal(reemplazo) ||
      !this._categoriasCompatibles(ejercicioActual).includes(reemplazo.categoria) ||
      !this._comparteMusculoPrincipal(ejercicioActual, reemplazo)
    ) {
      UI.toast("Elige una opción del mismo músculo y movimiento compatible", "error");
      return false;
    }
    if (rutina.some(([id]) => id === reemplazoId)) {
      UI.toast("Ese ejercicio ya está en la rutina de este día", "info");
      return false;
    }

    rutina[indice] = [reemplazoId, rutina[indice][1], rutina[indice][2]];
    STATE.rutinasPersonalizadas[dia] = rutina;
    Object.keys(STATE.checks).forEach((clave) => {
      if (clave.startsWith(`${dia}-`)) delete STATE.checks[clave];
    });
    Storage._save();
    ExerciseLibrary.render();
    return true;
  },
};
