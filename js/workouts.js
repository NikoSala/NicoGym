// ==========================================
// RUTINAS (ENTRENAR)
// ==========================================
function estimarDuracionRutina(dia, ejercicios) {
  const totalSeries = ejercicios.reduce((total, ejercicio) => total + (Number(ejercicio.series) || 0), 0);
  const minutosSeries = totalSeries * 0.65;
  const minutosDescanso = Math.max(0, totalSeries - 1) * 1.5;
  const minutosCambios = ejercicios.length * 1.5;
  const calentamiento = 1;
  const cinta = CONFIG.CARDIO_POR_DIA?.[dia]?.max || 0;
  const central = Math.ceil((minutosSeries + minutosDescanso + minutosCambios + calentamiento + cinta) / 5) * 5;
  return `${Math.max(25, central - 5)}–${central + 5} min`;
}

const Rutinas = {
  render() {
    const tc = document.getElementById("dayTabs");
    const pc = document.getElementById("dayPanelsContainer");
    if (!tc) return;
    const diaSeleccionadoAntes = diaActivo;

    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const nombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const iconos = ["🔵", "🟢", "🟣", "🟠", "🔵", "😌", "🟢"];
    const rutinaCompletadaHoy = STATE.historialEntrenos.find((sesion) => sesion.fecha === UI.getHoy())?.dia;

    tc.innerHTML = "";
    pc.innerHTML = "";

    dias.forEach((dia, idx) => {
      const ejerciciosDelDia = getEjerciciosPorDia(dia);
      const rutinaCompletadaEstaSemana = ejerciciosDelDia.length > 0 && ejerciciosDelDia.every((_, ejercicioIndex) => STATE.checks[`${dia}-${ejercicioIndex}`] === true);
      const btn = document.createElement("button");
      btn.className = "dtab";
      btn.textContent = `${iconos[idx]} ${nombres[idx]}`;
      btn.dataset.dia = dia;

      const esDescanso = esDiaDescansoRutina(dia);
      const completado = rutinaCompletadaHoy === dia || rutinaCompletadaEstaSemana;

      if (esDescanso) btn.classList.add("descanso");
      if (completado) btn.classList.add("completado");

      btn.onclick = () => {
        if (esDescanso) {
          UI.toast("😌 Día de descanso", "info");
          return;
        }
        this._seleccionarDia(dia);
      };
      tc.appendChild(btn);

      const panel = document.createElement("div");
      panel.className = "dia-panel";
      panel.id = `dp-${dia}`;

      const esHoy = dia === UI.getDiaNombre();
      const yaCompletado = rutinaCompletadaHoy === dia || rutinaCompletadaEstaSemana;

      let panelContent = "";

      if (esDescanso) {
        panelContent = `<div class="card" style="text-align:center;padding:24px;color:var(--text-secondary);"><span style="font-size:48px;display:block;margin-bottom:8px;">😌</span><div style="font-size:18px;font-weight:600;color:var(--text);">Día de descanso</div></div>`;
      } else {
        const ejercicios = getEjerciciosPorDia(dia);
        const tieneSesionAnterior = STATE.historialEntrenos.some(
          (sesion) => sesion.dia === dia && sesion.ejercicios?.length,
        );

        panelContent = `
                            <div class="card" style="text-align:center;padding:20px;">
                                <span style="font-size:40px;display:block;margin-bottom:8px;">${iconos[idx]}</span>
                                <div style="font-size:20px;font-weight:700;color:var(--text);">${nombres[idx]}</div>
                                <div style="font-size:13px;color:var(--text-secondary);margin:4px 0;">
                                ${getResumenRutinaDelDia(dia)}
                               </div>
                                <div style="font-size:12px;color:var(--text-secondary);">
                                    🏋️ ${ejercicios.length} ejercicios
                                </div>
                                <div style="font-size:12px;color:var(--text-secondary);margin:4px 0 10px;">
                                    ⏱️ Duración orientativa: ${estimarDuracionRutina(dia, ejercicios)} · incluye pausas y cardio si toca
                                </div>
                                <div class="routine-transition-notice" role="status">
                                  ${UI.getHoy() < (STATE.rutinaNuevaDesde || "2026-11-01")
                                    ? "Esta semana se mantiene la rutina anterior. La nueva se activa automáticamente el domingo 1 de noviembre."
                                    : "La nueva distribución semanal está activa."}
                                </div>
                                <aside class="routine-warmup" aria-label="Calentamiento">
                                    <strong>Calentamiento</strong>
                                    <span>Antes de las series efectivas, haz 1 serie inicial del primer ejercicio con menos peso para calentar. No cuenta como serie de trabajo.</span>
                                    ${CONFIG.CARDIO_POR_DIA?.[dia] ? `<span>Al final: ${CONFIG.CARDIO_POR_DIA[dia].maquina}, ${CONFIG.CARDIO_POR_DIA[dia].min}–${CONFIG.CARDIO_POR_DIA[dia].max} min.${CONFIG.CARDIO_POR_DIA[dia].opcionalExtra ? ' Si acabas pronto y te encuentras bien, puedes alargarlo un poco.' : ''}</span>` : ""}
                                </aside>
                                <details class="routine-load-guide">
                                    <summary>Cómo elegir el peso</summary>
                                    <div class="routine-load-guide-content">
                                        <p>Elige una carga con la que completes el rango indicado con buena técnica y te queden unas <strong>2–3 repeticiones en reserva</strong> al acabar cada serie.</p>
                                        <p>Si no llegas al mínimo del rango o pierdes la técnica, baja un punto. Cuando alcances el máximo en todas las series y aún te queden 2–3 repeticiones limpias, sube el mínimo incremento la próxima vez.</p>
                                        <p>Apunta el peso y los ajustes del asiento por máquina. No hace falta probar tu máximo.</p>
                                    </div>
                                </details>
                                <div class="routine-exercise-list" aria-label="Ejercicios de ${nombres[idx]}">
                                  ${ejercicios.map((ej, ejercicioIndex) => `
                                      <div class="routine-exercise-row">
                                        <div class="routine-exercise-info">
                                          <span class="routine-exercise-number">${ejercicioIndex + 1}</span>
                                          <span class="routine-exercise-copy"><strong>${ExerciseLibrary._escapar(ej.nombre)}</strong><small>${ExerciseLibrary._escapar(ej.grupo)}</small><span class="routine-setup"><strong>Preparación:</strong> ${ExerciseLibrary._escapar(ej.preparacion || "Ajusta el equipo a tu altura y comprueba el recorrido.")}</span><span class="routine-prescription">Material: ${ExerciseLibrary._escapar((ej.material || ["No especificado"]).join(", "))}</span><span class="routine-prescription">${ejercicioIndex === 0 ? "1 serie ligera de calentamiento + " : ""}${ej.series} series efectivas × ${ExerciseLibrary._escapar(ej.reps)} reps</span></span>
                                        </div>
                                      </div>
                                    `).join("")}
                                </div>
                                ${
                                  yaCompletado
                                    ? `
                                    <button class="dia-entrenar-btn completado" style="margin-top:12px;">
                                        ✅ Entrenamiento completado
                                    </button>
                                `
                                    : `
                                    <button class="dia-entrenar-btn" onclick="APP.iniciarEntreno('${dia}')" style="margin-top:12px;">
                                        <i class="fa-solid fa-play"></i> Comenzar entrenamiento
                                    </button>
                                `
                                }
                                ${
                                  tieneSesionAnterior && !yaCompletado
                                    ? `<button class="btn btn-ghost btn-block" onclick="APP.iniciarEntreno('${dia}', true)" style="margin-top:8px;">
                                        <i class="fa-solid fa-copy"></i> Repetir última sesión
                                      </button>`
                                    : ""
                                }
                            </div>
                        `;
      }

      panel.innerHTML = panelContent;
      pc.appendChild(panel);
    });

    const diaActual = UI.getDiaNombre();
    diaActivo = DAY_KEYS_ROUTINE.includes(diaSeleccionadoAntes)
      ? diaSeleccionadoAntes
      : diaActual;
    const idxActivo = dias.indexOf(diaActivo);
    if (idxActivo >= 0) {
      const tabs = tc.querySelectorAll(".dtab");
      const panel = document.getElementById(`dp-${diaActivo}`);
      if (panel) panel.classList.add("active");
      if (tabs[idxActivo]) tabs[idxActivo].classList.add("active");
    }

    this._actualizarProgreso();
  },

  abrirSelectorCambio(dia, ejercicioId) {
    if (STATE.entrenamientoPendiente?.dia === dia) {
      UI.toast("Pausa o termina ese entrenamiento antes de editar su rutina", "error");
      return;
    }
    const ejercicioActual = getExerciseDatabase().find((ej) => ej.id === ejercicioId);
    const alternativas = RutinaEditor.alternativas(ejercicioId, dia);
    if (!ejercicioActual || alternativas.length === 0) {
      UI.toast("No hay alternativas disponibles de este grupo muscular", "info");
      return;
    }

    Modal.abrir(`
      <h3>Cambiar ejercicio</h3>
      <p class="routine-replacement-description">${ExerciseLibrary._escapar(ejercicioActual.nombre)} · mismo músculo y movimiento parecido</p>
      <label class="routine-replacement-search-label" for="buscarReemplazo">Buscar alternativa</label>
      <input class="input" id="buscarReemplazo" type="search" placeholder="Nombre o material">
      <div class="routine-replacement-list" id="alternativasEjercicio"></div>
    `);

    const busqueda = document.getElementById("buscarReemplazo");
    const lista = document.getElementById("alternativasEjercicio");
    const renderAlternativas = () => {
      const consulta = busqueda.value.trim().toLocaleLowerCase("es");
      const visibles = alternativas.filter((ej) =>
        `${ej.nombre} ${ej.grupo} ${(ej.material || []).join(" ")}`
          .toLocaleLowerCase("es")
          .includes(consulta),
      );
      lista.innerHTML = visibles.length
        ? visibles.map((ej) => `
            <button type="button" class="routine-replacement-option" data-reemplazo-id="${ExerciseLibrary._escapar(ej.id)}" aria-label="Elegir ${ExerciseLibrary._escapar(ej.nombre)}">
              <span class="routine-replacement-media"><i class="fa-solid fa-dumbbell" aria-hidden="true"></i></span>
              <span><strong>${ExerciseLibrary._escapar(ej.nombre)}</strong><small>${ExerciseLibrary._escapar(ej.grupo)} · ${ExerciseLibrary._escapar(ej.categoria)}${ej.material?.length ? ` · ${ExerciseLibrary._escapar(ej.material.join(", "))}` : ""} · ${ExerciseLibrary.materialDisponible(ej) ? "Disponible" : "No marcado"}</small></span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          `).join("")
        : '<p class="routine-replacement-empty">No hay ejercicios que coincidan.</p>';

      lista.querySelectorAll("[data-reemplazo-id]").forEach((button) => {
        button.addEventListener("click", () => {
          const reemplazoId = button.dataset.reemplazoId;
          if (!RutinaEditor.reemplazar(ejercicioId, reemplazoId, dia)) return;
          Modal.cerrar();
          this.render();
          this._seleccionarDia(dia);
          [...document.getElementById(`dp-${dia}`).querySelectorAll("[data-cambiar-ejercicio]")]
            .find((control) => control.dataset.cambiarEjercicio === reemplazoId)
            ?.focus();
          UI.toast("Ejercicio cambiado; se conservaron las series y repeticiones", "success");
        });
      });
    };

    busqueda.addEventListener("input", renderAlternativas);
    renderAlternativas();
  },

  _seleccionarDia(dia) {
    document
      .querySelectorAll(".dia-panel")
      .forEach((p) => p.classList.remove("active"));
    document
      .querySelectorAll(".dtab")
      .forEach((b) => b.classList.remove("active"));

    const panel = document.getElementById(`dp-${dia}`);
    if (panel) panel.classList.add("active");

    const tab = document.querySelector(`.dtab[data-dia="${dia}"]`);
    if (tab) tab.classList.add("active");

    diaActivo = dia;
    this._actualizarProgreso();
  },

  _actualizarProgreso() {
    const c = document.getElementById("progresoRutinaContainer");
    if (!c) return;

    const ejercicios = getEjerciciosPorDia(diaActivo);
    if (ejercicios.length === 0) {
      c.innerHTML = "";
      return;
    }

    let comp = 0;
    ejercicios.forEach((_, idx) => {
      if (STATE.checks[`${diaActivo}-${idx}`]) comp++;
    });
    const pct = Math.round((comp / ejercicios.length) * 100);

    const completado = comp === ejercicios.length || STATE.historialEntrenos.some(
      (sesion) => sesion.fecha === UI.getHoy() && sesion.dia === diaActivo,
    );

    if (completado) {
      c.innerHTML = `<div class="progreso-rutina-bar"><div class="progreso-rutina-completado"><i class="fa-solid fa-circle-check"></i> ¡${CONFIG.NOMBRES_DIAS[diaActivo]} completado!</div></div>`;
    } else if (comp > 0) {
      c.innerHTML = `
                        <div class="progreso-rutina-bar">
                            <div class="progreso-rutina-header">
                                <span>${CONFIG.NOMBRES_DIAS[diaActivo]} - Progreso</span>
                                <span>${pct}%</span>
                            </div>
                            <div class="progreso-rutina-track"><div class="progreso-rutina-fill" style="width:${pct}%;"></div></div>
                            <div class="progreso-rutina-info">${comp}/${ejercicios.length} ejercicios</div>
                        </div>
                    `;
    } else {
      c.innerHTML = "";
    }
  },
};
