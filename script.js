// DATOS COMPLETOS DE EJERCICIOS
const ejercicios = {
lunes: [
{nombre:"Dominadas / Negativas", series:"3 x Fallo", instrucciones:"1. Colócate debajo de la barra con agarre prono (palmas hacia afuera).\n2. Activa los hombros hacia abajo y atrás.\n3. Sube llevando el pecho a la barra.\n4. Baja de forma CONTROLADA y LENTA (4-5 segundos).\n5. Si no puedes subir, haz solo la fase negativa.", consejo:"Escápulas juntas, pecho afuera. No balancees el cuerpo.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/3c194808-73c8-4d75-a2d9-cf85dd42fbeb", tienePeso:false},
{nombre:"Remo con Barra", series:"4 x 12", instrucciones:"1. Sujeta la barra con agarre prono, manos al ancho de hombros.\n2. Inclina el torso 45° con espalda RECTA.\n3. Tira de la barra hacia el ombligo.\n4. Aprieta las escapulas al final.\n5. Baja controladamente.", consejo:"Espalda recta SIEMPRE. No redondees.", peso:"~16 kg", imagen:"https://api.smartworkout.app/asset/image/be04fca7-9dc1-4b64-a7b4-d05217eaecda", tienePeso:true},
{nombre:"Remo a una mano", series:"3 x 12", instrucciones:"1. Apoya rodilla y mano en un banco.\n2. Espalda paralela al suelo, RECTA.\n3. Tira la mancuerna hacia la cadera.\n4. Codo pegado al cuerpo.\n5. Baja despacio.", consejo:"Tira con el codo, no con el bíceps.", peso:"~6.5 kg", imagen:"https://api.smartworkout.app/asset/image/55720d63-1744-4bf8-9917-8eafd30740f5", tienePeso:true},
{nombre:"Curl de Bíceps", series:"3 x 12", instrucciones:"1. De pie, codos PEGADOS a las costillas.\n2. Sube la mancuerna hacia el hombro.\n3. Gira ligeramente la muñeca.\n4. Aprieta arriba.\n5. Baja CONTROLADO.", consejo:"No balancees el cuerpo.", peso:"~3 kg", imagen:"https://api.smartworkout.app/asset/image/303b810b-f875-42eb-8b26-cc79b18b6865", tienePeso:true}
],
martes: [
{nombre:"Cardio", series:"30 min", instrucciones:"1. Calienta 5 min suave.\n2. Mantén ritmo constante.\n3. Controla la respiración.\n4. Enfría 5 min.", consejo:"Hidrátate bien.", peso:"Intensidad media", tienePeso:false},
{nombre:"Elevación de piernas", series:"4 x 15", instrucciones:"1. Tumbado, manos bajo glúteos.\n2. Piernas estiradas, eleva a 90°.\n3. Baja sin tocar suelo.", consejo:"Lumbar pegada al suelo.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/336b57e7-bcea-4e65-a54f-3a3519729f7e", tienePeso:false},
{nombre:"Plancha", series:"3 x 45 seg", instrucciones:"1. Apoyo en antebrazos y puntas pies.\n2. Cuerpo en línea RECTA.\n3. Aprieta abdomen y glúteos.", consejo:"No hundas la cadera.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/606defc2-dc68-41d8-bea0-41a8d68aaa71", tienePeso:false}
],
miercoles: [
{nombre:"Press Banca", series:"4 x 12", instrucciones:"1. Tumbado, mancuernas sobre el pecho.\n2. Baja hacia el pecho.\n3. Codas a 45°.\n4. Sube apretando pecho.", consejo:"Hazlo en el suelo si eres novato.", peso:"~9.5 kg", imagen:"https://api.smartworkout.app/asset/image/567ae9ad-b584-4d53-b400-82b0117a7ce1", tienePeso:true},
{nombre:"Fondos", series:"3 x 10", instrucciones:"1. Usa dos sillas fuertes.\n2. Baja hasta 90°.\n3. Sube con fuerza.", consejo:"Apoya un pie en suelo si es difícil.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/bc13ac85-0d15-4e4b-af8a-2b3367a40030", tienePeso:false},
{nombre:"Press Francés", series:"3 x 12", instrucciones:"1. Tumbado, mancuernas sobre cara.\n2. Baja hacia las sienes.\n3. Codas al techo.", consejo:"Poco peso, es delicado.", peso:"~3 kg", imagen:"https://api.smartworkout.app/asset/image/deff1b63-c052-42b3-a3e4-aad93db0159f", tienePeso:true},
{nombre:"Extensión Nuca", series:"3 x 12", instrucciones:"1. Sentado, mancuerna a dos manos.\n2. Sube y baja detrás de la nuca.\n3. Codas pegados a orejas.", consejo:"No abuses del peso.", peso:"~5.5 kg", imagen:"https://api.smartworkout.app/asset/image/6a79a439-417e-4fe9-8d83-0079e565389a", tienePeso:true}
],
jueves: [
{nombre:"Cardio", series:"30 min", instrucciones:"Caminata con inclinación.", consejo:"Ritmo constante.", peso:"Intensidad media", tienePeso:false},
{nombre:"Crunch", series:"4 x 20", instrucciones:"1. Tumbado, rodillas flexionadas.\n2. Manos tras cabeza.\n3. Eleva SOLO hombros.", consejo:"Movimiento pequeño.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/85e37877-a9d0-4fb6-93d1-e8c0931caed9", tienePeso:false},
{nombre:"Toques talón", series:"3 x 20", instrucciones:"1. Tumbado, rodillas flexionadas.\n2. Eleva hombros.\n3. Alterna tocando talones.", consejo:"Muévete rápido.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/bc90a160-cf28-49ff-ab43-60a01086d62f", tienePeso:false}
],
viernes: [
{nombre:"Sentadillas", series:"4 x 12", instrucciones:"1. Barra en trapecios.\n2. Baja como sentarte.\n3. Pecho arriba, espalda recta.\n4. Sube apretando glúteos.", consejo:"Empieza sin peso.", peso:"~20 kg", imagen:"https://api.smartworkout.app/asset/image/7937ce6b-b8cd-418c-a71c-aa8f4ecb3635", tienePeso:true},
{nombre:"Peso Muerto Rumano", series:"4 x 15", instrucciones:"1. Mancuernas a los lados.\n2. Baja el trasero hacia atrás.\n3. Siente isquios.\n4. Sube apretando glúteos.", consejo:"Movimiento de cadera.", peso:"~5.5 kg", imagen:"https://api.smartworkout.app/asset/image/7fa791dd-b202-4a33-a55b-ede33ac9ba8f", tienePeso:true},
{nombre:"Press Militar", series:"4 x 10", instrucciones:"1. Sentado con respaldo.\n2. Sube por encima cabeza.\n3. Aprieta hombros.", consejo:"Usa respaldo.", peso:"~6.5 kg", imagen:"https://api.smartworkout.app/asset/image/ea0950f5-a1f1-4982-886a-9c2ffbcf0f89", tienePeso:true},
{nombre:"Elevaciones Laterales", series:"3 x 15", instrucciones:"1. De pie, mancuernas a los lados.\n2. Sube hasta hombros.\n3. Baja controlado.", consejo:"MUY POCO PESO.", peso:"~3 kg", imagen:"https://api.smartworkout.app/asset/image/32c6f15d-63ef-4bd6-ae6b-0056c26157fc", tienePeso:true}
],
sabado: [
{nombre:"Cardio", series:"30 min", instrucciones:"Actividad libre.", consejo:"Disfruta.", peso:"Moderado", tienePeso:false},
{nombre:"Escaladores", series:"3 x 30 seg", instrucciones:"1. Plancha alta.\n2. Alterna rodillas al pecho rápido.\n3. Cadera baja.", consejo:"Ve a tope.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/5571abe1-227c-4fff-b7b6-9a365284a50d", tienePeso:false},
{nombre:"V-Ups", series:"3 x 15", instrucciones:"1. Tumbado, brazos atrás.\n2. Sube pierna y brazo contrario.\n3. Toca pie con mano.", consejo:"Dobla rodilla al principio.", peso:"Peso corporal", imagen:"https://api.smartworkout.app/asset/image/902e6c32-2f9a-4466-9e42-cc8a3c9eb498", tienePeso:false}
]
};

