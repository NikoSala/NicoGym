// ==========================================
        // AGENDA
        // ==========================================
        const Agenda = {
            render() {
                const c = document.getElementById('agendaContainer');
                if (!c) return;

                const hoy = new Date();
                const dia = UI.getDiaNombre();
                const entrenadoHoy = STATE.diasEntrenados.includes(UI.getHoy());

                const proximaActualizacion = APP.obtenerProximaActualizacion();
                const diasHastaActualizacion = getDiasHasta(proximaActualizacion);
                const tipoActualizacion = getTipoActualizacion(proximaActualizacion);

                let textoActualizacion = '';
                if (tipoActualizacion === 'completa') {
                    textoActualizacion = '📊 Actualización completa (peso + mediciones + fotos)';
                } else if (tipoActualizacion === 'mediciones') {
                    textoActualizacion = '📊 Actualización de mediciones (peso + mediciones)';
                } else if (tipoActualizacion === 'solo-peso') {
                    textoActualizacion = '📊 Actualización semanal (solo peso)';
                }

                let proxDia = null;
                const diasMap = { 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'domingo' };
                for (let i = 1; i <= 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const diaKey = diasMap[d.getDay()];
                    if (diaKey !== 'sabado' && diaKey !== 'domingo' && !STATE.diasEntrenados
                        .includes(UI.formatFecha(d))) {
                        const ejercicios = getEjerciciosPorDia(diaKey);
                        if (ejercicios.length > 0) {
                            proxDia = CONFIG.NOMBRES_DIAS[diaKey];
                            break;
                        }
                    }
                }

                c.innerHTML = `
                    <div class="card">
                        <div class="card-title">📅 Agenda</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;">${UI.getDiaSemanaNombre(hoy)} · ${hoy.toLocaleDateString('es-ES', {day:'numeric', month:'long'})}</div>

                        <div style="font-size:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Hoy</div>
                        <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
                            <div class="pending-item">
                                <span class="pi-icon">${(dia === 'domingo' || dia === 'sabado') ? '😌' : (entrenadoHoy ? '✅' : '⏳')}</span>
                                <span>${(dia === 'domingo' || dia === 'sabado') ? 'Día de descanso' : (entrenadoHoy ? 'Entreno completado' : 'Entreno pendiente')}</span>
                            </div>
                        </div>

                        <div style="font-size:10px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Próximos</div>
                        <div style="display:flex;flex-direction:column;gap:4px;">
                            <div class="pending-item" style="${diasHastaActualizacion <= 1 ? '' : 'opacity:0.5;'}">
                                <span class="pi-icon">📊</span>
                                <span>${textoActualizacion} ${diasHastaActualizacion <= 1 ? 'mañana' : `en ${diasHastaActualizacion} días`}</span>
                            </div>
                            <div class="pending-item">
                                <span class="pi-icon">💪</span>
                                <span>Próximo entreno: ${proxDia || '--'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        };

