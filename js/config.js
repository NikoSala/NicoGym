// ==========================================
        // CONFIGURACIÓN
        // ==========================================
        const CONFIG = {
            VERSION: '3.4',
            STATE_SCHEMA_VERSION: 17,
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
                martes: 'Pierna completa · 4 ejercicios',
                miercoles: 'Descanso',
                jueves: 'Pierna + Tríceps · 4 ejercicios',
                viernes: 'Espalda + Bíceps · 5 ejercicios',
                sabado: 'Descanso',
                domingo: 'Descanso comodín'
            },
            CARDIO_POR_DIA: {
                lunes: { maquina: 'Cinta', min: 10, max: 15 },
                martes: { maquina: 'Bicicleta estática', min: 10, max: 15 },
                viernes: { maquina: 'Máquina de escaleras', min: 10, max: 15 }
            },
            // TEMPORIZADOR DESACTIVADO POR DEFECTO
            TEMPORIZADOR_DESCANSO: false,
            TIEMPO_MSG_COMPLETADO: 1500
        };