// VARIABLES GLOBALES
let checks = JSON.parse(localStorage.getItem('nico_checks')) || {};
let notas = JSON.parse(localStorage.getItem('nico_notas')) || {};
let pesosRegistrados = JSON.parse(localStorage.getItem('nico_pesos')) || [{valor:82, fecha:'20/04'}];
let rachaActual = parseInt(localStorage.getItem('nico_racha')) || 18;
let ultimaFechaRacha = localStorage.getItem('nico_ultima_fecha_racha') || '';
let ultimoResetSemana = localStorage.getItem('nico_ultimo_reset') || '';
let rachaDiasCompletados = JSON.parse(localStorage.getItem('nico_dias_completados')) || [];
let notificacionesActivas = {bd:true, r1:true, r2:true, tab:true, res:true, se:true};
let permisosNotificaciones = false;
let intervalosNotificaciones = [];
let intervalDescanso = null;
let discosActuales = {d125:0, d15:0, d2:0};
let ejercicioDiscoActual = null;
let timerInterval = null;
const fechaDejarFumar = new Date(2026, 1, 22);

// DÍAS SIN FUMAR
function calcularDiasSinFumar() {
    const hoy = new Date();
    let meses = hoy.getMonth() - fechaDejarFumar.getMonth();
    let dias = hoy.getDate() - fechaDejarFumar.getDate();
    if (dias < 0) { meses--; const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0); dias += mesAnterior.getDate(); }
    if (meses < 0) meses += 12;
    const totalDias = Math.floor((hoy - fechaDejarFumar) / (1000 * 60 * 60 * 24));
    let texto = "";
    if (meses > 0) texto += `${meses} mes${meses !== 1 ? 'es' : ''} `;
    texto += `${dias} día${dias !== 1 ? 's' : ''}`;
    return { total: totalDias >= 0 ? totalDias : 0, texto: texto };
}

