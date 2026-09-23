// Biblioteca de consulta: utiliza el catálogo existente sin modificar rutinas ni registros.
const ExerciseLibrary = {
  grupoActivo: "Todos",
  busqueda: "",
  pagina: 1,

  _escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[caracter]);
  },

  _gruposMusculares(ejercicio) {
    const grupos = new Set();
    const normalizar = (musculo) => {
      const nombre = String(musculo || "")
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (/pectoral|pecho|serrato/.test(nombre)) return "Pecho";
      if (/espalda|dorsal|romboide|erector/.test(nombre)) return "Espalda";
      if (/deltoid|hombro|supraespinoso|manguito/.test(nombre)) return "Hombro";
      if (/triceps/.test(nombre)) return "Tríceps";
      if (/biceps|braquial/.test(nombre) && !/braquiorradial/.test(nombre)) return "Bíceps";
      if (/antebrazo|braquiorradial|agarre/.test(nombre)) return "Antebrazo";
      if (/trapecio/.test(nombre)) return "Trapecio";
      if (/glute/.test(nombre)) return "Glúteo";
      if (/cuadriceps|isquio|aductor|abductor|pierna/.test(nombre)) return "Pierna";
      if (/gemelo|soleo/.test(nombre)) return "Gemelos";
      if (/abdominal|oblicuo|\bcore\b/.test(nombre)) return "Abdominales";
      return null;
    };

    String(ejercicio?.grupo || "").split("/").forEach((grupo) => {
      const normalizado = normalizar(grupo.trim());
      if (normalizado) grupos.add(normalizado);
    });
    (ejercicio?.musculosPrincipales || []).forEach((musculo) => {
      const normalizado = normalizar(musculo);
      if (normalizado) grupos.add(normalizado);
    });
    return [...grupos];
  },

  render() {
    const container = document.getElementById("bibliotecaContainer");
    if (!container) return;
    const catalogo = getExerciseDatabase();
    const ejerciciosPorNombre = new Map();
    catalogo.forEach((ej) => {
      const clave = (ej.nombre || "").trim().toLocaleLowerCase("es");
      const actual = ejerciciosPorNombre.get(clave);
      const tieneGif = /\.gif(?:$|[?#])/i.test(ej.urlGif || "");
      const actualTieneGif = /\.gif(?:$|[?#])/i.test(actual?.urlGif || "");
      if (!actual || (tieneGif && !actualTieneGif)) ejerciciosPorNombre.set(clave, ej);
    });
    const ejercicios = [...ejerciciosPorNombre.values()];
    const asignados = new Set(DAY_KEYS_ROUTINE.flatMap((dia) => getRutinaDelDia(dia).map(([id]) => id)));
    const ejerciciosEnRutina = ejercicios.filter((ej) => asignados.has(ej.id)).length;
    const grupos = [...new Set(ejercicios.flatMap((ej) => this._gruposMusculares(ej)))].sort((a, b) => a.localeCompare(b, "es"));
    const filtrados = ejercicios.filter((ej) => {
      const gruposEjercicio = this._gruposMusculares(ej);
      const coincideGrupo = this.grupoActivo === "Todos" || gruposEjercicio.includes(this.grupoActivo);
      const texto = `${ej.nombre} ${gruposEjercicio.join(" ")} ${(ej.material || []).join(" ")} ${(ej.musculosPrincipales || []).join(" ")}`.toLocaleLowerCase("es");
      return coincideGrupo && texto.includes(this.busqueda.trim().toLocaleLowerCase("es"));
    });
    const tamanoPagina = window.matchMedia?.("(max-width: 650px)").matches ? 8 : 12;
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / tamanoPagina));
    this.pagina = Math.min(Math.max(1, this.pagina), totalPaginas);
    const visibles = filtrados.slice((this.pagina - 1) * tamanoPagina, this.pagina * tamanoPagina);

    container.innerHTML = `
      <header class="library-header">
        <div><span class="library-eyebrow">CATÁLOGO</span><h1>Ejercicios</h1><p>Marca los días para añadir o quitar ejercicios de tu rutina.</p></div>
        <span class="library-count">${ejercicios.length} ejercicios · ${ejerciciosEnRutina} en rutina</span>
      </header>
      <label class="library-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input id="librarySearch" type="search" placeholder="Buscar ejercicio o material" value="${this._escapar(this.busqueda)}" aria-label="Buscar ejercicios"></label>
      <div class="library-filters" aria-label="Filtrar por grupo muscular">
        ${["Todos", ...grupos].map((grupo) => `<button type="button" class="library-filter ${this.grupoActivo === grupo ? "active" : ""}" data-group="${this._escapar(grupo)}">${this._escapar(grupo)}</button>`).join("")}
      </div>
      <div class="library-grid" id="libraryGrid">${visibles.map((ej) => {
        const indice = ejercicios.indexOf(ej);
        const media = ej.urlGif ? `<img src="${this._escapar(ej.urlGif)}" alt="Demostración de ${this._escapar(ej.nombre)}" loading="lazy" onerror="this.parentElement.classList.add('is-placeholder');this.remove()">` : "";
        const dias = DAY_KEYS_ROUTINE.map((dia, diaIndex) => {
          const seleccionado = getRutinaDelDia(dia).some(([id]) => id === ej.id);
          const etiqueta = ["L", "M", "X", "J", "V"][diaIndex];
          const diaNombre = CONFIG.NOMBRES_DIAS[dia];
          return `<button type="button" class="library-day-toggle ${seleccionado ? "active" : ""}" data-day="${dia}" data-exercise-id="${this._escapar(ej.id)}" aria-label="${seleccionado ? "Quitar" : "Añadir"} ${this._escapar(ej.nombre)} ${seleccionado ? "de" : "a"} ${this._escapar(diaNombre)}" aria-pressed="${seleccionado}" title="${this._escapar(diaNombre)}">${etiqueta}</button>`;
        }).join("");
        return `<article class="library-card"><button type="button" class="library-card-main" data-exercise="${indice}" aria-label="Ver detalles de ${this._escapar(ej.nombre)}"><span class="library-card-media ${media ? "" : "is-placeholder"}">${media}<i class="fa-solid fa-dumbbell" aria-hidden="true"></i></span><span class="library-card-copy"><span class="library-card-group">${this._escapar(this._gruposMusculares(ej).join(" · ") || ej.categoria || "Ejercicio")}</span><strong>${this._escapar(ej.nombre)}</strong><span class="library-card-meta">${this._escapar((ej.musculosPrincipales || []).slice(0, 2).join(" · ") || ej.categoria || "Ver detalles")}</span></span><i class="fa-solid fa-chevron-right library-card-arrow" aria-hidden="true"></i></button><div class="library-routine-edit"><span>Añadir a</span><div class="library-day-toggles" aria-label="Días de rutina">${dias}</div></div></article>`;
      }).join("") || `<p class="library-empty">No hay ejercicios que coincidan con la búsqueda.</p>`}</div>
      ${totalPaginas > 1 ? `<nav class="library-pagination" aria-label="Páginas de ejercicios"><button type="button" class="library-page-button" data-page="${this.pagina - 1}" ${this.pagina === 1 ? "disabled" : ""}>Anterior</button><span>Página ${this.pagina} de ${totalPaginas}</span><button type="button" class="library-page-button" data-page="${this.pagina + 1}" ${this.pagina === totalPaginas ? "disabled" : ""}>Siguiente</button></nav>` : ""}`;

    const search = document.getElementById("librarySearch");
    search?.addEventListener("input", (event) => { this.busqueda = event.target.value; this.pagina = 1; this.render(); const input = document.getElementById("librarySearch"); input?.focus(); input?.setSelectionRange(this.busqueda.length, this.busqueda.length); });
    container.querySelectorAll(".library-filter").forEach((button) => button.addEventListener("click", () => { this.grupoActivo = button.dataset.group; this.pagina = 1; this.render(); }));
    container.querySelectorAll(".library-page-button").forEach((button) => button.addEventListener("click", () => { this.pagina = Number(button.dataset.page); this.render(); document.getElementById("libraryGrid")?.scrollIntoView({ behavior: "smooth", block: "start" }); }));
    container.querySelectorAll(".library-card-main").forEach((button) => button.addEventListener("click", () => this._ver(ejercicios[Number(button.dataset.exercise)])));
    container.querySelectorAll(".library-day-toggle").forEach((button) => button.addEventListener("click", () => RutinaEditor.toggle(button.dataset.exerciseId, button.dataset.day)));
  },

  _ver(ej) {
    if (!ej) return;
    const lista = (items) => items?.length ? `<ul>${items.map((item) => `<li>${this._escapar(item)}</li>`).join("")}</ul>` : "";
    const texto = (value) => value ? `<p>${this._escapar(value)}</p>` : "";
    const media = ej.urlGif ? `<img class="library-detail-image" src="${this._escapar(ej.urlGif)}" alt="Demostración de ${this._escapar(ej.nombre)}" onerror="this.style.display='none'">` : "";
    Modal.abrir(`<article class="library-detail">${media}<span class="library-eyebrow">${this._escapar(this._gruposMusculares(ej).join(" · ") || ej.categoria || "Ejercicio")}</span><h2>${this._escapar(ej.nombre)}</h2>${texto(ej.descripcion)}${ej.musculosPrincipales?.length ? `<h3>Músculos principales</h3><p>${this._escapar(ej.musculosPrincipales.join(" · "))}</p>` : ""}${ej.material?.length ? `<h3>Material</h3><p>${this._escapar(ej.material.join(" · "))}</p>` : ""}${ej.consejos ? `<h3>Consejos</h3>${lista(ej.consejos.split(/\r?\n/).map((x) => x.replace(/^•\s*/, "")).filter(Boolean))}` : ""}${ej.errores ? `<h3>Errores frecuentes</h3>${lista(ej.errores.split(/\r?\n/).map((x) => x.replace(/^•\s*/, "")).filter(Boolean))}` : ""}</article>`);
  },
};
