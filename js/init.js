// ==========================================
// INICIO + DIAGNÓSTICO GLOBAL
// ==========================================
window.addEventListener('error', event => {
  console.error('NicoGym error global:', event.error || event.message);
  if (typeof UI !== 'undefined' && UI.toast) {
    UI.toast('⚠️ NicoGym ha detectado un problema. Tus datos siguen guardados.', 'error');
  }
});

window.addEventListener('unhandledrejection', event => {
  console.error('NicoGym promesa rechazada:', event.reason);
  if (typeof UI !== 'undefined' && UI.toast) {
    UI.toast('⚠️ Se produjo un problema. Tus datos siguen guardados.', 'error');
  }
});

document.addEventListener('DOMContentLoaded', () => APP.init());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('No se pudo registrar el modo sin conexión:', error);
    });
  });
}