function actualizarDiasSinFumar() {
    const { total, texto } = calcularDiasSinFumar();
    document.getElementById('diasSinFumar').innerHTML = total;
    document.getElementById('mesesSinFumar').innerHTML = `🚭 ${texto}`;
}
// RACHA CORREGIDA
function sumarRachaSiCorresponde(dia) {
    const hoy = new Date().toDateString();
    if (ultimaFechaRacha === hoy) {
        mostrarToast(`🎉 ¡Completaste ${dia}! Ya sumaste racha hoy. ¡Mañana más!`);
        return false;
    }
    if (rachaDiasCompletados.includes(dia)) return false;
    
    rachaActual++;
    ultimaFechaRacha = hoy;
    rachaDiasCompletados.push(dia);
    
    localStorage.setItem('nico_racha', rachaActual);
    localStorage.setItem('nico_ultima_fecha_racha', ultimaFechaRacha);
    localStorage.setItem('nico_dias_completados', JSON.stringify(rachaDiasCompletados));
    
    // CONFETI
    if (typeof canvasConfetti !== 'undefined') {
        canvasConfetti({ particleCount: 300, spread: 100, origin: { y: 0.6 }, startVelocity: 25 });
        setTimeout(() => canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.5, x: 0.2 }, startVelocity: 20 }), 150);
        setTimeout(() => canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.5, x: 0.8 }, startVelocity: 20 }), 300);
    }
    
    mostrarToast(`🎉🔥 +1 RACHA! Ahora tienes ${rachaActual} días 🔥🎉`);
    actualizarHome();
    return true;
}

// NOTIFICACIONES
function activarNotificaciones() {
    if (!('Notification' in window)) { mostrarToast("❌ Tu navegador no soporta notificaciones"); return; }
    Notification.requestPermission().then(permiso => {
        if (permiso === 'granted') { permisosNotificaciones = true; mostrarToast("✅ Notificaciones activadas"); programarNotificaciones(); }
        else mostrarToast("❌ Permiso denegado");
    });
}

function enviarNotificacion(tit, msg) { 
    if (permisosNotificaciones) new Notification(tit, { body: msg, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ff6600'/%3E%3Ctext x='50' y='68' font-size='50' text-anchor='middle' fill='white'%3E🏋️%3C/text%3E%3C/svg%3E" }); 
}

function testNotificacion() { 
    if (permisosNotificaciones) { new Notification("🔔 PRUEBA", { body: "¡Notificación funcionando!" }); mostrarToast("✅ Prueba enviada"); } 
    else mostrarToast("❌ Activa notificaciones primero"); 
}

function programarNotificacion(msg, h, m, dias, repetir = true) {
    const ahora = new Date();
    const objetivo = new Date();
    objetivo.setHours(h - 2, m, 0, 0);
    if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1);
    const id = setTimeout(() => {
        const diaActual = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][new Date().getDay()];
        if (dias.includes(diaActual)) enviarNotificacion("NICO GYM", msg);
        if (repetir) programarNotificacion(msg, h, m, dias, repetir);
    }, objetivo - ahora);
    return id;
}

