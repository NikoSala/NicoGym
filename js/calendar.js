// ==========================================
// CALENDARIO DE ACTUALIZACIONES
// ==========================================
function _fechaBaseCalendario() {
    const inicio = new Date(CONFIG.FECHA_INICIO_CALENDARIO + 'T00:00:00');
    inicio.setHours(0, 0, 0, 0);
    return inicio;
}

function _freqMediciones() {
    return Math.max(1, Number(STATE?.recordatorios?.freqMediciones) || 2);
}

function _freqFotos() {
    return Math.max(1, Number(STATE?.recordatorios?.freqFotos) || 4);
}

function getTipoActualizacion(fecha) {
    const d = typeof fecha === 'string' ? new Date(fecha + 'T00:00:00') : new Date(fecha);
    d.setHours(0, 0, 0, 0);
    if (d.getDay() !== 0) return null;

    const inicio = _fechaBaseCalendario();
    if (d < inicio) return null;

    const diffWeeks = Math.floor((d - inicio) / (7 * 24 * 60 * 60 * 1000));
    const esFotos = diffWeeks % _freqFotos() === 0;
    const esMediciones = diffWeeks % _freqMediciones() === 0;

    if (esFotos) return 'completa';
    if (esMediciones) return 'mediciones';
    return 'solo-peso';
}

function getProximaActualizacion() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = _fechaBaseCalendario();
    let d = new Date(hoy);
    if (d < inicio) d = new Date(inicio);
    while (d.getDay() !== 0 || getTipoActualizacion(d) === null) d.setDate(d.getDate() + 1);
    return d;
}
