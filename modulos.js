// ==========================================
// EJERCICIOS (Biblioteca)
// ==========================================
const EJERCICIOS = [
  {
    id: "curl_biceps_alterno",
    nombre: "Curl de bíceps alterno",
    musculo: "biceps",
    categoria: "biceps",
    material: "Mancuernas",
    nivel: "Principiante",
    imagen:
      "https://i.pinimg.com/originals/7d/3c/de/7d3cdeed84c1c19ad372d5b25beffd08.gif",
    instrucciones:
      "1. De pie, con una mancuerna en cada mano.\n2. Curva un brazo llevando la mancuerna al hombro.\n3. Baja controladamente.\n4. Alterna con el otro brazo.",
    errores: "• No balancear el cuerpo.\n• Mantener codos pegados al torso.",
  },
  {
    id: "curl_martillo",
    nombre: "Curl martillo",
    musculo: "biceps",
    categoria: "biceps",
    material: "Mancuernas",
    nivel: "Principiante",
    imagen:
      "https://api.smartworkout.app/asset/image/8588e41c-5c2d-4ee0-90ca-ad69b7d0438a",
    instrucciones:
      "1. De pie, con mancuernas agarre neutro.\n2. Curva hacia el hombro manteniendo muñeca recta.\n3. Baja controladamente.",
    errores: "• No girar la muñeca.\n• Mantener codos fijos.",
  },
  {
    id: "curl_concentrado",
    nombre: "Curl concentrado",
    musculo: "biceps",
    categoria: "biceps",
    material: "Mancuerna",
    nivel: "Intermedio",
    imagen:
      "https://media.tenor.com/jaX3EUxaQGkAAAAM/rosca-concentrada-no-banco.gif",
    instrucciones:
      "1. Sentado, codo apoyado en muslo.\n2. Curva la mancuerna hacia el pecho.\n3. Baja lentamente.",
    errores: "• No usar impulso.\n• Mantener el codo fijo.",
  },
  {
    id: "curl_arana",
    nombre: "Curl araña",
    musculo: "biceps",
    categoria: "biceps",
    material: "Mancuernas",
    nivel: "Avanzado",
    imagen:
      "https://api.smartworkout.app/asset/image/7a6c7c0b-0480-4c45-ba66-18959ec9001f",
    instrucciones:
      "1. Tumbado boca abajo en banco inclinado.\n2. Curva mancuernas hacia hombros.\n3. Pausa 2 segundos arriba.\n4. Baja controladamente.",
    errores: "• No levantar los hombros.\n• Mantener el pecho apoyado.",
  },
  {
    id: "remo_con_barra",
    nombre: "Remo con barra",
    musculo: "espalda",
    categoria: "espalda",
    material: "Barra",
    nivel: "Intermedio",
    imagen:
      "https://mundoentrenamiento.com/wp-content/uploads/2019/10/Remo-con-barra-agarre-cerrado.gif",
    instrucciones:
      "1. De pie, inclina el torso 45°.\n2. Agarra la barra con palmas hacia abajo.\n3. Tira hacia la parte baja del abdomen.\n4. Aprieta la espalda arriba.\n5. Baja lentamente.",
    errores: "• No arquear la espalda.\n• Mantener el abdomen firme.",
  },
  {
    id: "remo_una_mano",
    nombre: "Remo a una mano",
    musculo: "espalda",
    categoria: "espalda",
    material: "Mancuerna",
    nivel: "Principiante",
    imagen:
      "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif",
    instrucciones:
      "1. Apoya rodilla y mano en banco.\n2. Columna recta y paralela al suelo.\n3. Tracciona el codo hacia atrás.\n4. Baja controladamente.",
    errores: "• No girar el torso.\n• Mantener la espalda recta.",
  },
  {
    id: "press_banca",
    nombre: "Press banca",
    musculo: "pecho",
    categoria: "pecho",
    material: "Barra",
    nivel: "Intermedio",
    imagen: "https://gymvisual.com/img/p/1/8/6/4/5/18645.gif",
    instrucciones:
      "1. Tumbado en banco plano.\n2. Agarra la barra con agarre medio.\n3. Baja hasta tocar el pecho.\n4. Empuja hacia arriba.",
    errores: "• No arquear la espalda.\n• Mantener los hombros fijos.",
  },
  {
    id: "press_hombros",
    nombre: "Press de hombros",
    musculo: "hombro",
    categoria: "hombro",
    material: "Mancuernas",
    nivel: "Intermedio",
    imagen:
      "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
    instrucciones:
      "1. Sentado, mancuernas a altura de orejas.\n2. Empuja hacia arriba.\n3. No bloquees los codos.\n4. Baja controladamente.",
    errores: "• No arquear la espalda.\n• Mantener el abdomen firme.",
  },
  {
    id: "fondos_triceps",
    nombre: "Fondos para tríceps",
    musculo: "triceps",
    categoria: "triceps",
    material: "Paralelas",
    nivel: "Avanzado",
    imagen:
      "https://i.pinimg.com/originals/2c/62/ba/2c62ba80d37c94d06ad6d60f1e5445df.gif",
    instrucciones:
      "1. Sujeta las paralelas con brazos estirados.\n2. Baja flexionando los codos.\n3. Sube estirando los brazos.",
    errores: "• No bajar demasiado.\n• Mantener los hombros estables.",
  },
  {
    id: "sentadilla_goblet",
    nombre: "Sentadilla Goblet",
    musculo: "pierna",
    categoria: "pierna",
    material: "Mancuerna",
    nivel: "Principiante",
    imagen:
      "https://fitnessprogramer.com/wp-content/uploads/2023/01/Dumbbell-Goblet-Squat.gif",
    instrucciones:
      "1. De pie, mancuerna pegada al pecho.\n2. Baja cadera como al sentarte.\n3. Empuja con los talones.\n4. Sube a la posición inicial.",
    errores: "• No dejar caer las rodillas.\n• Mantener el pecho erguido.",
  },
  {
    id: "elevaciones_gemelos",
    nombre: "Elevaciones de gemelos",
    musculo: "pierna",
    categoria: "pierna",
    material: "Mancuernas",
    nivel: "Principiante",
    imagen:
      "https://i.pinimg.com/originals/2f/7c/ca/2f7cca8d37c65384c1d0bd84cc0a91d1.gif",
    instrucciones:
      "1. De pie, mancuernas a los lados.\n2. Elévate con la punta de los pies.\n3. Baja controladamente.",
    errores: "• No usar impulso.\n• Mantener el equilibrio.",
  },
  {
    id: "aperturas_pecho",
    nombre: "Aperturas en banco",
    musculo: "pecho",
    categoria: "pecho",
    material: "Mancuernas",
    nivel: "Principiante",
    imagen:
      "https://media.tenor.com/oJXOnsC72qMAAAAM/crussifixo-no-banco-com-halteres.gif",
    instrucciones:
      "1. Tumbado en banco plano.\n2. Abre brazos en arco.\n3. Vuelve a juntar las mancuernas.",
    errores: "• No usar demasiado peso.\n• Mantener control en todo momento.",
  },
  {
    id: "extension_triceps",
    nombre: "Extensión de tríceps tras nuca",
    musculo: "triceps",
    categoria: "triceps",
    material: "Mancuerna",
    nivel: "Intermedio",
    imagen: "https://gymvisual.com/img/p/5/1/0/3/5103.gif",
    instrucciones:
      "1. Sentado, mancuerna sobre la cabeza.\n2. Flexiona codos para bajar por detrás de la cabeza.\n3. Sube estirando los brazos.",
    errores: "• No mover los codos.\n• Mantener el abdomen firme.",
  },
  {
    id: "patada_triceps",
    nombre: "Patada de tríceps",
    musculo: "triceps",
    categoria: "triceps",
    material: "Mancuerna",
    nivel: "Principiante",
    imagen:
      "https://i.pinimg.com/originals/96/a1/b6/96a1b68a9a9f4c853b695a3740e91326.gif",
    instrucciones:
      "1. Rodilla y mano apoyadas en banco.\n2. Estira brazo hacia atrás hasta paralelo al suelo.\n3. Baja controladamente.",
    errores: "• No mover el brazo.\n• Mantener la espalda recta.",
  },
];

