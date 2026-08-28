// ==========================================
// ESTADÍSTICAS + PROGRESO
// ==========================================
const Estadisticas = {
  _semanas() {
    const semanas = [];
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    for (let i = 7; i >= 0; i--) {
      const fecha = new Date(hoy); fecha.setDate(fecha.getDate() - i * 7);
      const inicio = new Date(fecha);
      inicio.setDate(inicio.getDate() - (inicio.getDay() || 7) + 1);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(inicio); fin.setDate(fin.getDate() + 7);
      let volumen = 0, sesiones = 0;
      STATE.historialEntrenos.forEach(entreno => {
        const dia = new Date(entreno.fecha);
        if (dia < inicio || dia >= fin) return;
        sesiones++;
        (entreno.ejercicios || []).forEach(ejercicio => {
          const reps = parseReps(ejercicio.reps);
          if (reps.valid) volumen += (Number(ejercicio.peso) || 0) * reps.total;
        });
      });
      semanas.push({ inicio, volumen, sesiones });
    }
    return semanas;
  },

  _fuerzaPorEjercicio() {
    const mapa = {};
    STATE.historialEntrenos.forEach(entreno => (entreno.ejercicios || []).forEach(ejercicio => {
      const reps = parseReps(ejercicio.reps);
      if (!reps.valid || !ejercicio.peso) return;
      const oneRM = PROGRESION.estimar1RM(ejercicio.peso, Math.max(...reps.series));
      if (!mapa[ejercicio.nombre] || oneRM > mapa[ejercicio.nombre].oneRM) mapa[ejercicio.nombre] = { nombre: ejercicio.nombre, oneRM };
    }));
    return Object.values(mapa).sort((a, b) => b.oneRM - a.oneRM).slice(0, 6);
  },

  _resumenSemanaActual() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - (hoy.getDay() || 7) + 1); inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio); fin.setDate(fin.getDate() + 7);
    let volumen = 0, sesiones = 0;
    STATE.historialEntrenos.forEach(entreno => {
      const fecha = new Date(entreno.fecha);
      if (fecha < inicio || fecha >= fin) return;
      sesiones++;
      (entreno.ejercicios || []).forEach(ejercicio => {
        const reps = parseReps(ejercicio.reps);
        if (reps.valid) volumen += (Number(ejercicio.peso) || 0) * reps.total;
      });
    });
    const records = STATE.records.filter(record => {
      const fecha = record.date ? new Date(record.date.split('/').reverse().join('-')) : null;
      return fecha && fecha >= inicio && fecha < fin;
    }).length;
    return { sesiones, volumen, records };
  },

  render() {
    const c = document.getElementById('estadisticasContainer');
    if (!c) return;
    const ev = STATE.evolution;
    const semanas = this._semanas();
    const fuerza = this._fuerzaPorEjercicio();
    const resumen = this._resumenSemanaActual();
    const ultima = STATE.mediciones[STATE.mediciones.length - 1];
    const pesos = STATE.mediciones.slice(-8);
    const cambioPeso = ev.currentWeight - ev.initialWeight;
    const cambioCintura = ev.currentWaist - ev.initialWaist;
    const altura = STATE.altura || CONFIG.ALTURA;
    const imc = ev.currentWeight ? ev.currentWeight / ((altura / 100) ** 2) : 0;
    const maxVolumen = Math.max(1, ...semanas.map(s => s.volumen));
    const max1RM = Math.max(1, ...fuerza.map(x => x.oneRM));
    const minPeso = pesos.length ? Math.min(...pesos.map(m => Number(m.peso) || 0)) : 0;
    const maxPeso = pesos.length ? Math.max(...pesos.map(m => Number(m.peso) || 0)) : 0;
    const rangoPeso = Math.max(0.5, maxPeso - minPeso);
    const delta = (valor, unidad) => `${valor > 0 ? '+' : ''}${valor.toFixed(1)}${unidad}`;
    const tono = valor => valor < 0 ? 'positive' : valor > 0 ? 'warning' : 'neutral';
    const vacio = (icono, texto) => `<div class="stats-empty"><i class="fa-solid ${icono}"></i><span>${texto}</span></div>`;

    c.innerHTML = `
      <section class="stats-hero">
        <div><p class="stats-eyebrow"><i class="fa-solid fa-chart-line"></i> PANEL DE PROGRESO</p><h1>Tu rendimiento, de un vistazo.</h1><p class="stats-hero-copy">${ultima ? `Última medición: <strong>${ultima.peso} kg</strong>${ultima.cintura ? ` · ${ultima.cintura} cm de cintura` : ''}` : 'Registra tu primera medición para empezar a ver tu evolución.'}</p></div>
        <div class="stats-hero-score"><span>Esta semana</span><strong>${resumen.sesiones}</strong><small>sesiones</small></div>
      </section>
      <section class="stats-kpis" aria-label="Indicadores principales">
        <div class="stats-kpi ${tono(cambioPeso)}"><span class="stats-kpi-icon"><i class="fa-solid fa-scale-balanced"></i></span><div><span class="stats-kpi-label">Cambio de peso</span><strong>${ev.currentWeight ? delta(cambioPeso, ' kg') : '--'}</strong><small>desde el inicio</small></div></div>
        <div class="stats-kpi ${tono(cambioCintura)}"><span class="stats-kpi-icon"><i class="fa-solid fa-ruler-horizontal"></i></span><div><span class="stats-kpi-label">Cintura</span><strong>${ev.currentWaist ? delta(cambioCintura, ' cm') : '--'}</strong><small>desde el inicio</small></div></div>
        <div class="stats-kpi neutral"><span class="stats-kpi-icon"><i class="fa-solid fa-dumbbell"></i></span><div><span class="stats-kpi-label">Entrenamientos</span><strong>${STATE.diasEntrenados.length || 0}</strong><small>completados</small></div></div>
        <div class="stats-kpi accent"><span class="stats-kpi-icon"><i class="fa-solid fa-trophy"></i></span><div><span class="stats-kpi-label">Récords</span><strong>${STATE.records.length}</strong><small>personales</small></div></div>
      </section>
      <section class="card stats-week-card"><div class="stats-section-heading"><div><p>RESUMEN</p><h2>Semana actual</h2></div><i class="fa-solid fa-calendar-week"></i></div><div class="week-summary"><div class="week-summary-item"><div class="value">${resumen.sesiones}</div><div class="label">Sesiones</div></div><div class="week-summary-item"><div class="value">${Math.round(resumen.volumen).toLocaleString('es-ES')}</div><div class="label">Volumen kg</div></div><div class="week-summary-item"><div class="value">${resumen.records}</div><div class="label">Récords</div></div><div class="week-summary-item"><div class="value">${imc ? imc.toFixed(1) : '--'}</div><div class="label">IMC actual</div></div></div></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>ENTRENAMIENTO</p><h2><i class="fa-solid fa-weight-hanging"></i> Volumen semanal</h2></div><span class="stats-heading-value">${semanas.some(s => s.volumen) ? `${Math.round(maxVolumen).toLocaleString('es-ES')} kg máx.` : 'Aún sin datos'}</span></div><div class="chart-wrap">${semanas.some(s => s.volumen) ? semanas.map(s => `<div class="chart-row"><span class="chart-label">${UI.formatearFecha(s.inicio)}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.round((s.volumen / maxVolumen) * 100)}%"></div></div><span class="chart-value">${Math.round(s.volumen).toLocaleString('es-ES')}</span></div>`).join('') : vacio('fa-chart-column', 'Completa entrenamientos para ver tu volumen semanal.')}</div></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>CUERPO</p><h2><i class="fa-solid fa-scale-balanced"></i> Evolución del peso</h2></div>${pesos.length ? `<span class="stats-heading-value">${minPeso.toFixed(1)}–${maxPeso.toFixed(1)} kg</span>` : ''}</div><div class="chart-wrap">${pesos.map(m => `<div class="chart-row"><span class="chart-label">${UI.formatearFecha(m.fecha || '')}</span><div class="chart-track"><div class="chart-bar weight-bar" style="width:${Math.round(12 + (((Number(m.peso) || minPeso) - minPeso) / rangoPeso) * 88)}%"></div></div><span class="chart-value">${m.peso} kg</span></div>`).join('') || vacio('fa-scale-balanced', 'Aún no hay mediciones registradas.')}</div></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>RENDIMIENTO</p><h2><i class="fa-solid fa-dumbbell"></i> Fuerza estimada</h2></div><span class="stats-heading-value">1RM</span></div><div class="chart-wrap">${fuerza.map(x => `<div class="chart-row"><span class="chart-label">${x.nombre}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.round((x.oneRM / max1RM) * 100)}%"></div></div><span class="chart-value">${x.oneRM.toFixed(1)}</span></div>`).join('') || vacio('fa-dumbbell', 'Completa entrenamientos para ver tu tendencia de fuerza.')}</div><p class="stats-note">El 1RM es una referencia de tendencia; no sustituye la progresión 4×12 del día completo.</p></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>PLAN</p><h2><i class="fa-solid fa-bullseye"></i> Progresión de rutina</h2></div></div><div class="stats-progression">${Object.entries(STATE.progresion || {}).map(([dia, progreso]) => `<div class="stats-progression-row"><span>${CONFIG.NOMBRES_DIAS[dia] || dia}</span><strong class="${progreso.completo ? 'is-complete' : ''}">${progreso.completo ? '4×12 conseguido · siguiente 4×15' : 'Objetivo actual: 4×12'}</strong></div>`).join('') || vacio('fa-bullseye', 'Todavía no hay sesiones suficientes para generar recomendaciones.')}</div></section>
    `;
  }
};
