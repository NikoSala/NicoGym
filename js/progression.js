// ==========================================
// PROGRESIÓN · OBJETIVO GLOBAL DEL DÍA
// Regla: no se recomienda subir peso hasta completar 4x12
// en TODOS los ejercicios de fuerza del día.
// ==========================================
const PROGRESION = {
    SERIES_OBJETIVO: 4,
    REPS_OBJETIVO: 12,
    REPS_SIGUIENTE: 15,

    incrementoSugerido(peso) {
        const n = Number(peso) || 0;
        if (n <= 5) return 0.5;
        if (n <= 10) return 1;
        if (n <= 20) return 2;
        return 2.5;
    },

    estimar1RM(peso, reps) {
        const p = Number(peso) || 0;
        const r = Number(reps) || 0;
        if (p <= 0 || r <= 0) return 0;
        return p * (1 + r / 30);
    },

    analizarRegistroEjercicio(registro) {
        if (!registro || !registro.reps) return { completo: false, series: [], total: 0, mejor1RM: 0 };
        const parsed = parseReps(registro.reps);
        if (!parsed.valid) return { completo: false, series: [], total: 0, mejor1RM: 0 };
        const series = parsed.series;
        const rir = Number.isFinite(Number(registro.rir)) ? Number(registro.rir) : null;
        return {
            completo: series.length >= this.SERIES_OBJETIVO && series.slice(0, this.SERIES_OBJETIVO).every(r => r >= this.REPS_OBJETIVO),
            series,
            total: parsed.total,
            rir,
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
        return { dia, detalle, completo, incompletos };
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

        const recomendaciones = analisis.detalle.map(x => {
            const peso = Number(x.registro.peso) || 0;
            const base = this.incrementoSugerido(peso);
            const rir = x.rir;
            let incremento = base;
            let texto;
            if (rir !== null && rir <= 0) {
                incremento = 0;
                texto = `Mantén ${peso} kg: completaste 4×12, pero llegaste al fallo. Busca 4×12 con RIR 1–2 antes de subir.`;
            } else if (rir !== null && rir === 1) {
                incremento = Math.max(0.5, Math.round((base * 0.5) * 10) / 10);
                texto = `Prueba ${peso + incremento} kg (+${incremento} kg) y busca 4×12. Si mantienes RIR 1–2, podrás seguir progresando.`;
            } else {
                texto = `Prueba ${peso + incremento} kg (+${incremento} kg). Objetivo: 4×12; si resulta cómodo, avanza hacia 4×15.`;
            }
            return {
                nombre: x.ejercicio.nombre,
                pesoActual: peso,
                siguientePeso: peso + incremento,
                incremento,
                rir,
                oneRM: Math.round(x.mejor1RM * 10) / 10,
                texto
            };
        });

        return {
            ...analisis,
            titulo: 'Día completado · puedes progresar',
            mensaje: `Has conseguido ${this.SERIES_OBJETIVO}×${this.REPS_OBJETIVO} en todos los ejercicios. La próxima sesión puedes subir ligeramente la carga.`,
            recomendaciones
        };
    }
};
