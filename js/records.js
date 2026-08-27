// ==========================================
// RECORDS
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
          <div style="text-align:center;color:var(--text-secondary);padding:24px;">
            <div style="font-size:48px;margin-bottom:12px;">🏆</div>
            <p style="font-size:15px;font-weight:600;">Aún no has batido ningún récord</p>
            <p style="font-size:12px;margin-top:4px;">Completa entrenamientos para conseguir tu primera marca</p>
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
      <div class="records-header">
        <div style="font-size:22px;font-weight:800;color:var(--text);">🏆 Récords</div>
        <div style="font-size:11px;color:var(--text-secondary);">${STATE.records.length} marcas conseguidas</div>
      </div>
      
      <div style="display:grid;gap:10px;">
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
            <div class="record-card-modern ${esReciente ? 'record-card-reciente' : ''}" style="animation-delay:${index * 50}ms;">
              <div class="record-card-header">
                <div class="record-icon">${esReciente ? '🥇' : '🏆'}</div>
                <div class="record-info">
                  <div class="record-name">${r.exerciseName}</div>
                  <div class="record-date">📅 ${r.date}</div>
                </div>
              </div>
              <div class="record-stats-modern">
                <div class="record-stat">
                  <div class="record-stat-value" style="color:var(--primary);">${r.weight} kg</div>
                  <div class="record-stat-label">Peso</div>
                </div>
                <div class="record-stat">
                  <div class="record-stat-value" style="color:var(--success);">${r.reps}</div>
                  <div class="record-stat-label">Reps</div>
                </div>
                <div class="record-stat">
                  <div class="record-stat-value" style="color:var(--warning);">${(r.weight * r.reps).toFixed(0)}</div>
                  <div class="record-stat-label">Volumen</div>
                </div>
              </div>
              ${diff ? `
                <div class="record-diff ${Number(diff) > 0 ? 'positive' : 'negative'}">
                  ${Number(diff) > 0 ? '📈' : '📉'} ${Number(diff) > 0 ? '+' : ''}${diff} kg vs anterior
                </div>
              ` : '<div class="record-diff">🏁 Primer récord conseguido</div>'}
              <button class="btn-historial-record" onclick="Records._verHistorial('${r.exerciseName}')">
                📊 Ver historial
              </button>
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
        <div style="padding:10px;border-bottom:1px solid var(--border);${index === 0 ? 'background:rgba(255,255,255,0.03);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;font-size:13px;">📅 ${fecha}</span>
            ${esRécord ? '<span style="font-size:10px;color:var(--success);background:rgba(214,169,74,0.15);padding:2px 8px;border-radius:99px;">🏆 RÉCORD</span>' : ''}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px;font-size:11px;">
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:6px;border-radius:8px;">
              <div style="color:var(--text-muted);font-size:9px;">PESO</div>
              <div style="font-weight:700;color:var(--text);">${peso} kg</div>
            </div>
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:6px;border-radius:8px;">
              <div style="color:var(--text-muted);font-size:9px;">REPS</div>
              <div style="font-weight:700;color:var(--text);">${reps}</div>
            </div>
            <div style="text-align:center;background:rgba(0,0,0,0.15);padding:6px;border-radius:8px;">
              <div style="color:var(--text-muted);font-size:9px;">VOLUMEN</div>
              <div style="font-weight:700;color:var(--text);">${((Number(peso) || 0) * (Number(reps) || 0)).toFixed(0)} kg</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    Modal.abrir(`
      <h3>📊 Historial de ${nombre}</h3>
      <div style="max-height:60vh;overflow-y:auto;margin-top:10px;">
        ${historialHtml}
      </div>
    `);
  }
};