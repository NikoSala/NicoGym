// ==========================================
        // FOTOS
        // ==========================================
        const Fotos = {
            db: null,
            DB_NAME: 'FotosProgresoDB',
            STORE_NAME: 'diasFotos',

            _abrirDB() {
                if (this.db) return Promise.resolve(this.db);

                return new Promise((resolve, reject) => {
                    const req = indexedDB.open(this.DB_NAME, 1);
                    req.onupgradeneeded = e => {
                        if (!e.target.result.objectStoreNames.contains(this.STORE_NAME))
                            e.target.result.createObjectStore(this.STORE_NAME, { keyPath: 'fecha' });
                    };
                    req.onsuccess = e => {
                        this.db = e.target.result;
                        this.db.onversionchange = () => {
                            this.db.close();
                            this.db = null;
                        };
                        resolve(this.db);
                    };
                    req.onerror = () => reject(req.error || new Error('No se pudo abrir la base de fotos'));
                });
            },

            async exportarBackup() {
                await this._abrirDB();
                if (!this.db) throw new Error('No se pudo abrir la base de fotos');

                return new Promise((resolve, reject) => {
                    const req = this.db.transaction(this.STORE_NAME, 'readonly')
                        .objectStore(this.STORE_NAME).getAll();
                    req.onsuccess = e => {
                        const fotos = (e.target.result || [])
                            .filter(dia => dia && typeof dia.fecha === 'string')
                            .map(dia => ({
                                fecha: dia.fecha,
                                timestamp: Number(dia.timestamp) || 0,
                                frente: typeof dia.frente === 'string' ? dia.frente : null,
                                espalda: typeof dia.espalda === 'string' ? dia.espalda : null,
                                izquierda: typeof dia.izquierda === 'string' ? dia.izquierda : null,
                                derecha: typeof dia.derecha === 'string' ? dia.derecha : null
                            }));
                        resolve(fotos);
                    };
                    req.onerror = () => reject(req.error || new Error('No se pudieron leer las fotos'));
                });
            },

            async restaurarBackup(diasFotos) {
                await this._abrirDB();
                if (!this.db) throw new Error('No se pudo abrir la base de fotos');

                const fotosValidas = diasFotos
                    .filter(dia => dia && typeof dia.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dia.fecha))
                    .map(dia => ({
                        fecha: dia.fecha,
                        timestamp: Number(dia.timestamp) || new Date(`${dia.fecha}T12:00:00`).getTime(),
                        frente: typeof dia.frente === 'string' ? dia.frente : null,
                        espalda: typeof dia.espalda === 'string' ? dia.espalda : null,
                        izquierda: typeof dia.izquierda === 'string' ? dia.izquierda : null,
                        derecha: typeof dia.derecha === 'string' ? dia.derecha : null
                    }));

                return new Promise((resolve, reject) => {
                    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
                    const store = tx.objectStore(this.STORE_NAME);
                    store.clear();
                    fotosValidas.forEach(dia => store.put(dia));
                    tx.oncomplete = () => resolve();
                    tx.onerror = () => reject(tx.error || new Error('No se pudieron restaurar las fotos'));
                    tx.onabort = () => reject(tx.error || new Error('Se canceló la restauración de fotos'));
                });
            },

            _leerArchivo(file) {
                if (!file) return Promise.resolve(null);
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        const img = new Image();
                        img.onload = () => {
                            const max = 1600;
                            const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
                            const canvas = document.createElement('canvas');
                            canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                            canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                        img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
                        img.src = e.target.result;
                    };
                    reader.onerror = () => reject(reader.error || new Error('No se pudo leer la imagen'));
                    reader.readAsDataURL(file);
                });
            },

            async render() {
                const c = document.getElementById('fotosContainer');
                if (!c) return;

                const fechas = await this._obtenerFechas();

                const mensajeFotos = '';

                c.innerHTML = `
                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-camera"></i> Subir fotos</div>
                        ${mensajeFotos}
                        <div style="display:flex;gap:6px;margin-bottom:8px">
                            <input type="date" id="fechaFotos" class="input" value="${UI.getHoy()}">
                        </div>
                        <div class="foto-grid-upload">
                            <div class="equip-card"><div class="label">Frente</div><input type="file" accept="image/*" onchange="Fotos._preview(this,'Frente')"><img id="previewFrente" class="foto-preview hidden"></div>
                            <div class="equip-card"><div class="label">Espalda</div><input type="file" accept="image/*" onchange="Fotos._preview(this,'Espalda')"><img id="previewEspalda" class="foto-preview hidden"></div>
                            <div class="equip-card"><div class="label">Izquierda</div><input type="file" accept="image/*" onchange="Fotos._preview(this,'Izquierda')"><img id="previewIzquierda" class="foto-preview hidden"></div>
                            <div class="equip-card"><div class="label">Derecha</div><input type="file" accept="image/*" onchange="Fotos._preview(this,'Derecha')"><img id="previewDerecha" class="foto-preview hidden"></div>
                        </div>
                        <button class="btn btn-primary btn-block" onclick="Fotos._guardar()"><i class="fa-solid fa-floppy-disk"></i> Guardar fotos</button>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-code-compare"></i> Comparar</div>
                        <div style="display:flex;gap:6px;margin-bottom:8px">
                            <select id="compararDia1" class="input" style="flex:1;">
                                <option value="">Día 1</option>
                                ${fechas.map(f => `<option value="${f}">${UI.formatearFecha(f)}</option>`).join('')}
                            </select>
                            <select id="compararDia2" class="input" style="flex:1;">
                                <option value="">Día 2</option>
                                ${fechas.map(f => `<option value="${f}">${UI.formatearFecha(f)}</option>`).join('')}
                            </select>
                        </div>
                        <button class="btn btn-primary btn-block" onclick="Fotos._comparar()"><i class="fa-solid fa-eye"></i> Comparar</button>
                        <div id="comparadorResultado" style="margin-top:8px"></div>
                    </div>
                `;
                document.getElementById('fechaFotos').value = UI.getHoy();
            },

            _obtenerFechas() {
                return new Promise(r => {
                    if (!this.db) { this._abrirDB().then(() => this._obtenerFechas().then(r)); return; }
                    const req = this.db.transaction(this.STORE_NAME, 'readonly').objectStore(this.STORE_NAME)
                        .getAll();
                    req.onsuccess = e => r((e.target.result || []).sort((a, b) => b.timestamp - a.timestamp).map(i =>
                        i.fecha));
                    req.onerror = () => r([]);
                });
            },

            async _guardar() {
                const f = document.getElementById('fechaFotos').value;
                if (!f) { UI.toast('Selecciona fecha', 'error'); return; }

                const inputs = document.querySelectorAll('.equip-card input[type="file"]');
                const files = {};
                for (const input of inputs) {
                    const label = input.parentElement.querySelector('.label').textContent;
                    files[label] = input.files[0];
                }

                const fr = await this._leerArchivo(files['Frente']);
                const es = await this._leerArchivo(files['Espalda']);
                const iz = await this._leerArchivo(files['Izquierda']);
                const de = await this._leerArchivo(files['Derecha']);

                if (!fr && !es && !iz && !de) { UI.toast('Selecciona al menos una foto', 'error'); return; }

                await this._abrirDB();
                if (!this.db) throw new Error('No se pudo abrir la base de fotos');
                await new Promise((resolve, reject) => {
                    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
                    tx.objectStore(this.STORE_NAME).put({
                        fecha: f,
                        timestamp: Date.now(),
                        frente: fr,
                        espalda: es,
                        izquierda: iz,
                        derecha: de
                    });
                    tx.oncomplete = resolve;
                    tx.onerror = () => reject(tx.error || new Error('No se pudieron guardar las fotos'));
                    tx.onabort = () => reject(tx.error || new Error('Se canceló el guardado de fotos'));
                });
                STATE.recordatorios.ultimasFotos = f;
                Storage._save();
                UI.toast('✅ Fotos guardadas', 'success');
                this.render();
                APP.renderizarTodo();

                document.querySelectorAll('.equip-card input[type="file"]').forEach(input => input.value = '');
                document.querySelectorAll('.foto-preview').forEach(el => el.classList.add('hidden'));
            },

            _preview(input, tipo) {
                if (input.files[0]) {
                    const r = new FileReader();
                    r.onload = e => {
                        const img = document.getElementById('preview' + tipo);
                        img.src = e.target.result;
                        img.classList.remove('hidden');
                    };
                    r.readAsDataURL(input.files[0]);
                }
            },

            _activarComparadores() {
                document.querySelectorAll('.photo-compare-hold').forEach(comparador => {
                    comparador.addEventListener('pointerdown', event => this._iniciarComparacion(event, comparador));
                    comparador.addEventListener('pointerup', event => this._finalizarComparacion(event, comparador));
                    comparador.addEventListener('pointercancel', event => this._finalizarComparacion(event, comparador));
                    comparador.addEventListener('lostpointercapture', event => this._finalizarComparacion(event, comparador));
                    comparador.addEventListener('contextmenu', event => event.preventDefault());
                    comparador.addEventListener('dragstart', event => event.preventDefault());
                });
            },

            _iniciarComparacion(event, comparador) {
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                event.preventDefault();
                comparador.dataset.pulsadoDesde = String(Date.now());
                comparador.classList.add('mostrando-actual');
                if (comparador.setPointerCapture) comparador.setPointerCapture(event.pointerId);
            },

            _finalizarComparacion(event, comparador) {
                if (!comparador.classList.contains('mostrando-actual')) return;
                const duracion = Date.now() - Number(comparador.dataset.pulsadoDesde || 0);
                comparador.classList.remove('mostrando-actual');
                delete comparador.dataset.pulsadoDesde;
                if (comparador.hasPointerCapture?.(event.pointerId)) comparador.releasePointerCapture(event.pointerId);

                // Un toque corto conserva el acceso al lightbox; al mantener pulsado no se abre.
                if (event.type === 'pointerup' && duracion < 300 && comparador.dataset.fotoLightbox) {
                    UI.abrirLightbox(comparador.dataset.fotoLightbox);
                }
            },

            async _comparar() {
                const f1 = document.getElementById('compararDia1').value;
                const f2 = document.getElementById('compararDia2').value;
                if (!f1 || !f2) { UI.toast('Selecciona dos días', 'error'); return; }

                await this._abrirDB();
                const store = this.db.transaction(this.STORE_NAME, 'readonly').objectStore(this.STORE_NAME);
                const d1 = await new Promise(r => store.get(f1).onsuccess = e => r(e.target.result));
                const d2 = await new Promise(r => store.get(f2).onsuccess = e => r(e.target.result));
                const primeraEsMasAntigua = new Date(`${f1}T00:00:00`) <= new Date(`${f2}T00:00:00`);
                const fechaAntigua = primeraEsMasAntigua ? f1 : f2;
                const fechaActual = primeraEsMasAntigua ? f2 : f1;
                const fotoAntigua = primeraEsMasAntigua ? d1 : d2;
                const fotoActual = primeraEsMasAntigua ? d2 : d1;

                const gen = (t, c) => {
                    const antigua = fotoAntigua?.[c] || '';
                    const actual = fotoActual?.[c] || '';
                    if (!antigua && !actual) return '';
                    return `
                        <div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:8px;margin-bottom:8px;border:1px solid var(--border);">
                            <h4 style="color:var(--primary);margin-bottom:4px;text-align:center;font-size:12px;">${t}</h4>
                            <div class="photo-compare-hold ${antigua && actual ? 'tiene-foto-actual' : ''} ${antigua ? '' : 'sin-foto-antigua'}" data-foto-lightbox="${antigua || actual}" aria-label="Mantén pulsado para ver la foto actual">
                                ${antigua ? `<img class="photo-compare-img photo-compare-antigua" src="${antigua}" alt="${t} · antes" draggable="false">` : ''}
                                ${actual ? `<img class="photo-compare-img photo-compare-actual" src="${actual}" alt="${t} · después" draggable="false">` : ''}
                                ${antigua && actual ? '<div class="photo-compare-hint"><i class="fa-solid fa-hand-pointer"></i> Mantén pulsado para ver la actual</div>' : ''}
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:3px;">
                                <span>ANTES · ${UI.formatearFecha(fechaAntigua)}</span>
                                <span>ACTUAL · ${UI.formatearFecha(fechaActual)}</span>
                            </div>
                        </div>
                    `;
                };

                let html = gen('FRENTE', 'frente') + gen('ESPALDA', 'espalda') + gen('IZQUIERDA', 'izquierda') + gen(
                    'DERECHA', 'derecha');
                if (!html) html =
                    '<div style="text-align:center;padding:16px;color:var(--text-secondary);">No hay fotos para comparar</div>';
                document.getElementById('comparadorResultado').innerHTML = html;
                this._activarComparadores();
            }
        };
