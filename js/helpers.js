// ==========================================
        // FUNCIONES AUX
        // ==========================================
        function getEjercicioPorNombre(nombre) {
            return getExerciseDatabase().find(e => e.nombre === nombre);
        }

        function getEjerciciosPorDia(dia) {
            return getExerciseDatabase().filter(e => e.dia === dia);
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

        function getDificultadColor(dificultad) {
            const map = { 'facil': '🟢', 'media': '🟡', 'dificil': '🔴' };
            return map[dificultad] || '🟡';
        }

        function getDificultadTexto(dificultad) {
            const map = { 'facil': 'Fácil', 'media': 'Media', 'dificil': 'Difícil' };
            return map[dificultad] || 'Media';
        }

        function calcularDuracionEstimada(ejercicios) {
            let total = 0;
            ejercicios.forEach(ej => {
                total += (ej.series || 0) * 0.5 + (ej.descanso || 60) / 60;
            });
            return Math.round(total);
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

