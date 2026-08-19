// ==========================================
        // FOTOS
        // ==========================================
        const Fotos = {
            db: null,
            DB_NAME: 'FotosProgresoDB',
            STORE_NAME: 'diasFotos',

            _abrirDB() {
                return new Promise(r => {
                    const req = indexedDB.open(this.DB_NAME, 1);
                    req.onupgradeneeded = e => {
                        if (!e.target.result.objectStoreNames.contains(this.STORE_NAME))
                            e.target.result.createObjectStore(this.STORE_NAME, { keyPath: 'fecha' });
                    };
                    req.onsuccess = e => { this.db = e.target.result;
                        r(); };
                    req.onerror = () => r();
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
                                timestamp: dia.timestamp,
                                frente: dia.frente || null,
                                espalda: dia.espalda || null,
                                izquierda: dia.izquierda || null,
                                derecha: dia.derecha || null
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
                    .filter(dia => dia && typeof dia.fecha === 'string')
                    .map(dia => ({
                        fecha: dia.fecha,
                        timestamp: Number.isFinite(dia.timestamp) ? dia.timestamp : Date.now(),
                        frente: dia.frente || null,
                        espalda: dia.espalda || null,
                        izquierda: dia.izquierda || null,
                        derecha: dia.derecha || null
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
                return new Promise(r => { const reader = new FileReader();
                    reader.onload = e => r(e.target.result);
                    reader.readAsDataURL(file); });
            },

            async render() {
                const c = document.getElementById('fotosContainer');
                if (!c) return;

                const fechas = await this._obtenerFechas();

                const tipo = APP.obtenerTipoActualizacion();
                const hoy = new Date();
                const esDomingo = hoy.getDay() === 0;
                const esFechaValida = tipo !== null;
                const permitirFotos = (esDomingo && esFechaValida && tipo === 'completa');

                let mensajeFotos = '';
                if (esDomingo && esFechaValida && tipo === 'mediciones') {
                    mensajeFotos = `
                        <div style="padding:10px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);margin-bottom:10px;text-align:center;font-size:13px;color:var(--text-secondary);">
                            📸 Hoy solo toca peso y mediciones. Las fotos se conservan de la última actualización completa (cada 4 semanas).
                        </div>
                    `;
                } else if (esDomingo && esFechaValida && tipo === 'solo-peso') {
                    mensajeFotos = `
                        <div style="padding:10px;background:rgba(255,255,255,0.05);border-radius:var(--radius-sm);margin-bottom:10px;text-align:center;font-size:13px;color:var(--text-secondary);">
                            📸 Hoy solo toca peso. Las fotos se conservan de la última actualización completa (cada 4 semanas).
                        </div>
                    `;
                }

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
                        ${permitirFotos ? `
                            <button class="btn btn-primary btn-block" onclick="Fotos._guardar()"><i class="fa-solid fa-floppy-disk"></i> Guardar fotos</button>
                        ` : `
                            <button class="btn btn-ghost btn-block" style="opacity:0.5;cursor:default;">
                                <i class="fa-solid fa-lock"></i> ${tipo === 'completa' ? 'Sube tus fotos' : 'Solo en actualización completa (cada 4 semanas)'}
                            </button>
                        `}
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
                await this.db.transaction(this.STORE_NAME, 'readwrite').objectStore(this.STORE_NAME).put({
                    fecha: f,
                    timestamp: Date.now(),
                    frente: fr,
                    espalda: es,
                    izquierda: iz,
                    derecha: de
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

            async _comparar() {
                const f1 = document.getElementById('compararDia1').value;
                const f2 = document.getElementById('compararDia2').value;
                if (!f1 || !f2) { UI.toast('Selecciona dos días', 'error'); return; }

                await this._abrirDB();
                const store = this.db.transaction(this.STORE_NAME, 'readonly').objectStore(this.STORE_NAME);
                const d1 = await new Promise(r => store.get(f1).onsuccess = e => r(e.target.result));
                const d2 = await new Promise(r => store.get(f2).onsuccess = e => r(e.target.result));

                const gen = (t, c) => {
                    if (!d1?.[c] && !d2?.[c]) return '';
                    return `
                        <div style="background:var(--bg-card);border-radius:var(--radius-sm);padding:8px;margin-bottom:8px;border:1px solid var(--border);">
                            <h4 style="color:var(--primary);margin-bottom:4px;text-align:center;font-size:12px;">${t}</h4>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                                <img src="${d1?.[c]||''}" style="width:100%;border-radius:var(--radius-sm);object-fit:cover;cursor:pointer;" onclick="UI.abrirLightbox(this.src)" onerror="this.style.display='none'">
                                <img src="${d2?.[c]||''}" style="width:100%;border-radius:var(--radius-sm);object-fit:cover;cursor:pointer;" onclick="UI.abrirLightbox(this.src)" onerror="this.style.display='none'">
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:3px;">
                                <span>${UI.formatearFecha(f1)}</span>
                                <span>${UI.formatearFecha(f2)}</span>
                            </div>
                        </div>
                    `;
                };

                let html = gen('FRENTE', 'frente') + gen('ESPALDA', 'espalda') + gen('IZQUIERDA', 'izquierda') + gen(
                    'DERECHA', 'derecha');
                if (!html) html =
                    '<div style="text-align:center;padding:16px;color:var(--text-secondary);">No hay fotos para comparar</div>';
                document.getElementById('comparadorResultado').innerHTML = html;
            }
        };

