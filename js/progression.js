// ==========================================
// PROGRESIÓN · OBJETIVO GLOBAL DEL DÍA
// Regla: no se recomienda subir peso hasta completar 4x12
// en TODOS los ejercicios de fuerza del día.
// ==========================================
const PROGRESION = {
    SERIES_OBJETIVO: 4,
    REPS_OBJETIVO: 12,
    RIR_MINIMO_SUBIDA: 2,

    incrementoSugerido(peso) {
        const n = Number(peso) || 0;
        if (n <= 5) return 0.5;
        // Regla conservadora: una subida aproximada del 25%, redondeada a 0,5 kg,
        // con un máximo de 3 kg. Así, 12 kg -> 15 kg como objetivo solicitado.
        const incremento = Math.round((n * 0.25) * 2) / 2;
        return Math.max(0.5, Math.min(3, incremento));
    },

    estimar1RM(peso, reps) {
        const p = Number(peso) || 0;
        const r = Number(reps) || 0;
        if (p <= 0 || r <= 0) return 0;
        // Epley: referencia de tendencia, no sustituto de la regla 4x12.
        return p * (1 + r / 30);
    },

    _normalizarRIR(valor) {
        if (valor === '' || valor === null || valor === undefined) return null;
        const n = Number(valor);
        return Number.isFinite(n) && n >= 0 && n <= 5 ? n : null;
    },

    analizarRegistroEjercicio(registro) {
        if (!registro || !registro.reps) return { completo: false, series: [], total: 0, mejor1RM: 0, rir: null };
        const parsed = parseReps(registro.reps);
        if (!parsed.valid) return { completo: false, series: [], total: 0, mejor1RM: 0, rir: null };
        const series = parsed.series;
        return {
            completo: series.length >= this.SERIES_OBJETIVO && series.slice(0, this.SERIES_OBJETIVO).every(r => r >= this.REPS_OBJETIVO),
            series,
            total: parsed.total,
            rir: this._normalizarRIR(registro.rir),
            mejor1RM: this.estimar1RM(registro.peso, Math.max(...series, 0))
        };
    },

    analizarDia(dia, ejercicios, entrenamiento) {
        const fuerza = ejercicios.filter(e => !e.esCaminata);
        const registros = entrenamiento?.ejercicios || [];
        const detalle = fuerza.map(ej => {
            const reg = registros.find(r => r.nombre === ej.nombre);
            const analisis = this.analizarRegistroEjercicio(reg);
            return { ejercicio: ej, registro: reg, ...analisis };
        });
        const completo = detalle.length > 0 && detalle.every(x => x.completo);
        const incompletos = detalle.filter(x => !x.completo);
        const rirs = detalle.map(x => x.rir).filter(x => x !== null);
        const rirMedio = rirs.length ? rirs.reduce((a,b)=>a+b,0) / rirs.length : null;
        return { dia, detalle, completo, incompletos, rirMedio };
    },

    recomendarDia(dia, ejercicios, entrenamiento) {
        const analisis = this.analizarDia(dia, ejercicios, entrenamiento);
        if (!analisis.detalle.length) return { ...analisis, titulo: '', mensaje: '', recomendaciones: [] };

        if (!analisis.completo) {
            return {
                ...analisis,
                titulo: 'Mantén el peso por ahora',
                mensaje: `La meta es completar ${this.SERIES_OBJETIVO}×${this.REPS_OBJETIVO} en todos los ejercicios del día antes de subir carga.`,
                recomendaciones: analisis.incompletos.map(x => ({
                    nombre: x.ejercicio.nombre,
                    texto: x.registro?.peso ? `Mantén ${x.registro.peso} kg e intenta completar 4×12.` : 'Registra el peso y busca completar 4×12.'
                }))
            };
        }

        const subirCarga = analisis.rirMedio === null || analisis.rirMedio >= this.RIR_MINIMO_SUBIDA;
        const recomendaciones = analisis.detalle.map(x => {
            const peso = Number(x.registro.peso) || 0;
            const incremento = this.incrementoSugerido(peso);
            const siguientePeso = Math.round((peso + incremento) * 2) / 2;
            const oneRM = Math.round(x.mejor1RM * 10) / 10;
            return {
                nombre: x.ejercicio.nombre,
                pesoActual: peso,
                siguientePeso: subirCarga ? siguientePeso : peso,
                incremento: subirCarga ? incremento : 0,
                oneRM,
                rir: x.rir,
                texto: subirCarga
                    ? `Prueba ${siguientePeso} kg${x.rir !== null ? ` (RIR ${x.rir})` : ''}. Objetivo: 4×12.`
                    : `Mantén ${peso} kg${x.rir !== null ? ` (RIR ${x.rir})` : ''} y consolida 4×12 antes de subir.`
            };
        });

        return {
            ...analisis,
            subirCarga,
            titulo: subirCarga ? 'Día completado · puedes progresar' : 'Día completado · consolida el peso',
            mensaje: subirCarga
                ? `Has conseguido 4×12 en todos los ejercicios. La app recomienda una subida moderada${analisis.rirMedio !== null ? ` porque el RIR medio fue ${analisis.rirMedio.toFixed(1)}` : ''}.`
                : `Has conseguido 4×12 en todo el día, pero el RIR medio indica que conviene repetir el peso antes de aumentarlo.`,
            recomendaciones
        };
    }
};
