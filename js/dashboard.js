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
    const rutinaNombre = CONFIG.TIPOS_RUTINA[dia] || "Descanso";
    const entrenadoHoy = STATE.diasEntrenados.includes(UI.getHoy());

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

    const diasMap = {
      0: "domingo",
      1: "lunes",
      2: "martes",
      3: "miercoles",
      4: "jueves",
      5: "viernes",
      6: "sabado",
    };
    let proxDia = null;
    let proxNombre = "";
    let proxIcono = "";
    let proxEjercicios = 0;
    let diasParaProx = 0;

    // Empezar por hoy. Si ya se completó, el recorrido continúa con
    // el siguiente día real de entrenamiento de la rutina semanal.
    for (let i = 0; i <= 7; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      const diaKey = diasMap[d.getDay()];
      const esDiaEntreno = diaKey !== "sabado" && diaKey !== "domingo";
      const yaCompletado =
        i === 0 && STATE.diasEntrenados.includes(UI.formatFecha(d));
      if (esDiaEntreno && !yaCompletado) {
        const ejercicios = getEjerciciosPorDia(diaKey);
        if (ejercicios.length > 0) {
          proxDia = diaKey;
          proxNombre = CONFIG.NOMBRES_DIAS[diaKey];
          const iconos = ["🔵", "🟢", "🟠", "🟣", "🔵"];
          const idx = [
            "lunes",
            "martes",
            "miercoles",
            "jueves",
            "viernes",
          ].indexOf(diaKey);
          proxIcono = idx >= 0 ? iconos[idx] : "💪";
          proxEjercicios = ejercicios.length;
          diasParaProx = i;
          break;
        }
      }
    }

    const notifs = Notificaciones.generar();

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

                    ${updateBanner}

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

                    ${
                      proxDia && diasParaProx <= 3
                        ? `
                        <div class="proximo-entreno-card" onclick="APP.navegar('rutinas')">
                            <div class="pe-titulo">${diasParaProx === 0 ? "🔵 HOY" : diasParaProx === 1 ? "🔴 MAÑANA" : "📅 PRÓXIMO ENTRENO"}</div>
                            <div class="pe-nombre">${proxIcono} ${proxNombre}</div>
                            <div class="pe-datos">
                                <span>📋 ${CONFIG.TIPOS_RUTINA[proxDia]}</span>
                                <span>🏋️ ${proxEjercicios} ejercicios</span>
                            </div>
                            <button class="pe-btn" onclick="event.stopPropagation();APP.iniciarEntreno('${proxDia}')">
                                <i class="fa-solid fa-play"></i> Comenzar
                            </button>
                        </div>
                    `
                        : `
                        <div class="card">
                            <div class="card-title">💪 Rutina de hoy</div>
                            ${
                              dia === "domingo" || dia === "sabado"
                                ? `
                                <div style="text-align:center;padding:6px 0;color:var(--text-secondary);">
                                    <span style="font-size:28px;display:block;margin-bottom:2px;">${dia === "sabado" ? "😌" : "😌"}</span>
                                    Día de descanso
                                </div>
                            `
                                : entrenadoHoy
                                  ? `
                                <div style="text-align:center;padding:6px 0;color:var(--success);">
                                    <span style="font-size:28px;display:block;margin-bottom:2px;">✅</span>
                                    Completado
                                    <div style="font-size:11px;color:var(--text-secondary);">${rutinaNombre}</div>
                                </div>
                            `
                                  : `
                                <div style="display:flex;align-items:center;justify-content:space-between;">
                                    <div>
                                        <div style="font-size:14px;font-weight:600;">${rutinaNombre}</div>
                                        <div style="font-size:11px;color:var(--text-secondary);">${getEjerciciosPorDia(dia).length} ejercicios</div>
                                    </div>
                                    <button class="btn btn-primary btn-sm" onclick="APP.iniciarEntreno('${dia}')"><i class="fa-solid fa-play"></i> Entrenar</button>
                                </div>
                            `
                            }
                        </div>
                    `
                    }

                    <div class="card">
                        <div class="card-title">📋 Último entrenamiento</div>
                        <div style="font-size:14px;font-weight:600;">${ultimoEntreno}</div>
                        ${racha > 0 ? `<div style="font-size:11px;color:var(--text-secondary);">🔥 Racha: ${racha} días</div>` : ""}
                    </div>

                    <div class="card">
                        <div class="card-title">📏 Última medición</div>
                        <div style="font-size:14px;font-weight:600;">${ultimaMedicion}</div>
                    </div>

                    ${
                      notifs.length > 0
                        ? `
                        <div class="card" style="border-left:3px solid var(--warning);">
                            <div class="card-title">🔔 Pendientes (${notifs.length})</div>
                            ${notifs
                              .map(
                                (n) => `
                                <div class="pending-item">
                                    <span class="pi-icon">${n.icono}</span>
                                    <span>${n.texto}</span>
                                </div>
                            `,
                              )
                              .join("")}
                            <div style="text-align:center;margin-top:6px;font-size:10px;color:var(--text-secondary);cursor:pointer;" onclick="APP.navegar('agenda')">Ver todas →</div>
                        </div>
                    `
                        : ""
                    }
                `;
  },
};
