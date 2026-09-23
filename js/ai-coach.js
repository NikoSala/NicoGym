// Coach de entrenamiento. El perfil se guarda aparte en este dispositivo;
// la estimación de experiencia se calcula con el historial local.
const EntrenadorIA = {
  endpointKey: "nicoGymAiEndpoint",
  tokenKey: "nicoGymAiAccessToken",
  profileKey: "nicoGymAiProfileV1",
  messages: [],
  enviando: false,
  aceptoCompartir: false,

  _config() {
    try {
      return {
        endpoint: sessionStorage.getItem(this.endpointKey) || "",
        token: sessionStorage.getItem(this.tokenKey) || "",
      };
    } catch (_) {
      return { endpoint: "", token: "" };
    }
  },

  _perfil() {
    try {
      return JSON.parse(localStorage.getItem(this.profileKey) || "null");
    } catch (_) {
      return null;
    }
  },

  _escapar(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  },

  _estimarNivelLocal() {
    const ahora = Date.now();
    const sesiones = (STATE.historialEntrenos || []).filter((sesion) => {
      const fecha = new Date(sesion.fecha).getTime();
      return Number.isFinite(fecha) && fecha <= ahora && ahora - fecha <= 365 * 24 * 60 * 60 * 1000;
    });
    const semanas = new Set(sesiones.map((sesion) => {
      const fecha = new Date(sesion.fecha);
      fecha.setHours(0, 0, 0, 0);
      fecha.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7));
      return `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
    }));
    let nivel = "principiante";
    if (sesiones.length >= 50 && semanas.size >= 30) nivel = "avanzado";
    else if (sesiones.length >= 16 && semanas.size >= 10) nivel = "intermedio";
    const fiable = sesiones.length >= 16 && semanas.size >= 10;
    return { nivel, sesiones: sesiones.length, semanas: semanas.size, fiable };
  },

  _materiales() {
    return [...new Set(getExerciseDatabase().flatMap((ej) => ej.material || []).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "es"));
  },

  render() {
    const container = document.getElementById("entrenadorIAContainer");
    if (!container) return;
    if (!this.messages.length) {
      this.messages.push({ role: "assistant", content: "Pídeme una rutina, una revisión de tu plan o una explicación. Usaré tu perfil y tu actividad de NicoGym como contexto." });
    }
    const config = this._config();
    const conectado = Boolean(config.endpoint && config.token);
    const perfil = this._perfil();
    const perfilCompleto = Boolean(perfil?.nivel && perfil?.objetivo && perfil?.dias && perfil?.minutos);
    const estimacion = this._estimarNivelLocal();
    const materiales = this._materiales();
    const seleccionados = new Set(perfil?.materiales || []);

    container.innerHTML = `
      <header class="ai-coach-header"><span class="ai-coach-kicker">ASISTENTE PERSONAL</span><h1>Entrenador IA</h1><p>Cuéntame qué rutina necesitas y la adaptaré a tu perfil.</p></header>
      <details class="ai-profile" ${perfilCompleto ? "" : "open"}>
        <summary><i class="fa-solid fa-user-check"></i><span>Tu perfil de entrenamiento</span><span class="ai-profile-status ${perfilCompleto ? "is-ready" : ""}">${perfilCompleto ? "GUARDADO EN ESTE MÓVIL" : "CONFIGURAR UNA VEZ"}</span></summary>
        <form class="ai-profile-form" id="aiProfileForm">
          <div class="ai-profile-grid">
            <label>Nivel<select id="aiLevel" required><option value="">Elige o calcula una sugerencia</option><option value="principiante" ${perfil?.nivel === "principiante" ? "selected" : ""}>Principiante</option><option value="intermedio" ${perfil?.nivel === "intermedio" ? "selected" : ""}>Intermedio</option><option value="avanzado" ${perfil?.nivel === "avanzado" ? "selected" : ""}>Avanzado</option></select></label>
            <label>Objetivo<select id="aiGoal" required><option value="">Elige tu objetivo</option><option value="ganar músculo" ${perfil?.objetivo === "ganar músculo" ? "selected" : ""}>Ganar músculo</option><option value="ganar fuerza" ${perfil?.objetivo === "ganar fuerza" ? "selected" : ""}>Ganar fuerza</option><option value="mejorar condición física" ${perfil?.objetivo === "mejorar condición física" ? "selected" : ""}>Mejorar condición física</option><option value="perder grasa" ${perfil?.objetivo === "perder grasa" ? "selected" : ""}>Perder grasa</option></select></label>
            <label>Días disponibles por semana<input id="aiDays" type="number" min="1" max="7" value="${this._escapar(perfil?.dias || "3")}" required></label>
            <label>Minutos por sesión<input id="aiMinutes" type="number" min="15" max="180" step="5" value="${this._escapar(perfil?.minutos || "45")}" required></label>
          </div>
          <div class="ai-level-estimate"><div><strong>Sugerencia calculada en este dispositivo</strong><span>${estimacion.sesiones} entrenamientos registrados en el último año · ${estimacion.semanas} semanas activas. ${estimacion.fiable ? "Estimación orientativa con historial suficiente." : "Hay poco historial para estimar el nivel con confianza."}</span></div><button type="button" class="btn btn-ghost btn-sm" id="aiUseEstimate">Usar ${estimacion.nivel}</button></div>
          <details class="ai-equipment"><summary>¿Qué material tienes?</summary><div class="ai-equipment-list">${materiales.map((material) => `<label><input type="checkbox" name="aiMaterial" value="${this._escapar(material)}" ${seleccionados.has(material) ? "checked" : ""}><span>${this._escapar(material)}</span></label>`).join("")}</div></details>
          <p class="ai-profile-local-note"><i class="fa-solid fa-mobile-screen-button"></i>Este perfil se guarda solo en este dispositivo y no modifica tus rutinas ni tus registros.</p>
          <button type="submit" class="btn btn-primary btn-sm">Guardar mi perfil</button>
        </form>
      </details>
      ${!conectado ? '<div class="ai-service-pending"><i class="fa-solid fa-circle-info"></i><span>El servicio de IA aún no está activado. Cuando se conecte, solo tendrás que escribir tu petición aquí.</span></div>' : ""}
      <div class="ai-privacy-note"><i class="fa-solid fa-lock"></i><span>El nivel se estima localmente. Al pedir respuesta, se envían a Cloudflare Workers AI tu mensaje, perfil, rutina y catálogo; del historial, solo cantidades resumidas. NicoGym no añade automáticamente nombre, peso, cintura, fotos, notas ni sesiones individuales. Si escribes esos datos en tu mensaje, también se enviarán.</span></div>
      <section class="ai-chat-panel" aria-label="Conversación con el entrenador IA"><div class="ai-chat-heading"><div><span class="ai-coach-kicker">ENTRENAMIENTO</span><h2>¿Qué quieres entrenar?</h2></div><button type="button" class="btn btn-ghost btn-sm" id="aiClearChat" aria-label="Borrar conversación">Nueva conversación</button></div><div class="ai-messages" id="aiMessages" role="log" aria-live="polite"></div><div class="ai-suggestions"><button type="button" data-prompt="Créame una rutina nueva adaptada a mi perfil, usando ejercicios de NicoGym.">Crear mi rutina</button><button type="button" data-prompt="Revisa mi rutina actual y sugiere mejoras, sin cambiarla.">Revisar mi rutina</button><button type="button" data-prompt="Explícame qué progreso de entrenamiento puedo observar en mis registros.">Ver mi progreso</button></div><label class="ai-consent"><input id="aiShareConsent" type="checkbox" ${this.aceptoCompartir ? "checked" : ""}><span>Acepto enviar mi mensaje, perfil y contexto de entrenamiento a Cloudflare Workers AI para generar la respuesta.</span></label><form class="ai-chat-form" id="aiChatForm"><textarea id="aiMessageInput" rows="2" maxlength="1600" placeholder="Ej.: Hazme una rutina de 4 días para ganar fuerza" aria-label="Tu mensaje" ${!conectado || !perfilCompleto || this.enviando ? "disabled" : ""}></textarea><button class="ai-send-button" type="submit" aria-label="Enviar mensaje" ${!conectado || !perfilCompleto || this.enviando ? "disabled" : ""}><i class="fa-solid ${this.enviando ? "fa-spinner fa-spin" : "fa-arrow-up"}"></i></button></form><p class="ai-chat-footnote">Las propuestas son borradores: no sustituyen asesoramiento profesional ni modifican tu rutina guardada.</p></section>
      <details class="ai-connection ai-advanced"><summary><i class="fa-solid fa-gear"></i><span>Configuración técnica del servicio (solo activación inicial)</span></summary><div class="ai-connection-body"><p>Usa la cuota gratuita diaria de Cloudflare Workers AI; aquí no se introduce ninguna clave de OpenAI.</p><label>Dirección del servicio<input id="aiEndpoint" type="url" placeholder="Dirección HTTPS terminada en /coach" value="${this._escapar(config.endpoint)}" autocomplete="url"></label><label>Clave de acceso del servicio<input id="aiAccessToken" type="password" placeholder="Clave de acceso privada del servicio" autocomplete="off"></label><div class="ai-connection-actions"><button type="button" class="btn btn-primary btn-sm" id="aiSaveConnection">Guardar en esta sesión</button>${conectado ? '<button type="button" class="btn btn-ghost btn-sm" id="aiDisconnect">Desconectar</button>' : ""}</div></div></details>`;

    const messageBox = document.getElementById("aiMessages");
    this.messages.forEach((message) => this._appendMessage(messageBox, message));
    messageBox.scrollTop = messageBox.scrollHeight;
    container.querySelector("#aiSaveConnection")?.addEventListener("click", () => this._guardarConexion());
    container.querySelector("#aiDisconnect")?.addEventListener("click", () => this._desconectar());
    container.querySelector("#aiClearChat")?.addEventListener("click", () => { this.messages = []; this.render(); });
    container.querySelector("#aiUseEstimate")?.addEventListener("click", () => {
      const level = document.getElementById("aiLevel");
      if (level) level.value = estimacion.nivel;
    });
    container.querySelector("#aiProfileForm")?.addEventListener("submit", (event) => this._guardarPerfil(event));
    container.querySelector("#aiShareConsent")?.addEventListener("change", (event) => { this.aceptoCompartir = event.target.checked; });
    container.querySelectorAll(".ai-suggestions button").forEach((button) => button.addEventListener("click", () => {
      const input = document.getElementById("aiMessageInput");
      if (input) { input.value = button.dataset.prompt; input.focus(); }
    }));
    container.querySelector("#aiChatForm")?.addEventListener("submit", (event) => { event.preventDefault(); this._enviar(); });
  },

  _appendMessage(container, message) {
    const bubble = document.createElement("article");
    bubble.className = `ai-message ${message.role === "user" ? "from-user" : "from-assistant"}`;
    const label = document.createElement("span");
    label.className = "ai-message-label";
    label.textContent = message.role === "user" ? "TÚ" : "ENTRENADOR IA";
    const body = document.createElement("p");
    body.textContent = message.content;
    bubble.append(label, body);
    container.appendChild(bubble);
  },

  _guardarPerfil(event) {
    event.preventDefault();
    const nivel = document.getElementById("aiLevel").value;
    const objetivo = document.getElementById("aiGoal").value;
    const dias = Math.max(1, Math.min(7, Number(document.getElementById("aiDays").value) || 3));
    const minutos = Math.max(15, Math.min(180, Number(document.getElementById("aiMinutes").value) || 45));
    if (!nivel || !objetivo) {
      UI.toast("Elige tu nivel y objetivo para personalizar las rutinas", "error");
      return;
    }
    const materiales = [...document.querySelectorAll('input[name="aiMaterial"]:checked')].map((input) => input.value);
    try {
      localStorage.setItem(this.profileKey, JSON.stringify({ nivel, objetivo, dias, minutos, materiales }));
    } catch (_) {
      UI.toast("No se pudo guardar el perfil en este dispositivo", "error");
      return;
    }
    this.render();
    UI.toast("Perfil guardado en este dispositivo", "success");
  },

  _guardarConexion() {
    const endpointInput = document.getElementById("aiEndpoint");
    const tokenInput = document.getElementById("aiAccessToken");
    let endpoint;
    try {
      endpoint = new URL(endpointInput.value.trim());
    } catch (_) {
      UI.toast("Introduce la dirección HTTPS del servicio", "error");
      return;
    }
    if (endpoint.protocol !== "https:" || !endpoint.pathname.endsWith("/coach")) {
      UI.toast("La dirección debe usar HTTPS y terminar en /coach", "error");
      return;
    }
    const token = tokenInput.value.trim() || this._config().token;
    if (token.length < 24) {
      UI.toast("Falta la clave privada del servicio", "error");
      return;
    }
    try {
      sessionStorage.setItem(this.endpointKey, endpoint.toString().replace(/\/$/, ""));
      sessionStorage.setItem(this.tokenKey, token);
    } catch (_) {
      UI.toast("No se pudo guardar la conexión en esta sesión", "error");
      return;
    }
    this.render();
    UI.toast("Servicio conectado", "success");
  },

  _desconectar() {
    sessionStorage.removeItem(this.endpointKey);
    sessionStorage.removeItem(this.tokenKey);
    this.render();
  },

  _contexto() {
    const perfil = this._perfil();
    const experiencia = this._estimarNivelLocal();
    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    const catalogo = [...new Map(getExerciseDatabase().map((ej) => [
      (ej.nombre || "").trim().toLocaleLowerCase("es"),
      { nombre: ej.nombre, grupo: ej.grupo, material: ej.material || [] },
    ])).values()];
    const rutinas = dias.map((dia) => ({
      dia: CONFIG.NOMBRES_DIAS[dia] || dia,
      ejercicios: getEjerciciosPorDia(dia).map((ej) => ({ nombre: ej.nombre, series: ej.series, repeticiones: ej.reps })),
    }));
    return {
      perfil: perfil ? { nivel: perfil.nivel, objetivo: perfil.objetivo, diasDisponibles: perfil.dias, minutosPorSesion: perfil.minutos, materialDisponible: perfil.materiales || [] } : null,
      experienciaEstimadaLocal: { nivelSugerido: experiencia.nivel, entrenamientosUltimoAno: experiencia.sesiones, semanasActivasUltimoAno: experiencia.semanas, orientativa: true },
      rutinaActual: rutinas,
      catalogoEjercicios: catalogo,
    };
  },

  async _enviar() {
    if (this.enviando) return;
    const input = document.getElementById("aiMessageInput");
    const content = input?.value.trim();
    if (!content) return;
    const config = this._config();
    if (!config.endpoint || !config.token) {
      UI.toast("El servicio de IA todavía no está activado", "error");
      return;
    }
    if (!this._perfil()?.nivel) {
      UI.toast("Completa tu perfil de entrenamiento primero", "error");
      return;
    }
    if (!this.aceptoCompartir) {
      UI.toast("Confirma el envío del mensaje y el contexto a Cloudflare Workers AI", "error");
      return;
    }
    this.messages.push({ role: "user", content });
    this.enviando = true;
    this.render();
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}` },
        body: JSON.stringify({ message: content, history: this.messages.slice(-9), context: this._contexto() }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "No se pudo conectar con el asistente.");
      this.messages.push({ role: "assistant", content: String(result.reply || "No he podido generar una respuesta.") });
    } catch (error) {
      this.messages.push({ role: "assistant", content: `No he podido responder: ${error.message || "comprueba la conexión"}` });
    } finally {
      this.enviando = false;
      this.render();
    }
  },
};
