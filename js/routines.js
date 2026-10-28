// ==========================================
// RUTINAS · CONFIGURACIÓN POR DÍA
// Los ejercicios son únicos; la rutina decide
// cuándo se usan y cuántas series/repeticiones.
// ==========================================

const ROUTINES = {
  lunes: [
    ["press-pecho-maquina", 3, "8-12"],
    ["aperturas-peck-deck", 2, "10-15"],
    ["press-hombros-maquina", 2, "8-12"],
    ["elevacion-lateral-polea", 2, "12-15 por lado"],
    ["extension-triceps-polea", 2, "10-15"],
  ],

  martes: [
    ["jalon-polea-al-pecho", 3, "8-12"],
    ["remo-sentado-polea", 3, "8-12"],
    ["remo-pecho-apoyado-maquina", 2, "8-12"],
    ["curl-scott-supino-barra-z", 2, "10-15"],
    ["curl-v-polea-baja", 3, "10-15"],
  ],

  miercoles: [
    ["prensa-piernas-maquina", 3, "8-12"],
    ["curl-femoral-sentado", 3, "10-15"],
    ["extension-cuadriceps-maquina", 3, "10-15"],
    ["abductores-maquina", 3, "12-15"],
    ["aductores-maquina", 3, "12-15"],
  ],

  jueves: [
    ["curl-v-polea-baja", 3, "10-15"],
    ["curl-scott-supino-barra-z", 3, "10-15"],
    ["extension-triceps-polea", 3, "10-15"],
    ["extension-triceps-polea-sobre-cabeza", 3, "10-15"],
  ],

  viernes: [
    ["press-banca-barra", 3, "8-12"],
    ["aperturas", 3, "10-15"],
    ["press-hombros-maquina", 2, "8-12"],
    ["elevacion-lateral-polea", 2, "12-15 por lado"],
    ["aperturas-inversas-maquina", 2, "12-15"],
  ],
};

const PREPARACION_EJERCICIOS = {
  "press-banca-barra": "Coloca un banco plano centrado bajo la barra; ajusta los soportes para descolgarla sin elevar los hombros y usa los seguros del rack. Túmbate con los ojos bajo la barra y los pies firmes en el suelo.",
  "curl-scott-supino-barra-z": "Coloca el banco Scott para que el borde quede bajo las axilas; apoya la parte superior de los brazos y sujeta la barra Z con las palmas hacia arriba.",
  "curl-v-polea-baja": "Engancha el agarre en V a la polea baja; ponte de pie frente a la polea, toma ambas empuñaduras con agarre neutro y mantén los codos junto al torso.",
  "press-pecho-maquina": "Ajusta el asiento para que las asas queden frente al centro del pecho; apoya la espalda.",
  "aperturas-peck-deck": "Ajusta el asiento para que los brazos queden a la altura del pecho y apoya la espalda.",
  "press-hombros-maquina": "Ajusta el asiento para empezar con las asas a la altura de los hombros; apoya la espalda.",
  "elevacion-lateral-polea": "Polea abajo del todo, tirador individual; colócate de lado y trabaja un brazo cada vez.",
  "extension-triceps-polea": "Polea alta con barra recta; con tu altura (1,64 m), ponla donde alcances el agarre sin estirarte ni encoger los hombros.",
  "jalon-polea-al-pecho": "Polea alta con barra larga; ajusta asiento y apoyo de muslos para alcanzar la barra sin despegarte ni estirarte de más.",
  "remo-sentado-polea": "Polea abajo con agarre estrecho; apoya los pies en la plataforma y siéntate erguido.",
  "remo-pecho-apoyado-maquina": "Ajusta asiento y apoyo para que las asas queden al alcance con el pecho apoyado.",
  "curl-biceps-maquina": "Ajusta el asiento para que los codos coincidan con el eje de giro y apóyalos en el soporte.",
  "alternating-dumbbell-curl": "De pie, una mancuerna en cada mano y los brazos junto al cuerpo.",
  "prensa-piernas-maquina": "Ajusta respaldo y asiento; apoya toda la espalda y coloca los pies en la plataforma.",
  "extension-cuadriceps-maquina": "Alinea la rodilla con el eje de la máquina y coloca el rodillo sobre la parte baja de la espinilla.",
  "curl-femoral-sentado": "Alinea la rodilla con el eje de giro; coloca el rodillo por encima de los talones y apoya la espalda.",
  "abductores-maquina": "Ajusta los topes para empujar las piernas hacia fuera; mantén la espalda apoyada.",
  "aductores-maquina": "Ajusta los topes para juntar las piernas hacia dentro; mantén la espalda apoyada.",
  "gemelos-prensa-piernas": "En la prensa, apoya la parte delantera de los pies en el borde inferior de la plataforma.",
  "extension-triceps-polea-sobre-cabeza": "Polea alta con cuerda; ponte de espaldas a una distancia que te permita alcanzarla sin encoger los hombros y da un paso al frente para tensar el cable.",
  "press-inclinado-maquina": "Ajusta asiento y respaldo inclinado para que las asas empiecen a la altura del pecho superior.",
  "aperturas": "Banco plano y una mancuerna en cada mano; apoya la espalda y mantén los codos ligeramente flexionados.",
  "aperturas-inversas-maquina": "Siéntate mirando al respaldo; ajusta las asas a la altura de los hombros y apoya el pecho.",
};

function getPreparacionEjercicio(ejercicio) {
  return PREPARACION_EJERCICIOS[ejercicio.id] || ejercicio.consejos || "Ajusta el equipo a tu altura y comprueba que el recorrido sea cómodo.";
}

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
        // Plan actual: tres series efectivas por ejercicio.
        series: 3,
        reps: String(reps),
        preparacion: getPreparacionEjercicio(base),
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

  _nombreNormalizado(ejercicio) {
    return String(ejercicio?.nombre || "")
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
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
    const rutina = getRutinaDelDia(dia);
    const idsAsignados = new Set(rutina.map(([id]) => id));
    const nombresAsignados = new Set(
      rutina
        .map(([id]) => catalogo.find((ej) => ej.id === id))
        .filter(Boolean)
        .map((ej) => this._nombreNormalizado(ej)),
    );
    const nombresAlternativas = new Set();

    return catalogo
      .filter((ej) => {
        const nombre = this._nombreNormalizado(ej);
        if (
          ej.id === ejercicioId ||
          idsAsignados.has(ej.id) ||
          nombresAsignados.has(nombre) ||
          nombresAlternativas.has(nombre) ||
          this._grupoPrincipal(ej) !== grupoActual ||
          !categoriasCompatibles.includes(ej.categoria) ||
          !this._comparteMusculoPrincipal(ejercicioActual, ej)
        ) return false;
        nombresAlternativas.add(nombre);
        return true;
      })
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
    const nombresAsignados = new Set(
      rutina
        .map(([id]) => catalogo.find((ej) => ej.id === id))
        .filter(Boolean)
        .map((ej) => this._nombreNormalizado(ej)),
    );
    if (
      rutina.some(([id]) => id === reemplazoId) ||
      nombresAsignados.has(this._nombreNormalizado(reemplazo))
    ) {
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