// ==========================================
// IMÁGENES E INSTRUCCIONES
// ==========================================
const imagenesMap = {
  "Remo con barra":
    "https://mundoentrenamiento.com/wp-content/uploads/2019/10/Remo-con-barra-agarre-cerrado.gif",
  "Remo a una mano con mancuerna":
    "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif",
  "Curl de bíceps alterno":
    "https://i.pinimg.com/originals/7d/3c/de/7d3cdeed84c1c19ad372d5b25beffd08.gif",
  "Curl martillo":
    "https://api.smartworkout.app/asset/image/8588e41c-5c2d-4ee0-90ca-ad69b7d0438a",
  "Cardio en cinta":
    "https://api.smartworkout.app/asset/image/87d7f44d-15a8-4e40-8ea0-4a9cafa23eda",
  "Press de hombros sentado":
    "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
  "Aperturas inclinadas con mancuernas":
    "https://media.tenor.com/oJXOnsC72qMAAAAM/crussifixo-no-banco-com-halteres.gif",
  "Pullover con mancuerna":
    "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Pullover.gif",
  "Elevaciones laterales sentado":
    "https://gymvisual.com/img/p/5/1/3/7/5137.gif",
  "Extensión de tríceps tumbado (Press Francés)":
    "https://gymvisual.com/img/p/2/0/8/4/3/20843.gif",
  "Extensión de tríceps tras nuca (Sentado)":
    "https://i.pinimg.com/originals/2c/62/ba/2c62ba80d37c94d06ad6d60f1e5445df.gif",
  "Fondos para tríceps":
    "https://i.pinimg.com/originals/2c/62/ba/2c62ba80d37c94d06ad6d60f1e5445df.gif",
  "Extensión de tríceps a una mano":
    "https://gymvisual.com/img/p/5/1/0/3/5103.gif",
  "Patada de tríceps":
    "https://i.pinimg.com/originals/96/a1/b6/96a1b68a9a9f4c853b695a3740e91326.gif",
  "Remo al mentón con mancuernas":
    "https://api.smartworkout.app/asset/image/80833bf7-99b5-4272-b3b2-629ccc137ce1",
  "Remo en banco inclinado con mancuernas":
    "https://gymvisual.com/img/p/1/4/9/7/3/14973.gif",
  'Curl araña (Pausa de 2")':
    "https://api.smartworkout.app/asset/image/7a6c7c0b-0480-4c45-ba66-18959ec9001f",
  "Curl concentrado":
    "https://media.tenor.com/jaX3EUxaQGkAAAAM/rosca-concentrada-no-banco.gif",
  "Press inclinado con mancuernas (Agarre Invertido)":
    "https://fitnessprogramer.com/wp-content/uploads/2022/07/Dumbbell-Reverse-Grip-30-Degrees-Incline-Bench-Press.gif",
  "Aperturas en banco plano":
    "https://media.tenor.com/oJXOnsC72qMAAAAM/crussifixo-no-banco-com-halteres.gif",
  "Press plano con mancuernas":
    "https://gymvisual.com/img/p/1/8/6/4/5/18645.gif",
  "Pájaro / Fly invertido (Hombro Posterior)":
    "https://i.pinimg.com/originals/f8/37/b5/f837b5d4ef387c529f2ca61a97fbabdd.gif",
  "Sentadilla Goblet con mancuerna":
    "https://fitnessprogramer.com/wp-content/uploads/2023/01/Dumbbell-Goblet-Squat.gif",
  "Zancadas estáticas con mancuernas (Lunges)":
    "https://gymvisual.com/img/p/2/3/7/3/9/23739.gif",
  "Elevación de gemelos de pie con mancuernas":
    "https://i.pinimg.com/originals/2f/7c/ca/2f7cca8d37c65384c1d0bd84cc0a91d1.gif",
  "Curl de antebrazo con mancuernas (Palmas arriba)":
    "https://gymvisual.com/img/p/1/5/3/1/0/15310.gif",
};

function getInstruccionDetallada(n) {
  const map = {
    "Remo con barra":
      "Posición: De pie, inclina el torso hacia adelante unos 45 grados. Agarra la barra con las palmas hacia abajo.\nEspalda: Mantén la espalda totalmente recta y el abdomen firme.\nMovimiento: Tira de la barra hacia la parte baja de tu abdomen, llevando los codos hacia atrás y arriba.\nContracción: Aprieta los músculos de la espalda un segundo arriba y baja la barra lentamente.\nRespiración: Exhala al subir, inhala al bajar.",
    "Remo a una mano con mancuerna":
      "Posición: Apoya rodilla y mano derecha sobre el banco.\nEspalda: Columna recta y paralela al suelo.\nMovimiento: Súbela dirigiendo el codo hacia atrás, rozando tu cadera.\nRespiración: Exhala al traccionar, inhala al bajar.",
    "Curl de bíceps alterno":
      "Manos: Agarre supino, codos pegados al torso.\nMovimiento: Curva un brazo llevando la mancuerna al hombro, baja controlado.\nRespiración: Exhala al subir, inhala al bajar.",
    "Curl martillo":
      "Manos: Agarre neutro, codos fijos.\nMovimiento: Curva hacia el hombro manteniendo muñeca recta.\nRespiración: Exhala al subir, inhala al bajar.",
    "Cardio en cinta":
      "Objetivo: Mejora tu resistencia cardiovascular.\nDuración: Ajusta tiempo y velocidad según energía.\nPostura: Erguida, mirada al frente, braceo natural.\nControl: Controla pulsaciones con el reloj.",
    "Press de hombros sentado":
      "Posición: Sentado, mancuernas a altura de orejas.\nMovimiento: Empuja hacia arriba sin bloquear codos.\nRespiración: Exhala al subir, inhala al bajar.",
    "Aperturas inclinadas con mancuernas":
      "Posición: Tumbado en banco inclinado.\nMovimiento: Abre brazos en arco hasta sentir estiramiento.\nRespiración: Inhala al abrir, exhala al cerrar.",
    "Pullover con mancuerna":
      "Posición: Tumbado en banco, mancuerna sobre pecho.\nMovimiento: Lleva mancuerna hacia atrás por encima de la cabeza.\nRespiración: Inhala al bajar, exhala al subir.",
    "Elevaciones laterales sentado":
      "Posición: Sentado, mancuernas a los lados.\nMovimiento: Eleva hasta paralelo al suelo.\nRespiración: Exhala al subir, inhala al bajar.",
    "Extensión de tríceps tumbado (Press Francés)":
      "Posición: Tumbado, brazos estirados hacia el techo.\nMovimiento: Flexiona codos para bajar mancuernas hacia las orejas.\nRespiración: Inhala al bajar, exhala al extender.",
    "Extensión de tríceps tras nuca (Sentado)":
      "Posición: Sentado, mancuerna sobre la cabeza.\nMovimiento: Flexiona codos para bajar por detrás de la cabeza.\nRespiración: Inhala al bajar, exhala al subir.",
    "Fondos para tríceps":
      "Posición: Sujeta las paralelas con brazos estirados.\nMovimiento: Baja flexionando los codos.\nSube estirando los brazos.\nRespiración: Inhala al bajar, exhala al subir.",
    "Extensión de tríceps a una mano":
      "Posición: Sentado, brazo estirado hacia el techo.\nMovimiento: Flexiona codo para bajar mancuerna detrás de la cabeza.\nRespiración: Inhala al bajar, exhala al subir.",
    "Patada de tríceps":
      "Posición: Rodilla y mano apoyadas en banco.\nMovimiento: Estira brazo hacia atrás hasta paralelo al suelo.\nRespiración: Exhala al estirar, inhala al volver.",
    "Remo al mentón con mancuernas":
      "Posición: De pie, mancuernas sobre muslos.\nMovimiento: Sube mancuernas verticalmente hacia el mentón.\nRespiración: Exhala al subir, inhala al bajar.",
    "Remo en banco inclinado con mancuernas":
      "Posición: Tumbado boca abajo en banco inclinado.\nMovimiento: Tira de mancuernas hacia arriba, codos hacia atrás.\nRespiración: Exhala al subir, inhala al bajar.",
    'Curl araña (Pausa de 2")':
      "Posición: Tumbado boca abajo en banco inclinado.\nMovimiento: Curva mancuernas hacia hombros, pausa 2 segundos arriba.\nRespiración: Exhala al subir, inhala al bajar.",
    "Curl concentrado":
      "Posición: Sentado, codo apoyado en muslo.\nMovimiento: Curva mancuerna hacia el pecho.\nRespiración: Exhala al subir, inhala al bajar.",
    "Press inclinado con mancuernas (Agarre Invertido)":
      "Posición: Banco inclinado 30-45°, palmas mirando a la cara.\nMovimiento: Empuja hacia arriba hasta estirar brazos.\nRespiración: Inhala al bajar, exhala al subir.",
    "Aperturas en banco plano":
      "Posición: Tumbado en banco plano, mancuernas juntas arriba.\nMovimiento: Abre brazos en arco, vuelve a juntar.\nRespiración: Inhala al abrir, exhala al cerrar.",
    "Press plano con mancuernas":
      "Posición: Tumbado en banco plano, mancuernas a los lados del pecho.\nMovimiento: Empuja hacia el techo en línea recta.\nRespiración: Exhala al subir, inhala al bajar.",
    "Pájaro / Fly invertido (Hombro Posterior)":
      "Posición: Sentado, torso inclinado hacia adelante.\nMovimiento: Abre brazos hacia los lados elevando mancuernas.\nRespiración: Exhala al subir, inhala al bajar.",
    "Sentadilla Goblet con mancuerna":
      "Posición: De pie, mancuerna pegada al pecho.\nMovimiento: Baja cadera como al sentarte, empuja con talones.\nRespiración: Inhala al bajar, exhala al subir.",
    "Zancadas estáticas con mancuernas (Lunges)":
      "Posición: Paso largo adelante, mancuernas a los lados.\nMovimiento: Baja hasta que rodilla trasera casi toque el suelo.\nRespiración: Inhala al bajar, exhala al subir.",
    "Elevación de gemelos de pie con mancuernas":
      "Posición: De pie, mancuernas a los lados.\nMovimiento: Elévate con la punta de los pies.\nRespiración: Exhala al subir, inhala al bajar.",
    "Curl de antebrazo con mancuernas (Palmas arriba)":
      "Posición: Sentado, antebrazos sobre muslos, palmas arriba.\nMovimiento: Flexiona muñecas hacia arriba.\nRespiración: Exhala al subir, inhala al bajar.",
  };
  return (
    map[n] ||
    "1️⃣ Posición inicial correcta.\n2️⃣ Movimiento controlado.\n3️⃣ Respiración adecuada."
  );
}

