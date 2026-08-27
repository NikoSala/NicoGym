// ==========================================
// OBJETIVOS / METAS
// ==========================================
const Objetivos = {
  render() {
    const c = document.getElementById("objetivosContainer");
    if (!c) return;

    const objetivos = STATE.objetivos || [];

    c.innerHTML = `
      <div class="card">
        <div class="card-title"><i class="fa-solid fa-bullseye"></i> Mis metas</div>
        <button class="btn btn-primary btn-block" onclick="Objetivos._nuevo()">
          <i class="fa-solid fa-plus"></i> Nueva meta
        </button>
        <div id="listaObjetivos" style="margin-top:10px;">
          ${this._renderLista(objetivos)}
        </div>
      </div>
    `;
  },

  _renderLista(objetivos) {
    if (objetivos.length === 0) {
      return `
        <div style="text-align:center;color:var(--text-secondary);padding:20px;">
          <i class="fa-solid fa-bullseye" style="font-size:36px;display:block;margin-bottom:8px;color:var(--text-muted);"></i>
          <p style="font-size:13px;">Aún no tienes metas creadas</p>
        </div>
      `;
    }

    return objetivos.map((obj, i) => {
      const progreso = obj.tipo === 'peso' ? this._progresoPeso(obj) : this._progresoEjercicio(obj);
      return `
        <div style="background:rgba(0,0,0,0.15);border-radius:12px;padding:12px;margin-bottom:8px;border:1px solid var(--border);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="font-weight:700;font-size:13px;">${obj.nombre}</div>
            <button class="btn btn-ghost btn-sm" onclick="Objetivos._eliminar(${i})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">${obj.descripcion}</div>
          <div style="background:rgba(255,255,255,0.08);border-radius:99px;height:6px;overflow:hidden;">
            <div style="height:100%;background:linear-gradient(90deg,var(--primary),var(--success));width:${progreso.pct}%;border-radius:99px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:var(--text-secondary);">
            <span>${progreso.actual}</span>
            <span>${progreso.pct}%</span>
            <span>${progreso.objetivo}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  _progresoPeso(obj) {
    if (STATE.mediciones.length === 0) return { pct: 0, actual: '-- kg', objetivo: `${obj.pesoObjetivo} kg` };
    const actual = STATE.mediciones[STATE.mediciones.length - 1].peso;
    const inicial = STATE.mediciones[0].peso;
    const total = Math.abs(inicial - obj.pesoObjetivo);
    const recorrido = Math.abs(inicial - actual);
    const pct = total > 0 ? Math.min(100, Math.round((recorrido / total) * 100)) : 100;
    return { pct, actual: `${actual} kg`, objetivo: `${obj.pesoObjetivo} kg` };
  },

  _progresoEjercicio(obj) {
    const registros = [];
    STATE.historialEntrenos.forEach(ent => {
      (ent.ejercicios || []).forEach(ej => {
        if (ej.nombre === obj.nombreEjercicio && ej.peso) {
          const p = parseReps(ej.reps);
          if (p.valid) registros.push({ peso: Number(ej.peso), reps: p.total });
        }
      });
    });
    const mejor = registros.length > 0 ? Math.max(...registros.map(r => r.peso)) : 0;
    const pct = obj.pesoObjetivo > 0 ? Math.min(100, Math.round((mejor / obj.pesoObjetivo) * 100)) : 0;
    return { pct, actual: `${mejor} kg`, objetivo: `${obj.pesoObjetivo} kg` };
  },

  _nuevo() {
    Modal.abrir(`
      <h3>🎯 Nueva meta</h3>
      <div class="form-field" style="margin-bottom:8px;">
        <label>Nombre</label>
        <input type="text" id="objNombre" class="input" placeholder="Ej: Perder 5 kg">
      </div>
      <div class="form-field" style="margin-bottom:8px;">
        <label>Tipo</label>
        <select id="objTipo" class="input" onchange="Objetivos._cambiarTipo()">
          <option value="peso">Peso corporal</option>
          <option value="ejercicio">Ejercicio</option>
        </select>
      </div>
      <div id="camposTipo">
        <div class="form-field" style="margin-bottom:8px;">
          <label>Peso objetivo (kg)</label>
          <input type="number" id="objPesoObjetivo" class="input" placeholder="Ej: 75">
        </div>
      </div>
      <div class="form-field" style="margin-bottom:8px;">
        <label>Descripción</label>
        <input type="text" id="objDescripcion" class="input" placeholder="Ej: Llegar a mi peso ideal">
      </div>
      <button class="btn btn-primary btn-block" onclick="Objetivos._guardar()">
        <i class="fa-solid fa-check"></i> Crear meta
      </button>
    `);
  },

  _cambiarTipo() {
    const tipo = document.getElementById("objTipo").value;
    const campos = document.getElementById("camposTipo");
    if (tipo === 'peso') {
      campos.innerHTML = `
        <div class="form-field" style="margin-bottom:8px;">
          <label>Peso objetivo (kg)</label>
          <input type="number" id="objPesoObjetivo" class="input" placeholder="Ej: 75">
        </div>
      `;
    } else {
      campos.innerHTML = `
        <div class="form-field" style="margin-bottom:8px;">
          <label>Ejercicio</label>
          <input type="text" id="objNombreEjercicio" class="input" placeholder="Ej: Press de pecho">
        </div>
        <div class="form-field" style="margin-bottom:8px;">
          <label>Peso objetivo (kg)</label>
          <input type="number" id="objPesoObjetivo" class="input" placeholder="Ej: 10">
        </div>
      `;
    }
  },

  _guardar() {
    const nombre = document.getElementById("objNombre").value;
    const tipo = document.getElementById("objTipo").value;
    const pesoObjetivo = parseFloat(document.getElementById("objPesoObjetivo").value);
    const descripcion = document.getElementById("objDescripcion").value;
    const nombreEjercicio = tipo === 'ejercicio' ? document.getElementById("objNombreEjercicio").value : null;

    if (!nombre || !pesoObjetivo) {
      UI.toast("Completa los campos obligatorios", "error");
      return;
    }

    if (!STATE.objetivos) STATE.objetivos = [];
    STATE.objetivos.push({
      nombre,
      tipo,
      pesoObjetivo,
      descripcion,
      nombreEjercicio,
      createdAt: new Date().toISOString()
    });

    Storage._save();
    Modal.cerrar();
    this.render();
    UI.toast("✅ Meta creada", "success");
  },

  _eliminar(i) {
    UI.confirmar("¿Eliminar esta meta?", () => {
      STATE.objetivos.splice(i, 1);
      Storage._save();
      this.render();
      UI.toast("🗑️ Meta eliminada", "success");
    });
  }
};