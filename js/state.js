// ==========================================
        // STATE
        // ==========================================
        const STATE = {
            schemaVersion: 3,
            nombre: 'Nico',
            altura: CONFIG.ALTURA,
            mediciones: [],
            historialEntrenos: [],
            diasNoFumar: [],
            diasEntrenados: [],
            checks: {},
            recordatorios: { freqMediciones: 2, freqFotos: 4, ultimaMedicion: CONFIG.FECHA_REFERENCIA_MEDICIONES,
                ultimasFotos: null, ultimoPeso: null },
            records: [],
            evolution: { initialWeight: 0, currentWeight: 0, initialWaist: 0, currentWaist: 0, totalWorkouts: 0,
                daysWithoutSmoking: 0 },
            ajustes: {},
            config: { temporizadorDescanso: false },
            _cargado: false,
            ultimoRegistroPeso: null,
            ultimasMediciones: null,
            ultimasFotosGuardadas: null,
            progresion: {}
        };

        let diaActivo = 'lunes';
        let modoEntrenoActivo = false;
        let ejerciciosEntreno = [];
        let idxEjercicioActual = 0;
        let temporizadorDescanso = null;
        let tiempoDescanso = 0;
        let startTimeEntreno = null;
        let recordsConseguidos = [];
let cardioCompletado = false;
        let totalPesoLevantadoEntreno = 0;
        let totalVolumenEntreno = 0;
        let totalSeriesEntreno = 0;
        let totalRepsEntreno = 0;
        let msgCompletadoTimeout = null;
let seriesActualesEntreno = [];
let pesoActualEntreno = 0;
let notasActualesEntreno = '';
let ejercicioIniciadoAt = null;

