// ==========================================
// FUNCIONES CALENDARIO DEFINITIVO
// ==========================================
function getTipoActualizacion(fecha) {
  const d =
    typeof fecha === "string" ? new Date(fecha + "T00:00:00") : new Date(fecha);
  d.setHours(0, 0, 0, 0);

  if (d.getDay() !== 0) return null;

  const inicio = new Date(CONFIG.FECHA_INICIO_CALENDARIO + "T00:00:00");
  inicio.setHours(0, 0, 0, 0);

  const diffTime = d.getTime() - inicio.getTime();
  if (diffTime < 0) return null;

  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));

  const freqFotos = STATE.recordatorios?.freqFotos || 4;
  const freqMediciones = STATE.recordatorios?.freqMediciones || 2;

  const esFotos = diffWeeks % freqFotos === 0;
  const esMediciones = diffWeeks % freqMediciones === 0;

  if (esFotos) return "completa";
  if (esMediciones) return "mediciones";
  return "solo-peso";
}

function getProximaActualizacion() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let d = new Date(hoy);
  while (d.getDay() !== 0) {
    d.setDate(d.getDate() + 1);
  }

  const inicio = new Date(CONFIG.FECHA_INICIO_CALENDARIO + "T00:00:00");
  inicio.setHours(0, 0, 0, 0);

  if (d.getTime() < inicio.getTime()) {
    d = new Date(inicio);
  }

  return d;
}
