// ==========================================
        // FUNCIONES AUX
        // ==========================================
        function escapeHTML(valor) {
            return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            })[caracter]);
        }

        function getEjercicioPorNombre(nombre) {
            return getExerciseDatabase().find(e => e.nombre === nombre);
        }

        function obtenerSeriesObjetivoEjercicio(ejercicio) {
            const series = Number(ejercicio?.series);
            return Number.isInteger(series) && series > 0
                ? series
                : PROGRESION?.SERIES_OBJETIVO || 4;
        }

        // En una sesión de entrenamiento empezamos siempre con 3 series.
        // Las series configuradas en la rutina se conservan intactas y no se modifican.
        function obtenerSeriesEntrenoEjercicio(ejercicio) {
            const series = Number(ejercicio?.seriesEntreno);
            return Number.isInteger(series) && series >= 3
                ? series
                : 3;
        }

        function obtenerRepsObjetivoEjercicio(ejercicio) {
            const primeraRepeticion = String(ejercicio?.reps ?? '').match(/\d+/);
            const repeticiones = Number(primeraRepeticion?.[0]);
            return Number.isInteger(repeticiones) && repeticiones > 0 && repeticiones <= 100
                ? repeticiones
                : PROGRESION?.REPS_OBJETIVO || 12;
        }

        function parseReps(valor) {
            const texto = String(valor ?? '').trim();
            if (!texto) return { series: [], total: 0, valid: false, error: 'Introduce las repeticiones.' };
            const partes = texto.split(',').map(v => v.trim());
            if (partes.some(v => !/^\d+$/.test(v))) {
                return { series: [], total: 0, valid: false, error: 'Usa solo números separados por comas.' };
            }
            const series = partes.map(Number);
            if (series.some(v => v < 1 || v > 100)) {
                return { series: [], total: 0, valid: false, error: 'Cada serie debe estar entre 1 y 100 repeticiones.' };
            }
            return { series, total: series.reduce((a, b) => a + b, 0), valid: true };
        }

        function calcularDuracionEstimada(ejercicios) {
            let fuerza = 0;
            let cardio = 0;
            ejercicios.forEach(ej => {
                if (ej.esCaminata) { cardio += CONFIG.MIN_CINTA || 15; return; }
                const series = obtenerSeriesObjetivoEjercicio(ej);
                const ejecucion = 0.75;
                const descansos = Math.max(0, series - 1) * ((ej.descanso || 60) / 60);
                const transicion = 1.5;
                fuerza += series * ejecucion + descansos + transicion;
            });
            const calentamiento = fuerza > 0 ? 5 : 0;
            return Math.max(1, Math.round(calentamiento + fuerza + cardio));
        }

        function getProximoDomingo(desde, cadaSemanas) {
            const d = new Date(desde);
            const hoy = new Date();
            while (d <= hoy) d.setDate(d.getDate() + 7 * cadaSemanas);
            while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
            return d;
        }

        function getDiasHasta(fecha) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fecha.setHours(0, 0, 0, 0);
            return Math.round((fecha - hoy) / 86400000);
        }

