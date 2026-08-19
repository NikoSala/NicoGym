// ==========================================
        // STORAGE
        // ==========================================
        const Storage = {
            init() {
                const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (raw) {
                    const d = JSON.parse(raw);
                    Object.assign(STATE, d);
                    if (!STATE.recordatorios) STATE.recordatorios = { freqMediciones: 2, freqFotos: 4,
                            ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES, ultimasFotos: null,
                            ultimoPeso: null };
                    if (!STATE.records) STATE.records = [];
                    if (!STATE.evolution) STATE.evolution = { initialWeight: 0, currentWeight: 0, initialWaist: 0,
                            currentWaist: 0, totalWorkouts: 0, daysWithoutSmoking: 0 };
                    if (!STATE.ajustes) STATE.ajustes = {};
                    if (!STATE.config) STATE.config = { temporizadorDescanso: false };
                    if (!STATE.ultimoRegistroPeso) STATE.ultimoRegistroPeso = null;
                    if (!STATE.ultimasMediciones) STATE.ultimasMediciones = null;
                    if (!STATE.ultimasFotosGuardadas) STATE.ultimasFotosGuardadas = null;
                }
                // Si no hay configuración guardada, establecer temporizador en false
                if (STATE.config && STATE.config.temporizadorDescanso === undefined) {
                    STATE.config.temporizadorDescanso = false;
                }
                this._calcularDiasSinFumar();
                this._save();
                return this;
            },
            _calcularDiasSinFumar() {
                let c = 0;
                const f = new Date(CONFIG.FECHA_INICIO_NO_FUMAR);
                const h = new Date();
                while (f <= h) {
                    if (!STATE.diasNoFumar.includes(UI.formatFecha(f))) c++;
                    f.setDate(f.getDate() + 1);
                }
                STATE.evolution.daysWithoutSmoking = c;
            },
            _save() { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(STATE)); },
            resetearSemana() {
                const hoy = new Date();
                const diaSemana = hoy.getDay();
                const semanaActual = this._getSemanaKey(hoy);
                const ultimaSemana = localStorage.getItem('ultimaSemana');
                if (diaSemana === 1 && ultimaSemana !== semanaActual) {
                    STATE.checks = {};
                    localStorage.setItem('ultimaSemana', semanaActual);
                    this._save();
                    return true;
                }
                return false;
            },
            _getSemanaKey(fecha) {
                const d = new Date(fecha);
                d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
                const year = d.getFullYear();
                const week = Math.ceil((((d - new Date(year, 0, 1)) / 86400000) + 1) / 7);
                return `${year}-W${String(week).padStart(2, '0')}`;
            },
            resetAll() { localStorage.removeItem(CONFIG.STORAGE_KEY);
                location.reload(); },
            async exportar() {
                try {
                    // Las fotos de progreso viven en IndexedDB, no en STATE. Se
                    // añaden al JSON solo para el backup y no al localStorage.
                    const fotosProgreso = await Fotos.exportarBackup();
                    const backup = {
                        ...STATE,
                        fotosProgreso: { version: 1, diasFotos: fotosProgreso }
                    };
                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    a.href = url;
                    a.download = 'nicogym_backup.json';
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 0);
                    UI.toast('✅ Datos exportados', 'success');
                } catch (err) {
                    console.error('Error al exportar las fotos:', err);
                    UI.toast('❌ Error al exportar las fotos', 'error');
                }
            },
            // IMPORTAR - función conectada correctamente
            importar(file) {
                if (!file) {
                    UI.toast('❌ No se seleccionó ningún archivo', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const datos = JSON.parse(e.target.result);
                        if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
                            throw new Error('Formato de backup no válido');
                        }
                        // Los backups antiguos no tienen fotosProgreso. En ese
                        // caso se conserva IndexedDB tal como estaba.
                        const fotosProgreso = Array.isArray(datos.fotosProgreso?.diasFotos)
                            ? datos.fotosProgreso.diasFotos : null;
                        const datosEstado = { ...datos };
                        delete datosEstado.fotosProgreso;
                        Object.assign(STATE, datosEstado);

                        // Compatibilidad con backups anteriores: conservar valores
                        // predeterminados si alguna sección no existe en el backup.
                        if (!STATE.recordatorios) STATE.recordatorios = {
                            freqMediciones: 2, freqFotos: 4,
                            ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES,
                            ultimasFotos: null, ultimoPeso: null
                        };
                        if (!STATE.records) STATE.records = [];
                        if (!STATE.evolution) STATE.evolution = {
                            initialWeight: 0, currentWeight: 0, initialWaist: 0,
                            currentWaist: 0, totalWorkouts: 0, daysWithoutSmoking: 0
                        };
                        if (!STATE.ajustes) STATE.ajustes = {};
                        if (!STATE.config) STATE.config = { temporizadorDescanso: false };
                        if (STATE.config.temporizadorDescanso === undefined) {
                            STATE.config.temporizadorDescanso = false;
                        }
                        if (!STATE.ultimoRegistroPeso) STATE.ultimoRegistroPeso = null;
                        if (!STATE.ultimasMediciones) STATE.ultimasMediciones = null;
                        if (!STATE.ultimasFotosGuardadas) STATE.ultimasFotosGuardadas = null;

                        CONFIG.TEMPORIZADOR_DESCANSO = STATE.config.temporizadorDescanso === true;
                        if (fotosProgreso !== null) {
                            await Fotos.restaurarBackup(fotosProgreso);
                        }
                        this._save();
                        UI.toast('✅ Datos importados correctamente', 'success');
                        APP.renderizarTodo();
                    } catch (err) {
                        UI.toast('❌ Error al importar: formato inválido', 'error');
                        console.error('Error al importar:', err);
                    }
                };
                reader.onerror = () => {
                    UI.toast('❌ Error al leer el archivo', 'error');
                };
                reader.readAsText(file);
            }
        };

