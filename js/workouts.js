// ==========================================
        // RUTINAS (ENTRENAR)
        // ==========================================
        const Rutinas = {
            render() {
                const tc = document.getElementById('dayTabs');
                const pc = document.getElementById('dayPanelsContainer');
                if (!tc) return;

                const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
                const nombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
                const iconos = ['🔵', '🟢', '🚶', '🟠', '🔵'];

                tc.innerHTML = '';
                pc.innerHTML = '';

                dias.forEach((dia, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'dtab';
                    btn.textContent = `${iconos[idx]} ${nombres[idx]}`;
                    btn.dataset.dia = dia;

                    const esDescanso = ['sabado', 'domingo'].includes(dia);
                    const completado = STATE.diasEntrenados.includes(UI.getHoy()) &&
                        dia === UI.getDiaNombre() &&
                        !esDescanso;

                    if (esDescanso) btn.classList.add('descanso');
                    if (completado) btn.classList.add('completado');

                    btn.onclick = () => {
                        if (esDescanso) {
                            UI.toast('😌 Día de descanso', 'info');
                            return;
                        }
                        this._seleccionarDia(dia);
                    };
                    tc.appendChild(btn);

                    const panel = document.createElement('div');
                    panel.className = 'dia-panel';
                    panel.id = `dp-${dia}`;

                    const esHoy = dia === UI.getDiaNombre();
                    const yaCompletado = STATE.diasEntrenados.includes(UI.getHoy()) && esHoy && !esDescanso;

                    let panelContent = '';

                    if (esDescanso) {
                        panelContent = `<div class="card" style="text-align:center;padding:24px;color:var(--text-secondary);"><span style="font-size:48px;display:block;margin-bottom:8px;">😌</span><div style="font-size:18px;font-weight:600;color:var(--text);">Día de descanso</div></div>`;
                    } else {
                        const ejercicios = getEjerciciosPorDia(dia);
                        const duracion = calcularDuracionEstimada(ejercicios);

                        panelContent = `
                            <div class="card" style="text-align:center;padding:20px;">
                                <span style="font-size:40px;display:block;margin-bottom:8px;">${iconos[idx]}</span>
                                <div style="font-size:20px;font-weight:700;color:var(--text);">${nombres[idx]}</div>
                                <div style="font-size:13px;color:var(--text-secondary);margin:4px 0;">${CONFIG.TIPOS_RUTINA[dia]}</div>
                                <div style="font-size:12px;color:var(--text-secondary);">
                                    🏋️ ${ejercicios.length} ejercicios · ⏱ ${duracion} min
                                </div>
                                ${yaCompletado ? `
                                    <button class="dia-entrenar-btn completado" style="margin-top:12px;">
                                        ✅ Entrenamiento completado
                                    </button>
                                ` : `
                                    <button class="dia-entrenar-btn" onclick="APP.iniciarEntreno('${dia}')" style="margin-top:12px;">
                                        <i class="fa-solid fa-play"></i> Comenzar entrenamiento
                                    </button>
                                `}
                            </div>
                        `;
                    }

                    panel.innerHTML = panelContent;
                    pc.appendChild(panel);
                });

                const diaActual = UI.getDiaNombre();
                diaActivo = diaActual === 'domingo' ? 'lunes' : diaActual;
                const idxActivo = dias.indexOf(diaActivo);
                if (idxActivo >= 0) {
                    const tabs = tc.querySelectorAll('.dtab');
                    const panel = document.getElementById(`dp-${diaActivo}`);
                    if (panel) panel.classList.add('active');
                    if (tabs[idxActivo]) tabs[idxActivo].classList.add('active');
                }

                this._actualizarProgreso();
            },

            _seleccionarDia(dia) {
                document.querySelectorAll('.dia-panel').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));

                const panel = document.getElementById(`dp-${dia}`);
                if (panel) panel.classList.add('active');

                const tab = document.querySelector(`.dtab[data-dia="${dia}"]`);
                if (tab) tab.classList.add('active');

                diaActivo = dia;
                this._actualizarProgreso();
            },

            _actualizarProgreso() {
                const c = document.getElementById('progresoRutinaContainer');
                if (!c) return;

                                const ejercicios = getEjerciciosPorDia(diaActivo);
                if (ejercicios.length === 0) { c.innerHTML = ''; return; }

                let comp = 0;
                ejercicios.forEach((_, idx) => { if (STATE.checks[`${diaActivo}-${idx}`]) comp++; });
                const pct = Math.round((comp / ejercicios.length) * 100);

                const completado = STATE.diasEntrenados.includes(UI.getHoy()) && diaActivo === UI.getDiaNombre();

                if (completado) {
                    c.innerHTML =
                        `<div class="progreso-rutina-bar"><div class="progreso-rutina-completado"><i class="fa-solid fa-circle-check"></i> ¡${CONFIG.NOMBRES_DIAS[diaActivo]} completado!</div></div>`;
                } else if (comp > 0) {
                    c.innerHTML = `
                        <div class="progreso-rutina-bar">
                            <div class="progreso-rutina-header">
                                <span>${CONFIG.NOMBRES_DIAS[diaActivo]} - Progreso</span>
                                <span>${pct}%</span>
                            </div>
                            <div class="progreso-rutina-track"><div class="progreso-rutina-fill" style="width:${pct}%;"></div></div>
                            <div class="progreso-rutina-info">${comp}/${ejercicios.length} ejercicios</div>
                        </div>
                    `;
                } else {
                    c.innerHTML = '';
                }
            }
        };

