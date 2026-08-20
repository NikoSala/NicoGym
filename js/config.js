// ==========================================
        // CONFIGURACIÓN
        // ==========================================
        const CONFIG = {
            VERSION: '3.2',
            STATE_SCHEMA_VERSION: 3,
            BACKUP_VERSION: 3,
            ALTURA: 165,
            PESO_OBJETIVO: 75,
            STORAGE_KEY: 'nicoGym',
            FECHA_INICIO_NO_FUMAR: '2026-02-22',
            FECHA_REFERENCIA_MEDICIONES: '2026-07-20',
            FECHA_INICIO_CALENDARIO: '2026-08-23',
            DIAS_SEMANA: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            NOMBRES_DIAS: { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes',
                sabado: 'Sábado', domingo: 'Domingo' },
            TIPOS_RUTINA: {
                lunes: 'Pecho + Bíceps · 5 ejercicios + cinta',
                martes: 'Espalda + Trapecio + Antebrazo · 8 ejercicios',
                miercoles: 'Hombros + Tríceps · 5 ejercicios + cinta',
                jueves: 'Brazos · 8 ejercicios',
                viernes: 'Torso completo · 4 ejercicios + cinta',
                sabado: 'Descanso',
                domingo: 'Descanso'
            },
            DIAS_CINTA: ['lunes', 'miercoles', 'viernes'],
            MIN_CINTA: 15,
            MAX_CINTA: 20,
            // TEMPORIZADOR DESACTIVADO POR DEFECTO
            TEMPORIZADOR_DESCANSO: false,
            PROGRESION: { seriesObjetivo: 4, repsObjetivo: 12, repsSiguiente: 15 },
            TIEMPO_MSG_COMPLETADO: 1500
        };
