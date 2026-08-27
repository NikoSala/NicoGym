// ==========================================
// COMPARADOR DE SESIONES
// ==========================================
const Comparador = {
  render() {
    const c = document.getElementById("comparadorContainer");
    if (!c) return;

    // Obtener fechas de entrenamientos
    const fechas = [...STATE.historialEntrenos]
      .map(e => e.fecha)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));

    if (fechas.length === 0) {
      c.innerHTML = `
        <div class="card">
          <div style="text-align:center;color:var(--text-secondary);padding:20px;">
            <i class="fa-solid fa-code-compare" style="font-size:36px;display:block;margin-bottom:8px;color:var(--text-muted);"></i>
            <p style="font-size:13px;">Aún no hay sesiones para comparar</p>
          </div>
        </div>
      `;
      return;
    }

    c.innerHTML = `
      <div class="card">
        <div class="card-title"><i class="fa-solid fa-code-compare"></i> Comparar sesiones</div>
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <select id="compDia1" class="input" style="flex:1;">
            ${fechas.map(f => `<option value="${f}">${UI.formatearFecha(f)}</option>`).join('')}
          </select>
          <select id="compDia2" class="input" style="flex:1;">
            ${fechas.map(f => `<option value="${f}">${UI.formatearFecha(f)}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary btn-block" onclick="Comparador._comparar()">
          <i class="fa-solid fa-scale-balanced"></i> Comparar
        </button>
        <div id="comparadorResultado" style="margin-top:10px;"></div>
      </div>
    `;
  },

  _comparar() {
    const f1 = document.getElementById("compDia1").value;
    const f2 = document.getElementById("compDia2").value;

    if (!f1 || !f2) {
      UI.toast("Selecciona dos fechas", "error");
      return;
    }

    const e1 = STATE.historialEntrenos.find(e => e.fecha === f1);
    const e2 = STATE.historialEntrenos.find(e => e.fecha === f2);

    if (!e1 || !e2) {
      UI.toast("No se encontraron datos para esas fechas", "error");
      return;
    }

    // Calcular totales
    const calcularTotales = (entreno) => {
      let volumen = 0, series = 0, reps = 0, ejercicios = 0;
      (entreno.ejercicios || []).forEach(ej => {
        if (ej.tipo === "caminata") return;
        const p = parseReps(ej.reps);
        if (p.valid) {
          volumen += (Number(ej.peso) || 0) * p.total;
          series += p.series.length;
          reps += p.total;
          ejercicios++;
        }
      });
      return { volumen, series, reps, ejercicios };
    };

    const t1 = calcularTotales(e1);
    const t2 = calcularTotales(e2);

    const difVolumen = t2.volumen - t1.volumen;
    const difSeries = t2.series - t1.series;
    const difReps = t2.reps - t1.reps;
    const difEjercicios = t2.ejercicios - t1.ejercicios;

    // Comparar ejercicios individuales
    const ejerciciosNombres = [...new Set([
      ...(e1.ejercicios || []).map(e => e.nombre),
      ...(e2.ejercicios || []).map(e => e.nombre)
    ])];

    const comparacionEjercicios = ejerciciosNombres.map(nombre => {
      const r1 = (e1.ejercicios || []).find(e => e.nombre === nombre);
      const r2 = (e2.ejercicios || []).find(e => e.nombre === nombre);
      const p1 = r1 ? parseReps(r1.reps) : { valid: false, total: 0 };
      const p2 = r2 ? parseReps(r2.reps) : { valid: false, total: 0 };
      const v1 = p1.valid ? (Number(r1.peso) || 0) * p1.total : 0;
      const v2 = p2.valid ? (Number(r2.peso) || 0) * p2.total : 0;
      return { nombre, v1, v2, dif: v2 - v1 };
    }).sort((a, b) => Math.abs(b.dif) - Math.abs(a.dif));

    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">📅 ${UI.formatearFecha(f1)}</div>
          <div style="font-size:20px;font-weight:800;color:var(--text);">${t1.volumen.toFixed(0)} kg</div>
          <div style="font-size:10px;color:var(--text-secondary);">Volumen</div>
        </div>
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">📅 ${UI.formatearFecha(f2)}</div>
          <div style="font-size:20px;font-weight:800;color:var(--text);">${t2.volumen.toFixed(0)} kg</div>
          <div style="font-size:10px;color:var(--text-secondary);">Volumen</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px;">
        <div style="background:rgba(0,0,0,0.15);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:${difVolumen >= 0 ? 'var(--success)' : 'var(--danger)'};">${difVolumen >= 0 ? '+' : ''}${difVolumen.toFixed(0)}</div>
          <div style="font-size:9px;color:var(--text-secondary);">Volumen</div>
        </div>
        <div style="background:rgba(0,0,0,0.15);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:${difSeries >= 0 ? 'var(--success)' : 'var(--danger)'};">${difSeries >= 0 ? '+' : ''}${difSeries}</div>
          <div style="font-size:9px;color:var(--text-secondary);">Series</div>
        </div>
        <div style="background:rgba(0,0,0,0.15);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:${difReps >= 0 ? 'var(--success)' : 'var(--danger)'};">${difReps >= 0 ? '+' : ''}${difReps}</div>
          <div style="font-size:9px;color:var(--text-secondary);">Reps</div>
        </div>
      </div>

      ${comparacionEjercicios.length > 0 ? `
        <div style="margin-top:10px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-secondary);margin-bottom:6px;">📊 Comparación por ejercicio</div>
          ${comparacionEjercicios.slice(0, 6).map(ej => `
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;">
              <span style="flex:1;">${ej.nombre}</span>
              <span style="color:${ej.dif >= 0 ? 'var(--success)' : 'var(--danger)'};font-weight:700;white-space:nowrap;">
                ${ej.dif >= 0 ? '+' : ''}${ej.dif.toFixed(0)} kg
              </span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    document.getElementById("comparadorResultado").innerHTML = html;
  }
};