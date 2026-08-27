// ==========================================
// DASHBOARD
// ==========================================
const Dashboard = {
  render() {
    const c = document.getElementById("dashboardContainer");
    if (!c) return;

    const hoy = new Date();
    const horas = hoy.getHours();
    let saludo = "Buenos días";
    if (horas >= 14 && horas < 21) saludo = "Buenas tardes";
    if (horas >= 21 || horas < 6) saludo = "Buenas noches";

    const dia = UI.getDiaNombre();
    const rutinaNombre = CONFIG.TIPOS_RUTINA[dia];
    const entrenadoHoy = STATE.diasEntrenados.includes(UI.getHoy());
    const ejercicios = getEjerciciosPorDia(dia);
    const rutinaNombreActualizada = CONFIG.TIPOS_RUTINA[dia];

    const peso =
      STATE.mediciones.length > 0
        ? STATE.mediciones[STATE.mediciones.length - 1].peso
        : "--";
    const obj = CONFIG.PESO_OBJETIVO;
    let pctObjetivo = 0;
    if (STATE.mediciones.length > 0) {
      const primero = STATE.mediciones[0].peso;
      const ultimo = STATE.mediciones[STATE.mediciones.length - 1].peso;
      const total = primero - obj;
      if (total > 0)
        pctObjetivo = Math.min(
          100,
          Math.round(((primero - ultimo) / total) * 100),
        );
    }

    let racha = 0;
    let h = new Date();
    for (let i = 0; i < 100; i++) {
      let f = new Date(h);
      f.setDate(h.getDate() - i);
      if (STATE.diasEntrenados.includes(UI.formatFecha(f))) racha++;
      else break;
    }

    let ultimoEntreno = "Nunca";
    if (STATE.diasEntrenados.length > 0) {
      const ultimo = [...STATE.diasEntrenados].sort().reverse()[0];
      const diff = Math.round((new Date() - new Date(ultimo)) / 86400000);
      if (diff === 0) ultimoEntreno = "Hoy";
      else if (diff === 1) ultimoEntreno = "Ayer";
      else if (diff < 7) ultimoEntreno = `Hace ${diff} días`;
      else ultimoEntreno = UI.formatearFecha(ultimo);
    }

    let ultimaMedicion = "Nunca";
    if (STATE.mediciones.length > 0) {
      const ultima = STATE.mediciones[STATE.mediciones.length - 1];
      const diff = Math.round((new Date() - new Date(ultima.fecha)) / 86400000);
      if (diff === 0) ultimaMedicion = "Hoy";
      else if (diff === 1) ultimaMedicion = "Ayer";
      else if (diff < 7) ultimaMedicion = `Hace ${diff} días`;
      else ultimaMedicion = UI.formatearFecha(ultima.fecha);
    }

    const entrenamientoPendiente = STATE.entrenamientoPendiente;
    const diaHoy = UI.getDiaNombre();

    const hayEntrenamientoPendiente =
      entrenamientoPendiente &&
      entrenamientoPendiente.dia === diaHoy &&
      Array.isArray(entrenamientoPendiente.ejerciciosEntreno) &&
      entrenamientoPendiente.ejerciciosEntreno.length > 0;
    const progresionDia = STATE.progresion[dia] || null;

    const recomendacionesProximaSesion =
      progresionDia && Array.isArray(progresionDia.recomendaciones)
        ? progresionDia.recomendaciones
        : [];

    let bloqueProgresion = "";

    if (recomendacionesProximaSesion.length > 0) {
      bloqueProgresion = `
        <div class="card progreso-sesion-card">
        <div class="card-title">🎯 Objetivo próxima sesión</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">
            Basado en tu último entrenamiento
        </div>
        <div>
            ${recomendacionesProximaSesion
              .map(
                (r) => `
                <div style="padding:7px 0;border-bottom:1px solid var(--border);">
                    <div style="font-weight:600;font-size:13px;">
                    ${r.nombre}
                    </div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">
                    ${r.texto}
                    </div>
                </div>
                `,
              )
              .join("")}
        </div>
        </div>
    `;
    }

    const ejerciciosHoy = getEjerciciosPorDia(diaHoy);

    let ejerciciosCompletadosHoy = 0;

    if (Array.isArray(ejerciciosHoy) && STATE.checks) {
      ejerciciosHoy.forEach((_, idx) => {
        if (STATE.checks[`${diaHoy}-${idx}`] === true) {
          ejerciciosCompletadosHoy++;
        }
      });
    }

    const totalEjerciciosHoy = Array.isArray(ejerciciosHoy)
      ? ejerciciosHoy.length
      : 0;
    let mensajeProgreso = "";

    if (
      totalEjerciciosHoy > 0 &&
      ejerciciosCompletadosHoy > 0 &&
      !entrenadoHoy
    ) {
      if (ejerciciosCompletadosHoy >= totalEjerciciosHoy - 1) {
        mensajeProgreso = "⚡ Último esfuerzo";
      } else {
        mensajeProgreso = `🔥 ${ejerciciosCompletadosHoy} de ${totalEjerciciosHoy} ejercicios`;
      }
    }

    const nombresDias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const etiquetasDias = ["L", "M", "X", "J", "V", "S", "D"];
    const frasesMotivadoras = [
      "La constancia de hoy construye tu fuerza de mañana.",
      "Un paso más también cuenta.",
      "Entrena con intención, descansa con orgullo.",
      "Tu mejor marca empieza con una decisión.",
      "No necesitas hacerlo perfecto, sólo seguir avanzando.",
      "Cada repetición suma.",
      "Hazlo por la persona en la que te estás convirtiendo.",
    ];
    const fraseMotivadora = frasesMotivadoras[hoy.getDay() === 0 ? 6 : hoy.getDay() - 1];
    const inicioSemana = new Date(hoy);
    inicioSemana.setHours(0, 0, 0, 0);
    inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const diasSemana = nombresDias.map((diaNombre, indice) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + indice);
      const fechaKey = UI.formatFecha(fecha);
      const descanso = indice > 4;
      const completado = STATE.diasEntrenados.includes(fechaKey);
      return { diaNombre, etiqueta: etiquetasDias[indice], fechaKey, descanso, completado, esHoy: fechaKey === UI.getHoy() };
    });
    // --- NUEVO: Calcular consistencia considerando días especiales ---
    const diasExentos = diasSemana.filter(diaSemana => {
      const estado = STATE.diasEspeciales?.[diaSemana.fechaKey];
      return estado === 'vacaciones' || estado === 'lesionado';
    }).length;
    
    const entrenamientosObjetivoSemana = Math.max(1, 5 - diasExentos);
    const entrenamientosSemana = diasSemana.filter((diaSemana) => diaSemana.completado).length;
    const porcentajeConsistencia = Math.min(100, Math.round((entrenamientosSemana / entrenamientosObjetivoSemana) * 100));
    
    let semaforo;
    if (diasExentos > 0) {
      semaforo = { clase: "amarillo", titulo: "Semana ajustada", texto: `${diasExentos} día(s) marcado(s) como exento(s)` };
    } else {
      semaforo = porcentajeConsistencia >= 80
        ? { clase: "verde", titulo: "Buen ritmo", texto: "Vas cumpliendo la semana" }
        : porcentajeConsistencia >= 50
          ? { clase: "amarillo", titulo: "Puedes remontar", texto: "Todavía estás a tiempo" }
          : { clase: "rojo", titulo: "Semana pendiente", texto: "Empieza con el entrenamiento de hoy" };
    }

    const bloqueSemana = `
      <section class="inicio-semana-grid">
        <div class="card inicio-semaforo-card semaforo-${semaforo.clase}">
          <div class="inicio-panel-kicker">ESTADO DE LA SEMANA</div>
          <div class="semaforo-main"><span class="semaforo-luz"></span><div><strong>${semaforo.titulo}</strong><span>${semaforo.texto}</span></div></div>
          <div class="semaforo-track"><span style="width:${porcentajeConsistencia}%"></span></div>
          <div class="semaforo-foot"><span>${porcentajeConsistencia}% de consistencia</span><span>${entrenamientosSemana}/${entrenamientosObjetivoSemana} entrenos</span></div>
        </div>
        <div class="card consistencia-card">
          <div class="card-title">📈 Consistencia</div>
          <div class="consistencia-number">${entrenamientosSemana}<small>/5</small></div>
          <div class="consistencia-label">entrenamientos esta semana</div>
          <div class="consistencia-streak">🔥 Racha actual: <strong>${racha} días</strong></div>
        </div>
      </section>
      <section class="card tu-semana-card">
        <div class="card-title"><span>🗓️ Tu Semana</span><button class="text-action" onclick="APP.navegar('semana')">Ver rutina</button></div>
        <div class="tu-semana-days">
          ${diasSemana.map((diaSemana) => `
            <button class="tu-semana-day ${diaSemana.esHoy ? "actual" : ""} ${diaSemana.completado ? "hecho" : ""} ${diaSemana.descanso ? "descanso" : ""}" onclick="${diaSemana.descanso ? "" : `APP.navegar('rutinas')`}">
              <span>${diaSemana.etiqueta}</span><strong>${diaSemana.descanso ? "·" : diaSemana.completado ? "✓" : "○"}</strong>
            </button>
          `).join("")}
        </div>
        <div class="tu-semana-caption">${entrenamientosSemana >= 5 ? "Semana completada" : `Te quedan ${Math.max(0, 5 - entrenamientosSemana)} entrenamientos previstos`}</div>
      </section>
    `;

    const accionesRapidas = `
      <div class="inicio-acciones-rapidas" aria-label="Acciones rápidas">
        <button class="accion-rapida" onclick="${dia === "sabado" || dia === "domingo" ? "APP.navegar('semana')" : `APP.iniciarEntreno('${dia}')`}">
          <span class="accion-icono">▶</span>
          <span class="accion-texto">${dia === "sabado" || dia === "domingo" ? "Plan" : "Entrenar"}</span>
        </button>
        <button class="accion-rapida" onclick="APP.navegar('peso')">
          <span class="accion-icono">⚖</span>
          <span class="accion-texto">Peso</span>
        </button>
        <button class="accion-rapida" onclick="APP.navegar('fotos')">
          <span class="accion-icono">▣</span>
          <span class="accion-texto">Foto</span>
        </button>
        <button class="accion-rapida" onclick="APP.navegar('semana')">
          <span class="accion-icono">☷</span>
          <span class="accion-texto">Rutina</span>
        </button>
      </div>
    `;
    
    // ===== MINI CALENDARIO =====
    const miniCalendario = this._renderMiniCalendario();
    
    // ===== BANNER DE ACTUALIZACIÓN =====
    const tipoActualizacion = APP.obtenerTipoActualizacion();
    let updateBanner = "";
    const hoyStr = UI.getHoy();

    if (tipoActualizacion === "completa") {
      updateBanner = `
                        <div class="update-banner">
                            <div class="ub-titulo">📊 Actualización completa — Peso + Mediciones + Fotos</div>
                            <div class="ub-descripcion">Hoy es domingo de actualización completa. Registra todos tus datos.</div>
                            <div class="ub-boton">
                                <button class="btn btn-primary btn-block btn-sm" onclick="APP.navegar('peso')">
                                    <i class="fa-solid fa-scale-balanced"></i> Ir a mediciones
                                </button>
                            </div>
                        </div>
                    `;
    } else if (tipoActualizacion === "mediciones") {
      updateBanner = `
                        <div class="update-banner mediciones">
                            <div class="ub-titulo">📊 Actualización de mediciones — Peso + Mediciones</div>
                            <div class="ub-descripcion">Hoy actualiza peso y mediciones. Las fotos se conservan.</div>
                            <div class="ub-boton">
                                <button class="btn btn-primary btn-block btn-sm" onclick="APP.navegar('peso')" style="background:var(--primary);border-color:var(--primary);color:#fff;">
                                    <i class="fa-solid fa-scale-balanced"></i> Ir a mediciones
                                </button>
                            </div>
                        </div>
                    `;
    } else if (tipoActualizacion === "solo-peso") {
      updateBanner = `
                        <div class="update-banner peso">
                            <div class="ub-titulo">📊 Actualización semanal — Solo peso</div>
                            <div class="ub-descripcion">Hoy solo debes registrar tu peso. Mediciones y fotos se conservan.</div>
                            <div class="ub-boton">
                                <button class="btn btn-primary btn-block btn-sm" onclick="APP.navegar('peso')" style="background:var(--text-muted);border-color:var(--text-muted);">
                                    <i class="fa-solid fa-scale-balanced"></i> Registrar peso
                                </button>
                            </div>
                        </div>
                    `;
    }

    c.innerHTML = `
                <div class="saludo-header">
                    <div class="saludo-info">
                        <div class="saludo">${saludo}, <span>${STATE.nombre}</span></div>
                        <div class="saludo-dia">${UI.getDiaSemanaNombre(hoy)} · ${hoy.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</div>
                        <div class="frase-motivadora">${fraseMotivadora}</div>
                    </div>
                    ${miniCalendario}
                </div>
                <div class="inicio-acciones-layout">
                    ${accionesRapidas}
                </div>
                ${bloqueSemana}

                ${
                  hayEntrenamientoPendiente
                    ? `
                            <div class="proximo-entreno-card entrenamiento-pausado">
                                <div class="pe-titulo">⏸️ ENTRENAMIENTO PAUSADO</div>
                                <div class="pe-nombre">
                                    💪 ${CONFIG.NOMBRES_DIAS[entrenamientoPendiente.dia] || entrenamientoPendiente.dia}
                                </div>
                                <div class="pe-datos">
                                    <span>▶️ Puedes continuar donde lo dejaste</span>
                                </div>
                                <button class="pe-btn" onclick="APP.iniciarEntreno('${entrenamientoPendiente.dia}')">
                                    <i class="fa-solid fa-play"></i> Reanudar entrenamiento
                                </button>
                            </div>
                        `
                    : dia === "sabado" || dia === "domingo"
                      ? `
                                <div class="proximo-entreno-card">
                                    <div class="pe-titulo">😌 DESCANSO</div>
                                    <div class="pe-nombre">
                                        Hoy toca recuperar
                                    </div>
                                    <div class="pe-datos">
                                        <span>🛌 Sábado y domingo · descanso</span>
                                    </div>
                                </div>
                            `
                      : `
                                <div class="proximo-entreno-card">
                                    <div class="pe-titulo">💪 HOY</div>
                                    <div class="pe-nombre">
                                        ${CONFIG.TIPOS_RUTINA[dia]}
                                    </div>
                                    <div class="pe-datos">
                                        <span>🏋️ ${getEjerciciosPorDia(dia).length} ejercicios</span>
                                    </div>
                                    <button class="pe-btn" onclick="APP.iniciarEntreno('${dia}')">
                                        <i class="fa-solid fa-play"></i> Comenzar entrenamiento
                                    </button>
                                </div>
                            `
                }

                ${updateBanner}
                ${
                  mensajeProgreso
                    ? `
                        <div class="card progreso-sesion-card">
                            <div class="card-title">💪 Progreso de hoy</div>
                            <div style="font-size:18px;font-weight:700;margin-top:4px;">
                                ${mensajeProgreso}
                            </div>
                            <div style="font-size:11px;color:var(--text-secondary);margin-top:3px;">
                                ${ejerciciosCompletadosHoy}/${totalEjerciciosHoy} ejercicios completados
                            </div>
                        </div>
                        `
                    : ""
                }
                ${bloqueProgresion}
                
                     <div class="card card-accent">
                    <div class="card-title">📊 Resumen</div>
                    <div class="dash-grid">
                        <div class="dash-stat">
                            <div class="num primary">${peso}</div>
                            <div class="label">Peso (kg)</div>
                        </div>
                        <div class="dash-stat">
                            <div class="num green">${pctObjetivo}%</div>
                            <div class="label">Objetivo</div>
                        </div>
                    </div>
                </div>
            `;
  },

  // ==========================================
  // MINI CALENDARIO
  // ==========================================
    _renderMiniCalendario() {
    const hoy = new Date();
    const mes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const primerDia = (mes.getDay() + 6) % 7;
    const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const totalCeldas = Math.ceil((primerDia + diasMes) / 7) * 7;
    
    const nombreMes = mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    
    let celdas = "";
    for (let i = 0; i < totalCeldas; i++) {
      const numero = i - primerDia + 1;
      if (numero < 1 || numero > diasMes) {
        celdas += '<div class="mini-cal-empty"></div>';
        continue;
      }
      
      const fecha = new Date(mes.getFullYear(), mes.getMonth(), numero);
      const fechaKey = UI.formatFecha(fecha);
      const esHoy = fechaKey === UI.getHoy();
      const estadoEspecial = STATE.diasEspeciales?.[fechaKey];
      const completado = STATE.diasEntrenados.includes(fechaKey);
      
      let clase = "mini-cal-day";
      if (esHoy) clase += " mini-cal-hoy";
      if (estadoEspecial === 'vacaciones') clase += " mini-cal-vacaciones";
      if (estadoEspecial === 'lesionado') clase += " mini-cal-lesionado";
      if (completado) clase += " mini-cal-completado";
      
      celdas += `
        <button class="${clase}" onclick="APP.navegar('agenda'); setTimeout(() => Agenda.seleccionar('${fechaKey}'), 100);">
          ${numero}
        </button>
      `;
    }
    
    return `
      <div class="mini-calendario-card" onclick="APP.navegar('agenda')">
        <div class="mini-cal-header">
          <span>📅 ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</span>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
        <div class="mini-cal-grid">
          <span class="mini-cal-weekday">L</span><span class="mini-cal-weekday">M</span><span class="mini-cal-weekday">X</span><span class="mini-cal-weekday">J</span><span class="mini-cal-weekday">V</span><span class="mini-cal-weekday">S</span><span class="mini-cal-weekday">D</span>
          ${celdas}
        </div>
      </div>
    `;
  },
};