function programarNotificaciones() {
    if (!permisosNotificaciones) return;
    intervalosNotificaciones.forEach(id => clearTimeout(id));
    intervalosNotificaciones = [];
    const { texto } = calcularDiasSinFumar();
    const rutina = getRutinaHoy();
    intervalosNotificaciones.push(programarNotificacion("🔔 PRUEBA - ¡Notificación funcionando!", 20, 0, ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'], false));
    if (notificacionesActivas.bd) intervalosNotificaciones.push(programarNotificacion(`🌞 Buenos días. Hoy: ${rutina}`, 8, 0, ['lunes','martes','miercoles','jueves','viernes']));
    if (notificacionesActivas.r1) intervalosNotificaciones.push(programarNotificacion(`💪 ¡Hora de entrenar! Hoy: ${rutina}`, 18, 30, ['lunes','martes','miercoles','jueves','viernes']));
    if (notificacionesActivas.r2) intervalosNotificaciones.push(programarNotificacion(`⏰ ${texto} sin fumar. ¿Entrenaste?`, 19, 0, ['lunes','martes','miercoles','jueves','viernes']));
    if (notificacionesActivas.tab) intervalosNotificaciones.push(programarNotificacion(`🚭 ${texto} sin fumar, ¡eres increíble!`, 10, 0, ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']));
    if (notificacionesActivas.res) intervalosNotificaciones.push(programarNotificacion(`📊 Resumen semanal: Racha ${rachaActual} días`, 20, 0, ['domingo']));
    if (notificacionesActivas.se) intervalosNotificaciones.push(programarNotificacion(`⚠️ Aún no has entrenado hoy`, 21, 0, ['lunes','martes','miercoles','jueves','viernes']));
    mostrarToast("✅ Notificaciones programadas");
}

function toggleNotif(tipo) {
    const toggle = document.getElementById(`toggle-${tipo}`);
    notificacionesActivas[tipo] = !notificacionesActivas[tipo];
    toggle.classList.toggle('active', notificacionesActivas[tipo]);
    localStorage.setItem('nico_notif_activas', JSON.stringify(notificacionesActivas));
    programarNotificaciones();
}

// UTILIDADES
function mostrarToast(m) { const t = document.createElement('div'); t.className = 'toast-msg'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 3000); }
function getDiaNombre() { return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date().getDay()]; }
function getRutinaHoy() { const dia = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][new Date().getDay()]; const r = { lunes:'Espalda/Bíceps', martes:'Cardio/Abs', miercoles:'Pecho/Tríceps', jueves:'Cardio/Abs', viernes:'Pierna/Hombro', sabado:'Cardio/Abs', domingo:'Descanso' }; return r[dia] || 'Descanso'; }
function toggleSubmenu(b) { b.classList.toggle('open'); b.nextElementSibling.classList.toggle('show'); }
function openMenu() { document.getElementById('menu-lat').classList.add('open'); document.getElementById('overlay').style.display = 'block'; }
function closeMenu() { document.getElementById('menu-lat').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
function go(id) { document.querySelectorAll('.seccion').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); if (id === 'home') actualizarHome(); window.scrollTo(0,0); closeMenu(); }
function goToday() { const hoy = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][new Date().getDay()]; if (hoy !== 'domingo') go(hoy); else go('domingo'); }

function actualizarHome() {
    document.getElementById('racha').innerText = rachaActual;
    actualizarDiasSinFumar();
    const total = Object.values(ejercicios).reduce((s,d) => s + d.length, 0);
    const hechos = Object.values(checks).filter(v => v === true).length;
    const pct = Math.min(Math.round((hechos / total) * 100), 100);
    document.getElementById('perc').innerText = pct + "%";
    const ctx = document.getElementById('grafico').getContext('2d');
    if (window.miGrafico) window.miGrafico.destroy();
    window.miGrafico = new Chart(ctx, { type:'line', data:{ labels:pesosRegistrados.map(p => p.fecha), datasets:[{ data:pesosRegistrados.map(p => p.valor), borderColor:'#ff6600', borderWidth:3, tension:0.3, fill:true, backgroundColor:'rgba(255,102,0,0.1)', pointBackgroundColor:'#ff6600', pointRadius:4 }] }, options:{ maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ grid:{ color:'#333' } }, x:{ grid:{ color:'#333' } } } } });
    document.getElementById('todayDay').innerHTML = `📅 HOY ES ${getDiaNombre().toUpperCase()}`;
    document.getElementById('todayRoutine').innerHTML = getRutinaHoy();
}

