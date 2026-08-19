// ==========================================
// ESTADÍSTICAS + PROGRESO
// ==========================================
const Estadisticas = {
    _semanas() {
        const out = [];
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        for (let i = 7; i >= 0; i--) {
            const fin = new Date(hoy);
            fin.setDate(fin.getDate() - i * 7);
            const inicio = new Date(fin);
            const day = inicio.getDay() || 7;
            inicio.setDate(inicio.getDate() - day + 1);
            inicio.setHours(0,0,0,0);
            const siguiente = new Date(inicio); siguiente.setDate(siguiente.getDate()+7);
            let volumen = 0, sesiones = 0;
            STATE.historialEntrenos.forEach(e => {
                const f = new Date(e.fecha);
                if (f >= inicio && f < siguiente) {
                    sesiones++;
                    (e.ejercicios || []).forEach(ej => {
                        const p = parseReps(ej.reps);
                        if (p.valid) volumen += (Number(ej.peso)||0) * p.total;
                    });
                }
            });
            out.push({ inicio, volumen, sesiones });
        }
        return out;
    },

    _fuerzaPorEjercicio() {
        const mapa = {};
        STATE.historialEntrenos.forEach(ent => (ent.ejercicios || []).forEach(ej => {
            const p = parseReps(ej.reps);
            if (!p.valid || !ej.peso) return;
            const maxReps = Math.max(...p.series);
            const oneRM = PROGRESION.estimar1RM(ej.peso, maxReps);
            if (!mapa[ej.nombre] || oneRM > mapa[ej.nombre].oneRM) mapa[ej.nombre] = { nombre: ej.nombre, oneRM, peso: ej.peso, reps: maxReps };
        }));
        return Object.values(mapa).sort((a,b)=>b.oneRM-a.oneRM).slice(0,6);
    },

    _resumenSemanaActual() {
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        const day = hoy.getDay() || 7;
        const inicio = new Date(hoy); inicio.setDate(hoy.getDate()-day+1); inicio.setHours(0,0,0,0);
        const fin = new Date(inicio); fin.setDate(fin.getDate()+7);
        let volumen = 0, sesiones = 0, records = 0;
        STATE.historialEntrenos.forEach(e => {
            const f = new Date(e.fecha);
            if (f >= inicio && f < fin) {
                sesiones++;
                (e.ejercicios||[]).forEach(ej => { const p=parseReps(ej.reps); if(p.valid) volumen += (Number(ej.peso)||0)*p.total; });
            }
        });
        records = STATE.records.filter(r => {
            const d = r.date ? new Date(r.date.split('/').reverse().join('-')) : null;
            return d && d >= inicio && d < fin;
        }).length;
        return { sesiones, volumen, records };
    },

    render() {
        const c = document.getElementById('estadisticasContainer');
        if (!c) return;
        const ev = STATE.evolution;
        const total = STATE.diasEntrenados.length || 0;
        const wc = (ev.currentWeight - ev.initialWeight).toFixed(1);
        const wc2 = (ev.currentWaist - ev.initialWaist).toFixed(1);
        const altura = STATE.altura || CONFIG.ALTURA;
        const imc = ev.currentWeight ? ev.currentWeight / ((altura / 100) ** 2) : 0;
        const semanas = this._semanas();
        const maxVol = Math.max(1, ...semanas.map(s=>s.volumen));
        const fuerza = this._fuerzaPorEjercicio();
        const max1RM = Math.max(1, ...fuerza.map(x=>x.oneRM));
        const semanal = this._resumenSemanaActual();
        const ultima = STATE.mediciones[STATE.mediciones.length-1];

        c.innerHTML = `
            <div class="card">
                <div class="card-title"><i class="fa-solid fa-chart-line"></i> Progreso</div>
                <div class="stats-grid">
                    <div class="stats-item"><div class="num ${parseFloat(wc)<0?'green':'orange'}">${wc}</div><div class="label">Peso</div></div>
                    <div class="stats-item"><div class="num ${parseFloat(wc2)<0?'green':'orange'}">${wc2}</div><div class="label">Cintura</div></div>
                    <div class="stats-item"><div class="num primary">${imc ? imc.toFixed(1) : '--'}</div><div class="label">IMC</div></div>
                    <div class="stats-item"><div class="num primary">${total}</div><div class="label">Entrenos</div></div>
                    <div class="stats-item"><div class="num green">${ev.daysWithoutSmoking || 0}</div><div class="label">Sin fumar</div></div>
                    <div class="stats-item"><div class="num info">${STATE.records.length}</div><div class="label">Récords</div></div>
                </div>
                ${ultima ? `<div style="margin-top:10px;text-align:center;font-size:11px;color:var(--text-secondary);">Última medición: <strong>${ultima.peso} kg</strong>${ultima.cintura ? ` · ${ultima.cintura} cm cintura` : ''}</div>` : ''}
            </div>

            <div class="card">
                <div class="card-title"><i class="fa-solid fa-calendar-week"></i> Resumen semanal</div>
                <div class="week-summary">
                    <div class="week-summary-item"><div class="value">${semanal.sesiones}</div><div class="label">Sesiones</div></div>
                    <div class="week-summary-item"><div class="value">${Math.round(semanal.volumen).toLocaleString('es-ES')}</div><div class="label">Volumen kg</div></div>
                    <div class="week-summary-item"><div class="value">${semanal.records}</div><div class="label">Récords</div></div>
                    <div class="week-summary-item"><div class="value">${ultima?.peso ?? '--'}</div><div class="label">Peso actual</div></div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fa-solid fa-weight-hanging"></i> Volumen semanal</div>
                <div class="chart-wrap">
                    ${semanas.map(s => `<div class="chart-row"><span class="chart-label">${UI.formatearFecha(s.inicio)}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.round((s.volumen/maxVol)*100)}%"></div></div><span class="chart-value">${Math.round(s.volumen)}</span></div>`).join('')}
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fa-solid fa-scale-balanced"></i> Evolución del peso</div>
                <div class="chart-wrap">
                    ${STATE.mediciones.slice(-8).map(m => `<div class="chart-row"><span class="chart-label">${UI.formatearFecha(m.fecha || '')}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.min(100, Math.max(0, Number(m.peso||0)*1.2))}%"></div></div><span class="chart-value">${m.peso} kg</span></div>`).join('') || '<div style="color:var(--text-secondary);font-size:11px;">Aún no hay suficientes mediciones.</div>'}
                </div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fa-solid fa-dumbbell"></i> Fuerza estimada</div>
                <div class="chart-wrap">
                    ${fuerza.map(x => `<div class="chart-row"><span class="chart-label">${x.nombre}</span><div class="chart-track"><div class="chart-bar" style="width:${Math.round((x.oneRM/max1RM)*100)}%"></div></div><span class="chart-value">${x.oneRM.toFixed(1)}</span></div>`).join('') || '<div style="color:var(--text-secondary);font-size:11px;">Completa entrenamientos para ver tu tendencia de fuerza.</div>'}
                </div>
                <div style="margin-top:8px;font-size:10px;color:var(--text-muted);">1RM estimado como referencia de tendencia, no sustituye la regla de progresión 4×12 del día completo.</div>
            </div>

            <div class="card">
                <div class="card-title"><i class="fa-solid fa-bullseye"></i> Progresión de rutina</div>
                ${Object.entries(STATE.progresion || {}).map(([dia, p]) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:11px;"><span>${CONFIG.NOMBRES_DIAS[dia] || dia}</span><strong style="color:${p.completo?'var(--primary)':'var(--text-secondary)'}">${p.completo ? '4×12 conseguido · carga progresiva recomendada' : 'Objetivo actual: 4×12'}</strong></div>`).join('') || '<div style="font-size:11px;color:var(--text-secondary);">Todavía no hay sesiones suficientes para generar recomendaciones.</div>'}
            </div>
        `;
    }
};
