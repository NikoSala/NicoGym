// ==========================================
// ESTADÍSTICAS + PROGRESO
// ==========================================
const Estadisticas = {
  ejercicioSeleccionado: "",
  metricaEjercicio: "peso",

  _graficoEjercicio() {
    const activos = ExerciseProgression.ejerciciosActivos();
    if (!activos.length) return `<section class="card stats-chart-card exercise-chart-card"><div class="stats-section-heading"><div><p>RENDIMIENTO</p><h2>Progresión por ejercicio</h2></div></div><div class="stats-empty">No hay ejercicios en las rutinas actuales.</div></section>`;
    if (!activos.some((ej) => ej.id === this.ejercicioSeleccionado)) this.ejercicioSeleccionado = activos[0].id;
    const seleccionado = activos.find((ej) => ej.id === this.ejercicioSeleccionado) || activos[0];
    const historial = ExerciseProgression.historial(seleccionado);
    const colores = ["#c33251", "#d6a94a", "#aab3bd", "#78a9bd", "#b28aae", "#e0a579"];
    const ancho = 760, alto = 300, izquierda = 58, derecha = 18, arriba = 22, abajo = 58;
    const plotW = ancho - izquierda - derecha, plotH = alto - arriba - abajo;
    const valores = historial.flatMap((sesion) => this.metricaEjercicio === "peso" ? sesion.pesos : sesion.reps).filter(Number.isFinite);
    const min = valores.length ? Math.min(...valores) : 0;
    const max = valores.length ? Math.max(...valores) : 1;
    const margen = Math.max((max - min) * 0.15, this.metricaEjercicio === "peso" ? 1 : 1);
    const yMin = Math.max(0, min - margen), yMax = max + margen || 1;
    const x = (i) => izquierda + (historial.length <= 1 ? plotW / 2 : (i / (historial.length - 1)) * plotW);
    const y = (value) => arriba + ((yMax - value) / (yMax - yMin || 1)) * plotH;
    const seriesCount = Math.max(0, ...historial.map((sesion) => this.metricaEjercicio === "peso" ? sesion.pesos.length : sesion.reps.length));
    const lineas = Array.from({ length: seriesCount }, (_, serie) => {
      const pts = historial.map((sesion, i) => ({ x: x(i), y: y((this.metricaEjercicio === "peso" ? sesion.pesos : sesion.reps)[serie]), value: (this.metricaEjercicio === "peso" ? sesion.pesos : sesion.reps)[serie] })).filter((p) => Number.isFinite(p.value));
      const segmentos = pts.slice(1).map((p, i) => `<line x1="${pts[i].x}" y1="${pts[i].y}" x2="${p.x}" y2="${p.y}" stroke="${colores[serie % colores.length]}" stroke-width="2.5" stroke-linecap="round" opacity=".82"/>`).join("");
      const puntos = pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${colores[serie % colores.length]}" stroke="#17181c" stroke-width="2"><title>Serie ${serie + 1}: ${p.value}${this.metricaEjercicio === "peso" ? " kg" : " reps"}</title></circle>`).join("");
      return `${segmentos}${puntos}`;
    }).join("");
    const lineasGuia = Array.from({ length: 5 }, (_, i) => {
      const valor = yMax - ((yMax - yMin) * i / 4), yy = arriba + plotH * i / 4;
      return `<line x1="${izquierda}" y1="${yy}" x2="${ancho - derecha}" y2="${yy}" stroke="rgba(222,214,202,.10)"/><text x="${izquierda - 9}" y="${yy + 4}" text-anchor="end" fill="#a7a19a" font-size="11">${Number(valor.toFixed(1)).toLocaleString("es-ES")}</text>`;
    }).join("");
    const tickStep = Math.max(1, Math.ceil(historial.length / 6));
    const fechas = historial.map((sesion, i) => i % tickStep === 0 || i === historial.length - 1
      ? `<text x="${x(i)}" y="${alto - 26}" text-anchor="middle" fill="#a7a19a" font-size="10">${escapeHTML(UI.formatearFecha(sesion.fecha))}</text>` : "").join("");
    const unidades = this.metricaEjercicio === "peso" ? "kg" : "reps";
    const leyenda = Array.from({ length: seriesCount }, (_, i) => `<span><i style="--series-color:${colores[i % colores.length]}"></i> Serie ${i + 1}</span>`).join("");
    const tabla = historial.slice().reverse().map((sesion) => `<tr><td>${escapeHTML(UI.formatearFecha(sesion.fecha))}</td><td>${sesion.pesos.map((peso, i) => `S${i + 1}: ${peso} kg`).join(" · ") || "—"}</td><td>${sesion.reps.map((reps, i) => `S${i + 1}: ${reps}`).join(" · ") || "—"}</td><td>${sesion.reps.length}</td></tr>`).join("");

    return `<section class="card stats-chart-card exercise-chart-card">
      <div class="stats-section-heading"><div><p>RENDIMIENTO</p><h2><i class="fa-solid fa-chart-line"></i> Progresión por ejercicio</h2><span class="stats-section-copy">Una gráfica dinámica con el historial del ejercicio elegido.</span></div></div>
      <div class="exercise-chart-controls"><label>Ejercicio<select id="exerciseChartSelect" onchange="Estadisticas.actualizarGrafico()">${activos.map((ej) => `<option value="${escapeHTML(ej.id)}" ${ej.id === seleccionado.id ? "selected" : ""}>${escapeHTML(ej.nombre)}</option>`).join("")}</select></label><label>Métrica<select id="exerciseChartMetric" onchange="Estadisticas.actualizarGrafico()"><option value="peso" ${this.metricaEjercicio === "peso" ? "selected" : ""}>Peso utilizado (kg)</option><option value="repeticiones" ${this.metricaEjercicio === "repeticiones" ? "selected" : ""}>Repeticiones</option></select></label></div>
      <div class="exercise-chart-legend">${leyenda}</div>
      ${historial.length ? `<div class="exercise-chart-scroll"><svg class="exercise-chart-svg" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Evolución de ${escapeHTML(seleccionado.nombre)} por sesión, en ${unidades}">${lineasGuia}${lineas}${fechas}<text x="${izquierda}" y="15" fill="#c7cbd1" font-size="11">${unidades}</text></svg></div>` : `<div class="stats-empty"><i class="fa-solid fa-chart-line"></i><span>Aún no hay registros de ${escapeHTML(seleccionado.nombre)}.</span></div>`}
      <div class="exercise-history-table-wrap"><h3>Historial de ${escapeHTML(seleccionado.nombre)}</h3><table class="exercise-history-table"><thead><tr><th>Fecha</th><th>Peso por serie</th><th>Repeticiones</th><th>Series</th></tr></thead><tbody>${tabla || `<tr><td colspan="4">Sin sesiones guardadas.</td></tr>`}</tbody></table></div>
    </section>`;
  },

  actualizarGrafico() {
    const ejercicio = document.getElementById("exerciseChartSelect");
    const metrica = document.getElementById("exerciseChartMetric");
    if (ejercicio) this.ejercicioSeleccionado = ejercicio.value;
    if (metrica) this.metricaEjercicio = metrica.value === "repeticiones" ? "repeticiones" : "peso";
    this.render();
  },

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
          volumen += obtenerVolumenEjercicio(ejercicio);
        });
      });
      semanas.push({ inicio, volumen, sesiones });
    }
    return semanas;
  },

  _fuerzaPorEjercicio() {
    const mapa = {};
    STATE.historialEntrenos.forEach(entreno => (entreno.ejercicios || []).forEach(ejercicio => {
      if (ejercicio.unidad === "segundos") return;
      const reps = parseReps(ejercicio.reps);
      if (!reps.valid) return;
      const pesos = obtenerPesosSeries(ejercicio, reps.series);
      if (!pesos.some((peso) => peso > 0)) return;
      const indiceMejorSerie = reps.series.reduce((mejor, repeticiones, indice) =>
        PROGRESION.estimar1RM(pesos[indice], repeticiones) > PROGRESION.estimar1RM(pesos[mejor], reps.series[mejor]) ? indice : mejor, 0);
      const oneRM = PROGRESION.estimar1RM(pesos[indiceMejorSerie], reps.series[indiceMejorSerie]);
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
        volumen += obtenerVolumenEjercicio(ejercicio);
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
    const altura = Number(STATE.altura || CONFIG.ALTURA) || 0;
    const imc = ev.currentWeight && altura > 0 ? ev.currentWeight / ((altura / 100) ** 2) : 0;
    const maxVolumen = Math.max(1, ...semanas.map(s => s.volumen));
    const max1RM = Math.max(1, ...fuerza.map(x => x.oneRM));
    const minPeso = pesos.length ? Math.min(...pesos.map(m => Number(m.peso) || 0)) : 0;
    const maxPeso = pesos.length ? Math.max(...pesos.map(m => Number(m.peso) || 0)) : 0;
    const rangoPeso = Math.max(0.5, maxPeso - minPeso);
    const delta = (valor, unidad) => `${valor > 0 ? '+' : ''}${valor.toFixed(1)}${unidad}`;
    const tono = valor => valor < 0 ? 'positive' : valor > 0 ? 'warning' : 'neutral';
    const vacio = (icono, texto) => `<div class="stats-empty"><i class="fa-solid ${icono}"></i><span>${texto}</span></div>`;
    const semanaActual = semanas[semanas.length - 1];
    const semanaAnterior = semanas[semanas.length - 2];
    const cambioVolumen = semanaAnterior?.volumen ? ((semanaActual.volumen - semanaAnterior.volumen) / semanaAnterior.volumen) * 100 : null;
    const mensajePrincipal = resumen.sesiones === 0
      ? 'Aún no has entrenado esta semana. Una sesión es suficiente para poner el contador en marcha.'
      : resumen.sesiones === 1
        ? 'Buen comienzo. Completa una segunda sesión para consolidar tu ritmo semanal.'
        : `Vas a buen ritmo: llevas ${resumen.sesiones} sesiones esta semana.`;
    const etiquetaVolumen = cambioVolumen === null
      ? 'Primera semana con referencia'
      : `${cambioVolumen >= 0 ? '+' : ''}${Math.round(cambioVolumen)}% frente a la semana anterior`;

    c.innerHTML = `
      <section class="stats-hero">
        <div><p class="stats-eyebrow"><i class="fa-solid fa-chart-line"></i> PANEL DE PROGRESO</p><h1>Tu rendimiento, de un vistazo.</h1><p class="stats-hero-copy">${ultima ? `Última medición: <strong>${ultima.peso} kg</strong>${ultima.cintura ? ` · ${ultima.cintura} cm de cintura` : ''}` : 'Registra tu primera medición para empezar a ver tu evolución.'}</p></div>
        <div class="stats-hero-score"><span>Esta semana</span><strong>${resumen.sesiones}</strong><small>sesiones</small></div>
      </section>
      <section class="stats-focus-card">
        <span class="stats-focus-icon"><i class="fa-solid ${resumen.sesiones ? 'fa-bolt' : 'fa-flag'}"></i></span>
        <div><p>EN QUÉ FIJARTE AHORA</p><strong>${mensajePrincipal}</strong></div>
        <span class="stats-focus-detail">${etiquetaVolumen}</span>
      </section>
      <section class="stats-body-card card">
        <div class="stats-section-heading"><div><p>CUERPO</p><h2>Última medición</h2><span class="stats-section-copy">Una lectura rápida de tus datos corporales.</span></div><i class="fa-solid fa-scale-balanced"></i></div>
        ${ultima ? `
          <div class="stats-body-primary">
            <div><span>Peso</span><strong>${ultima.peso} kg</strong></div>
            <div><span>Grasa corporal</span><strong>${ultima.grasaPorcentaje > 0 ? `${ultima.grasaPorcentaje}%` : '--'}</strong></div>
            <div><span>Masa muscular</span><strong>${ultima.masaMuscular > 0 ? `${ultima.masaMuscular} kg` : '--'}</strong></div>
          </div>
          <div class="stats-body-secondary">
            <span>Cintura <strong>${ultima.cintura > 0 ? `${ultima.cintura} cm` : '--'}</strong></span>
            <span>Masa magra <strong>${ultima.masaMagra > 0 ? `${ultima.masaMagra} kg` : '--'}</strong></span>
            <span>Grasa visceral <strong>${ultima.grasaVisceral > 0 ? ultima.grasaVisceral : '--'}</strong></span>
          </div>
        ` : `<div class="stats-empty"><i class="fa-solid fa-scale-balanced"></i><span>Aún no hay mediciones corporales.</span></div>`}
      </section>
      <section class="stats-kpis" aria-label="Indicadores principales">
        <div class="stats-kpi ${tono(cambioPeso)}"><span class="stats-kpi-icon"><i class="fa-solid fa-scale-balanced"></i></span><div><span class="stats-kpi-label">Cambio de peso</span><strong>${ev.currentWeight ? delta(cambioPeso, ' kg') : '--'}</strong><small>desde el inicio</small></div></div>
        <div class="stats-kpi ${tono(cambioCintura)}"><span class="stats-kpi-icon"><i class="fa-solid fa-ruler-horizontal"></i></span><div><span class="stats-kpi-label">Cintura</span><strong>${ev.currentWaist ? delta(cambioCintura, ' cm') : '--'}</strong><small>desde el inicio</small></div></div>
        <div class="stats-kpi neutral"><span class="stats-kpi-icon"><i class="fa-solid fa-dumbbell"></i></span><div><span class="stats-kpi-label">Entrenamientos</span><strong>${STATE.diasEntrenados.length || 0}</strong><small>completados</small></div></div>
        <div class="stats-kpi accent"><span class="stats-kpi-icon"><i class="fa-solid fa-trophy"></i></span><div><span class="stats-kpi-label">Récords</span><strong>${STATE.records.length}</strong><small>personales</small></div></div>
      </section>
      <section class="card stats-week-card"><div class="stats-section-heading"><div><p>RESUMEN</p><h2>Semana actual</h2></div><i class="fa-solid fa-calendar-week"></i></div><div class="week-summary"><div class="week-summary-item"><div class="value">${resumen.sesiones}</div><div class="label">Sesiones</div></div><div class="week-summary-item"><div class="value">${Math.round(resumen.volumen).toLocaleString('es-ES')}</div><div class="label">Volumen kg</div></div><div class="week-summary-item"><div class="value">${resumen.records}</div><div class="label">Récords</div></div><div class="week-summary-item"><div class="value">${imc ? imc.toFixed(1) : '--'}</div><div class="label">IMC actual</div></div></div></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>ENTRENAMIENTO</p><h2><i class="fa-solid fa-weight-hanging"></i> Volumen semanal</h2><span class="stats-section-copy">Carga total movida en cada semana.</span></div><span class="stats-heading-value">${semanas.some(s => s.volumen) ? `${Math.round(maxVolumen).toLocaleString('es-ES')} kg máx.` : 'Aún sin datos'}</span></div><div class="chart-wrap">${semanas.some(s => s.volumen) ? semanas.map(s => `<div class="chart-row"><span class="chart-label">${UI.formatearFecha(s.inicio)}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.round((s.volumen / maxVolumen) * 100)}%"></div></div><span class="chart-value">${Math.round(s.volumen).toLocaleString('es-ES')}</span></div>`).join('') : vacio('fa-chart-column', 'Completa entrenamientos para ver tu volumen semanal.')}</div></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>CUERPO</p><h2><i class="fa-solid fa-scale-balanced"></i> Evolución del peso</h2><span class="stats-section-copy">Cada registro corporal, ajustado a tu rango real.</span></div>${pesos.length ? `<span class="stats-heading-value">${minPeso.toFixed(1)}–${maxPeso.toFixed(1)} kg</span>` : ''}</div><div class="chart-wrap">${pesos.map(m => `<div class="chart-row"><span class="chart-label">${UI.formatearFecha(m.fecha || '')}</span><div class="chart-track"><div class="chart-bar weight-bar" style="width:${Math.round(12 + (((Number(m.peso) || minPeso) - minPeso) / rangoPeso) * 88)}%"></div></div><span class="chart-value">${m.peso} kg</span></div>`).join('') || vacio('fa-scale-balanced', 'Aún no hay mediciones registradas.')}</div></section>
      <section class="card stats-chart-card"><div class="stats-section-heading"><div><p>RENDIMIENTO</p><h2><i class="fa-solid fa-dumbbell"></i> Fuerza estimada</h2><span class="stats-section-copy">Tu mejor 1RM teórico por ejercicio.</span></div><span class="stats-heading-value">1RM</span></div><div class="chart-wrap">${fuerza.map(x => `<div class="chart-row"><span class="chart-label">${escapeHTML(x.nombre)}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.round((x.oneRM / max1RM) * 100)}%"></div></div><span class="chart-value">${x.oneRM.toFixed(1)}</span></div>`).join('') || vacio('fa-dumbbell', 'Completa entrenamientos para ver tu tendencia de fuerza.')}</div><p class="stats-note">El 1RM es una referencia de tendencia y no cambia la recomendación de 3 series de 8–12.</p></section>
      ${this._graficoEjercicio()}
    `;
  }
};
