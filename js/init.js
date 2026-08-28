// ==========================================
// AUTO-VERSIÓN DINÁMICA (SIN CACHÉ)
// ==========================================

function autoVersion() {
  const hoy = new Date();
  const version = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
  
  // Añadir versión a TODOS los scripts y CSS
  document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach(el => {
    const src = el.getAttribute('src') || el.getAttribute('href');
    if (src && !src.includes('?')) {
      const nuevoSrc = `${src}?v=${version}`;
      if (el.tagName === 'SCRIPT') {
        el.setAttribute('src', nuevoSrc);
      } else {
        el.setAttribute('href', nuevoSrc);
      }
    }
  });
}

// Ejecutar automáticamente
autoVersion();

// ==========================================
// INICIO + DIAGNÓSTICO GLOBAL
// ==========================================
window.addEventListener('error', event => {
    console.error('NicoGym error global:', event.error || event.message);
    if (typeof UI !== 'undefined' && UI.toast) UI.toast('⚠️ NicoGym ha detectado un problema. Tus datos siguen guardados.', 'error');
});
window.addEventListener('unhandledrejection', event => {
    console.error('NicoGym promesa rechazada:', event.reason);
    if (typeof UI !== 'undefined' && UI.toast) UI.toast('⚠️ Se produjo un problema. Tus datos siguen guardados.', 'error');
});
document.addEventListener('DOMContentLoaded', () => APP.init());
// ==========================================
// INICIO + DIAGNÓSTICO GLOBAL
// ==========================================
window.addEventListener('error', event => {
    console.error('NicoGym error global:', event.error || event.message);
    if (typeof UI !== 'undefined' && UI.toast) UI.toast('⚠️ NicoGym ha detectado un problema. Tus datos siguen guardados.', 'error');
});
window.addEventListener('unhandledrejection', event => {
    console.error('NicoGym promesa rechazada:', event.reason);
    if (typeof UI !== 'undefined' && UI.toast) UI.toast('⚠️ Se produjo un problema. Tus datos siguen guardados.', 'error');
});
document.addEventListener('DOMContentLoaded', () => APP.init());