// ==========================================
// DASHBOARD
// ==========================================
const Dashboard = {
  render() {
    const container = document.getElementById("dashboardContainer");
    if (!container) return;

    const hoy = new Date();
    const horas = hoy.getHours();
    let saludo = "Buenos días";
    if (horas >= 14 && horas < 21) saludo = "Buenas tardes";
    if (horas >= 21 || horas < 6) saludo = "Buenas noches";

    const diaSemana = DIAS_SEMANA[hoy.getDay()];
    const fechaStr = hoy.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
    });

    const peso =
      STATE.mediciones.length > 0
        ? STATE.mediciones[STATE.mediciones.length - 1].peso
        : "--";
    const obj = CONFIG.PESO_OBJETIVO;
    const restan = peso !== "--" ? (peso - obj).toFixed(1) : "--";
    const isRestan = parseFloat(restan) > 0;

    const diasMap = {
      0: "domingo",
      1: "lunes",
      2: "martes",
      3: "miercoles",
      4: "jueves",
      5: "viernes",
      6: "sabado",
    };
    const diaHoy = diasMap[hoy.getDay()];
    const ejHoy = Rutinas.ejerciciosUnicos[diaHoy] || [];
    const rutinaNombre = TIPOS_RUTINA[diaHoy] || "Descanso";
    const entrenadoHoy = STATE.diasEntrenados.includes(UI.getHoyStr());

    const racha = Calculos.getRacha();
    const sinFumar = STATE.evolution.daysWithoutSmoking || 0;
    const totalEntrenos = STATE.diasEntrenados.length || 0;

    const notifs = Notificaciones.generar();

    let html = `
              <div class="saludo">${saludo}, <span>${userData.nombre}</span></div>
              <div class="saludo-dia">${diaSemana} · ${fechaStr}</div>

              <div class="card card-accent">
                <div class="card-title">🎯 Objetivo</div>
                <div class="objetivo-row">
                  <div>
                    <div class="peso-actual">${peso} kg</div>
                    <div class="peso-meta">↓ ${obj} kg</div>
                  </div>
                  <div class="restan">
                    <div class="label">Restan</div>
                    <div class="valor ${isRestan ? "warning" : "ok"}">${isRestan ? restan : "🎉"} kg</div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-title">💪 Hoy</div>
            `;

    if (diaHoy === "domingo") {
      html += `
                <div class="hoy-row">
                  <span class="hoy-icon" style="font-size:32px;">😌</span>
                  <div class="hoy-info">
                    <div class="titulo">Domingo de descanso</div>
                    <div class="sub">Recuperación activa</div>
                  </div>
                </div>
              `;
    } else if (entrenadoHoy) {
      html += `
                <div class="hoy-row">
                  <span class="hoy-icon" style="color:var(--success);font-size:32px;">✅</span>
                  <div class="hoy-info">
                    <div class="titulo" style="color:var(--success);">Entrenamiento completado</div>
                    <div class="sub">${rutinaNombre} · ${ejHoy.length} ejercicios</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Buen trabajo. Nos vemos mañana.</div>
                  </div>
                </div>
              `;
    } else {
      html += `
                <div class="hoy-row">
                  <span class="hoy-icon" style="color:var(--primary);font-size:32px;">💪</span>
                  <div class="hoy-info">
                    <div class="titulo">${rutinaNombre}</div>
                    <div class="sub">${ejHoy.length} ejercicios</div>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="APP.navegar('rutinas')"><i class="fa-solid fa-play"></i> Empezar</button>
                </div>
              `;
    }

    html += `</div>`;

    if (notifs.length > 0) {
      html += `
                <div class="card" style="border-left:3px solid var(--warning);">
                  <div class="card-title">🔔 Pendientes (${notifs.length})</div>
              `;
      notifs.forEach((n) => {
        html += `
                  <div class="pending-item">
                    <span class="pi-icon">${n.icono}</span>
                    <span>${n.texto}</span>
                    <span class="pi-check">✔</span>
                  </div>
                `;
      });
      html += `</div>`;
    }

    html += `
              <div class="card">
                <div class="card-title">🔥 Rachas</div>
                <div class="rachas-grid">
                  <div class="racha-box">
                    <div class="num primary">${totalEntrenos}</div>
                    <div class="label">Entrenos</div>
                  </div>
                  <div class="racha-box">
                    <div class="num green">${sinFumar}</div>
                    <div class="label">Sin fumar</div>
                  </div>
                </div>
              </div>
            `;

    container.innerHTML = html;
  },
};

