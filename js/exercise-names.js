// ==========================================
        // MAPEO DE NOMBRES EN ESPAÑOL PARA RUTINA
        // ==========================================
        const NOMBRES_ESPANOL = {
            'Press de pecho con mancuernas': 'Press de pecho con mancuernas',
            'Press inclinado con mancuernas': 'Press inclinado con mancuernas',
            'Aperturas con mancuernas': 'Aperturas con mancuernas',
            'Press de hombros con mancuernas': 'Press de hombros con mancuernas',
            'Elevaciones laterales con mancuernas': 'Elevaciones laterales con mancuernas',
            'Elevaciones frontales con mancuernas': 'Elevaciones frontales con mancuernas',
            'Extensión de tríceps sobre la cabeza': 'Extensión de tríceps sobre la cabeza',
            'Press cerrado con mancuernas': 'Press cerrado con mancuernas',
            'Barbell Row': 'Remo con barra',
            'One-Arm Dumbbell Row': 'Remo con mancuerna a una mano',
            'Dumbbell Reverse Fly': 'Aperturas inversas con mancuernas',
            'Dumbbell Shrug': 'Encogimientos de hombros con mancuernas',
            'Alternating Dumbbell Curl': 'Curl alterno con mancuernas',
            'Hammer Curl': 'Curl martillo',
            'Reverse Dumbbell Curl': 'Curl inverso con mancuernas',
            'Press plano con mancuernas (viernes)': 'Press de pecho con mancuernas',
            'Remo a una mano con mancuerna (viernes)': 'Remo con mancuerna a una mano',
            'Press militar sentado (viernes)': 'Press de hombros con mancuernas',
            'Remo en banco inclinado con mancuernas (viernes)': 'Remo en banco inclinado con mancuernas',
            'Aperturas con mancuernas (viernes)': 'Aperturas con mancuernas',
            'Elevaciones laterales (viernes)': 'Elevaciones laterales con mancuernas',
            'Curl martillo (viernes)': 'Curl martillo',
            'Extensión de tríceps por encima de la cabeza (viernes)': 'Extensión de tríceps sobre la cabeza',
            'Dumbbell Pullover': 'Pullover con mancuerna',
            'Incline Dumbbell Curl': 'Curl inclinado con mancuernas',
            'Dumbbell Zottman Curl': 'Curl Zottman con mancuernas',
            'Dumbbell Preacher Curl': 'Curl predicador con mancuerna',
            'Dumbbell Spider Curl': 'Curl araña con mancuernas',
            'Dumbbell Tate Press': 'Press Tate con mancuernas',
            'Dumbbell Squeeze Press': 'Press de compresión con mancuernas',
            'Sentadilla Goblet con mancuerna': 'Sentadilla Goblet con mancuerna',
            'Peso muerto rumano': 'Peso muerto rumano',
            'Zancadas estáticas con mancuernas': 'Zancadas estáticas con mancuernas',
            'Sentadilla búlgara': 'Sentadilla búlgara',
            'Hip Thrust': 'Hip Thrust',
            'Elevación de gemelos de pie': 'Elevación de gemelos de pie',
            'Crunch abdominal': 'Crunch abdominal',
            'Elevación de piernas': 'Elevación de piernas',
            'Bicicleta abdominal': 'Bicicleta abdominal'
        };

        function getNombreEspanol(nombre) {
            return NOMBRES_ESPANOL[nombre] || nombre;
        }
