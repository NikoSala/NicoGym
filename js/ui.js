// ==========================================
        // UI
        // ==========================================
        const UI = {
            toast(msg, tipo = 'info') {
                const t = document.createElement('div');
                t.className = `toast-msg toast-${tipo}`;
                t.textContent = msg;
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 3000);
            },
            confirmar(msg, cb) {
                Modal.abrir(`
                    <h3>${msg}</h3>
                    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                        <button type="button" class="btn btn-danger" data-confirmar-accion>Confirmar</button>
                        <button type="button" class="btn btn-ghost" data-cancelar-accion>Cancelar</button>
                    </div>
                `);

                const contenido = document.getElementById('modalGlobalContent');
                contenido.querySelector('[data-confirmar-accion]').addEventListener('click', () => {
                    Modal.cerrar();
                    cb();
                });
                contenido.querySelector('[data-cancelar-accion]').addEventListener('click', () => Modal.cerrar());
            },
            toggleMenu() {
                document.getElementById('sideMenu').classList.toggle('open');
                document.getElementById('sideOverlay').classList.toggle('open');
            },
            toggleNotif() {
                document.getElementById('notifDropdown').classList.toggle('open');
            },
            cerrarLightbox() { document.getElementById('lightbox').classList.remove('active'); },
            abrirLightbox(src) { document.getElementById('lightboxImg').src = src;
                document.getElementById('lightbox').classList.add('active'); },
            getHoy() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; },
            formatFecha(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; },
            formatearFecha(fecha) { return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric',
                    month: 'short' }); },
            getDiaNombre() {
                const mapa = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes',
                    6: 'sabado' };
                return mapa[new Date().getDay()] || 'lunes';
            },
            getDiaSemanaNombre(d) { return CONFIG.DIAS_SEMANA[d.getDay()] || ''; },
            actualizarTopBar() {
                const p = STATE.mediciones.length > 0 ? STATE.mediciones[STATE.mediciones.length - 1].peso : '--';
                document.getElementById('topPesoDisplay').textContent = p + ' kg';
                document.getElementById('topObjetivo').textContent = CONFIG.PESO_OBJETIVO;
            }
        };