// ==========================================
// RUTINAS
// ==========================================
const Rutinas = {
  ejerciciosUnicos: {
    lunes: [
      "Remo con barra",
      "Remo a una mano con mancuerna",
      "Curl de bíceps alterno",
      "Curl martillo",
      "Cardio en cinta",
    ],
    martes: [
      "Press de hombros sentado",
      "Aperturas inclinadas con mancuernas",
      "Pullover con mancuerna",
      "Elevaciones laterales sentado",
      "Cardio en cinta",
    ],
    miercoles: [
      "Extensión de tríceps tumbado (Press Francés)",
      "Extensión de tríceps tras nuca (Sentado)",
      "Fondos para tríceps",
      "Patada de tríceps",
      "Cardio en cinta",
    ],
    jueves: [
      "Remo al mentón con mancuernas",
      "Remo en banco inclinado con mancuernas",
      'Curl araña (Pausa de 2")',
      "Curl concentrado",
      "Cardio en cinta",
    ],
    viernes: [
      "Press inclinado con mancuernas (Agarre Invertido)",
      "Aperturas en banco plano",
      "Press plano con mancuernas",
      "Pájaro / Fly invertido (Hombro Posterior)",
      "Cardio en cinta",
    ],
    sabado: [
      "Sentadilla Goblet con mancuerna",
      "Zancadas estáticas con mancuernas (Lunges)",
      "Elevación de gemelos de pie con mancuernas",
      "Curl de antebrazo con mancuernas (Palmas arriba)",
      "Cardio en cinta",
    ],
  },
  esCardio(n) {
    return n === "Cardio en cinta";
  },
  getEjerciciosPorDia(d) {
    return this.ejerciciosUnicos[d] || [];
  },
  getUltimoEntrenoEjercicio(nombre) {
    if (STATE.historialEntrenos.length === 0) return null;
    const ord = [...STATE.historialEntrenos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
    for (const e of ord) {
      const ej = e.ejercicios.find((x) => x.nombre === nombre);
      if (ej) return { fecha: e.fecha, peso: ej.peso, reps: ej.reps };
    }
    return null;
  },
  marcarEjercicio(id) {
    if (STATE.checks[id]) delete STATE.checks[id];
    else STATE.checks[id] = true;
    STORAGE._save();
    this.actualizarProgreso();
    const dia = id.split("-")[0];
    const c = document.getElementById(`lista-${dia}`);
    if (
      c &&
      Array.from(c.querySelectorAll(".check-box")).every((cb) => cb.checked) &&
      c.querySelectorAll(".check-box").length > 0
    ) {
      const hoy = UI.getHoyStr();
      if (!STATE.diasEntrenados.includes(hoy)) {
        STATE.diasEntrenados.push(hoy);
        STORAGE._save();
        UI.toast(`🎉 ¡${dia.toUpperCase()} COMPLETADO!`, "success");
        confetti({ particleCount: 120, spread: 70 });
        Dashboard.render();
        Notificaciones.render();
      }
    }
  },
  actualizarProgreso() {
    const c = document.getElementById("progresoRutinaContainer");
    if (!c) return;
    const ej = this.getEjerciciosPorDia(diaActivo);
    if (ej.length === 0) {
      c.innerHTML = "";
      return;
    }
    const total = ej.length;
    let comp = 0;
    ej.forEach((_, idx) => {
      if (STATE.checks[`${diaActivo}-${idx}`]) comp++;
    });
    const pct = Math.round((comp / total) * 100);
    const bf = document.getElementById("btnFinalizarRutina");
    if (comp === total) {
      c.innerHTML = `<div class="progreso-rutina-bar"><div class="progreso-rutina-completado"><i class="fa-solid fa-circle-check"></i> ¡${NOMBRES_DIAS[diaActivo]} completado!</div></div>`;
      if (bf) bf.classList.add("visible");
    } else {
      c.innerHTML = `
                <div class="progreso-rutina-bar">
                  <div class="progreso-rutina-header">
                    <span>${NOMBRES_DIAS[diaActivo]}</span>
                    <span>${pct}%</span>
                  </div>
                  <div class="progreso-rutina-track"><div class="progreso-rutina-fill" style="width:${pct}%;"></div></div>
                  <div class="progreso-rutina-info">${comp}/${total} ejercicios</div>
                </div>
              `;
      if (bf) bf.classList.remove("visible");
    }
  },
  cargarTabs() {
    const tc = document.getElementById("dayTabs");
    const pc = document.getElementById("dayPanelsContainer");
    if (!tc) return;
    const dias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    const nombres = ["L", "M", "X", "J", "V", "S"];
    tc.innerHTML = "";
    pc.innerHTML = "";
    dias.forEach((dia, idx) => {
      const btn = document.createElement("button");
      btn.className = "dtab";
      btn.textContent = nombres[idx];
      btn.onclick = () => {
        document
          .querySelectorAll(".day-panel")
          .forEach((p) => p.classList.add("hidden"));
        document
          .querySelectorAll(".dtab")
          .forEach((b) => b.classList.remove("active"));
        const panel = document.getElementById(`dp-${dia}`);
        if (panel) panel.classList.remove("hidden");
        btn.classList.add("active");
        diaActivo = dia;
        Rutinas.actualizarProgreso();
      };
      tc.appendChild(btn);
    });
    dias.forEach((dia) => {
      const panel = document.createElement("div");
      panel.className = "day-panel hidden";
      panel.id = `dp-${dia}`;
      const ejercicios = this.getEjerciciosPorDia(dia);
      let html = `<div class="ex-grid" id="lista-${dia}">`;
      ejercicios.forEach((nombre, idx) => {
        const id = `${dia}-${idx}`;
        const img = imagenesMap[nombre] || "";
        const inst = getInstruccionDetallada(nombre).replace(/\n/g, "<br>");
        const checked = !!STATE.checks[id];
        const ultimo = this.getUltimoEntrenoEjercicio(nombre);
        const record = RecordsManager.getRecord(nombre);
        const recordStr = record
          ? `${record.weight} kg × ${record.reps}`
          : "--";
        const esCardio = this.esCardio(nombre);

        const imgHtml = img
          ? `<img src="${img}" class="ex-img" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'ex-img-fallback\\'>💪</div>'" onclick="UI.abrirLightbox(this.src)" alt="${nombre}">`
          : `<div class="ex-img-fallback">💪</div>`;

        const datosHTML = esCardio
          ? `
                      <div class="ex-datos"><div class="ex-dato"><label>Tiempo (min)</label><input type="number" id="peso-${dia}-${idx}" step="1" placeholder="20" value="${ultimo ? ultimo.peso : ""}"></div></div>
                      ${ultimo ? `<div class="ex-ultimo">Último: <strong>${ultimo.peso} min</strong> (${new Date(ultimo.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })})</div>` : ""}
                    `
          : `
                      <div class="ex-datos">
                        <div class="ex-dato"><label>Peso (kg)</label><input type="number" id="peso-${dia}-${idx}" step="0.5" placeholder="6" value="${ultimo ? ultimo.peso : ""}"></div>
                        <div class="ex-dato"><label>Reps</label><input type="text" id="reps-${dia}-${idx}" placeholder="12,12,11" value="${ultimo ? ultimo.reps : ""}"></div>
                      </div>
                      ${ultimo ? `<div class="ex-ultimo">Último: <strong>${ultimo.peso} kg</strong> · ${ultimo.reps} (${new Date(ultimo.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })})</div>` : ""}
                    `;

        html += `
                  <div class="ex-card ${checked ? "checked" : ""}">
                    <div class="ex-head">
                      <span class="ex-name">${nombre}</span>
                      <input type="checkbox" class="check-box" ${checked ? "checked" : ""} onchange="Rutinas.marcarEjercicio('${id}')">
                    </div>
                    <div class="ex-body">
                      <button class="ex-tog" onclick="Rutinas.toggleDetalles(this,'${img}','${inst}')"><i class="fa-solid fa-circle-info"></i> Ver técnica</button>
                      <div class="ex-det">
                        ${imgHtml}
                        <div style="white-space:pre-wrap;font-size:13px;line-height:1.7;">${inst}</div>
                      </div>
                      ${datosHTML}
                      <div class="ultimo-entreno"><span>Último entrenamiento</span><span>${ultimo ? (esCardio ? ultimo.peso + " min" : ultimo.peso + " kg × " + ultimo.reps) : "--"}</span></div>
                      <div class="mejor-marca"><span>🏆 Récord</span><span class="mm-valor">${recordStr}</span></div>
                      <button class="btn-historial-ej" onclick="Rutinas.verHistorial('${nombre.replace(/'/g, "\\'")}')"><i class="fa-solid fa-clock-rotate-left"></i> Historial</button>
                      <button class="btn-historial-ej" onclick="Rutinas.verEvolucion('${nombre.replace(/'/g, "\\'")}')" style="margin-left:4px;"><i class="fa-solid fa-chart-line"></i> Evolución</button>
                    </div>
                  </div>
                `;
      });
      html += `</div>`;
      panel.innerHTML = html;
      pc.appendChild(panel);
    });

    const btn = document.createElement("button");
    btn.id = "btnFinalizarRutina";
    btn.className = "btn btn-success btn-finalizar";
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Finalizar entrenamiento`;
    btn.onclick = () => Rutinas.mostrarModalFinalizar();
    pc.appendChild(btn);

    const idxActivo = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ].indexOf(diaActivo);
    const tabs = tc.querySelectorAll(".dtab");
    if (idxActivo >= 0 && tabs[idxActivo]) {
      const panel = document.getElementById(`dp-${diaActivo}`);
      if (panel) panel.classList.remove("hidden");
      tabs[idxActivo].classList.add("active");
    } else {
      const panel = document.getElementById("dp-lunes");
      if (panel) panel.classList.remove("hidden");
      if (tabs[0]) tabs[0].classList.add("active");
    }
  },
  toggleDetalles(btn, imgUrl, inst) {
    const d = btn.nextElementSibling;
    if (d && d.classList && d.classList.contains("open")) {
      d.classList.remove("open");
      btn.innerHTML = '<i class="fa-solid fa-circle-info"></i> Ver técnica';
    } else {
      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" class="ex-img" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'ex-img-fallback\\'>💪</div>'" onclick="UI.abrirLightbox(this.src)" alt="Técnica">`
        : `<div class="ex-img-fallback">💪</div>`;
      d.innerHTML = `
                ${imgHtml}
                <div style="white-space:pre-wrap;font-size:13px;line-height:1.7;">${inst}</div>
              `;
      d.classList.add("open");
      btn.innerHTML = '<i class="fa-solid fa-circle-chevron-up"></i> Ocultar';
    }
  },
  verHistorial(nombre) {
    const hist = [];
    const ord = [...STATE.historialEntrenos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
    for (const e of ord) {
      const ej = e.ejercicios.find((x) => x.nombre === nombre);
      if (ej) hist.push({ fecha: e.fecha, peso: ej.peso, reps: ej.reps });
    }
    document.getElementById("modalHistorialEj")?.remove();
    let h = `<div id="modalHistorialEj" class="modal-overlay"><div class="modal-panel"><button class="modal-close" onclick="document.getElementById('modalHistorialEj').remove()"><i class="fa-solid fa-xmark"></i></button><h3><i class="fa-solid fa-clock-rotate-left"></i> ${nombre}</h3>`;
    if (hist.length === 0)
      h +=
        '<div style="text-align:center;padding:12px;color:var(--text-secondary);">Sin historial</div>';
    else {
      hist.forEach((x) => {
        h += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span>${new Date(x.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span><span style="color:var(--primary);">${this.esCardio(nombre) ? x.peso + " min" : x.peso + " kg · " + x.reps}</span></div>`;
      });
    }
    h += `<button class="btn btn-ghost btn-block" onclick="document.getElementById('modalHistorialEj').remove()" style="margin-top:12px;">Cerrar</button></div></div>`;
    document.body.insertAdjacentHTML("beforeend", h);
  },
  verEvolucion(nombre) {
    const hist = [];
    const ord = [...STATE.historialEntrenos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
    for (const e of ord) {
      const ej = e.ejercicios.find((x) => x.nombre === nombre);
      if (ej) hist.push({ fecha: e.fecha, peso: ej.peso, reps: ej.reps });
    }
    document.getElementById("modalEvolucionEj")?.remove();
    let h = `<div id="modalEvolucionEj" class="modal-overlay"><div class="modal-panel"><button class="modal-close" onclick="document.getElementById('modalEvolucionEj').remove()"><i class="fa-solid fa-xmark"></i></button><h3><i class="fa-solid fa-chart-line"></i> ${nombre} - Evolución</h3>`;
    if (hist.length === 0)
      h +=
        '<div style="text-align:center;padding:12px;color:var(--text-secondary);">Sin historial</div>';
    else {
      hist.forEach((x, i) => {
        const isBest = i === 0;
        h += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);${isBest ? "color:var(--success);font-weight:600;" : ""}"><span>${new Date(x.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span><span>${this.esCardio(nombre) ? x.peso + " min" : x.peso + " kg · " + x.reps} ${isBest ? "🏆" : ""}</span></div>`;
      });
    }
    h += `<button class="btn btn-ghost btn-block" onclick="document.getElementById('modalEvolucionEj').remove()" style="margin-top:12px;">Cerrar</button></div></div>`;
    document.body.insertAdjacentHTML("beforeend", h);
  },
  mostrarModalFinalizar() {
    const ej = this.getEjerciciosPorDia(diaActivo);
    document.getElementById("modalFinalizar")?.remove();
    let h = `<div id="modalFinalizar" class="modal-overlay"><div class="modal-panel"><h3><i class="fa-solid fa-clipboard-check"></i> Revisar entrenamiento</h3>`;
    ej.forEach((nombre, idx) => {
      const peso =
        document.getElementById(`peso-${diaActivo}-${idx}`)?.value || "-";
      const reps = this.esCardio(nombre)
        ? ""
        : document.getElementById(`reps-${diaActivo}-${idx}`)?.value || "-";
      const det = this.esCardio(nombre)
        ? `${peso} min`
        : `${peso} kg · ${reps}`;
      h += `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);"><span>${nombre}</span><span style="color:var(--primary);">${det}</span></div>`;
    });
    h += `
              <div style="margin:12px 0;text-align:left;background:rgba(0,0,0,0.1);border-radius:var(--radius-sm);padding:10px;">
                <div style="font-size:10px;color:var(--text-secondary);text-transform:uppercase;font-weight:600;margin-bottom:4px;">Suplementos</div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox" checked> Creatina</label>
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox"> Proteína (Agosto)</label>
                  <label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox" checked> Agua 💧</label>
                </div>
              </div>
              <button class="btn btn-success btn-block" onclick="Rutinas.guardarEntreno()"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
              <button class="btn btn-ghost btn-block" onclick="document.getElementById('modalFinalizar').remove()" style="margin-top:6px;">Cancelar</button>
            </div></div>`;
    document.body.insertAdjacentHTML("beforeend", h);
  },
  guardarEntreno() {
    const ej = this.getEjerciciosPorDia(diaActivo);
    const datos = [];
    let hasNewRecord = false;
    const recordMsgs = [];
    for (let idx = 0; idx < ej.length; idx++) {
      const nombre = ej[idx];
      const pesoInput = document.getElementById(`peso-${diaActivo}-${idx}`);
      const repsInput = document.getElementById(`reps-${diaActivo}-${idx}`);
      const peso = pesoInput ? parseFloat(pesoInput.value) || 0 : 0;
      const reps = this.esCardio(nombre)
        ? "Cardio"
        : repsInput
          ? repsInput.value || "-"
          : "-";
      datos.push({ nombre, peso, reps });
      if (peso > 0 && !this.esCardio(nombre)) {
        const date = new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const repsNum = reps
          .split(",")
          .map(Number)
          .reduce((a, b) => a + b, 0);
        const isRecord = RecordsManager.checkAndUpdate(
          nombre,
          peso,
          repsNum,
          date,
        );
        if (isRecord) {
          hasNewRecord = true;
          recordMsgs.push(`🏆 Nuevo récord en ${nombre}`);
        }
      }
    }
    const ne = {
      fecha: UI.getHoyStr(),
      dia: diaActivo,
      tipo: TIPOS_RUTINA[diaActivo] || diaActivo.toUpperCase(),
      ejercicios: datos,
    };
    STATE.historialEntrenos.push(ne);
    if (STATE.mediciones.length > 0) {
      const last = STATE.mediciones[STATE.mediciones.length - 1];
      STATE.evolution.currentWeight = last.peso;
      STATE.evolution.currentWaist = last.cintura;
      STATE.evolution.totalWorkouts = STATE.diasEntrenados.length || 0;
    }
    STORAGE._save();
    document.getElementById("modalFinalizar")?.remove();
    if (hasNewRecord) {
      setTimeout(() => {
        recordMsgs.forEach((msg) => UI.toast(msg, "success"));
      }, 300);
    }
    UI.toast("✅ Entrenamiento guardado", "success");
    Dashboard.render();
    Notificaciones.render();
    this.mostrarPantallaFinalizacion(datos);
  },
  mostrarPantallaFinalizacion(datos) {
    document.getElementById("modalFinalizarCompleto")?.remove();
    let h = `
              <div id="modalFinalizarCompleto" class="modal-overlay">
                <div class="modal-panel">
                  <div style="font-size:28px;font-weight:700;text-align:center;color:var(--success);margin-bottom:8px;">🎉 Entrenamiento completado</div>
                  <div style="text-align:center;color:var(--text-secondary);margin-bottom:16px;">${TIPOS_RUTINA[diaActivo] || diaActivo.toUpperCase()} · ${datos.length} ejercicios</div>
                  <div style="text-align:center;margin:12px 0;background:rgba(0,0,0,0.1);border-radius:var(--radius-sm);padding:12px;">
                    <div style="font-size:10px;color:var(--text-secondary);text-transform:uppercase;font-weight:600;margin-bottom:4px;">☐ Suplementos</div>
                    <div style="display:flex;flex-direction:column;gap:6px;text-align:left;">
                      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox" checked> Creatina</label>
                      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox"> Proteína (Agosto)</label>
                      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;"><input type="checkbox" checked> Agua 💧</label>
                    </div>
                  </div>
                  <button class="btn btn-success btn-block" onclick="Rutinas.finalizarEntreno()" style="padding:14px;font-size:15px;"><i class="fa-solid fa-check-circle"></i> Finalizar</button>
                </div>
              </div>
            `;
    document.body.insertAdjacentHTML("beforeend", h);
  },
  finalizarEntreno() {
    document.getElementById("modalFinalizarCompleto")?.remove();
    UI.toast("✅ Buen trabajo. Nos vemos mañana.", "success");
    APP.navegar("inicio");
    Dashboard.render();
  },
};

// ==========================================
// RECORDS MANAGER
// ==========================================
const RecordsManager = {
  getRecord(name) {
    return STATE.records.find((r) => r.exerciseName === name);
  },
  checkAndUpdate(name, weight, reps, date) {
    const current = this.getRecord(name);
    if (
      !current ||
      weight > current.weight ||
      (weight === current.weight && reps > current.reps)
    ) {
      STATE.records = STATE.records.filter((r) => r.exerciseName !== name);
      STATE.records.push({ exerciseName: name, weight, reps, date });
      STORAGE._save();
      return true;
    }
    return false;
  },
  render() {
    const c = document.getElementById("recordsContainer");
    if (!c) return;
    if (STATE.records.length === 0) {
      c.innerHTML = `<div style="text-align:center;color:var(--text-secondary);padding:24px;"><i class="fa-solid fa-trophy" style="font-size:40px;display:block;margin-bottom:12px;color:var(--text-muted);"></i><p>Aún no has batido ningún récord</p></div>`;
      return;
    }
    const sorted = [...STATE.records].sort((a, b) => b.weight - a.weight);
    c.innerHTML = sorted
      .map(
        (r) => `
              <div class="record-card">
                <div class="record-name">${r.exerciseName}</div>
                <div class="record-stats">
                  <div class="rs-item"><div class="rs-label">Peso</div><div class="rs-value">${r.weight} kg</div></div>
                  <div class="rs-item"><div class="rs-label">Reps</div><div class="rs-value">${r.reps}</div></div>
                  <div class="rs-item"><div class="rs-label">Volumen</div><div class="rs-value">${r.weight * r.reps} kg</div></div>
                </div>
                <div class="record-date">${r.date}</div>
              </div>
            `,
      )
      .join("");
  },
};

// ==========================================
// COMPOSICIÓN (PESO)
// ==========================================
const Composicion = {
  guardar() {
    const f = document.getElementById("medFecha").value;
    if (!f) {
      UI.toast("Selecciona una fecha", "error");
      return;
    }
    const p = parseFloat(document.getElementById("medPeso").value);
    const ci = parseFloat(document.getElementById("medCintura").value);
    const g = parseFloat(document.getElementById("medGrasaPorc").value);
    const mu = parseFloat(document.getElementById("medMasaMuscular").value);
    const pe = parseFloat(document.getElementById("medPecho").value);
    const ca = parseFloat(document.getElementById("medCadera").value);
    const bi = parseFloat(document.getElementById("medBiceps").value);
    if (isNaN(p) || isNaN(ci) || isNaN(g) || isNaN(mu)) {
      UI.toast("Completa peso, cintura, % grasa y masa muscular", "error");
      return;
    }
    const nm = {
      fecha: f,
      peso: p,
      cintura: ci,
      grasaPorcentaje: g,
      masaMuscular: mu,
      pecho: pe || null,
      cadera: ca || null,
      biceps: bi || null,
    };
    const idx = STATE.mediciones.findIndex((m) => m.fecha === f);
    if (idx !== -1) STATE.mediciones[idx] = nm;
    else STATE.mediciones.push(nm);
    STATE.mediciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    STATE.recordatorios.ultimaMedicion = f;
    STORAGE._save();
    UI.toast("✅ Medición guardada", "success");
    this.renderHistorial();
    Dashboard.render();
    EvolutionManager.update();
    Notificaciones.render();
    this.limpiar();
  },
  limpiar() {
    document.getElementById("medFecha").value = UI.getHoyStr();
    [
      "medPeso",
      "medCintura",
      "medGrasaPorc",
      "medMasaMuscular",
      "medPecho",
      "medCadera",
      "medBiceps",
    ].forEach((id) => (document.getElementById(id).value = ""));
  },
  renderHistorial() {
    const c = document.getElementById("historialMediciones");
    if (!c) return;
    if (STATE.mediciones.length === 0) {
      c.innerHTML =
        '<div style="text-align:center;color:var(--text-secondary);padding:12px;">Sin registros.</div>';
      return;
    }
    const rev = [...STATE.mediciones].reverse();
    c.innerHTML = rev
      .map((m, i) => {
        const fecha = new Date(m.fecha).toLocaleDateString("es-ES");
        const cPeso =
          i < rev.length - 1 ? (m.peso - rev[i + 1].peso).toFixed(1) : null;
        const cCintura =
          i < rev.length - 1
            ? (m.cintura - rev[i + 1].cintura).toFixed(1)
            : null;
        let cambios = "";
        if (cPeso !== null && parseFloat(cPeso) !== 0) {
          const signo = parseFloat(cPeso) < 0 ? "" : "+";
          const cls = parseFloat(cPeso) < 0 ? "positive" : "negative";
          cambios += `<span class="${cls}">${signo}${cPeso} kg</span>`;
        }
        if (cCintura !== null && parseFloat(cCintura) !== 0) {
          const signo = parseFloat(cCintura) < 0 ? "" : "+";
          const cls = parseFloat(cCintura) < 0 ? "positive" : "negative";
          if (cambios) cambios += " · ";
          cambios += `<span class="${cls}">${signo}${cCintura} cm</span>`;
        }
        return `
                <div class="historial-medicion-card" onclick="Composicion.toggleDetalle(${i})">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span class="med-fecha">${fecha}</span>
                    <span style="font-weight:600;">${m.peso} kg</span>
                  </div>
                  <div class="med-resumen">
                    <span class="med-item">📏 <span class="valor">${m.cintura}</span> cm</span>
                    <span class="med-item">💪 <span class="valor">${m.masaMuscular}</span> kg</span>
                    ${cambios ? `<span class="med-item">${cambios}</span>` : ""}
                  </div>
                  <div class="historial-medicion-detalle" id="medDetalle-${i}">
                    <div class="detalle-item"><span>Peso</span><span>${m.peso} kg ${cPeso !== null && parseFloat(cPeso) !== 0 ? `(${UI.formatearCambio(parseFloat(cPeso), "kg", true)})` : ""}</span></div>
                    <div class="detalle-item"><span>Cintura</span><span>${m.cintura} cm ${cCintura !== null && parseFloat(cCintura) !== 0 ? `(${UI.formatearCambio(parseFloat(cCintura), "cm", true)})` : ""}</span></div>
                    ${m.pecho ? `<div class="detalle-item"><span>Pecho</span><span>${m.pecho} cm</span></div>` : ""}
                    ${m.cadera ? `<div class="detalle-item"><span>Cadera</span><span>${m.cadera} cm</span></div>` : ""}
                    ${m.biceps ? `<div class="detalle-item"><span>Bíceps</span><span>${m.biceps} cm</span></div>` : ""}
                    <div class="detalle-item"><span>% Grasa</span><span>${m.grasaPorcentaje}%</span></div>
                    <div class="detalle-item"><span>Masa muscular</span><span>${m.masaMuscular} kg</span></div>
                    <div style="margin-top:8px;display:flex;gap:8px;justify-content:center;">
                      <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Composicion.editar('${m.fecha}')"><i class="fa-solid fa-pen"></i> Editar</button>
                      <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Composicion.eliminar('${m.fecha}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
                    </div>
                  </div>
                </div>
              `;
      })
      .join("");
  },
  toggleDetalle(i) {
    const d = document.getElementById(`medDetalle-${i}`);
    if (d) d.classList.toggle("open");
  },
  editar(f) {
    const m = STATE.mediciones.find((x) => x.fecha === f);
    if (!m) return;
    document.getElementById("medFecha").value = m.fecha;
    document.getElementById("medPeso").value = m.peso;
    document.getElementById("medCintura").value = m.cintura;
    document.getElementById("medGrasaPorc").value = m.grasaPorcentaje;
    document.getElementById("medMasaMuscular").value = m.masaMuscular;
    document.getElementById("medPecho").value = m.pecho || "";
    document.getElementById("medCadera").value = m.cadera || "";
    document.getElementById("medBiceps").value = m.biceps || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  eliminar(f) {
    UI.confirmar("¿Eliminar esta medición?", () => {
      STATE.mediciones = STATE.mediciones.filter((m) => m.fecha !== f);
      STORAGE._save();
      this.renderHistorial();
      Dashboard.render();
      EvolutionManager.update();
      UI.toast("🗑️ Eliminado", "success");
    });
  },
};

// ==========================================
// EVOLUTION MANAGER (Estadísticas)
// ==========================================
const EvolutionManager = {
  update() {
    if (STATE.mediciones.length > 0) {
      const first = STATE.mediciones[0];
      const last = STATE.mediciones[STATE.mediciones.length - 1];
      STATE.evolution.initialWeight = first.peso;
      STATE.evolution.currentWeight = last.peso;
      STATE.evolution.initialWaist = first.cintura;
      STATE.evolution.currentWaist = last.cintura;
      STATE.evolution.totalWorkouts = STATE.diasEntrenados.length || 0;
      let c = 0;
      const f = new Date(CONFIG.FECHA_INICIO_NO_FUMAR);
      const h = new Date();
      while (f <= h) {
        if (!STATE.diasNoFumar.includes(UI.formatFechaLocal(f))) c++;
        f.setDate(f.getDate() + 1);
      }
      STATE.evolution.daysWithoutSmoking = c;
      STORAGE._save();
    }
  },
  render() {
    const c = document.getElementById("estadisticasContainer");
    if (!c) return;
    this.update();
    const ev = STATE.evolution;
    const total = STATE.diasEntrenados.length || 0;
    const wc = (ev.currentWeight - ev.initialWeight).toFixed(1);
    const wc2 = (ev.currentWaist - ev.initialWaist).toFixed(1);
    const altura = userData.altura || CONFIG.ALTURA;
    const imc = ev.currentWeight / (altura / 100) ** 2;
    const ratio = ev.currentWaist / altura;
    const obj = CONFIG.PESO_OBJETIVO;
    const restan = (ev.currentWeight - obj).toFixed(1);

    c.innerHTML = `
              <div class="card">
                <div class="card-title"><i class="fa-solid fa-chart-simple"></i> Estadísticas</div>
                <div class="stats-grid">
                  <div class="stats-item">
                    <div class="num ${parseFloat(wc) < 0 ? "green" : "orange"}">${parseFloat(wc) < 0 ? "-" : "+"}${Math.abs(parseFloat(wc))}</div>
                    <div class="label">Peso perdido</div>
                  </div>
                  <div class="stats-item">
                    <div class="num ${parseFloat(wc2) < 0 ? "green" : "orange"}">${parseFloat(wc2) < 0 ? "-" : "+"}${Math.abs(parseFloat(wc2))}</div>
                    <div class="label">Cintura</div>
                  </div>
                  <div class="stats-item">
                    <div class="num primary">${imc.toFixed(1)}</div>
                    <div class="label">IMC</div>
                  </div>
                  <div class="stats-item">
                    <div class="num primary">${ratio.toFixed(2)}</div>
                    <div class="label">Ratio C/A</div>
                  </div>
                  <div class="stats-item">
                    <div class="num primary">${total}</div>
                    <div class="label">Entrenos</div>
                  </div>
                  <div class="stats-item">
                    <div class="num green">${ev.daysWithoutSmoking}</div>
                    <div class="label">Sin fumar</div>
                  </div>
                </div>
                <div style="margin-top:10px;display:flex;justify-content:space-between;padding:8px 12px;background:rgba(0,0,0,0.1);border-radius:var(--radius-sm);">
                  <span>🎯 Objetivo: <strong>${obj} kg</strong></span>
                  <span style="color:${parseFloat(restan) > 0 ? "var(--warning)" : "var(--success)"};">Restan: ${parseFloat(restan) > 0 ? restan : "🎉"} kg</span>
                </div>
              </div>
            `;
  },
};

// ==========================================
// NUTRICIÓN
// ==========================================
const Nutricion = {
  render() {
    this.renderSuplementos();
    this.renderAgua();
    this.renderComida();
    this.cargarImagenGuardada();
  },
  renderSuplementos() {
    const hoy = new Date();
    const proteinaActiva = hoy >= CONFIG.FECHA_ACTIVACION_PROTEINA;
    const container = document.getElementById("suplementosContainer");
    if (!container) return;
    const creatinaChecked = STATE.nutricion.suplementos.creatina || false;
    const proteinaChecked = STATE.nutricion.suplementos.proteina || false;
    const ck = container.querySelector(
      '[data-suplemento="creatina"] .suple-check',
    );
    if (ck) ck.checked = creatinaChecked;
    const sp = document.getElementById("supleProteina");
    const spi = document.getElementById("supleProteinaInactivo");
    if (proteinaActiva) {
      sp.style.display = "flex";
      spi.style.display = "none";
      const pk = sp.querySelector(".suple-check");
      if (pk) pk.checked = proteinaChecked;
    } else {
      sp.style.display = "none";
      spi.style.display = "flex";
    }
  },
  toggleSuplemento(id, checkbox) {
    STATE.nutricion.suplementos[id] = checkbox.checked;
    STORAGE._save();
    Notificaciones.render();
    if (checkbox.checked) {
      const nombres = { creatina: "Creatina", proteina: "Proteína" };
      UI.toast(`✅ ${nombres[id] || "Suplemento"} tomado`, "success");
    }
    if (document.getElementById("page-inicio").classList.contains("active"))
      Dashboard.render();
  },
  renderAgua() {
    const actual = STATE.nutricion.agua || 0;
    const objetivo = 2.5;
    const pct = Math.min(100, Math.round((actual / objetivo) * 100));
    document.getElementById("aguaActual").textContent = actual.toFixed(1);
    document.getElementById("aguaFill").style.width = pct + "%";
    const msg = document.getElementById("aguaMensaje");
    msg.style.display = actual >= objetivo ? "block" : "none";
  },
  agregarAgua(cantidad) {
    const obj = 2.5;
    STATE.nutricion.agua = Math.min(
      obj,
      (STATE.nutricion.agua || 0) + cantidad / 1000,
    );
    STORAGE._save();
    this.renderAgua();
    if (STATE.nutricion.agua >= obj) {
      UI.toast("💧 ¡Objetivo de agua conseguido!", "success");
    }
  },
  renderComida() {
    const ahora = new Date();
    const t = ahora.getHours() * 60 + ahora.getMinutes();
    const comidas = CONFIG.COMIDAS;
    let prox = null,
      minDiff = Infinity;
    for (const c of comidas) {
      const [h, m] = c.hora.split(":").map(Number);
      let diff = h * 60 + m - t;
      if (diff < 0) diff += 1440;
      if (diff < minDiff) {
        minDiff = diff;
        prox = c;
      }
    }
    const icono = document.getElementById("comidaIcono");
    const nombre = document.getElementById("comidaNombre");
    const tiempo = document.getElementById("comidaTiempo");
    const faltan = document.getElementById("comidaFaltan");
    const container = document.getElementById("comidaContainer");
    if (prox && minDiff > 5) {
      const mins = Math.round(minDiff);
      const hh = Math.floor(mins / 60);
      const mm = mins % 60;
      icono.textContent = prox.icono;
      nombre.textContent = prox.nombre;
      tiempo.textContent = prox.hora;
      faltan.textContent =
        hh > 0 ? `Faltan ${hh}h ${mm}m` : `Faltan ${mins} min`;
      container.style.borderLeft = "3px solid var(--primary)";
      container.style.paddingLeft = "12px";
    } else if (prox && minDiff <= 5) {
      icono.textContent = "✅";
      nombre.textContent = `¡${prox.nombre}!`;
      tiempo.textContent = prox.hora;
      faltan.textContent = "🍽 Disfruta tu comida";
      container.style.borderLeft = "3px solid var(--success)";
      container.style.paddingLeft = "12px";
    } else {
      icono.textContent = "🌙";
      nombre.textContent = "Comidas completadas";
      tiempo.textContent = comidas[comidas.length - 1].hora;
      faltan.textContent = "Vuelve mañana";
      container.style.borderLeft = "3px solid var(--muted)";
      container.style.paddingLeft = "12px";
    }
  },
  cargarImagenGuardada() {
    const img = document.getElementById("planImg");
    if (img && STATE.nutricion.imagen) {
      img.src = STATE.nutricion.imagen;
    }
  },
  cargarImagen(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.getElementById("planImg");
        if (img) {
          img.src = e.target.result;
          STATE.nutricion.imagen = e.target.result;
          STORAGE._save();
          UI.toast("✅ Imagen actualizada", "success");
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  },
  abrirImagen() {
    const img = document.getElementById("planImg");
    if (img) UI.abrirLightbox(img.src);
  },
};

// ==========================================
// BIBLIOTECA
// ==========================================
const Biblioteca = {
  favoritos: JSON.parse(localStorage.getItem("nicogym_favoritos") || "[]"),
  filtroActual: "todos",

  init() {
    this.cargarManiqui();
    this.renderizar();
  },

  cargarManiqui() {
    const container = document.getElementById("maniquiContainer");
    if (!container) return;
    container.innerHTML = `
              <svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg">
                <style>
                  .musculo { fill: #1e2a3a; stroke: #334155; stroke-width: 1.5; cursor: pointer; transition: fill 0.3s, stroke 0.3s; }
                  .musculo:hover { fill: #2a3a4a; }
                  .musculo.active { fill: #22c55e; stroke: #22c55e; }
                  .musculo-label { fill: #475569; font-size: 9px; font-family: Inter, sans-serif; pointer-events: none; font-weight: 500; }
                </style>
                <ellipse class="musculo" id="m_cabeza" cx="150" cy="40" rx="30" ry="35" data-musculo="cabeza"/>
                <text class="musculo-label" x="150" y="45" text-anchor="middle">Cabeza</text>
                <rect class="musculo" id="m_cuello" x="135" y="75" width="30" height="20" rx="5" data-musculo="cuello"/>
                <path class="musculo" id="m_hombro_izq" d="M135,85 L80,105 L80,125 L135,110 Z" data-musculo="hombro"/>
                <path class="musculo" id="m_hombro_der" d="M165,85 L220,105 L220,125 L165,110 Z" data-musculo="hombro"/>
                <text class="musculo-label" x="65" y="120" text-anchor="middle">Hombros</text>
                <text class="musculo-label" x="235" y="120" text-anchor="middle">Hombros</text>
                <path class="musculo" id="m_pecho" d="M100,110 L200,110 L200,170 L150,190 L100,170 Z" data-musculo="pecho"/>
                <text class="musculo-label" x="150" y="155" text-anchor="middle">Pecho</text>
                <path class="musculo" id="m_biceps_izq" d="M80,125 L55,175 L65,185 L95,140 Z" data-musculo="biceps"/>
                <path class="musculo" id="m_biceps_der" d="M220,125 L245,175 L235,185 L205,140 Z" data-musculo="biceps"/>
                <text class="musculo-label" x="40" y="170" text-anchor="middle">Bíceps</text>
                <text class="musculo-label" x="260" y="170" text-anchor="middle">Bíceps</text>
                <rect class="musculo" id="m_abdomen" x="130" y="190" width="40" height="60" rx="5" data-musculo="abdomen"/>
                <text class="musculo-label" x="150" y="225" text-anchor="middle">Abdomen</text>
                <path class="musculo" id="m_triceps_izq" d="M80,125 L55,175 L45,165 L75,115 Z" data-musculo="triceps"/>
                <path class="musculo" id="m_triceps_der" d="M220,125 L245,175 L255,165 L225,115 Z" data-musculo="triceps"/>
                <text class="musculo-label" x="30" y="160" text-anchor="middle">Tríceps</text>
                <text class="musculo-label" x="270" y="160" text-anchor="middle">Tríceps</text>
                <path class="musculo" id="m_gluteos" d="M120,250 L180,250 L185,290 L115,290 Z" data-musculo="gluteos"/>
                <text class="musculo-label" x="150" y="275" text-anchor="middle">Glúteos</text>
                <path class="musculo" id="m_cuadriceps_izq" d="M125,290 L145,290 L145,370 L125,370 Z" data-musculo="pierna"/>
                <path class="musculo" id="m_cuadriceps_der" d="M155,290 L175,290 L175,370 L155,370 Z" data-musculo="pierna"/>
                <text class="musculo-label" x="135" y="335" text-anchor="middle">Cuádriceps</text>
                <text class="musculo-label" x="165" y="335" text-anchor="middle">Cuádriceps</text>
                <path class="musculo" id="m_femoral_izq" d="M115,290 L125,290 L125,370 L115,370 Z" data-musculo="pierna"/>
                <path class="musculo" id="m_femoral_der" d="M175,290 L185,290 L185,370 L175,370 Z" data-musculo="pierna"/>
                <text class="musculo-label" x="105" y="335" text-anchor="middle">Femoral</text>
                <text class="musculo-label" x="195" y="335" text-anchor="middle">Femoral</text>
                <path class="musculo" id="m_gemelos_izq" d="M125,370 L145,370 L145,420 L125,420 Z" data-musculo="pierna"/>
                <path class="musculo" id="m_gemelos_der" d="M155,370 L175,370 L175,420 L155,420 Z" data-musculo="pierna"/>
                <text class="musculo-label" x="135" y="400" text-anchor="middle">Gemelos</text>
                <text class="musculo-label" x="165" y="400" text-anchor="middle">Gemelos</text>
                <path class="musculo" id="m_espalda" d="M110,110 L190,110 L190,190 L150,210 L110,190 Z" data-musculo="espalda" opacity="0.3"/>
                <text class="musculo-label" x="150" y="165" text-anchor="middle">Espalda</text>
                <path class="musculo" id="m_trapecio" d="M120,85 L180,85 L170,110 L130,110 Z" data-musculo="espalda"/>
                <text class="musculo-label" x="150" y="100" text-anchor="middle">Trapecio</text>
              </svg>
            `;
    document.querySelectorAll(".maniqui-container .musculo").forEach((el) => {
      el.addEventListener("click", function () {
        const musculo = this.dataset.musculo;
        if (musculo) Biblioteca.filtrarPorMusculo(musculo);
      });
    });
  },

  filtrarPorMusculo(musculo) {
    this.filtroActual = musculo;
    document.querySelectorAll(".maniqui-container .musculo").forEach((el) => {
      el.classList.toggle("active", el.dataset.musculo === musculo);
    });
    this.renderizar();
    document
      .getElementById("listaEjercicios")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  },

  filtrarPorCategoria(cat) {
    this.filtroActual = cat;
    document
      .querySelectorAll(".maniqui-container .musculo")
      .forEach((el) => el.classList.remove("active"));
    this.renderizar();
  },

  filtrarFavoritos() {
    this.filtroActual = "favoritos";
    document
      .querySelectorAll(".maniqui-container .musculo")
      .forEach((el) => el.classList.remove("active"));
    this.renderizar();
  },

  toggleFavorito(id, e) {
    e.stopPropagation();
    const idx = this.favoritos.indexOf(id);
    if (idx >= 0) this.favoritos.splice(idx, 1);
    else this.favoritos.push(id);
    localStorage.setItem("nicogym_favoritos", JSON.stringify(this.favoritos));
    this.renderizar();
  },

  esFavorito(id) {
    return this.favoritos.includes(id);
  },

  abrirDetalle(id) {
    const ej = EJERCICIOS.find((e) => e.id === id);
    if (!ej) return;
    document.getElementById("modalEjercicioNombre").textContent = ej.nombre;
    const img = document.getElementById("modalEjercicioImagen");
    img.src = ej.imagen;
    img.onerror = function () {
      this.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%231e293b'/%3E%3Ctext x='200' y='100' font-family='Inter' font-size='32' fill='%2322c55e' text-anchor='middle'%3E💪%3C/text%3E%3Ctext x='200' y='130' font-family='Inter' font-size='12' fill='%2394a3b8' text-anchor='middle'%3EEjercicio%3C/text%3E%3C/svg%3E";
    };
    document.getElementById("modalEjercicioMusculo").textContent =
      ej.musculo.charAt(0).toUpperCase() + ej.musculo.slice(1);
    document.getElementById("modalEjercicioMaterial").textContent = ej.material;
    document.getElementById("modalEjercicioNivel").textContent = ej.nivel;
    document.getElementById("modalEjercicioInstrucciones").textContent =
      ej.instrucciones;
    document.getElementById("modalEjercicioErrores").textContent = ej.errores;

    const hist = this.getHistorial(id);
    const hc = document.getElementById("modalEjercicioHistorial");
    if (hist.length > 0) {
      hc.innerHTML = hist
        .map(
          (h) =>
            `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.03);"><span>${h.fecha}</span><span>${h.peso} kg × ${h.reps}</span></div>`,
        )
        .join("");
    } else {
      hc.textContent = "Sin historial";
    }

    const record = RecordsManager.getRecord(ej.nombre);
    document.getElementById("modalEjercicioRecord").textContent = record
      ? `${record.weight} kg × ${record.reps}`
      : "--";

    document.getElementById("modalEjercicio").classList.remove("hidden");
  },

  cerrarModal() {
    document.getElementById("modalEjercicio").classList.add("hidden");
  },

  getHistorial(id) {
    const ej = EJERCICIOS.find((e) => e.id === id);
    if (!ej) return [];
    const hist = [];
    const ord = [...STATE.historialEntrenos].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );
    for (const e of ord) {
      const found = e.ejercicios.find((x) => x.nombre === ej.nombre);
      if (found)
        hist.push({
          fecha: new Date(e.fecha).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          }),
          peso: found.peso,
          reps: found.reps,
        });
    }
    return hist;
  },

  renderizar() {
    const container = document.getElementById("listaEjercicios");
    if (!container) return;
    let filtrados = [...EJERCICIOS];
    const busqueda =
      document.getElementById("buscarEjercicio")?.value.toLowerCase() || "";

    if (this.filtroActual !== "todos" && this.filtroActual !== "favoritos") {
      filtrados = filtrados.filter(
        (e) =>
          e.categoria === this.filtroActual || e.musculo === this.filtroActual,
      );
    }
    if (this.filtroActual === "favoritos") {
      filtrados = filtrados.filter((e) => this.esFavorito(e.id));
    }
    if (busqueda) {
      filtrados = filtrados.filter((e) =>
        e.nombre.toLowerCase().includes(busqueda),
      );
    }

    if (filtrados.length === 0) {
      container.innerHTML = `<div style="grid-column:span 2;text-align:center;color:var(--text-secondary);padding:24px;"><i class="fa-solid fa-search" style="font-size:32px;display:block;margin-bottom:8px;"></i><p>No se encontraron ejercicios</p></div>`;
      return;
    }

    container.innerHTML = filtrados
      .map((e) => {
        const imgHtml = e.imagen
          ? `<img src="${e.imagen}" class="ejercicio-img" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'ejercicio-img-fallback\\'>💪</div>'" alt="${e.nombre}">`
          : `<div class="ejercicio-img-fallback">💪</div>`;
        return `
                <div class="ejercicio-card" onclick="Biblioteca.abrirDetalle('${e.id}')">
                  <div style="position:relative;">
                    ${imgHtml}
                    <button class="ejercicio-favorito ${this.esFavorito(e.id) ? "active" : ""}" onclick="Biblioteca.toggleFavorito('${e.id}', event)">${this.esFavorito(e.id) ? "⭐" : "☆"}</button>
                    <span class="ejercicio-badge">${e.musculo}</span>
                  </div>
                  <div class="ejercicio-nombre">${e.nombre}</div>
                </div>
              `;
      })
      .join("");
  },
};

// ==========================================
// FOTOS
// ==========================================
const Fotos = {
  db: null,
  DB_NAME: "FotosProgresoDB",
  STORE_NAME: "diasFotos",
  async _abrirDB() {
    return new Promise((r) => {
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        if (!e.target.result.objectStoreNames.contains(this.STORE_NAME))
          e.target.result.createObjectStore(this.STORE_NAME, {
            keyPath: "fecha",
          });
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        r();
      };
      req.onerror = () => r();
    });
  },
  async guardar() {
    const f = document.getElementById("fechaFotos").value;
    if (!f) {
      UI.toast("Selecciona fecha", "error");
      return;
    }
    const fr = await this._leerArchivo(
      document.querySelector(
        "[onchange*=\"Fotos.previsualizar(this,'Frente')\"]",
      )?.files?.[0],
    );
    const es = await this._leerArchivo(
      document.querySelector(
        "[onchange*=\"Fotos.previsualizar(this,'Espalda')\"]",
      )?.files?.[0],
    );
    const iz = await this._leerArchivo(
      document.querySelector(
        "[onchange*=\"Fotos.previsualizar(this,'Izquierda')\"]",
      )?.files?.[0],
    );
    const de = await this._leerArchivo(
      document.querySelector(
        "[onchange*=\"Fotos.previsualizar(this,'Derecha')\"]",
      )?.files?.[0],
    );
    if (!fr && !es && !iz && !de) {
      UI.toast("Selecciona al menos una foto", "error");
      return;
    }
    await this._abrirDB();
    await this.db
      .transaction(this.STORE_NAME, "readwrite")
      .objectStore(this.STORE_NAME)
      .put({
        fecha: f,
        timestamp: Date.now(),
        frente: fr,
        espalda: es,
        izquierda: iz,
        derecha: de,
      });
    STATE.recordatorios.ultimasFotos = f;
    STORAGE._save();
    UI.toast("✅ Fotos guardadas", "success");
    this.cargarSelectores();
    ["fotoFrente", "fotoEspalda", "fotoIzquierda", "fotoDerecha"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      },
    );
    [
      "previewFrente",
      "previewEspalda",
      "previewIzquierda",
      "previewDerecha",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
  },
  _leerArchivo(file) {
    if (!file) return Promise.resolve(null);
    return new Promise((r) => {
      const reader = new FileReader();
      reader.onload = (e) => r(e.target.result);
      reader.readAsDataURL(file);
    });
  },
  async cargarSelectores() {
    await this._abrirDB();
    const items =
      (await new Promise(
        (r) =>
          (this.db
            .transaction(this.STORE_NAME, "readonly")
            .objectStore(this.STORE_NAME)
            .getAll().onsuccess = (e) => r(e.target.result)),
      )) || [];
    items.sort((a, b) => b.timestamp - a.timestamp);
    const opts = items
      .map((i) => `<option value="${i.fecha}">${i.fecha}</option>`)
      .join("");
    document.getElementById("compararDia1").innerHTML =
      '<option value="">Día 1</option>' + opts;
    document.getElementById("compararDia2").innerHTML =
      '<option value="">Día 2</option>' + opts;
  },
  async comparar() {
    const f1 = document.getElementById("compararDia1").value;
    const f2 = document.getElementById("compararDia2").value;
    if (!f1 || !f2) return;
    await this._abrirDB();
    const store = this.db
      .transaction(this.STORE_NAME, "readonly")
      .objectStore(this.STORE_NAME);
    const d1 = await new Promise(
      (r) => (store.get(f1).onsuccess = (e) => r(e.target.result)),
    );
    const d2 = await new Promise(
      (r) => (store.get(f2).onsuccess = (e) => r(e.target.result)),
    );
    const gen = (t, c) => {
      if (!d1?.[c] && !d2?.[c]) return "";
      return `
                <div style="background:var(--card);border-radius:var(--radius-sm);padding:10px;margin-bottom:10px;">
                  <h4 style="color:var(--primary);margin-bottom:6px;text-align:center;">${t}</h4>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <img src="${d1?.[c] || ""}" style="width:100%;border-radius:var(--radius-sm);object-fit:cover;cursor:pointer;" onclick="UI.abrirLightbox(this.src)" onerror="this.style.display='none'">
                    <img src="${d2?.[c] || ""}" style="width:100%;border-radius:var(--radius-sm);object-fit:cover;cursor:pointer;" onclick="UI.abrirLightbox(this.src)" onerror="this.style.display='none'">
                  </div>
                </div>
              `;
    };
    let html =
      gen("FRENTE", "frente") +
      gen("ESPALDA", "espalda") +
      gen("IZQUIERDA", "izquierda") +
      gen("DERECHA", "derecha");
    if (!html)
      html =
        '<div style="text-align:center;padding:20px;color:var(--text-secondary);">No hay fotos para comparar</div>';
    document.getElementById("comparadorResultado").innerHTML = html;
  },
  previsualizar(input, tipo) {
    if (input.files[0]) {
      const r = new FileReader();
      r.onload = (e) => {
        const img = document.getElementById("preview" + tipo);
        img.src = e.target.result;
        img.classList.remove("hidden");
      };
      r.readAsDataURL(input.files[0]);
    }
  },
};

