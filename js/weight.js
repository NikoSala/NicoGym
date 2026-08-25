// ==========================================
// PESO
// ==========================================
const mostrarMedida = (valor) =>
  Number.isFinite(Number(valor)) && Number(valor) > 0 ? valor : "--";

const Peso = {
  render() {
    const c = document.getElementById("pesoContainer");
    if (!c) return;

    const ultimo =
      STATE.mediciones.length > 0
        ? STATE.mediciones[STATE.mediciones.length - 1]
        : null;
    const primero = STATE.mediciones.length > 0 ? STATE.mediciones[0] : null;

    const tipo = APP.obtenerTipoActualizacion();
    const hoy = new Date();
    const esDomingo = hoy.getDay() === 0;
    const esFechaValida = tipo !== null;

    let titulo = "Nueva medición";
    let descripcion = "Registra todos tus datos corporales.";
    let mensajeAdicional = "";

    if (esDomingo && esFechaValida) {
      if (tipo === "completa") {
        titulo = "📊 Actualización completa — Peso + Mediciones + Fotos";
        descripcion = "Registra peso, mediciones y fotos.";
      } else if (tipo === "mediciones") {
        titulo = "📊 Actualización de mediciones — Peso + Mediciones";
        descripcion = "Hoy registra peso y mediciones. Las fotos se conservan.";
        mensajeAdicional = `
                            <div style="padding:10px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);margin-bottom:8px;text-align:center;">
                                <span style="font-size:13px;color:var(--text-secondary);">
                                    📸 Las fotos se conservan de la última actualización completa.
                                </span>
                            </div>
                        `;
      } else if (tipo === "solo-peso") {
        titulo = "📊 Actualización semanal — Solo peso";
        descripcion =
          "Hoy solo debes registrar tu peso. Mediciones y fotos se conservan.";
        mensajeAdicional = `
                            <div style="padding:10px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);margin-bottom:8px;text-align:center;">
                                <span style="font-size:13px;color:var(--text-secondary);">
                                    📏 Mediciones y fotos se conservan de la última actualización completa.
                                </span>
                            </div>
                        `;
        if (ultimo) {
          mensajeAdicional += `
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;color:var(--text-secondary);background:rgba(0,0,0,0.1);padding:8px;border-radius:var(--radius-sm);margin-bottom:8px;">
                                    <div>Último peso: <strong style="color:var(--text);">${ultimo.peso} kg</strong></div>
                                    <div>Última grasa: <strong style="color:var(--text);">${mostrarMedida(ultimo.grasaPorcentaje)}%</strong></div>
                                    <div>Último músculo: <strong style="color:var(--text);">${mostrarMedida(ultimo.masaMuscular)} kg</strong></div>
                                    <div>Última cintura: <strong style="color:var(--text);">${mostrarMedida(ultimo.cintura)} cm</strong></div>
                                </div>
                            `;
        }
      }
    }

    const mostrarCamposCompletos =
      tipo === "completa" ||
      tipo === "mediciones" ||
      !esDomingo ||
      !esFechaValida;

    let html = `
                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-plus"></i> ${titulo}</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;">${descripcion}</div>
                        ${mensajeAdicional}
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
                            <div class="form-field"><label>Fecha</label><input type="date" id="medFecha" class="input" value="${UI.getHoy()}"></div>
                            <div class="form-field"><label>Peso (kg) *</label><input type="number" id="medPeso" step="0.1" placeholder="${ultimo ? ultimo.peso : "84.3"}" class="input"></div>
                            ${
                              mostrarCamposCompletos
                                ? `
                                <div class="form-field"><label>% Grasa</label><input type="number" id="medGrasa" step="0.1" placeholder="${ultimo ? ultimo.grasaPorcentaje : "27.5"}" class="input"></div>
                                <div class="form-field"><label>Masa muscular (kg)</label><input type="number" id="medMusculo" step="0.1" placeholder="${ultimo ? ultimo.masaMuscular : "58.2"}" class="input"></div>
                                <div class="form-field"><label>Masa magra (kg)</label><input type="number" id="medMagra" step="0.1" placeholder="${ultimo ? ultimo.masaMagra : "62.0"}" class="input"></div>
                                <div class="form-field"><label>Grasa visceral</label><input type="number" id="medVisceral" step="0.5" placeholder="${ultimo ? ultimo.grasaVisceral : "8.0"}" class="input"></div>
                                <div class="form-field" style="grid-column:span 2;"><label>Cintura (cm)</label><input type="number" id="medCintura" step="0.1" placeholder="${ultimo ? ultimo.cintura : "98"}" class="input"></div>
                            `
                                : ""
                            }
                        </div>
                        <button class="btn btn-primary btn-block" onclick="Peso._guardar()"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-chart-simple"></i> Resumen</div>
                        <div class="peso-grid">
                            <div class="peso-stat"><div class="num primary">${ultimo ? ultimo.peso : "--"}</div><div class="label">Peso</div></div>
                            <div class="peso-stat"><div class="num green">${ultimo ? ultimo.grasaPorcentaje : "--"}%</div><div class="label">Grasa</div></div>
                            <div class="peso-stat"><div class="num orange">${ultimo ? ultimo.masaMuscular : "--"}</div><div class="label">Músculo</div></div>
                        </div>
                        ${
                          primero && ultimo
                            ? `
                            <div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(0,0,0,0.1);border-radius:var(--radius-sm);margin-top:6px;font-size:12px;flex-wrap:wrap;gap:4px;">
                                <span>📉 Desde inicio: <strong>${(primero.peso - ultimo.peso).toFixed(1)} kg</strong></span>
                                <span>📏 Cintura: <strong>${mostrarMedida(ultimo.cintura)} cm</strong></span>
                                <span>📊 Grasa visceral: <strong>${mostrarMedida(ultimo.grasaVisceral)}</strong></span>
                            </div>
                        `
                            : ""
                        }
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-clock-rotate-left"></i> Historial</div>
                        <div id="historialMediciones"></div>
                    </div>
                `;
    c.innerHTML = html;
    this._renderHistorial();
  },

  _guardar() {
    const f = document.getElementById("medFecha").value;
    if (!f) {
      UI.toast("Selecciona fecha", "error");
      return;
    }

    const peso = parseFloat(document.getElementById("medPeso").value);
    if (isNaN(peso) || peso === 0) {
      UI.toast("Introduce un peso válido", "error");
      return;
    }

    const ultimo =
      STATE.mediciones.length > 0
        ? STATE.mediciones[STATE.mediciones.length - 1]
        : null;
    const idx = STATE.mediciones.findIndex((x) => x.fecha === f);
    const ultimoRegistro = (idx !== -1 ? STATE.mediciones[idx] : null) ||
      ultimo ||
      STATE.ultimasMediciones || {
        grasaPorcentaje: null,
        masaMuscular: null,
        masaMagra: null,
        grasaVisceral: null,
        cintura: null,
      };
    const conservarSiVacio = (id, valorAnterior) => {
      const input = document.getElementById(id);
      const valor = input ? parseFloat(input.value) : NaN;
      if (Number.isFinite(valor)) return valor;
      return Number.isFinite(Number(valorAnterior)) && Number(valorAnterior) > 0
        ? Number(valorAnterior)
        : null;
    };
    const grasaPorcentaje = conservarSiVacio(
      "medGrasa",
      ultimoRegistro.grasaPorcentaje,
    );
    const masaMuscular = conservarSiVacio(
      "medMusculo",
      ultimoRegistro.masaMuscular,
    );
    const masaMagra = conservarSiVacio("medMagra", ultimoRegistro.masaMagra);
    const grasaVisceral = conservarSiVacio(
      "medVisceral",
      ultimoRegistro.grasaVisceral,
    );
    const cintura = conservarSiVacio("medCintura", ultimoRegistro.cintura);
    const nm = {
      fecha: f,
      peso: peso,
      grasaPorcentaje: grasaPorcentaje,
      masaMuscular: masaMuscular,
      masaMagra: masaMagra,
      grasaVisceral: grasaVisceral,
      cintura: cintura,
    };

    if (idx !== -1) STATE.mediciones[idx] = nm;
    else STATE.mediciones.push(nm);

    STATE.mediciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    STATE.recordatorios.ultimaMedicion = f;

    STATE.ultimasMediciones = {
      grasaPorcentaje: grasaPorcentaje,
      masaMuscular: masaMuscular,
      masaMagra: masaMagra,
      grasaVisceral: grasaVisceral,
      cintura: cintura,
    };

    Storage._save();
    UI.toast("✅ Datos guardados", "success");
    this.render();
    APP.renderizarTodo();
    document.getElementById("medPeso").value = "";
  },

  _renderHistorial() {
    const c = document.getElementById("historialMediciones");
    if (!c) return;
    if (STATE.mediciones.length === 0) {
      c.innerHTML =
        '<div style="text-align:center;color:var(--text-secondary);padding:10px;">Sin registros</div>';
      return;
    }
    const rev = [...STATE.mediciones].reverse();
    c.innerHTML = rev
      .map((m, i) => {
        const diff =
          i < rev.length - 1 ? (m.peso - rev[i + 1].peso).toFixed(1) : null;
        return `
                        <div class="historial-medicion-card" onclick="Peso._toggleDetalle(${i})">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span class="med-fecha">${UI.formatearFecha(m.fecha)}</span>
                                <span style="font-weight:600;">${m.peso} kg</span>
                            </div>
                            <div class="med-resumen">
                                <span class="med-item">📏 <span class="valor">${mostrarMedida(m.cintura)}</span> cm</span>
                                <span class="med-item">💪 <span class="valor">${mostrarMedida(m.masaMuscular)}</span> kg</span>
                                <span class="med-item">🔥 <span class="valor">${mostrarMedida(m.grasaPorcentaje)}</span>%</span>
                                ${diff !== null && Math.abs(parseFloat(diff)) > 0 ? `<span class="med-item ${parseFloat(diff) < 0 ? "positive" : "negative"}">${parseFloat(diff) > 0 ? "+" : ""}${diff} kg</span>` : ""}
                            </div>
                            <div class="historial-medicion-detalle" id="pesoDetalle-${i}">
                                <div class="detalle-item"><span>Peso</span><span>${m.peso} kg</span></div>
                                <div class="detalle-item"><span>Cintura</span><span>${mostrarMedida(m.cintura)} cm</span></div>
                                <div class="detalle-item"><span>% Grasa</span><span>${mostrarMedida(m.grasaPorcentaje)}%</span></div>
                                <div class="detalle-item"><span>Masa muscular</span><span>${mostrarMedida(m.masaMuscular)} kg</span></div>
                                <div class="detalle-item"><span>Masa magra</span><span>${mostrarMedida(m.masaMagra)} kg</span></div>
                                <div class="detalle-item"><span>Grasa visceral</span><span>${mostrarMedida(m.grasaVisceral)}</span></div>
                                <div style="margin-top:6px;display:flex;gap:6px;justify-content:center;">
                                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Peso._editar('${m.fecha}')"><i class="fa-solid fa-pen"></i> Editar</button>
                                    <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();Peso._eliminar('${m.fecha}')"><i class="fa-solid fa-trash"></i> Eliminar</button>
                                </div>
                            </div>
                        </div>
                    `;
      })
      .join("");
  },

  _toggleDetalle(i) {
    const d = document.getElementById(`pesoDetalle-${i}`);
    if (d) d.classList.toggle("open");
  },

  _editar(f) {
    const m = STATE.mediciones.find((x) => x.fecha === f);
    if (!m) return;
    document.getElementById("medFecha").value = m.fecha;
    document.getElementById("medPeso").value = m.peso;
    document.getElementById("medGrasa").value = m.grasaPorcentaje;
    document.getElementById("medMusculo").value = m.masaMuscular;
    document.getElementById("medMagra").value = m.masaMagra || "";
    document.getElementById("medVisceral").value = m.grasaVisceral || "";
    document.getElementById("medCintura").value = m.cintura;
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  _eliminar(f) {
    UI.confirmar("¿Eliminar esta medición?", () => {
      STATE.mediciones = STATE.mediciones.filter((m) => m.fecha !== f);
      Storage._save();
      this.render();
      APP.renderizarTodo();
      UI.toast("🗑️ Eliminado", "success");
    });
  },
};
