// ==========================================
// RECORDS (VERSIÓN COMPACTA)
// ==========================================
const Records = {
  getRecord(name) {
    return STATE.records.find(r => r.exerciseName === name);
  },

  actualizar(name, weight, reps, date) {
    const current = this.getRecord(name);
    if (!current || weight > current.weight || (weight === current.weight && reps > current.reps)) {
      STATE.records = STATE.records.filter(r => r.exerciseName !== name);
      STATE.records.push({ exerciseName: name, weight, reps, date });
      Storage._save();
      return true;
    }
    return false;
  },

  render() {
    const c = document.getElementById('recordsContainer');
    if (!c) return;

    if (STATE.records.length === 0) {
      c.innerHTML = `
        <div class="card">
          <div style="text-align:center;color:var(--text-secondary);padding:20px;">
            <div style="font-size:40px;margin-bottom:8px;">🏆</div>
            <p style="font-size:14px;font-weight:600;">Aún no has batido ningún récord</p>
            <p style="font-size:11px;margin-top:3px;">Completa entrenamientos para conseguir tu primera marca</p>
          </div>
        </div>
      `;
      return;
    }

    // Ordenar por peso (mayor a menor)
    const sorted = [...STATE.records].sort((a, b) => b.weight - a.weight);

    // Calcular el récord más reciente
    const recordMasReciente = [...STATE.records].sort((a, b) => 
      new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-'))
    )[0];

    c.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-size:20px;font-weight:800;color:var(--text);">🏆 Récords</div>
        <div style="font-size:11px;color:var(--text-secondary);">${STATE.records.length} marcas</div>
      </div>
      
      <div class="records-grid">
        ${sorted.map((r, index) => {
          // Buscar el récord anterior (si existe)
          const anteriores = STATE.historialEntrenos
            .flatMap(e => e.ejercicios || [])
            .filter(ej => ej.nombre === r.exerciseName && ej.peso)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          const mejorAnterior = anteriores.length > 1 ? anteriores[1].peso : null;
          const diff = mejorAnterior ? (Number(r.weight) - Number(mejorAnterior)).toFixed(1) : null;
          const esReciente = r.exerciseName === recordMasReciente.exerciseName;

          return `
            <div class="record-card-compact ${esReciente ? 'record-card-reciente' : ''}" style="animation-delay:${index * 40}ms;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="font-size:16px;">${esReciente ? '🥇' : '🏆'}</span>
                <span style="font-size:11px;font-weight:700;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.exerciseName}</span>
                <span style="font-size:9px;color:var(--text-muted);">${r.date}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <div style="flex:1;text-align:center;background:rgba(0,0,0,0.15);border-radius:8px;padding:6px 4px;">
                  <div style="font-size:16px;font-weight:800;color:var(--primary);">${r.weight}</div>
                  <div style="font-size:8px;color:var(--text-secondary);">KG</div>
                </div>
                <div style="flex:1;text-align:center;background:rgba(0,0,0,0.15);border-radius:8px;padding:6px 4px;">
                  <div style="font-size:16px;font-weight:800;color:var(--success);">${r.reps}</div>
                  <div style="font-size:8px;color:var(--text-secondary);">REPS</div>
                </div>
                <div style="flex:1;text-align:center;background:rgba(0,0,0,0.15);border-radius:8px;padding:6px 4px;">
                  <div style="font-size:16px;font-weight:800;color:var(--warning);">${(r.weight * r.reps).toFixed(0)}</div>
                  <div style="font-size:8px;color:var(--text-secondary);">VOL</div>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;">
                ${diff ? `
                  <span style="font-size:9px;font-weight:600;color:${Number(diff) > 0 ? 'var(--success)' : 'var(--danger)'};">
                    ${Number(diff) > 0 ? '📈' : '📉'} ${Number(diff) > 0 ? '+' : ''}${diff} kg
                  </span>
                ` : '<span style="font-size:9px;color:var(--text-muted);">🏁 Primer récord</span>'}
                <button class="btn-historial-compact" onclick="Records._verHistorial('${r.exerciseName}')">
                  📊
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _verHistorial(nombre) {
    const sesiones = STATE.historialEntrenos
      .filter(ent => ent.ejercicios.some(ej => ej.nombre === nombre))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (sesiones.length === 0) {
      Modal.abrir(`
        <h3>📊 Historial de ${nombre}</h3>
        <div style="text-align:center;padding:16px;color:var(--text-secondary);">
          No hay sesiones registradas para este ejercicio.
        </div>
      `);
      return;
    }

    const historialHtml = sesiones.map((ent, index) => {
      const registro = ent.ejercicios.find(ej => ej.nombre === nombre);
      const peso = registro?.peso || '--';
      const reps = registro?.reps || '--';
      const fecha = UI.formatearFecha(ent.fecha);
      const esRécord = STATE.records.find(r => r.exerciseName === nombre && r.date === ent.fecha);

      return `
        <div style="padding:8px;border-bottom:1px solid var(--border);${index === 0 ? 'background:rgba(255,255,255,0.03);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;font-size:12px;">📅 ${fecha}</span>
            ${esRécord ? '<span style="font-size:9px;color:var(--success);background:rgba(214,169,74,0.15);padding:2px 6px;border-radius:99px;">🏆 RÉCORD</span>' : ''}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:4px;font-size:10px;">
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:5px;border-radius:6px;">
              <div style="color:var(--text-muted);font-size:8px;">PESO</div>
              <div style="font-weight:700;color:var(--text);">${peso} kg</div>
            </div>
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:5px;border-radius:6px;">
              <div style="color:var(--text-muted);font-size:8px;">REPS</div>
              <div style="font-weight:700;color:var(--text);">${reps}</div>
            </div>
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:5px;border-radius:6px;">
              <div style="color:var(--text-muted);font-size:8px;">VOLUMEN</div>
              <div style="font-weight:700;color:var(--text);">${((Number(peso) || 0) * (Number(reps) || 0)).toFixed(0)} kg</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    Modal.abrir(`
      <h3>📊 Historial de ${nombre}</h3>
      <div style="max-height:60vh;overflow-y:auto;margin-top:8px;">
        ${historialHtml}
      </div>
    `);
  }
};