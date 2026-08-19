// ==========================================
        // MODAL
        // ==========================================
        const Modal = {
            abrir(html) {
                document.getElementById('modalGlobalContent').innerHTML = html;
                document.getElementById('modalGlobal').classList.remove('hidden');
            },
            cerrar() {
                document.getElementById('modalGlobal').classList.add('hidden');
            }
        };

