// ==========================================
        // AJUSTES
        // ==========================================
        const Ajustes = {
            render() {
                const c = document.getElementById('ajustesContainer');
                if (!c) return;

                // Leer estado actual del temporizador
                const temporizadorActivo = CONFIG.TEMPORIZADOR_DESCANSO;

                c.innerHTML = `
                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-user"></i> Perfil</div>
                        <div class="ajustes-item"><span class="aj-label">Nombre</span><input class="input input-sm" id="ajusteNombre" value="${STATE.nombre}" style="width:120px;"></div>
                        <div class="ajustes-item"><span class="aj-label">Altura (cm)</span><input class="input input-sm" type="number" id="ajusteAltura" value="${STATE.altura}" style="width:80px;"></div>
                        <div class="ajustes-item"><span class="aj-label">Peso objetivo (kg)</span><input class="input input-sm" type="number" id="ajusteObjetivo" value="${CONFIG.PESO_OBJETIVO}" style="width:80px;"></div>
                        <button class="btn btn-primary btn-block" onclick="Ajustes._guardar()" style="margin-top:10px;"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-bell"></i> Recordatorios</div>
                        <div class="ajustes-item"><span class="aj-label">📏 Mediciones (semanas)</span><input class="input input-sm" type="number" id="ajusteFreqMediciones" value="${STATE.recordatorios.freqMediciones || 2}" min="1" max="8" style="width:60px;"></div>
                        <div class="ajustes-item"><span class="aj-label">📸 Fotos (semanas)</span><input class="input input-sm" type="number" id="ajusteFreqFotos" value="${STATE.recordatorios.freqFotos || 4}" min="1" max="12" style="width:60px;"></div>
                        <button class="btn btn-primary btn-block" onclick="Ajustes._guardarRecordatorios()" style="margin-top:10px;"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-timer"></i> Temporizador</div>
                        <div class="ajustes-item">
                            <span class="aj-label">⏱️ Temporizador de descanso</span>
                            <div class="switch-container">
                                <div class="switch ${temporizadorActivo ? 'active' : ''}" onclick="Ajustes._toggleDescanso()">
                                    <div class="switch-thumb"></div>
                                </div>
                                <span class="switch-label">${temporizadorActivo ? 'Activado' : 'Desactivado'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-calendar"></i> Calendario de actualizaciones</div>
                        <div style="font-size:12px;color:var(--text-secondary);padding:4px 0;">
                            <div>📅 Próxima fecha: <strong>${UI.formatearFecha(APP.obtenerProximaActualizacion())}</strong></div>
                            <div style="margin-top:2px;">🔄 Peso: <strong>cada semana</strong></div>
                            <div>📏 Mediciones: <strong>cada ${STATE.recordatorios.freqMediciones || 2} semanas</strong></div>
                            <div>📸 Fotos: <strong>cada ${STATE.recordatorios.freqFotos || 4} semanas</strong></div>
                            <div>💾 Backup: <strong>recordatorio mensual</strong></div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-database"></i> Datos</div>
                        <button class="btn btn-ghost btn-block" onclick="Storage.exportar()"><i class="fa-solid fa-download"></i> Exportar</button>
                        <button class="btn btn-ghost btn-block" onclick="document.getElementById('importFile').click()" style="margin-top:4px;"><i class="fa-solid fa-upload"></i> Importar</button>
                        <input type="file" id="importFile" accept=".json" class="hidden" onchange="Storage.importar(this.files[0]); this.value='';">
                        <button class="btn btn-danger btn-block" onclick="APP.confirmarReset()" style="margin-top:4px;"><i class="fa-solid fa-trash"></i> Borrar todos los datos</button>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-circle-info"></i> Acerca de</div>
                        <div class="ajustes-item"><span class="aj-label">Versión</span><span style="color:var(--text-secondary);" id="versionDisplay">${CONFIG.VERSION}</span></div>
                        <div style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:6px;">NicoGym · Tu compañero de entrenamiento</div>
                    </div>
                `;
            },

            _guardar() {
                const nombre = document.getElementById('ajusteNombre').value || 'Nico';
                const altura = parseInt(document.getElementById('ajusteAltura').value) || CONFIG.ALTURA;
                const objetivo = parseInt(document.getElementById('ajusteObjetivo').value) || CONFIG.PESO_OBJETIVO;
                STATE.nombre = nombre;
                STATE.altura = altura;
                CONFIG.PESO_OBJETIVO = objetivo;
                STATE.ajustes = { nombre, altura, objetivo };
                Storage._save();
                UI.toast('✅ Ajustes guardados', 'success');
                APP.renderizarTodo();
            },

            _guardarRecordatorios() {
                const fm = parseInt(document.getElementById('ajusteFreqMediciones').value) || 2;
                const ff = parseInt(document.getElementById('ajusteFreqFotos').value) || 4;
                STATE.recordatorios.freqMediciones = fm;
                STATE.recordatorios.freqFotos = ff;
                Storage._save();
                UI.toast('✅ Recordatorios guardados', 'success');
                APP.renderizarTodo();
            },

            _toggleDescanso() {
                CONFIG.TEMPORIZADOR_DESCANSO = !CONFIG.TEMPORIZADOR_DESCANSO;
                STATE.config.temporizadorDescanso = CONFIG.TEMPORIZADOR_DESCANSO;
                Storage._save();
                this.render();
                UI.toast(`⏱️ Temporizador ${CONFIG.TEMPORIZADOR_DESCANSO ? 'activado' : 'desactivado'}`, 'info');
            }
        };

