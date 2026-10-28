// ==========================================
        // CONFIGURACIÓN
        // ==========================================
        const CONFIG = {
            VERSION: '3.4',
            STATE_SCHEMA_VERSION: 14,
            BACKUP_VERSION: 3,
            ALTURA: null,
            PESO_OBJETIVO: null,
            STORAGE_KEY: 'nicoGym',
            FECHA_INICIO_NO_FUMAR: null,
            DIAS_SEMANA: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            NOMBRES_DIAS: { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes',
                sabado: 'Sábado', domingo: 'Domingo' },
            TIPOS_RUTINA: {
                lunes: 'Pecho + Hombro + Tríceps · 5 ejercicios',
                martes: 'Espalda + Bíceps · 5 ejercicios',
                miercoles: 'Pierna completa · 5 ejercicios',
                jueves: 'Bíceps + Tríceps · 4 ejercicios',
                viernes: 'Hombro + Pecho · 5 ejercicios',
                sabado: 'Descanso',
                domingo: 'Descanso'
            },
            CARDIO_POR_DIA: {
                lunes: { maquina: 'Cinta', min: 10, max: 15 },
                martes: { maquina: 'Bicicleta estática', min: 10, max: 15 },
                jueves: { maquina: 'Máquina de escaleras', min: 10, max: 15, opcionalExtra: true },
                viernes: { maquina: 'Elíptica', min: 10, max: 15 }
            },
            // TEMPORIZADOR DESACTIVADO POR DEFECTO
            TEMPORIZADOR_DESCANSO: false,
            TIEMPO_MSG_COMPLETADO: 1500
        };
