// Biblioteca de consulta: utiliza el catálogo existente sin modificar rutinas ni registros.
const ExerciseLibrary = {
  grupoActivo: "Todos",
  busqueda: "",

  _escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[caracter]);
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
    const grupos = [...new Set(ejercicios.map((ej) => ej.grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
    const filtrados = ejercicios.filter((ej) => {
      const coincideGrupo = this.grupoActivo === "Todos" || ej.grupo === this.grupoActivo;
      const texto = `${ej.nombre} ${ej.grupo || ""} ${(ej.material || []).join(" ")} ${(ej.musculosPrincipales || []).join(" ")}`.toLocaleLowerCase("es");
      return coincideGrupo && texto.includes(this.busqueda.trim().toLocaleLowerCase("es"));
    });

    container.innerHTML = `
      <header class="library-header">
        <div><span class="library-eyebrow">CATÁLOGO</span><h1>Ejercicios</h1><p>Consulta movimientos, músculos y técnica.</p></div>
        <span class="library-count">${filtrados.length} ejercicios</span>
      </header>
      <label class="library-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input id="librarySearch" type="search" placeholder="Buscar ejercicio o material" value="${this._escapar(this.busqueda)}" aria-label="Buscar ejercicios"></label>
      <div class="library-filters" aria-label="Filtrar por grupo muscular">
        ${["Todos", ...grupos].map((grupo) => `<button type="button" class="library-filter ${this.grupoActivo === grupo ? "active" : ""}" data-group="${this._escapar(grupo)}">${this._escapar(grupo)}</button>`).join("")}
      </div>
      <div class="library-grid">${filtrados.map((ej) => {
        const indice = ejercicios.indexOf(ej);
        const media = ej.urlGif ? `<img src="${this._escapar(ej.urlGif)}" alt="Demostración de ${this._escapar(ej.nombre)}" loading="lazy" onerror="this.parentElement.classList.add('is-placeholder');this.remove()">` : "";
        return `<button type="button" class="library-card" data-exercise="${indice}" aria-label="Ver ${this._escapar(ej.nombre)}"><span class="library-card-media ${media ? "" : "is-placeholder"}">${media}<i class="fa-solid fa-dumbbell" aria-hidden="true"></i></span><span class="library-card-copy"><span class="library-card-group">${this._escapar(ej.grupo || ej.categoria || "Ejercicio")}</span><strong>${this._escapar(ej.nombre)}</strong><span class="library-card-meta">${this._escapar((ej.musculosPrincipales || []).slice(0, 2).join(" · ") || ej.categoria || "Ver detalles")}</span></span><i class="fa-solid fa-chevron-right library-card-arrow" aria-hidden="true"></i></button>`;
      }).join("") || `<p class="library-empty">No hay ejercicios que coincidan con la búsqueda.</p>`}</div>`;

    const search = document.getElementById("librarySearch");
    search?.addEventListener("input", (event) => { this.busqueda = event.target.value; this.render(); const input = document.getElementById("librarySearch"); input?.focus(); input?.setSelectionRange(this.busqueda.length, this.busqueda.length); });
    container.querySelectorAll(".library-filter").forEach((button) => button.addEventListener("click", () => { this.grupoActivo = button.dataset.group; this.render(); }));
    container.querySelectorAll(".library-card").forEach((button) => button.addEventListener("click", () => this._ver(ejercicios[Number(button.dataset.exercise)])));
  },

  _ver(ej) {
    if (!ej) return;
    const lista = (items) => items?.length ? `<ul>${items.map((item) => `<li>${this._escapar(item)}</li>`).join("")}</ul>` : "";
    const texto = (value) => value ? `<p>${this._escapar(value)}</p>` : "";
    const media = ej.urlGif ? `<img class="library-detail-image" src="${this._escapar(ej.urlGif)}" alt="Demostración de ${this._escapar(ej.nombre)}" onerror="this.style.display='none'">` : "";
    Modal.abrir(`<article class="library-detail">${media}<span class="library-eyebrow">${this._escapar(ej.grupo || ej.categoria || "Ejercicio")}</span><h2>${this._escapar(ej.nombre)}</h2>${texto(ej.descripcion)}${ej.musculosPrincipales?.length ? `<h3>Músculos principales</h3><p>${this._escapar(ej.musculosPrincipales.join(" · "))}</p>` : ""}${ej.material?.length ? `<h3>Material</h3><p>${this._escapar(ej.material.join(" · "))}</p>` : ""}${ej.consejos ? `<h3>Consejos</h3>${lista(ej.consejos.split(/\r?\n/).map((x) => x.replace(/^•\s*/, "")).filter(Boolean))}` : ""}${ej.errores ? `<h3>Errores frecuentes</h3>${lista(ej.errores.split(/\r?\n/).map((x) => x.replace(/^•\s*/, "")).filter(Boolean))}` : ""}</article>`);
  },
};
