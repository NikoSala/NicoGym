// ==========================================
        // AJUSTES
        // ==========================================
        const Ajustes = {
            render() {
                const c = document.getElementById('ajustesContainer');
                if (!c) return;

                // Leer estado actual del temporizador
                const temporizadorActivo = CONFIG.TEMPORIZADOR_DESCANSO;
                const escapar = (valor) => String(valor ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]);
                if (!Array.isArray(STATE.materialDisponible)) STATE.materialDisponible = [];

                c.innerHTML = `
                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-user"></i> Perfil</div>
                        <div class="ajustes-item"><span class="aj-label">Nombre</span><input class="input input-sm" id="ajusteNombre" maxlength="80" value="${escapeHTML(STATE.nombre)}" style="width:120px;"></div>
                        <div class="ajustes-item"><span class="aj-label">Altura (cm)</span><input class="input input-sm" type="number" id="ajusteAltura" min="80" max="250" step="1" value="${STATE.altura ?? ""}" style="width:80px;"></div>
                        <div class="ajustes-item"><span class="aj-label">Peso objetivo (kg)</span><input class="input input-sm" type="number" id="ajusteObjetivo" min="1" max="500" step="0.1" value="${CONFIG.PESO_OBJETIVO ?? ""}" style="width:80px;"></div>
                        <div class="ajustes-item"><label class="aj-label" for="ajusteFechaSinFumar">Inicio sin fumar</label><input class="input input-sm" type="date" id="ajusteFechaSinFumar" max="${UI.getHoy()}" value="${escapeHTML(STATE.ajustes?.fechaInicioNoFumar || "")}"></div>
                        <button class="btn btn-primary btn-block" onclick="Ajustes._guardar()" style="margin-top:10px;"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
                    </div>

                    <div class="card inventory-card">
                        <div class="card-title"><i class="fa-solid fa-dumbbell"></i> Mi material</div>
                        <p class="inventory-hint">Activa lo que tienes disponible para entrenar. Puedes cambiarlo cuando quieras.</p>
                        <div class="inventory-list">${STATE.materialDisponible.map((item, index) => `
                            <div class="inventory-item" data-index="${index}">
                                <div class="inventory-fields">
                                    <input class="input input-sm inventory-name" aria-label="Nombre del material" maxlength="80" value="${escapar(item.nombre)}" placeholder="Material">
                                    <input class="input input-sm inventory-detail" aria-label="Detalle del material" maxlength="180" value="${escapar(item.detalle)}" placeholder="Detalle opcional">
                                </div>
                                <label class="inventory-toggle"><input type="checkbox" class="inventory-active" ${item.activo !== false ? "checked" : ""}> Disponible</label>
                                <button type="button" class="btn btn-ghost btn-sm inventory-remove" aria-label="Eliminar ${escapar(item.nombre)}" title="Eliminar material"><i class="fa-solid fa-trash"></i></button>
                            </div>`).join("")}</div>
                        <form class="inventory-add" id="inventoryAddForm">
                            <input class="input input-sm" id="inventoryNewName" maxlength="80" placeholder="Añadir material" aria-label="Nombre del material" required>
                            <button class="btn btn-ghost btn-sm" type="submit"><i class="fa-solid fa-plus"></i> Añadir</button>
                        </form>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-timer"></i> Temporizador</div>
                        <div class="ajustes-item">
                            <span class="aj-label">⏱️ Temporizador de descanso</span>
                            <div class="switch-container">
                                    <button type="button" role="switch" aria-label="Temporizador de descanso" aria-checked="${temporizadorActivo}" class="switch ${temporizadorActivo ? 'active' : ''}" onclick="Ajustes._toggleDescanso()">
                                    <div class="switch-thumb"></div>
                                    </button>
                                <span class="switch-label">${temporizadorActivo ? 'Activado' : 'Desactivado'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-database"></i> Datos</div>
                        <button class="btn btn-ghost btn-block" onclick="Storage.exportar()"><i class="fa-solid fa-download"></i> Exportar</button>
                        <button class="btn btn-ghost btn-block" onclick="document.getElementById('importFile').click()" style="margin-top:4px;"><i class="fa-solid fa-upload"></i> Importar</button>
                        <input type="file" id="importFile" accept=".json" class="hidden" onchange="Storage.importar(this.files[0]); this.value='';">
                        <button class="btn btn-danger btn-block" onclick="APP.confirmarReset()" style="margin-top:4px;"><i class="fa-solid fa-trash"></i> Borrar todos los datos</button>
                    </div>

                    <div class="card">
                        <div class="card-title"><i class="fa-solid fa-circle-info"></i> Acerca de</div>
                        <div class="ajustes-item"><span class="aj-label">Versión</span><span style="color:var(--text-secondary);" id="versionDisplay">${CONFIG.VERSION}</span></div>
                        <div style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:6px;">NicoGym · Tu compañero de entrenamiento</div>
                    </div>
                `;

                c.querySelectorAll('.inventory-item').forEach((row) => {
                    const index = Number(row.dataset.index);
                    const guardar = () => {
                        const item = STATE.materialDisponible[index];
                        if (!item) return;
                        item.nombre = row.querySelector('.inventory-name').value.trim() || 'Material';
                        item.detalle = row.querySelector('.inventory-detail').value.trim();
                        item.activo = row.querySelector('.inventory-active').checked;
                        Storage._save();
                    };
                    row.querySelectorAll('input').forEach((input) => input.addEventListener('change', guardar));
                    row.querySelector('.inventory-remove').addEventListener('click', () => {
                        STATE.materialDisponible.splice(index, 1);
                        Storage._save();
                        this.render();
                    });
                });
                c.querySelector('#inventoryAddForm')?.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const nombre = c.querySelector('#inventoryNewName').value.trim();
                    if (!nombre) return;
                    STATE.materialDisponible.push({ id: `material-${Date.now()}`, nombre, detalle: '', activo: true });
                    Storage._save();
                    this.render();
                });
            },

            _guardar() {
                const nombre = document.getElementById('ajusteNombre').value.trim();
                const alturaTexto = document.getElementById('ajusteAltura').value.trim();
                const objetivoTexto = document.getElementById('ajusteObjetivo').value.trim();
                const fechaInicioNoFumar = document.getElementById('ajusteFechaSinFumar').value;
                const altura = alturaTexto ? Number(alturaTexto) : null;
                const objetivo = objetivoTexto ? Number(objetivoTexto) : null;
                if (altura !== null && (!Number.isFinite(altura) || altura < 80 || altura > 250)) {
                    UI.toast('La altura debe estar entre 80 y 250 cm', 'error');
                    return;
                }
                if (objetivo !== null && (!Number.isFinite(objetivo) || objetivo <= 0 || objetivo > 500)) {
                    UI.toast('El peso objetivo debe estar entre 0 y 500 kg', 'error');
                    return;
                }
                if (fechaInicioNoFumar && fechaInicioNoFumar > UI.getHoy()) {
                    UI.toast('La fecha de inicio sin fumar no puede ser futura', 'error');
                    return;
                }
                STATE.nombre = nombre;
                STATE.altura = altura;
                CONFIG.PESO_OBJETIVO = objetivo;
                STATE.ajustes = { ...STATE.ajustes, nombre, altura, objetivo, fechaInicioNoFumar: fechaInicioNoFumar || null };
                Storage._calcularDiasSinFumar();
                Storage._save();
                UI.toast('✅ Ajustes guardados', 'success');
                APP.renderizarTodo();
            },

            _toggleDescanso() {
                CONFIG.TEMPORIZADOR_DESCANSO = !CONFIG.TEMPORIZADOR_DESCANSO;
                STATE.config.temporizadorDescanso = CONFIG.TEMPORIZADOR_DESCANSO;
                Storage._save();
                this.render();
                UI.toast(`⏱️ Temporizador ${CONFIG.TEMPORIZADOR_DESCANSO ? 'activado' : 'desactivado'}`, 'info');
            }
        };

