// ==========================================
        // APP
        // ==========================================
        const APP = {
            _cardioMostrado: false,
            init() {
                const loading = document.getElementById('loadingScreen');
                loading.style.display = 'flex';

                Storage.init();
                const reset = Storage.resetearSemana();
                if (reset) UI.toast('🔄 Nueva semana. ¡A marcar los ejercicios!', 'success');

                this._cargarAjustesBasicos();
                this._renderDashboardInicial();

                setTimeout(() => {
                    loading.classList.add('fade-out');
                    setTimeout(() => { loading.style.display = 'none'; }, 500);
                }, 300);

                setTimeout(() => {
                    this._cargarDatosCompletos();
                }, 100);

                document.addEventListener('click', (e) => {
                    const bell = document.getElementById('bellWrap');
                    const drop = document.getElementById('notifDropdown');
                    if (bell && drop && !bell.contains(e.target)) drop.classList.remove('open');
                });

                return this;
            },

            _cargarAjustesBasicos() {
                const a = STATE.ajustes || {};
                if (a.nombre) STATE.nombre = a.nombre;
                if (a.altura) STATE.altura = a.altura;
                if (a.objetivo) CONFIG.PESO_OBJETIVO = a.objetivo;
                // Cargar preferencia del temporizador: si no existe, false por defecto
                if (STATE.config && STATE.config.temporizadorDescanso !== undefined) {
                    CONFIG.TEMPORIZADOR_DESCANSO = STATE.config.temporizadorDescanso;
                } else {
                    CONFIG.TEMPORIZADOR_DESCANSO = false;
                    if (STATE.config) STATE.config.temporizadorDescanso = false;
                }
                const dia = UI.getDiaNombre();
                diaActivo = dia === 'domingo' ? 'lunes' : dia;
            },

            _renderDashboardInicial() {
                UI.actualizarTopBar();
                Dashboard.render();
                Notificaciones.render();
            },

            _cargarDatosCompletos() {
                if (STATE.mediciones.length > 0) {
                    STATE.evolution.initialWeight = STATE.mediciones[0].peso;
                    STATE.evolution.currentWeight = STATE.mediciones[STATE.mediciones.length - 1].peso;
                    STATE.evolution.initialWaist = STATE.mediciones[0].cintura;
                    STATE.evolution.currentWaist = STATE.mediciones[STATE.mediciones.length - 1].cintura;
                    STATE.evolution.totalWorkouts = STATE.diasEntrenados.length || 0;
                }
                Storage._save();
                Dashboard.render();
                STATE._cargado = true;
            },

            renderizarTodo() {
                UI.actualizarTopBar();
                Dashboard.render();
            },

            navegar(id) {
                if (modoEntrenoActivo) {
                    UI.toast('⚠️ Termina el entrenamiento primero', 'error');
                    return;
                }

                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                const page = document.getElementById(`page-${id}`);
                if (page) page.classList.add('active');

                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                const map = { 'inicio': 0, 'rutinas': 1, 'semana': 2, 'peso': 3, 'estadisticas': 4 };
                const btns = document.querySelectorAll('.nav-btn');
                if (map[id] !== undefined && btns[map[id]]) btns[map[id]].classList.add('active');

                document.querySelectorAll('.side-menu .menu-item').forEach(m => m.classList.remove('active'));
                document.querySelectorAll('.side-menu .menu-item').forEach(m => {
                    const txt = m.textContent.trim().toLowerCase();
                    if (txt.includes(id) || (id === 'estadisticas' && txt.includes('estadísticas')) ||
                        (id === 'peso' && txt.includes('peso')) || (id === 'fotos' && txt.includes('fotos')) ||
                        (id === 'semana' && txt.includes('rutina'))) {
                        m.classList.add('active');
                    }
                });

                if (document.getElementById('sideMenu').classList.contains('open')) UI.toggleMenu();
                window.scrollTo(0, 0);

                switch (id) {
                    case 'rutinas':
                        Rutinas.render();
                        break;
                    case 'semana':
                        Semana.render();
                        break;
                    case 'peso':
                        Peso.render();
                        break;
                    case 'agenda':
                        Agenda.render();
                        break;
                    case 'records':
                        Records.render();
                        break;
                    case 'estadisticas':
                        Estadisticas.render();
                        break;
                    case 'fotos':
                        Fotos.render();
                        break;
                    case 'ajustes':
                        Ajustes.render();
                        break;
                    case 'inicio':
                    default:
                        Dashboard.render();
                        break;
                }
            },

            confirmarReset() { UI.confirmar('¿Borrar TODOS los datos? No se puede deshacer.', () => Storage
                    .resetAll()); },

            // ==========================================
            // CALENDARIO DE ACTUALIZACIONES
            // ==========================================
            obtenerTipoActualizacion() {
                const hoy = new Date();
                return getTipoActualizacion(hoy);
            },

            obtenerProximaActualizacion() {
                return getProximaActualizacion();
            },

            // ==========================================
            // MODO ENTRENO GUIADO
            // ==========================================
            iniciarEntreno(dia) {
                const ejercicios = getEjerciciosPorDia(dia);
                if (ejercicios.length === 0) {
                    UI.toast('No hay ejercicios para este día', 'error');
                    return;
                }
                if (STATE.diasEntrenados.includes(UI.getHoy())) {
                    UI.toast('✅ Este entrenamiento ya fue completado hoy', 'success');
                    return;
                }
                if (['sabado', 'domingo'].includes(dia)) {
                    UI.toast('🚶 Este día no tiene entrenamiento guiado', 'info');
                    return;
                }

                modoEntrenoActivo = true;
                ejerciciosEntreno = ejercicios.map(e => ({ ...e }));
                if (CONFIG.DIAS_CINTA.includes(dia)) {
                    ejerciciosEntreno.push({
                        nombre: 'Caminata en cinta',
                        grupo: 'Cardio suave',
                        dia: dia,
                        esCaminata: true,
                        series: 1,
                        reps: `${CONFIG.MIN_CINTA}–${CONFIG.MAX_CINTA} min`,
                        descanso: 0,
                        descripcion: 'Camina a un ritmo cómodo durante 15–20 minutos. Con el tiempo iremos aumentando poco a poco el ritmo o la duración.',
                        material: ['Cinta de correr'],
                        intensidadMuscular: {}
                    });
                }
                idxEjercicioActual = 0;
                recordsConseguidos = [];
                cardioCompletado = false;
                this._cardioMostrado = false;
                startTimeEntreno = Date.now();
                totalPesoLevantadoEntreno = 0;
                totalVolumenEntreno = 0;
                totalSeriesEntreno = 0;
                totalRepsEntreno = 0;

                document.getElementById('modoEntreno').classList.add('open');
                document.getElementById('meTitulo').textContent = `🏋️ ${CONFIG.NOMBRES_DIAS[dia]}`;
                document.getElementById('meCompletadoMsg').classList.add('hidden');
                this._mostrarEjercicio();
            },

            _mostrarEjercicio() {
                if (idxEjercicioActual >= ejerciciosEntreno.length) {
                    this._finalizarEntreno();
                    return;
                }

                const ej = ejerciciosEntreno[idxEjercicioActual];
                const total = ejerciciosEntreno.length;
                const progreso = Math.round((idxEjercicioActual / total) * 100);

                if (ej.esCaminata) {
                    this._mostrarCaminataComoEjercicio(ej, total, progreso);
                    return;
                }

                document.getElementById('meProgresoTexto').textContent = `${idxEjercicioActual + 1} / ${total}`;
                document.getElementById('meProgresoFill').style.width = `${progreso}%`;
                document.getElementById('meProgresoInfo').textContent = `${progreso}%`;
                document.getElementById('meCompletadoMsg').classList.add('hidden');

                const ultimo = this._getUltimoEntreno(ej.nombre);
                const record = Records.getRecord(ej.nombre);

                const dificultadColor = getDificultadColor(ej.dificultad);
                const dificultadTexto = getDificultadTexto(ej.dificultad);
                const intensidad = ej.intensidadMuscular || {};

                const body = document.getElementById('meBody');

                let html = `
                    <div class="me-ejercicio-card">
                        <div class="me-ej-numero">Ejercicio ${idxEjercicioActual + 1} de ${total}</div>
                        <div class="me-ej-nombre">${ej.nombre}</div>
                        <div class="me-ej-grupo">${ej.grupo}</div>
                        ${ej.urlGif ? `
                            <div class="me-ej-img-wrap">
                                <img src="${ej.urlGif}" class="me-ej-img" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'me-ej-img-fallback\\'>💪</div>'" onclick="UI.abrirLightbox(this.src)" alt="${ej.nombre}" loading="lazy">
                            </div>
                        ` : `
                            <div class="me-ej-img-fallback">💪</div>
                        `}
                        <div class="me-ej-descripcion">${ej.descripcion}</div>
                        <div class="me-ej-dificultad">
                            <span class="dif-label">Dificultad</span>
                            ${dificultadColor} ${dificultadTexto}
                        </div>
                        ${ej.material && ej.material.length > 0 ? `
                            <div class="me-ej-material">
                                ${ej.material.map(m => `<span class="mat-tag">✔ ${m}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${Object.keys(intensidad).length > 0 ? `
                            <div class="me-ej-musculos">
                                ${Object.entries(intensidad).map(([musculo, valor]) => `
                                    <div class="musc-row">
                                        <span class="musc-name">${musculo}</span>
                                        <div class="musc-bar">
                                            <div class="musc-fill" style="width:${Math.min(valor, 100)}%;"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${ej.consejos ? `
                            <div class="me-ej-consejos">
                                <div class="me-ej-consejo-titulo">💡 Consejos</div>
                                <div class="me-ej-consejo-texto">${ej.consejos.split('\n').filter(c => c.trim()).map(c => '• ' + c.trim()).join('<br>')}</div>
                            </div>
                        ` : ''}
                        ${ej.errores ? `
                            <div class="me-ej-errores">
                                <div class="me-ej-error-titulo">❌ Evita</div>
                                <div class="me-ej-error-texto">${ej.errores.split('\n').filter(e => e.trim()).map(e => '• ' + e.trim()).join('<br>')}</div>
                            </div>
                        ` : ''}
                        <div class="me-ej-datos">
                            <span>🎯 ${ej.series} × ${ej.reps}</span>
                            <span>⏱ ${ej.descanso}s descanso</span>
                        </div>
                        ${ultimo ? `<div class="me-ej-ultimo">Último: <strong>${ultimo.peso} kg</strong> · ${ultimo.reps} (${UI.formatearFecha(ultimo.fecha)})</div>` : ''}
                        ${record ? `<div class="me-ej-record">🏆 Récord: <strong>${record.weight} kg × ${record.reps}</strong></div>` : ''}
                        <div class="me-ej-inputs">
                            <div class="me-input-group">
                                <label>Peso (kg)</label>
                                <input type="number" id="mePeso" step="0.5" value="${ultimo ? ultimo.peso : ''}" placeholder="0">
                            </div>
                            <div class="me-input-group">
                                <label>Repeticiones (ej: 10,10,9,8)</label>
                                <input type="text" id="meReps" placeholder="10,10,9,8" value="${ultimo ? ultimo.reps : ''}">
                            </div>
                            <div class="me-input-group">
                                <label>Notas</label>
                                <textarea id="meNotas" placeholder="Comentarios..." rows="2"></textarea>
                            </div>
                        </div>
                        <div class="me-ej-botones">
                            <button class="btn btn-success" onclick="APP._guardarEjercicio()"><i class="fa-solid fa-check"></i> Guardar ejercicio</button>
                        </div>
                    </div>
                `;

                body.innerHTML = html;
                document.getElementById('modoEntreno').scrollTop = 0;
            },

            _guardarEjercicio() {
                const ej = ejerciciosEntreno[idxEjercicioActual];
                const peso = parseFloat(document.getElementById('mePeso').value);
                const reps = document.getElementById('meReps').value.trim() || '-';
                const notas = document.getElementById('meNotas').value.trim() || '';

                if (!peso || peso === 0) {
                    UI.toast('Introduce un peso válido', 'error');
                    return;
                }

                const repsNum = reps.split(',').map(Number).reduce((a, b) => a + b, 0) || 0;
                const seriesNum = reps.split(',').length || 0;

                totalPesoLevantadoEntreno += peso;
                totalVolumenEntreno += peso * repsNum;
                totalSeriesEntreno += seriesNum;
                totalRepsEntreno += repsNum;

                const hoy = UI.getHoy();
                const dia = ej.dia;
                let entrenamientoExistente = STATE.historialEntrenos.find(e => e.fecha === hoy && e.dia === dia);

                const registroEjercicio = {
                    nombre: ej.nombre,
                    peso: peso,
                    reps: reps,
                    tipo: 'mancuerna',
                    discos: {},
                    notas: notas,
                    series: seriesNum,
                    repsTotales: repsNum
                };

                if (entrenamientoExistente) {
                    const ejExistente = entrenamientoExistente.ejercicios.find(e => e.nombre === ej.nombre);
                    if (ejExistente) Object.assign(ejExistente, registroEjercicio);
                    else entrenamientoExistente.ejercicios.push(registroEjercicio);
                } else {
                    STATE.historialEntrenos.push({
                        fecha: hoy,
                        dia: dia,
                        tipo: CONFIG.TIPOS_RUTINA[dia] || dia.toUpperCase(),
                        ejercicios: [registroEjercicio]
                    });
                }

                if (peso > 0 && repsNum > 0) {
                    const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit',
                        year: 'numeric' });
                    if (Records.actualizar(ej.nombre, peso, repsNum, date)) {
                        recordsConseguidos.push(ej.nombre);
                        UI.toast('🏆 ¡Nuevo récord!', 'success');
                    }
                }

                const ejerciciosDia = getEjerciciosPorDia(dia);
                const idxEjercicio = ejerciciosDia.findIndex(e => e.nombre === ej.nombre);
                if (idxEjercicio >= 0) {
                    const id = `${dia}-${idxEjercicio}`;
                    if (!STATE.checks[id]) STATE.checks[id] = true;
                }

                Storage._save();

                this._mostrarMensajeCompletado(ej.nombre);

                idxEjercicioActual++;
                if (idxEjercicioActual >= ejerciciosEntreno.length) {
                    setTimeout(() => this._finalizarEntreno(), CONFIG.TIEMPO_MSG_COMPLETADO + 300);
                } else if (CONFIG.TEMPORIZADOR_DESCANSO) {
                    setTimeout(() => this._mostrarDescanso(), CONFIG.TIEMPO_MSG_COMPLETADO);
                } else {
                    setTimeout(() => this._mostrarEjercicio(), CONFIG.TIEMPO_MSG_COMPLETADO);
                }
            },

            _mostrarMensajeCompletado(nombre) {
                const msg = document.getElementById('meCompletadoMsg');
                msg.textContent = `✔ ${nombre} completado`;
                msg.classList.remove('hidden');
                if (msgCompletadoTimeout) clearTimeout(msgCompletadoTimeout);
            },

            _mostrarDescanso() {
                const ej = ejerciciosEntreno[idxEjercicioActual];
                const descanso = ej.descanso || 60;
                tiempoDescanso = descanso;

                const body = document.getElementById('meBody');
                body.innerHTML = `
                    <div class="me-descanso">
                        <div style="font-size:22px;margin-bottom:6px;">⏱️</div>
                        <div class="me-timer" id="meTimer">${tiempoDescanso}</div>
                        <div class="me-timer-label">Descanso antes del siguiente ejercicio</div>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:3px;">Próximo: ${ej.nombre}</div>
                        <button class="btn btn-primary me-siguiente" onclick="APP._saltarDescanso()">
                            <i class="fa-solid fa-forward"></i> Saltar descanso
                        </button>
                    </div>
                `;

                if (temporizadorDescanso) clearInterval(temporizadorDescanso);
                temporizadorDescanso = setInterval(() => {
                    tiempoDescanso--;
                    const el = document.getElementById('meTimer');
                    if (el) el.textContent = tiempoDescanso;
                    if (tiempoDescanso <= 0) {
                        clearInterval(temporizadorDescanso);
                        temporizadorDescanso = null;
                        document.getElementById('meCompletadoMsg').classList.add('hidden');
                        APP._mostrarEjercicio();
                    }
                }, 1000);
            },

            _saltarDescanso() {
                if (temporizadorDescanso) {
                    clearInterval(temporizadorDescanso);
                    temporizadorDescanso = null;
                }
                document.getElementById('meCompletadoMsg').classList.add('hidden');
                this._mostrarEjercicio();
            },

            _mostrarCaminataComoEjercicio(ej, total, progreso) {
                const body = document.getElementById('meBody');
                document.getElementById('meProgresoTexto').textContent = `${idxEjercicioActual + 1} / ${total}`;
                document.getElementById('meProgresoFill').style.width = `${progreso}%`;
                document.getElementById('meProgresoInfo').textContent = `${progreso}% · Último ejercicio`;
                document.getElementById('meCompletadoMsg').classList.add('hidden');
                body.innerHTML = `
                    <div class="me-caminata-card">
                        <div class="me-ej-numero">Ejercicio ${idxEjercicioActual + 1} de ${total}</div>
                        <div class="me-caminata-icon"><i class="fa-solid fa-person-walking"></i></div>
                        <div class="me-caminata-tag">Cardio suave</div>
                        <div class="me-caminata-title">Caminata en cinta</div>
                        <div class="me-caminata-time">${CONFIG.MIN_CINTA}–${CONFIG.MAX_CINTA} minutos · andando</div>
                        <div class="me-caminata-note">Mantén un ritmo cómodo. Con el tiempo iremos aumentando poco a poco el ritmo o la duración.</div>
                        <button class="btn btn-primary btn-block" onclick="APP._completarCaminataComoEjercicio()">
                            <i class="fa-solid fa-check"></i> He terminado la caminata
                        </button>
                    </div>`;
                document.getElementById('modoEntreno').scrollTop = 0;
            },

            _completarCaminataComoEjercicio() {
                const ej = ejerciciosEntreno[idxEjercicioActual];
                const hoy = UI.getHoy();
                let entrenamientoExistente = STATE.historialEntrenos.find(e => e.fecha === hoy && e.dia === ej.dia);
                const registroCardio = { nombre: ej.nombre, tipo: 'caminata', minutos: `${CONFIG.MIN_CINTA}-${CONFIG.MAX_CINTA}`, notas: '' };
                if (entrenamientoExistente) {
                    const existente = entrenamientoExistente.ejercicios.find(e => e.nombre === ej.nombre);
                    if (existente) Object.assign(existente, registroCardio);
                    else entrenamientoExistente.ejercicios.push(registroCardio);
                } else {
                    STATE.historialEntrenos.push({ fecha: hoy, dia: ej.dia, tipo: CONFIG.TIPOS_RUTINA[ej.dia] || ej.dia.toUpperCase(), ejercicios: [registroCardio] });
                }
                cardioCompletado = true;
                Storage._save();
                this._mostrarMensajeCompletado(ej.nombre);
                idxEjercicioActual++;
                setTimeout(() => this._finalizarEntreno(), CONFIG.TIEMPO_MSG_COMPLETADO + 200);
            },

            _finalizarEntreno() {
                if (temporizadorDescanso) {
                    clearInterval(temporizadorDescanso);
                    temporizadorDescanso = null;
                }
                if (msgCompletadoTimeout) clearTimeout(msgCompletadoTimeout);

                const tiempoEmpleado = Math.round((Date.now() - startTimeEntreno) / 60000);
                const dia = ejerciciosEntreno[0]?.dia || '';

                const hoyStr = UI.getHoy();
                if (!STATE.diasEntrenados.includes(hoyStr)) {
                    STATE.diasEntrenados.push(hoyStr);
                    Storage._save();
                }

                const body = document.getElementById('meBody');
                body.innerHTML = `
                    <div class="me-completado-final">
                        <div class="me-feliz">🏆</div>
                        <div class="me-titulo">¡Entrenamiento completado!</div>
                        <div class="me-sub">${CONFIG.NOMBRES_DIAS[dia]} · ${tiempoEmpleado} minutos${CONFIG.DIAS_CINTA.includes(dia) ? ' · 🚶 Cinta 15–20 min' : ''}</div>
                        <div class="me-resumen-grid">
                            <div class="me-res-item">
                                <div class="me-res-valor">${ejerciciosEntreno.length}</div>
                                <div class="me-res-label">Ejercicios</div>
                            </div>
                            <div class="me-res-item">
                                <div class="me-res-valor">${totalSeriesEntreno}</div>
                                <div class="me-res-label">Series</div>
                            </div>
                            <div class="me-res-item">
                                <div class="me-res-valor">${totalRepsEntreno}</div>
                                <div class="me-res-label">Repeticiones</div>
                            </div>
                            <div class="me-res-item">
                                <div class="me-res-valor">${totalPesoLevantadoEntreno.toFixed(1)}</div>
                                <div class="me-res-label">Peso total</div>
                            </div>
                            <div class="me-res-item">
                                <div class="me-res-valor">${totalVolumenEntreno}</div>
                                <div class="me-res-label">Volumen (kg)</div>
                            </div>
                            <div class="me-res-item">
                                <div class="me-res-valor">${recordsConseguidos.length}</div>
                                <div class="me-res-label">Récords</div>
                            </div>
                        </div>
                        ${recordsConseguidos.length > 0 ? `
                            <div class="me-records">
                                <div class="me-rec-titulo">🏆 Nuevos récords</div>
                                <div class="me-rec-item">${recordsConseguidos.join(', ')}</div>
                            </div>
                        ` : ''}
                        <button class="btn btn-primary btn-block" onclick="APP._salirEntreno()" style="margin-top:10px;">
                            <i class="fa-solid fa-check"></i> Finalizar entrenamiento
                        </button>
                    </div>
                `;

                document.getElementById('meProgresoTexto').textContent = `¡Completado!`;
                document.getElementById('meProgresoFill').style.width = `100%`;
                document.getElementById('meProgresoInfo').textContent = `100%`;
                document.getElementById('meCompletadoMsg').classList.add('hidden');

                Storage._save();
                APP.renderizarTodo();
                confetti({ particleCount: 120, spread: 70 });
                UI.toast('🎉 ¡Entrenamiento completado!', 'success');
            },

            _salirEntreno() {
                modoEntrenoActivo = false;
                ejerciciosEntreno = [];
                idxEjercicioActual = 0;
                recordsConseguidos = [];
                cardioCompletado = false;
                this._cardioMostrado = false;
                totalPesoLevantadoEntreno = 0;
                totalVolumenEntreno = 0;
                totalSeriesEntreno = 0;
                totalRepsEntreno = 0;
                if (temporizadorDescanso) {
                    clearInterval(temporizadorDescanso);
                    temporizadorDescanso = null;
                }
                if (msgCompletadoTimeout) clearTimeout(msgCompletadoTimeout);
                document.getElementById('modoEntreno').classList.remove('open');
                APP.renderizarTodo();
                APP.navegar('inicio');
            },

            _getUltimoEntreno(nombre) {
                const ord = [...STATE.historialEntrenos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                for (const e of ord) {
                    const ej = e.ejercicios.find(x => x.nombre === nombre);
                    if (ej) return { fecha: e.fecha, peso: ej.peso, reps: ej.reps };
                }
                return null;
            }
        };

