// ==========================================
// STORAGE
// ==========================================
const Storage = {
    init() {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (raw) {
            try {
                const d = JSON.parse(raw);
                if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('Estado guardado no válido');
                const clavesPermitidas = Object.keys(STATE);
                clavesPermitidas.forEach(clave => {
                    if (Object.prototype.hasOwnProperty.call(d, clave)) STATE[clave] = d[clave];
                });
            } catch (err) {
                console.warn('Estado local corrupto; se restauran valores iniciales.', err);
                localStorage.removeItem(CONFIG.STORAGE_KEY);
            }
        }
        if (!STATE.recordatorios || typeof STATE.recordatorios !== 'object') STATE.recordatorios = {
            freqMediciones: 2, freqFotos: 4,
            ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES, ultimasFotos: null, ultimoPeso: null
        };
        if (!Array.isArray(STATE.records)) STATE.records = [];
        if (!STATE.evolution || typeof STATE.evolution !== 'object') STATE.evolution = {
            initialWeight: 0, currentWeight: 0, initialWaist: 0, currentWaist: 0,
            totalWorkouts: 0, daysWithoutSmoking: 0
        };
        if (!STATE.ajustes || typeof STATE.ajustes !== 'object') STATE.ajustes = {};
        if (!STATE.config || typeof STATE.config !== 'object') STATE.config = { temporizadorDescanso: false };
        if (typeof STATE.config.temporizadorDescanso !== 'boolean') STATE.config.temporizadorDescanso = false;
        if (STATE.ultimoRegistroPeso === undefined) STATE.ultimoRegistroPeso = null;
        if (STATE.ultimasMediciones === undefined) STATE.ultimasMediciones = null;
        if (STATE.ultimasFotosGuardadas === undefined) STATE.ultimasFotosGuardadas = null;
        CONFIG.TEMPORIZADOR_DESCANSO = STATE.config.temporizadorDescanso === true;
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
    _save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(STATE));
        } catch (err) {
            console.error('No se pudo guardar el estado local:', err);
            if (typeof UI !== 'undefined' && UI.toast) UI.toast('❌ No se pudieron guardar los datos', 'error');
        }
    },
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
    resetAll() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        location.reload();
    },
    async exportar() {
        try {
            const fotosProgreso = await Fotos.exportarBackup();
            const backup = {
                version: 3,
                app: 'NicoGym',
                createdAt: new Date().toISOString(),
                state: { ...STATE },
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
            console.error('Error al exportar:', err);
            UI.toast('❌ Error al exportar los datos', 'error');
        }
    },
    importar(file) {
        if (!file) {
            UI.toast('❌ No se seleccionó ningún archivo', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const datos = JSON.parse(e.target.result);
                if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw new Error('Formato de backup no válido');

                const esNuevoFormato = datos.app === 'NicoGym' && Number.isFinite(datos.version) && datos.state && typeof datos.state === 'object';
                const datosEstado = esNuevoFormato ? datos.state : datos;
                if (!datosEstado || typeof datosEstado !== 'object' || Array.isArray(datosEstado)) throw new Error('Estado no válido');

                const camposValidables = {
                    recordatorios: 'object', records: 'array', evolution: 'object', config: 'object',
                    mediciones: 'array', historialEntrenos: 'array', diasNoFumar: 'array', diasEntrenados: 'array', checks: 'object'
                };
                for (const [campo, tipo] of Object.entries(camposValidables)) {
                    if (datosEstado[campo] === undefined) continue;
                    const correcto = tipo === 'array'
                        ? Array.isArray(datosEstado[campo])
                        : datosEstado[campo] && typeof datosEstado[campo] === 'object' && !Array.isArray(datosEstado[campo]);
                    if (!correcto) throw new Error(`Campo inválido: ${campo}`);
                }

                const fotosProgreso = Array.isArray(datos.fotosProgreso?.diasFotos) ? datos.fotosProgreso.diasFotos : null;
                const clavesPermitidas = Object.keys(STATE);
                const estadoImportado = {};
                clavesPermitidas.forEach(clave => {
                    if (Object.prototype.hasOwnProperty.call(datosEstado, clave)) estadoImportado[clave] = datosEstado[clave];
                });

                Object.assign(STATE, estadoImportado);
                if (!STATE.recordatorios || typeof STATE.recordatorios !== 'object') STATE.recordatorios = {
                    freqMediciones: 2, freqFotos: 4, ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES,
                    ultimasFotos: null, ultimoPeso: null
                };
                if (!Array.isArray(STATE.records)) STATE.records = [];
                if (!STATE.evolution || typeof STATE.evolution !== 'object') STATE.evolution = {
                    initialWeight: 0, currentWeight: 0, initialWaist: 0, currentWaist: 0, totalWorkouts: 0, daysWithoutSmoking: 0
                };
                if (!STATE.ajustes || typeof STATE.ajustes !== 'object') STATE.ajustes = {};
                if (!STATE.config || typeof STATE.config !== 'object') STATE.config = { temporizadorDescanso: false };
                if (typeof STATE.config.temporizadorDescanso !== 'boolean') STATE.config.temporizadorDescanso = false;
                if (STATE.ultimoRegistroPeso === undefined) STATE.ultimoRegistroPeso = null;
                if (STATE.ultimasMediciones === undefined) STATE.ultimasMediciones = null;
                if (STATE.ultimasFotosGuardadas === undefined) STATE.ultimasFotosGuardadas = null;

                CONFIG.TEMPORIZADOR_DESCANSO = STATE.config.temporizadorDescanso === true;
                if (fotosProgreso !== null) await Fotos.restaurarBackup(fotosProgreso);
                this._save();
                UI.toast('✅ Datos importados correctamente', 'success');
                APP.renderizarTodo();
            } catch (err) {
                UI.toast('❌ Error al importar: formato inválido', 'error');
                console.error('Error al importar:', err);
            }
        };
        reader.onerror = () => UI.toast('❌ Error al leer el archivo', 'error');
        reader.readAsText(file);
    }
};
