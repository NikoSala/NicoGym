// ==========================================
// MODAL · FOCO + ESC
// ==========================================
const Modal = {
    _previousFocus: null,
    abrir(html) {
        this._previousFocus = document.activeElement;
        document.getElementById('modalGlobalContent').innerHTML = html;
        document.getElementById('modalGlobal').setAttribute('aria-hidden', 'false');
        const modal = document.getElementById('modalGlobal');
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            const first = modal.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
            (first || document.getElementById('modalGlobalPanel')).focus?.();
        });
    },
    cerrar() {
        const modal = document.getElementById('modalGlobal');
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        this._previousFocus?.focus?.();
    }
};
document.addEventListener('keydown', e => {
    const modal = document.getElementById('modalGlobal');
    if (!modal || modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') { e.preventDefault(); Modal.cerrar(); return; }
    if (e.key === 'Tab') {
        const focusables = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
});
