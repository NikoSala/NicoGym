// ==========================================
// EXERCISE DATABASE - Carga perezosa
// ==========================================

let exerciseDatabase = null;

function getExerciseDatabase() {
  if (exerciseDatabase) return exerciseDatabase;

  exerciseDatabase = [
    // ==========================================
    // LUNES
    // ==========================================

    {
      id: "press-plano",
      nombre: "Press de pecho con mancuernas",
      grupo: "Pecho",
      categoria: "Press",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/03/02891301-Dumbbell-Bench-Press_Chest_720.gif",
      descripcion:
        "Tumbado sobre un banco plano, baja las mancuernas de forma controlada hasta el pecho y empuja hacia arriba manteniendo siempre el control del movimiento.",
      consejos:
        "• Baja lentamente (2-3 segundos).\n• Mantén las muñecas rectas.\n• Exhala al empujar.",
      errores:
        "• No bajes demasiado rápido.\n• No bloquees los codos.\n• No pierdas el control.",
      musculosPrincipales: ["Pectoral mayor", "Tríceps", "Deltoides anterior"],
      musculosSecundarios: ["Serrato anterior"],
      series: 4,
      reps: "8-12",
      dia: null,
      dificultad: "media",
      material: ["Banco", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Pecho: 90,
        Tríceps: 75,
        Hombro: 65,
      },
    },

    {
      id: "press-inclinado",
      nombre: "Press inclinado con mancuernas",
      grupo: "Pecho",
      categoria: "Press",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/03/03241301-Dumbbell-Incline-Palm-in-Press_Chest_720.gif",
      descripcion:
        "Con el banco inclinado entre 30° y 45°, baja las mancuernas lentamente hasta el pecho y vuelve a empujarlas hacia arriba trabajando la parte superior del pectoral.",
      consejos:
        "• El banco debe estar entre 30° y 45°.\n• Mantén las muñecas rectas.\n• Exhala al empujar.",
      errores:
        "• No uses un ángulo demasiado vertical.\n• No bajes más allá del pecho.",
      musculosPrincipales: [
        "Pectoral superior",
        "Deltoides anterior",
        "Tríceps",
      ],
      musculosSecundarios: ["Serrato anterior", "Trapecio"],
      series: 4,
      reps: "8-12",
      dia: null,
      dificultad: "media",
      material: ["Banco inclinado", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Pecho: 85,
        Hombro: 70,
        Tríceps: 70,
      },
    },

    {
      id: "aperturas",
      nombre: "Aperturas con mancuernas",
      grupo: "Pecho",
      categoria: "Apertura",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/03/03081301-Dumbbell-Fly_Chest-FIX_720.gif",
      descripcion:
        "Tumbado en banco plano, abre los brazos manteniendo una ligera flexión de los codos hasta notar el estiramiento del pecho, y vuelve lentamente.",
      consejos:
        "• Mantén los codos ligeramente flexionados.\n• Siente el estiramiento.\n• Controla el movimiento.",
      errores: "• No bloquees los codos.\n• No uses demasiado peso.",
      musculosPrincipales: ["Pectoral mayor", "Deltoides anterior"],
      musculosSecundarios: ["Bíceps", "Serrato anterior"],
      series: 4,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Banco", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Pecho: 80,
        Hombro: 50,
      },
    },

    {
      id: "alternating-dumbbell-curl",
      nombre: "Curl alterno con mancuernas",
      grupo: "Bíceps",
      categoria: "Curl",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03181301-Dumbbell-Incline-Curl_Upper-Arms_720.gif",
      descripcion:
        "De pie, sujeta una mancuerna en cada mano con las palmas mirando hacia delante. Flexiona un codo para llevar una mancuerna hacia el hombro mientras mantienes el otro brazo quieto. Baja lentamente y repite con el brazo contrario. Mantén los codos cerca del cuerpo y evita balancear el torso para ayudarte.",
      consejos:
        "• Mantén los codos pegados al torso.\n• Controla el movimiento en todo momento.\n• Siente la contracción del bíceps al subir.\n• Baja lentamente y sin impulso.",
      errores:
        "• No balancees el cuerpo.\n• No uses demasiado peso.\n• No separes los codos del torso.",
      musculosPrincipales: ["Bíceps"],
      musculosSecundarios: ["Braquial"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Bíceps: 90,
      },
    },

    {
      id: "hammer-curl",
      nombre: "Curl martillo",
      grupo: "Bíceps",
      categoria: "Curl",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/02981301-Dumbbell-Cross-Body-Hammer-Curl_Forearms_720.gif",
      descripcion:
        "De pie, sujeta una mancuerna en cada mano con las palmas enfrentadas entre sí. Manteniendo los codos cerca del cuerpo, flexiona los brazos y lleva las mancuernas hacia los hombros sin cambiar el agarre. Baja lentamente y controla todo el recorrido. Evita balancear el cuerpo.",
      consejos:
        "• Mantén las palmas enfrentadas (agarre neutro).\n• Los codos deben permanecer cerca del torso.\n• Controla la subida y la bajada.\n• Siente el trabajo del braquial.",
      errores:
        "• No balancees el cuerpo.\n• No uses demasiado peso.\n• No separes los codos del torso.",
      musculosPrincipales: ["Bíceps", "Braquial"],
      musculosSecundarios: ["Braquiorradial"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Bíceps: 80,
        Antebrazo: 70,
      },
    },

    // ==========================================
    // MIÉRCOLES
    // ==========================================

    {
      id: "press-militar",
      nombre: "Press de hombros con mancuernas",
      grupo: "Hombro",
      categoria: "Press",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/11651301-Barbell-Standing-Military-Press-without-rack_Shoulders_720.gif",
      descripcion:
        "Sentado en el banco con la espalda apoyada, empuja las mancuernas por encima de la cabeza y baja lentamente hasta la altura de los hombros.",
      consejos:
        "• Mantén la espalda apoyada.\n• No arquees la zona lumbar.\n• Controla la bajada.",
      errores: "• No bloquees los codos.\n• No inclines el cuerpo.",
      musculosPrincipales: ["Deltoides", "Tríceps", "Trapecio"],
      musculosSecundarios: ["Serrato anterior"],
      series: 4,
      reps: "8-12",
      dia: null,
      dificultad: "media",
      material: ["Banco", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Hombro: 90,
        Tríceps: 70,
        Trapecio: 60,
      },
    },

    {
      id: "elevaciones-laterales",
      nombre: "Elevaciones laterales con mancuernas",
      grupo: "Hombro",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03341301-Dumbbell-Lateral-Raise_shoulder-AFIX_720.gif",
      descripcion:
        "De pie o sentado, eleva las mancuernas lateralmente hasta la altura de los hombros manteniendo una ligera flexión en los codos.",
      consejos:
        "• Mantén los codos ligeramente flexionados.\n• No uses demasiado peso.\n• Controla el movimiento.",
      errores: "• No balancees el cuerpo.\n• No uses impulso.",
      musculosPrincipales: ["Deltoides medio", "Supraespinoso"],
      musculosSecundarios: ["Trapecio"],
      series: 4,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Hombro: 85,
      },
    },

    {
      id: "elevaciones-frontales",
      nombre: "Elevaciones frontales con mancuernas",
      grupo: "Hombro",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03101301-Dumbbell-Front-Raise_Shoulders_720.gif",
      descripcion:
        "De pie, eleva las mancuernas hacia delante hasta la altura de los hombros sin balancear el cuerpo.",
      consejos:
        "• Mantén los brazos extendidos.\n• Controla la subida y la bajada.",
      errores: "• No balancees el cuerpo.\n• No uses demasiado peso.",
      musculosPrincipales: ["Deltoides anterior"],
      musculosSecundarios: ["Pectoral"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Hombro: 75,
      },
    },

    {
      id: "extension-triceps-cabeza",
      nombre: "Extensión de tríceps sobre la cabeza",
      grupo: "Tríceps",
      categoria: "Aislamiento",
      urlGif:
        "https://media.tenor.com/V3J-mg9gH0kAAAAM/seated-dumbbell-triceps-extension.gif",
      descripcion:
        "Sentado, sujeta una mancuerna con ambas manos por encima de la cabeza y extiende completamente los brazos manteniendo los codos cerca de la cabeza.",
      consejos:
        "• Mantén los codos cerca de la cabeza.\n• Controla el movimiento.",
      errores: "• No separes los codos.\n• No bajes demasiado rápido.",
      musculosPrincipales: ["Tríceps (cabeza larga)"],
      musculosSecundarios: [
        "Tríceps (cabeza lateral)",
        "Tríceps (cabeza medial)",
      ],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuerna"],
      tipoCarga: "una_mancuerna",
      intensidadMuscular: {
        Tríceps: 90,
      },
    },

    {
      id: "extension-triceps-tumbado",
      nombre: "Extensión de tríceps tumbado con mancuernas",
      grupo: "Tríceps",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03061301-Dumbbell-Decline-Triceps-Extension_Upper-Arms_720.gif",
      descripcion:
        "Tumbado en un banco, sujeta una mancuerna en cada mano con los brazos extendidos sobre el pecho. Flexiona los codos para bajar las mancuernas a los lados de la cabeza y vuelve a extenderlos sin mover los hombros.",
      consejos:
        "• Mantén los codos apuntando hacia arriba.\n• Mantén los hombros estables.\n• Baja las mancuernas de forma controlada.",
      errores:
        "• No abras los codos en exceso.\n• No muevas los hombros hacia delante.\n• No uses impulso al extender.",
      musculosPrincipales: ["Tríceps (cabeza larga)"],
      musculosSecundarios: [
        "Tríceps (cabeza lateral)",
        "Tríceps (cabeza medial)",
      ],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "media",
      material: ["Banco", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Tríceps: 90,
      },
    },

    {
      id: "press-cerrado",
      nombre: "Press cerrado con mancuernas",
      grupo: "Tríceps",
      categoria: "Press",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/03/36811301-Dumbbell-Squeeze-Bench-Press_Chest_720.gif",
      descripcion:
        "Tumbado en banco plano, mantén las mancuernas juntas durante todo el recorrido, con las palmas enfrentadas.",
      consejos: "• Mantén las mancuernas juntas.\n• Controla el movimiento.",
      errores: "• No separes las mancuernas.\n• No bloquees los codos.",
      musculosPrincipales: ["Tríceps"],
      musculosSecundarios: ["Pectoral"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "media",
      material: ["Banco", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Tríceps: 85,
        Pecho: 50,
      },
    },

    // ==========================================
    // MARTES
    // ==========================================

    {
      id: "barbell-row",
      nombre: "Remo con barra",
      grupo: "Espalda",
      categoria: "Remo",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/00271301-Barbell-Bent-Over-Row_Back-FIX_720.gif",
      descripcion:
        "De pie, con una barra sujeta con las manos y las rodillas ligeramente flexionadas, inclina el torso hacia delante manteniendo la espalda recta. Lleva la barra hacia la parte baja del abdomen, acercando los codos al cuerpo. Aprieta la espalda al llegar arriba y baja la barra de forma controlada. Evita redondear la espalda o utilizar impulso.",
      consejos:
        "• Mantén la espalda recta en todo momento.\n• Lleva los codos hacia atrás y cerca del cuerpo.\n• Aprieta los omóplatos al final del movimiento.\n• Baja la barra de forma controlada.",
      errores:
        "• No redondees la espalda.\n• No uses impulso para levantar el peso.\n• No tires con los brazos sin activar la espalda.",
      musculosPrincipales: ["Dorsal ancho", "Espalda media", "Romboides"],
      musculosSecundarios: ["Bíceps", "Trapecio medio"],
      series: 4,
      reps: "8-12",
      dia: null,
      dificultad: "media",
      material: ["Barra", "Discos"],
      tipoCarga: "barra_larga",
      intensidadMuscular: {
        Espalda: 90,
        Bíceps: 60,
      },
    },

    {
      id: "one-arm-dumbbell-row",
      nombre: "Remo con mancuerna a una mano",
      grupo: "Espalda",
      categoria: "Remo",
      urlGif:
        "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif",
      descripcion:
        "Apoya una mano y una rodilla sobre un banco y coloca el otro pie firmemente en el suelo. Sujeta una mancuerna con la mano libre y deja el brazo extendido hacia abajo. Tira de la mancuerna hacia la cadera llevando el codo hacia atrás, manteniendo el torso estable. Baja lentamente hasta extender de nuevo el brazo. Evita girar el cuerpo para levantar más peso.",
      consejos:
        "• Mantén el torso estable y la espalda recta.\n• Lleva el codo hacia atrás y cerca del cuerpo.\n• Siente la contracción de la espalda al subir.\n• Baja la mancuerna de forma controlada.",
      errores:
        "• No gires el cuerpo para levantar más peso.\n• No redondees la espalda.\n• No uses impulso.",
      musculosPrincipales: ["Dorsal ancho", "Espalda media"],
      musculosSecundarios: ["Bíceps", "Romboides"],
      series: 4,
      reps: "8-12",
      dia: null,
      dificultad: "media",
      material: ["Banco", "Mancuerna"],
      tipoCarga: "una_mancuerna",
      intensidadMuscular: {
        Espalda: 85,
        Bíceps: 55,
      },
    },

    {
      id: "remo-banco-inclinado",
      nombre: "Remo en banco inclinado con mancuernas",
      grupo: "Espalda",
      categoria: "Remo",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03271301-Dumbbell-Incline-Row_Back_720.gif",
      descripcion:
        "Tumbado boca abajo en banco inclinado, tira las mancuernas hacia arriba manteniendo la espalda recta.",
      consejos:
        "• Mantén la espalda recta.\n• Controla el movimiento.\n• Siente la contracción de la espalda.",
      errores: "• No uses demasiado peso.\n• No pierdas el control.",
      musculosPrincipales: ["Dorsal ancho", "Romboides", "Trapecio medio"],
      musculosSecundarios: ["Deltoides posterior"],
      series: 4,
      reps: "8-12",
      dia: null,
      dificultad: "media",
      material: ["Banco inclinado", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Espalda: 80,
        Bíceps: 50,
      },
    },

    {
      id: "dumbbell-pullover",
      nombre: "Pullover con mancuerna",
      grupo: "Pecho / Espalda",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/04331301-Dumbbell-Straight-Arm-Pullover_Chest-FIX_720.gif",
      descripcion:
        "Tumbado perpendicular en un banco con la cabeza al borde, sujeta una mancuerna con ambas manos sobre el pecho. Mantén los brazos ligeramente flexionados y lleva la mancuerna de forma controlada por detrás de la cabeza hasta sentir el estiramiento en el pecho y la espalda, y vuelve a la posición inicial sin extender completamente los brazos.",
      consejos:
        "• Mantén los brazos ligeramente flexionados durante todo el movimiento.\n• Controla la bajada de la mancuerna.\n• Siente el estiramiento en el pecho y el dorsal.\n• No uses demasiado peso.",
      errores:
        "• No bloquees los codos.\n• No bajes la mancuerna demasiado rápido.\n• No arquees la espalda.",
      musculosPrincipales: ["Pectoral mayor", "Dorsal ancho"],
      musculosSecundarios: ["Tríceps", "Serrato anterior"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Banco", "Mancuerna"],
      tipoCarga: "una_mancuerna",
      intensidadMuscular: {
        Pecho: 70,
        Espalda: 65,
        Tríceps: 40,
      },
    },

    {
      id: "dumbbell-reverse-fly",
      nombre: "Pájaros con mancuernas",
      grupo: "Espalda",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03801301-Dumbbell-Rear-Lateral-Raise_Shoulders_720.gif",
      descripcion:
        "Inclínate hacia delante manteniendo la espalda recta y sujeta una mancuerna en cada mano con los brazos ligeramente flexionados. Abre los brazos hacia los lados hasta aproximadamente la altura de los hombros, juntando los omóplatos de forma natural. Baja las mancuernas lentamente y repite. Mantén el movimiento controlado y evita balancear el cuerpo.",
      consejos:
        "• Mantén la espalda recta y el torso estable.\n• Los codos deben estar ligeramente flexionados.\n• Juega con la contracción de los omóplatos.\n• Baja lentamente y controla el movimiento.",
      errores:
        "• No balancees el cuerpo.\n• No uses demasiado peso.\n• No bloquees los codos.",
      musculosPrincipales: ["Deltoides posterior", "Parte alta de la espalda"],
      musculosSecundarios: ["Romboides", "Trapecio medio"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Espalda: 80,
        Hombro: 60,
      },
    },

    {
      id: "dumbbell-shrug",
      nombre: "Encogimientos con mancuernas",
      grupo: "Trapecio",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/04061301-Dumbbell-Shrug_Back-FIX_720.gif",
      descripcion:
        "De pie, con una mancuerna en cada mano y los brazos extendidos a los lados, mantén el cuerpo erguido y eleva los hombros directamente hacia las orejas. Haz una breve pausa en la posición superior y baja lentamente los hombros. No dobles los codos ni hagas círculos con los hombros. El movimiento debe ser vertical y controlado.",
      consejos:
        "• Eleva los hombros verticalmente hacia las orejas.\n• Haz una breve pausa en la posición superior.\n• Baja lentamente y controla el movimiento.\n• No dobles los codos.",
      errores:
        "• No hagas círculos con los hombros.\n• No uses impulso.\n• No dobles los codos.",
      musculosPrincipales: ["Trapecio superior"],
      musculosSecundarios: ["Elevador de la escápula"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Trapecio: 90,
      },
    },

    {
      id: "reverse-dumbbell-curl",
      nombre: "Curl inverso con mancuernas",
      grupo: "Antebrazo",
      categoria: "Curl",
      urlGif:
        "https://fitnessprogramer.com/wp-content/uploads/2021/04/dumbbell-reverse-curl.gif",
      descripcion:
        "De pie, sujeta una mancuerna en cada mano con las palmas mirando hacia abajo. Mantén los codos cerca del cuerpo y flexiona los brazos para llevar las mancuernas hacia los hombros. Baja lentamente hasta extender los brazos de nuevo. Evita balancear el cuerpo y mantén las muñecas estables.",
      consejos:
        "• Mantén las palmas hacia abajo (agarre prono).\n• Los codos deben permanecer cerca del torso.\n• Controla el movimiento y evita el balanceo.\n• Siente el trabajo del antebrazo.",
      errores:
        "• No balancees el cuerpo.\n• No uses demasiado peso.\n• No flexiones las muñecas.",
      musculosPrincipales: ["Braquial", "Braquiorradial", "Antebrazo"],
      musculosSecundarios: ["Bíceps"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Bíceps: 70,
        Antebrazo: 85,
      },
    },

    // ==========================================
    // JUEVES
    // ==========================================

    {
      id: "incline-dumbbell-curl",
      nombre: "Curl inclinado con mancuernas",
      grupo: "Bíceps",
      categoria: "Curl",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03221301-Dumbbell-Incline-Inner-Biceps-Curl_Upper-Arms_720.gif",
      descripcion:
        "Sentado en un banco inclinado (45°), sujeta una mancuerna en cada mano con los brazos extendidos hacia abajo. Curva las mancuernas hacia los hombros manteniendo los codos fijos y siente la contracción del bíceps. Baja controladamente hasta extender los brazos.",
      consejos:
        "• Mantén los codos fijos durante todo el movimiento.\n• Controla la bajada para mantener la tensión.\n• Siente la contracción del bíceps al subir.",
      errores:
        "• No muevas los codos.\n• No uses impulso.\n• No bajes demasiado rápido.",
      musculosPrincipales: ["Bíceps braquial"],
      musculosSecundarios: ["Braquial"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Banco inclinado", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Bíceps: 90,
      },
    },

    {
      id: "dumbbell-zottman-curl",
      nombre: "Curl Zottman con mancuernas",
      grupo: "Bíceps / Antebrazo",
      categoria: "Curl",
      urlGif:
        "https://i.pinimg.com/originals/4b/e4/68/4be46841032506b311d43b8d49c6a58a.gif",
      descripcion:
        "De pie, sujeta una mancuerna en cada mano con las palmas mirando hacia delante. Curva las mancuernas hacia los hombros y, en la posición superior, gira las muñecas para que las palmas miren hacia abajo. Baja lentamente las mancuernas con el agarre prono, sintiendo el trabajo del antebrazo.",
      consejos:
        "• Gira las muñecas en la posición superior.\n• Controla la bajada con el agarre prono.\n• Mantén los codos estables.",
      errores:
        "• No uses demasiado peso.\n• No balancees el cuerpo.\n• No hagas el giro demasiado rápido.",
      musculosPrincipales: ["Bíceps braquial", "Braquiorradial"],
      musculosSecundarios: ["Braquial"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "media",
      material: ["Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Bíceps: 85,
        Antebrazo: 75,
      },
    },

    {
      id: "dumbbell-preacher-curl",
      nombre: "Curl predicador con mancuerna",
      grupo: "Bíceps",
      categoria: "Curl",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03721301-Dumbbell-Preacher-Curl_Upper-Arms_720.gif",
      descripcion:
        "Coloca un brazo apoyado sobre el respaldo de un banco inclinado (o sobre el propio banco) de forma que el brazo quede extendido y el hombro estable. Sujeta una mancuerna con la mano y curva el brazo hacia el hombro manteniendo el codo fijo. Baja lentamente hasta extender el brazo. Este ejercicio aísla el bíceps y evita el impulso del cuerpo.",
      consejos:
        "• Mantén el codo firmemente apoyado.\n• Controla el movimiento sin impulso.\n• Siente la contracción máxima del bíceps.",
      errores:
        "• No muevas el codo.\n• No uses demasiado peso.\n• No balancees el cuerpo.",
      musculosPrincipales: ["Bíceps braquial"],
      musculosSecundarios: ["Braquial"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Banco", "Mancuerna"],
      tipoCarga: "una_mancuerna",
      intensidadMuscular: {
        Bíceps: 90,
      },
    },

    {
      id: "dumbbell-spider-curl",
      nombre: "Curl araña con mancuernas",
      grupo: "Bíceps",
      categoria: "Curl",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/00721301-Barbell-Prone-Incline-Curl_Upper-Arms_720.gif",
      descripcion:
        "Tumbado boca abajo sobre un banco inclinado, deja los brazos colgando hacia el suelo con las mancuernas. Curva las mancuernas hacia los hombros manteniendo los codos fijos y siente la contracción del bíceps al final del recorrido.",
      consejos:
        "• Mantén los codos fijos.\n• Controla la subida y la bajada.\n• Aprieta el bíceps en la posición superior.",
      errores:
        "• No muevas los codos.\n• No uses demasiado peso.\n• No bajes demasiado rápido.",
      musculosPrincipales: ["Bíceps braquial"],
      musculosSecundarios: ["Braquial"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Banco inclinado", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Bíceps: 90,
      },
    },

    {
      id: "dumbbell-tate-press",
      nombre: "Press Tate con mancuernas",
      grupo: "Tríceps",
      categoria: "Press",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/04361301-Dumbbell-Tate-Press_Triceps_720.gif",
      descripcion:
        "Tumbado en un banco plano, sujeta una mancuerna en cada mano con las palmas mirando hacia el techo y los codos apuntando hacia afuera. Baja las mancuernas hacia el pecho manteniendo los codos fijos y extiende los brazos para completar el movimiento, sintiendo el tríceps.",
      consejos:
        "• Mantén los codos apuntando hacia afuera.\n• Controla la bajada.\n• Siente la contracción del tríceps.",
      errores:
        "• No muevas los codos.\n• No uses demasiado peso.\n• No bajes demasiado rápido.",
      musculosPrincipales: ["Tríceps (cabeza lateral)"],
      musculosSecundarios: ["Tríceps (cabeza medial)"],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "media",
      material: ["Banco", "Mancuernas"],
      tipoCarga: "dos_mancuernas",
      intensidadMuscular: {
        Tríceps: 85,
      },
    },

    {
      id: "extension-triceps-cabeza",
      nombre: "Extensión de tríceps sobre la cabeza",
      grupo: "Tríceps",
      categoria: "Aislamiento",
      urlGif:
        "https://media.tenor.com/V3J-mg9gH0kAAAAM/seated-dumbbell-triceps-extension.gif",
      descripcion:
        "Sentado, sujeta una mancuerna con ambas manos por encima de la cabeza y extiende completamente los brazos manteniendo los codos cerca de la cabeza.",
      consejos:
        "• Mantén los codos cerca de la cabeza.\n• Controla el movimiento.",
      errores: "• No separes los codos.\n• No bajes demasiado rápido.",
      musculosPrincipales: ["Tríceps (cabeza larga)"],
      musculosSecundarios: [
        "Tríceps (cabeza lateral)",
        "Tríceps (cabeza medial)",
      ],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuerna"],
      tipoCarga: "una_mancuerna",
      intensidadMuscular: {
        Tríceps: 90,
      },
    },

    {
      id: "jm-press",
      nombre: "JM Press con barra",
      grupo: "Tríceps",
      categoria: "Press",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/03/04501301-EZ-Barbell-JM-Bench-Press_Upper-Arms_720.gif",
      descripcion:
        "Tumbado en un banco, baja la barra hacia la parte alta del pecho flexionando los codos y manteniéndolos cerca del cuerpo. Extiende los codos para volver a la posición inicial, combinando el recorrido de un press cerrado y una extensión de tríceps.",
      consejos:
        "• Mantén los codos cerca del cuerpo.\n• Controla el descenso de la barra.\n• Usa un agarre algo más cerrado que el del press de banca.",
      errores:
        "• No abras los codos hacia los lados.\n• No rebotes la barra sobre el pecho.\n• No cargues más peso del que puedas controlar.",
      musculosPrincipales: [
        "Tríceps (cabeza lateral)",
        "Tríceps (cabeza medial)",
      ],
      musculosSecundarios: ["Pectoral mayor", "Deltoides anterior"],
      series: 3,
      reps: "8-12",
      dia: null,
      dificultad: "dificil",
      material: ["Banco", "Barra", "Discos"],
      tipoCarga: "barra_larga",
      intensidadMuscular: {
        Tríceps: 90,
        Pecho: 45,
        Hombro: 35,
      },
    },

    {
      id: "patada-triceps",
      nombre: "Patada de tríceps con mancuerna",
      grupo: "Tríceps",
      categoria: "Aislamiento",
      urlGif:
        "https://fitcron.com/wp-content/uploads/2021/04/03331301-Dumbbell-Kickback_Upper-Arms_720.gif",
      descripcion:
        "Inclina el torso con la espalda recta, apoya una mano en el banco si lo necesitas y lleva el codo a la altura del cuerpo. Extiende el antebrazo hacia atrás hasta contraer el tríceps y vuelve lentamente sin mover el codo.",
      consejos:
        "• Mantén el codo fijo y elevado.\n• Extiende el brazo completamente sin bloquearlo.\n• Controla el regreso de la mancuerna.",
      errores:
        "• No balancees el torso.\n• No dejes caer el codo.\n• No uses impulso para extender el brazo.",
      musculosPrincipales: ["Tríceps (cabeza lateral)"],
      musculosSecundarios: [
        "Tríceps (cabeza larga)",
        "Tríceps (cabeza medial)",
      ],
      series: 3,
      reps: "10-15",
      dia: null,
      dificultad: "facil",
      material: ["Mancuerna"],
      tipoCarga: "una_mancuerna",
      intensidadMuscular: {
        Tríceps: 85,
      },
    },

  ];

  return exerciseDatabase;
}