function borrarTodo() { if (confirm("¿Borrar todos los datos?")) { localStorage.clear(); location.reload(); } }

// TEMPORIZADORES
function abrirTimer() { document.getElementById('timer-box').style.display = 'flex'; }
function cerrarTimer() { if (timerInterval) clearInterval(timerInterval); document.getElementById('timer-box').style.display = 'none'; }
function iniciarTimer() { let s = 60; document.getElementById('t-num').innerText = s; if (timerInterval) clearInterval(timerInterval); timerInterval = setInterval(() => { s--; document.getElementById('t-num').innerText = s; if (s <= 0) { clearInterval(timerInterval); cerrarTimer(); mostrarToast("⏰ ¡TIEMPO!"); } }, 1000); }
function abrirSelectorDescanso() { document.getElementById('descansoSelector').classList.add('show'); }
function cerrarSelectorDescanso() { document.getElementById('descansoSelector').classList.remove('show'); }
function iniciarDescanso(seg) { cerrarSelectorDescanso(); const box = document.getElementById('descanso-box'); const num = document.getElementById('descansoTimer'); num.innerText = seg; box.style.display = 'flex'; if (intervalDescanso) clearInterval(intervalDescanso); intervalDescanso = setInterval(() => { seg--; num.innerText = seg; if (seg <= 0) { clearInterval(intervalDescanso); box.style.display = 'none'; mostrarToast("⏰ DESCANSO TERMINADO"); } }, 1000); }
function cancelarDescanso() { if (intervalDescanso) clearInterval(intervalDescanso); document.getElementById('descanso-box').style.display = 'none'; }

// CALCULADORA DISCOS
function abrirCalc(id) { ejercicioDiscoActual = id; const g = localStorage.getItem(`discos_${id}`); if (g) discosActuales = JSON.parse(g); else discosActuales = { d125:0, d15:0, d2:0 }; actualizarMostrarDiscos(); document.getElementById('calcModal').classList.add('show'); }
function cerrarCalc() { document.getElementById('calcModal').classList.remove('show'); }
function sumarDisco(p) { const clave = p === 1.25 ? 'd125' : (p === 1.5 ? 'd15' : 'd2'); if (discosActuales[clave] < 4) { discosActuales[clave]++; actualizarMostrarDiscos(); if (ejercicioDiscoActual) localStorage.setItem(`discos_${ejercicioDiscoActual}`, JSON.stringify(discosActuales)); } else mostrarToast(`Máximo 4 discos de ${p}kg`); }
function resetearDiscos() { discosActuales = { d125:0, d15:0, d2:0 }; actualizarMostrarDiscos(); if (ejercicioDiscoActual) localStorage.setItem(`discos_${ejercicioDiscoActual}`, JSON.stringify(discosActuales)); }
function actualizarMostrarDiscos() { const total = (discosActuales.d125 * 1.25) + (discosActuales.d15 * 1.5) + (discosActuales.d2 * 2); document.getElementById('totalDisco').innerText = total.toFixed(2); document.getElementById('badge125').innerText = discosActuales.d125; document.getElementById('badge15').innerText = discosActuales.d15; document.getElementById('badge2').innerText = discosActuales.d2; }

