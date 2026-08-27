// ==========================================
// COMPARADOR DE SESIONES
// ==========================================
const Comparador = {
  render() {
    const c = document.getElementById("comparadorContainer");
    if (!c) return;

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

    // Agrupar fechas por día de la semana
    const fechasPorDia = {};
    fechas.forEach(f => {
      const dia = new Date(`${f}T00:00:00`).getDay();
      if (!fechasPorDia[dia]) fechasPorDia[dia] = [];
      fechasPorDia[dia].push(f);
    });

    c.innerHTML = `
      <div class="card">
        <div class="card-title"><i class="fa-solid fa-code-compare"></i> Comparar sesiones</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">
          💡 Selecciona dos fechas del <strong>mismo día de la semana</strong> para comparar correctamente.
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <div style="flex:1;">
            <label style="font-size:10px;color:var(--text-secondary);display:block;margin-bottom:4px;">Primera sesión</label>
            <select id="compDia1" class="input" onchange="Comparador._filtrarSegundo()">
              ${fechas.map(f => `<option value="${f}">${this._etiquetaFecha(f)}</option>`).join('')}
            </select>
          </div>
          <div style="flex:1;">
            <label style="font-size:10px;color:var(--text-secondary);display:block;margin-bottom:4px;">Segunda sesión</label>
            <select id="compDia2" class="input">
              ${fechas.map(f => `<option value="${f}">${this._etiquetaFecha(f)}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-block" onclick="Comparador._comparar()">
          <i class="fa-solid fa-scale-balanced"></i> Comparar
        </button>
        <div id="comparadorResultado" style="margin-top:10px;"></div>
      </div>
    `;

    // Filtrar el segundo selector inicialmente
    this._filtrarSegundo();
  },

  _etiquetaFecha(f) {
    const fecha = new Date(`${f}T00:00:00`);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dias[fecha.getDay()]} · ${UI.formatearFecha(f)}`;
  },

  _filtrarSegundo() {
    const f1 = document.getElementById("compDia1").value;
    const select2 = document.getElementById("compDia2");
    if (!f1 || !select2) return;

    const dia1 = new Date(`${f1}T00:00:00`).getDay();
    const fechas = [...STATE.historialEntrenos]
      .map(e => e.fecha)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b) - new Date(a));

    // Filtrar solo fechas del mismo día de la semana
    const fechasMismoDia = fechas.filter(f => {
      const dia = new Date(`${f}T00:00:00`).getDay();
      return dia === dia1;
    });

    select2.innerHTML = fechasMismoDia.map(f => 
      `<option value="${f}">${this._etiquetaFecha(f)}</option>`
    ).join('');

    // Si no hay fechas del mismo día, mostrar aviso
    if (fechasMismoDia.length === 0) {
      select2.innerHTML = '<option value="">No hay sesiones de este día</option>';
    }
  },

  _comparar() {
    const f1 = document.getElementById("compDia1").value;
    const f2 = document.getElementById("compDia2").value;

    if (!f1 || !f2) {
      UI.toast("Selecciona dos fechas", "error");
      return;
    }

    // Verificar que son el mismo día de la semana
    const dia1 = new Date(`${f1}T00:00:00`).getDay();
    const dia2 = new Date(`${f2}T00:00:00`).getDay();
    if (dia1 !== dia2) {
      UI.toast("⚠️ Debes comparar el mismo día de la semana", "error");
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

    // ==========================================
    // 1. MEJOR MARCA (1RM ESTIMADO) POR SESIÓN
    // ==========================================
    const mejorMarca = (entreno) => {
      let mejor = { nombre: "", oneRM: 0, peso: 0, reps: 0 };
      (entreno.ejercicios || []).forEach(ej => {
        if (ej.tipo === "caminata" || !ej.peso) return;
        const p = parseReps(ej.reps);
        if (p.valid) {
          const maxReps = Math.max(...p.series);
          const oneRM = PROGRESION.estimar1RM(ej.peso, maxReps);
          if (oneRM > mejor.oneRM) {
            mejor = { nombre: ej.nombre, oneRM, peso: Number(ej.peso), reps: maxReps };
          }
        }
      });
      return mejor;
    };

    const mejor1 = mejorMarca(e1);
    const mejor2 = mejorMarca(e2);

    // ==========================================
    // 2. GRÁFICA DE PROGRESO (VOLUMEN)
    // ==========================================
    const maxVolumen = Math.max(t1.volumen, t2.volumen, 1);
    const ancho1 = Math.round((t1.volumen / maxVolumen) * 100);
    const ancho2 = Math.round((t2.volumen / maxVolumen) * 100);

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
      <!-- GRÁFICA DE PROGRESO -->
      <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;margin-bottom:10px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);margin-bottom:8px;">📈 Progreso de volumen</div>
        <div style="margin-bottom:6px;">
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:2px;">
            <span>${this._etiquetaFecha(f1)}</span>
            <span>${t1.volumen.toFixed(0)} kg</span>
          </div>
          <div style="background:rgba(255,255,255,0.08);border-radius:99px;height:8px;overflow:hidden;">
            <div style="height:100%;background:var(--primary);width:${ancho1}%;border-radius:99px;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:2px;">
            <span>${this._etiquetaFecha(f2)}</span>
            <span>${t2.volumen.toFixed(0)} kg</span>
          </div>
          <div style="background:rgba(255,255,255,0.08);border-radius:99px;height:8px;overflow:hidden;">
            <div style="height:100%;background:var(--success);width:${ancho2}%;border-radius:99px;"></div>
          </div>
        </div>
        <div style="text-align:center;font-size:12px;font-weight:700;color:${difVolumen >= 0 ? 'var(--success)' : 'var(--danger)'};margin-top:6px;">
          ${difVolumen >= 0 ? '+' : ''}${difVolumen.toFixed(0)} kg ${difVolumen >= 0 ? '📈' : '📉'}
        </div>
      </div>

      <!-- MEJOR MARCA -->
      ${mejor1.nombre || mejor2.nombre ? `
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;margin-bottom:10px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-secondary);margin-bottom:6px;">🏆 Mejor marca (1RM estimado)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div style="background:rgba(0,0,0,0.15);border-radius:8px;padding:8px;text-align:center;">
              <div style="font-size:9px;color:var(--text-muted);">${this._etiquetaFecha(f1)}</div>
              ${mejor1.nombre ? `
                <div style="font-size:11px;font-weight:600;margin-top:3px;">${mejor1.nombre}</div>
                <div style="font-size:16px;font-weight:800;color:var(--primary);margin-top:2px;">${mejor1.oneRM.toFixed(1)} kg</div>
              ` : '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Sin datos</div>'}
            </div>
            <div style="background:rgba(0,0,0,0.15);border-radius:8px;padding:8px;text-align:center;">
              <div style="font-size:9px;color:var(--text-muted);">${this._etiquetaFecha(f2)}</div>
              ${mejor2.nombre ? `
                <div style="font-size:11px;font-weight:600;margin-top:3px;">${mejor2.nombre}</div>
                <div style="font-size:16px;font-weight:800;color:var(--success);margin-top:2px;">${mejor2.oneRM.toFixed(1)} kg</div>
              ` : '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Sin datos</div>'}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- COMPARACIÓN GENERAL -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">📅 ${this._etiquetaFecha(f1)}</div>
          <div style="font-size:20px;font-weight:800;color:var(--text);">${t1.volumen.toFixed(0)} kg</div>
          <div style="font-size:10px;color:var(--text-secondary);">Volumen</div>
        </div>
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">📅 ${this._etiquetaFecha(f2)}</div>
          <div style="font-size:20px;font-weight:800;color:var(--text);">${t2.volumen.toFixed(0)} kg</div>
          <div style="font-size:10px;color:var(--text-secondary);">Volumen</div>
        </div>
      </div>

      <!-- DIFERENCIAS -->
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