// ==========================================
// AJUSTES
// ==========================================
const Ajustes = {
  guardar() {
    const nombre = document.getElementById("ajusteNombre").value || "Nico";
    const objetivo =
      parseInt(document.getElementById("ajusteObjetivo").value) ||
      CONFIG.PESO_OBJETIVO;
    const altura =
      parseInt(document.getElementById("ajusteAltura").value) || CONFIG.ALTURA;
    userData.nombre = nombre;
    userData.altura = altura;
    STATE.ajustes = { nombre, objetivo, altura };
    STORAGE._save();
    UI.toast("✅ Ajustes guardados", "success");
    Dashboard.render();
    EvolutionManager.render();
  },
  cargar() {
    const saved = STATE.ajustes;
    if (saved && saved.nombre) {
      userData.nombre = saved.nombre;
      userData.altura = saved.altura || CONFIG.ALTURA;
      document.getElementById("ajusteNombre").value = userData.nombre;
      document.getElementById("ajusteAltura").value = userData.altura;
      document.getElementById("ajusteObjetivo").value =
        saved.objetivo || CONFIG.PESO_OBJETIVO;
    }
  },
  guardarRecordatorios() {
    const fm =
      parseInt(document.getElementById("ajusteFreqMediciones").value) || 2;
    const ff = parseInt(document.getElementById("ajusteFreqFotos").value) || 4;
    STATE.recordatorios.freqMediciones = fm;
    STATE.recordatorios.freqFotos = ff;
    STORAGE._save();
    UI.toast("✅ Recordatorios guardados", "success");
  },
  cargarRecordatorios() {
    document.getElementById("ajusteFreqMediciones").value =
      STATE.recordatorios.freqMediciones || 2;
    document.getElementById("ajusteFreqFotos").value =
      STATE.recordatorios.freqFotos || 4;
  },
};
