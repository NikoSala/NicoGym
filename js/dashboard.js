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
                <div class="saludo">${saludo}, <span>${STATE.nombre}</span></div>
                <div class="saludo-dia">${UI.getDiaSemanaNombre(hoy)} · ${hoy.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</div>

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
};
