// ==========================================
// NOTIFICACIONES
// ==========================================
const Notificaciones = {
  generar() {
    const notifs = [];
    const dia = UI.getDiaNombre();
    const entrenadoHoy = STATE.diasEntrenados.includes(UI.getHoy());

    const proximaActualizacion = APP.obtenerProximaActualizacion();
    const diasHasta = getDiasHasta(proximaActualizacion);
    const tipo = getTipoActualizacion(proximaActualizacion);

    const ultimoBackup = STATE.recordatorios?.ultimoBackup;
    const necesitaBackup = !ultimoBackup ||
      Date.now() - new Date(ultimoBackup).getTime() >= 30 * 86400000;

    if (necesitaBackup) {
      notifs.push({
        icono: "💾",
        texto: "Hace un mes o más que no haces una copia de seguridad",
        tipo: "importante",
      });
    }

    if (diasHasta <= 1 && tipo) {
      let texto = "";
      if (tipo === "completa")
        texto = "Actualización completa (peso + mediciones + fotos)";
      else if (tipo === "mediciones")
        texto = "Actualización de mediciones (peso + mediciones)";
      else texto = "Actualización semanal (solo peso)";
      notifs.push({
        icono: "📊",
        texto: `Mañana: ${texto}`,
        tipo: "importante",
      });
    }

    if (dia !== "domingo" && dia !== "sabado" && !entrenadoHoy) {
      const ejercicios = getEjerciciosPorDia(dia);
      const rutinaActual = CONFIG.TIPOS_RUTINA[dia];
      notifs.push({
        icono: "💪",
        texto: `Entrena ${CONFIG.TIPOS_RUTINA[dia]}`,
        tipo: "entrenamiento",
      });
    }

    return notifs;
  },

  render() {
    const lista = document.getElementById("notifList");
    const notifs = this.generar();

    if (notifs.length === 0) {
      lista.innerHTML = '<div class="notif-empty">Sin notificaciones</div>';
    } else {
      lista.innerHTML = notifs
        .map(
          (n) =>
            `<div class="notif-item">
                          <span class="ni-icon">${n.icono}</span>
                          <span class="ni-text">${n.texto}</span>
                      </div>`,
        )
        .join("");
    }

    const badge = document.getElementById("bellBadge");
    const bell = document.getElementById("bellWrap");

    // Badge: muestra todas las notificaciones
    if (notifs.length > 0) {
      badge.classList.remove("hidden");
      badge.textContent = notifs.length;
    } else {
      badge.classList.add("hidden");
    }

    // Destacar la campanita SOLO si hay una notificación importante
    const hayImportante = notifs.some((n) => n.tipo === "importante");

    if (bell) {
      bell.classList.toggle("has-important", hayImportante);
    }
  },
};