// PESO CORPORAL
function agregarPeso() { const v = document.getElementById('in-peso').value; if (v && !isNaN(v)) { pesosRegistrados.push({ valor: parseFloat(v), fecha: new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit' }) }); localStorage.setItem('nico_pesos', JSON.stringify(pesosRegistrados)); document.getElementById('in-peso').value = ''; actualizarHome(); mostrarHistorialPeso(); mostrarToast(`✅ Peso: ${v}kg`); } }
function eliminarPeso(i) { if (confirm("¿Borrar?")) { pesosRegistrados.splice(i,1); localStorage.setItem('nico_pesos', JSON.stringify(pesosRegistrados)); actualizarHome(); mostrarHistorialPeso(); } }
function mostrarHistorialPeso() { const h = document.getElementById('hist-peso'); if (!h) return; h.innerHTML = [...pesosRegistrados].reverse().map((p,i) => `<div class="peso-item"><span>${p.fecha}: <b>${p.valor}kg</b></span><button class="btn-del" onclick="eliminarPeso(${i})">🗑️</button></div>`).join(''); }

// RENDERIZAR RUTINAS
function renderizarRutinas() {
    for (const dia in ejercicios) {
        const lista = document.getElementById(`list-${dia}`);
        if (!lista) continue;
        lista.innerHTML = ejercicios[dia].map((ex, idx) => {
            const id = `${dia}-${idx}`;
            return `<div class="card"><div style="display:flex; justify-content:space-between; align-items:center"><div style="flex:1"><div class="ex-header"><span class="ex-title">${ex.nombre}</span><div class="ex-buttons">${ex.tienePeso ? `<span class="calc-icon" onclick="abrirCalc('${id}')">🏋️ CALCULAR</span>` : ''}<span class="descanso-icon" onclick="abrirSelectorDescanso()">⏱️ DESCANSAR</span></div></div><span class="ex-reps">${ex.series}</span></div><input type="checkbox" class="check-box" ${checks[id] ? 'checked' : ''} onchange="marcarCheck('${dia}', ${idx}, this.checked)"></div><input type="number" class="input-nota" step="0.5" placeholder="Peso real (kg)..." value="${notas[id] || ''}" onchange="guardarNota('${id}', this.value)"><button class="btn-main" onclick="document.getElementById('det-${id}').classList.toggle('show')">📋 VER INSTRUCCIONES ▾</button><div class="detalles" id="det-${id}">${ex.imagen ? `<img src="${ex.imagen}" class="ex-img" loading="lazy" onerror="this.style.display='none'">` : ''}<div style="background:#0a0a0a; padding:8px; border-radius:8px; margin:8px 0"><strong>📝 CÓMO HACERLO:</strong><br>${ex.instrucciones.replace(/\n/g, '<br>')}</div><p style="color:#32d74b">💡 CONSEJO: ${ex.consejo}</p><p style="color:#ff6600">⚖️ ${ex.peso}</p></div></div>`;
        }).join('');
    }
}

function marcarCheck(dia, idx, valor) {
    const id = `${dia}-${idx}`;
    checks[id] = valor;
    localStorage.setItem('nico_checks', JSON.stringify(checks));
    const todos = ejercicios[dia].every((_, i) => checks[`${dia}-${i}`] === true);
    if (todos) sumarRachaSiCorresponde(dia);
    actualizarHome();
}

function guardarNota(id, valor) { if (valor && valor !== '') notas[id] = valor; else delete notas[id]; localStorage.setItem('nico_notas', JSON.stringify(notas)); }

// RESET SEMANAL AUTO
function resetSemanalAuto() {
    const hoy = new Date();
    const numSemana = `${hoy.getFullYear()}-${Math.floor((hoy - new Date(hoy.getFullYear(), 0, 1)) / 86400000 / 7)}`;
    if (hoy.getDay() === 1 && ultimoResetSemana !== numSemana) {
        checks = {};
        rachaDiasCompletados = [];
        localStorage.setItem('nico_checks', JSON.stringify(checks));
        localStorage.setItem('nico_dias_completados', JSON.stringify(rachaDiasCompletados));
        ultimoResetSemana = numSemana;
        localStorage.setItem('nico_ultimo_reset', ultimoResetSemana);
        renderizarRutinas();
        actualizarHome();
        mostrarToast("🔄 LUNES - Nueva semana lista para entrenar!");
    }
}

// INICIALIZACIÓN
const notifGuardadas = localStorage.getItem('nico_notif_activas');
if (notifGuardadas) notificacionesActivas = JSON.parse(notifGuardadas);
for (let t in notificacionesActivas) {
    const toggle = document.getElementById(`toggle-${t}`);
    if (toggle && notificacionesActivas[t]) toggle.classList.add('active');
}
if ('Notification' in window && Notification.permission === 'granted') { permisosNotificaciones = true; programarNotificaciones(); }
window.onload = () => { resetSemanalAuto(); renderizarRutinas(); actualizarHome(); mostrarHistorialPeso(); };
