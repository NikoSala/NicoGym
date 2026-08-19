// ==========================================
        // ESTADÍSTICAS
        // ==========================================
        const Estadisticas = {
            render() {
                const c = document.getElementById('estadisticasContainer');
                if (!c) return;

                const ev = STATE.evolution;
                const total = STATE.diasEntrenados.length || 0;
                const wc = (ev.currentWeight - ev.initialWeight).toFixed(1);
                const wc2 = (ev.currentWaist - ev.initialWaist).toFixed(1);
                const altura = STATE.altura || CONFIG.ALTURA;
                const imc = ev.currentWeight / ((altura / 100) ** 2);

                const hoy = new Date();
                const inicioSemana = new Date(hoy);
                inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
                inicioSemana.setHours(0, 0, 0, 0);
                const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

                let volumenSemana = 0;
                let volumenMes = 0;
                let pesoTotalLevantado = 0;
                let conteoEjercicios = {};

                STATE.historialEntrenos.forEach(e => {
                    const fecha = new Date(e.fecha);
                    e.ejercicios.forEach(ej => {
                        const repsNum = ej.reps.split(',').map(Number).reduce((a, b) => a + b, 0) || 0;
                        const vol = ej.peso * repsNum;
                        pesoTotalLevantado += vol;
                        if (fecha >= inicioSemana) volumenSemana += vol;
                        if (fecha >= inicioMes) volumenMes += vol;
                        conteoEjercicios[ej.nombre] = (conteoEjercicios[ej.nombre] || 0) + 1;
                    });
                });

                const ejerciciosMasRealizados = Object.entries(conteoEjercicios)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3);

                c.innerHTML = `
                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-chart-simple"></i> Estadísticas</div>
                        <div class="stats-grid">
                            <div class="stats-item">
                                <div class="num ${parseFloat(wc) < 0 ? 'green' : 'orange'}">${parseFloat(wc) < 0 ? '' : '+'}${Math.abs(parseFloat(wc))}</div>
                                <div class="label">Peso</div>
                            </div>
                            <div class="stats-item">
                                <div class="num ${parseFloat(wc2) < 0 ? 'green' : 'orange'}">${parseFloat(wc2) < 0 ? '' : '+'}${Math.abs(parseFloat(wc2))}</div>
                                <div class="label">Cintura</div>
                            </div>
                            <div class="stats-item">
                                <div class="num primary">${imc.toFixed(1)}</div>
                                <div class="label">IMC</div>
                            </div>
                            <div class="stats-item">
                                <div class="num primary">${total}</div>
                                <div class="label">Entrenos</div>
                            </div>
                            <div class="stats-item">
                                <div class="num green">${ev.daysWithoutSmoking || 0}</div>
                                <div class="label">Sin fumar</div>
                            </div>
                            <div class="stats-item">
                                <div class="num info">${STATE.records.length}</div>
                                <div class="label">Récords</div>
                            </div>
                        </div>
                        <div style="margin-top:10px;padding:6px 10px;background:rgba(0,0,0,0.1);border-radius:var(--radius-sm);text-align:center;font-size:12px;">
                            🎯 Objetivo: <strong>${CONFIG.PESO_OBJETIVO} kg</strong> · ${STATE.mediciones.length > 0 ? Math.min(100, Math.round(((STATE.mediciones[0].peso - STATE.mediciones[STATE.mediciones.length-1].peso) / (STATE.mediciones[0].peso - CONFIG.PESO_OBJETIVO)) * 100)) : 0}% completado
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-weight-hanging"></i> Volumen</div>
                        <div class="stats-grid">
                            <div class="stats-item">
                                <div class="num primary">${Math.round(volumenSemana)}</div>
                                <div class="label">Semanal (kg)</div>
                            </div>
                            <div class="stats-item">
                                <div class="num primary">${Math.round(volumenMes)}</div>
                                <div class="label">Mensual (kg)</div>
                            </div>
                            <div class="stats-item">
                                <div class="num primary">${Math.round(pesoTotalLevantado)}</div>
                                <div class="label">Total (kg)</div>
                            </div>
                        </div>
                    </div>

                    ${ejerciciosMasRealizados.length > 0 ? `
                        <div class="card">
                            <div class="card-title"><i class="fa-solid fa-star"></i> Ejercicios más realizados</div>
                            ${ejerciciosMasRealizados.map(e => `
                                <div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);font-size:12px;">
                                    <span>${e[0]}</span>
                                    <span style="color:var(--primary);">${e[1]} veces</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
            }
        };

