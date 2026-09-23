// Asistente de entrenamiento. Las conversaciones solo viven en memoria de esta pestaña.
const EntrenadorIA = {
  endpointKey: "nicoGymAiEndpoint",
  tokenKey: "nicoGymAiAccessToken",
  messages: [],
  enviando: false,
  configurando: false,

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

  _escapar(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  },

  render() {
    const container = document.getElementById("entrenadorIAContainer");
    if (!container) return;
    if (!this.messages.length) {
      this.messages.push({ role: "assistant", content: "¡Hola! Puedo ayudarte a entender tu progreso y proponerte ideas de entrenamiento basadas en tus rutinas y ejercicios. ¿Qué quieres revisar?" });
    }
    const config = this._config();
    const conectado = Boolean(config.endpoint && config.token);
    container.innerHTML = `
      <header class="ai-coach-header"><span class="ai-coach-kicker">ASISTENTE PERSONAL</span><h1>Entrenador IA</h1><p>Ideas y orientación basadas en tus rutinas y progreso.</p></header>
      <details class="ai-connection" ${!conectado || this.configurando ? "open" : ""}>
        <summary><i class="fa-solid ${conectado ? "fa-shield-halved" : "fa-link"}"></i><span>${conectado ? "Conexión configurada en esta sesión" : "Conectar el servicio de IA"}</span><span class="ai-connection-state ${conectado ? "is-connected" : ""}">${conectado ? "LISTA" : "CONFIGURAR"}</span></summary>
        <div class="ai-connection-body"><p>Introduce la URL del Worker y la clave de acceso configuradas por ti. No pegues aquí tu clave de OpenAI.</p><label>URL del asistente<input id="aiEndpoint" type="url" placeholder="https://tu-worker.workers.dev/coach" value="${this._escapar(config.endpoint)}" autocomplete="url"></label><label>Clave de acceso del Worker<input id="aiAccessToken" type="password" placeholder="La clave APP_ACCESS_TOKEN que configuraste" autocomplete="off"></label><div class="ai-connection-actions"><button type="button" class="btn btn-primary btn-sm" id="aiSaveConnection">Guardar en esta sesión</button>${conectado ? '<button type="button" class="btn btn-ghost btn-sm" id="aiDisconnect">Desconectar</button>' : ""}</div></div>
      </details>
      <div class="ai-privacy-note"><i class="fa-solid fa-lock"></i><span>Al enviar, el mensaje y un resumen de rutinas, entrenamientos recientes y últimas mediciones se envían a OpenAI. No se envían nombre, fotos ni notas. La conversación no se guarda en NicoGym.</span></div>
      <section class="ai-chat-panel" aria-label="Conversación con el entrenador IA"><div class="ai-chat-heading"><div><span class="ai-coach-kicker">ENTRENAMIENTO</span><h2>¿En qué te ayudo?</h2></div><button type="button" class="btn btn-ghost btn-sm" id="aiClearChat" aria-label="Borrar conversación">Nueva conversación</button></div><div class="ai-messages" id="aiMessages" role="log" aria-live="polite"></div><div class="ai-suggestions"><button type="button" data-prompt="Analiza mi rutina semanal y dime si tiene un reparto equilibrado.">Revisar mi rutina</button><button type="button" data-prompt="Resume mi evolución reciente de entrenamiento y dime qué tendencia observas.">Ver mi progreso</button><button type="button" data-prompt="Propón una rutina alternativa de cinco días usando solo ejercicios de mi catálogo actual. No cambies mi rutina guardada.">Proponer una rutina</button></div><form class="ai-chat-form" id="aiChatForm"><textarea id="aiMessageInput" rows="2" maxlength="1600" placeholder="Escribe tu pregunta..." aria-label="Tu mensaje" ${!conectado || this.enviando ? "disabled" : ""}></textarea><button class="ai-send-button" type="submit" aria-label="Enviar mensaje" ${!conectado || this.enviando ? "disabled" : ""}><i class="fa-solid ${this.enviando ? "fa-spinner fa-spin" : "fa-arrow-up"}"></i></button></form><p class="ai-chat-footnote">Orientación general; no sustituye a un profesional sanitario o entrenador.</p></section>`;

    const messageBox = document.getElementById("aiMessages");
    this.messages.forEach((message) => this._appendMessage(messageBox, message));
    messageBox.scrollTop = messageBox.scrollHeight;
    container.querySelector("#aiSaveConnection")?.addEventListener("click", () => this._guardarConexion());
    container.querySelector("#aiDisconnect")?.addEventListener("click", () => this._desconectar());
    container.querySelector("#aiClearChat")?.addEventListener("click", () => { this.messages = []; this.render(); });
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

  _guardarConexion() {
    const endpointInput = document.getElementById("aiEndpoint");
    const tokenInput = document.getElementById("aiAccessToken");
    let endpoint;
    try {
      endpoint = new URL(endpointInput.value.trim());
    } catch (_) {
      UI.toast("Introduce la URL HTTPS de tu Worker", "error");
      return;
    }
    if (endpoint.protocol !== "https:" || !endpoint.pathname.endsWith("/coach")) {
      UI.toast("La URL debe usar HTTPS y terminar en /coach", "error");
      return;
    }
    const token = tokenInput.value.trim() || this._config().token;
    if (token.length < 24) {
      UI.toast("Introduce la clave de acceso configurada en el Worker", "error");
      return;
    }
    try {
      sessionStorage.setItem(this.endpointKey, endpoint.toString().replace(/\/$/, ""));
      sessionStorage.setItem(this.tokenKey, token);
    } catch (_) {
      UI.toast("El navegador no permite guardar la conexión en esta sesión", "error");
      return;
    }
    this.configurando = false;
    this.render();
    UI.toast("Conexión guardada durante esta sesión", "success");
  },

  _desconectar() {
    sessionStorage.removeItem(this.endpointKey);
    sessionStorage.removeItem(this.tokenKey);
    this.configurando = true;
    this.render();
  },

  _contexto() {
    const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    const catalogo = [...new Map(getExerciseDatabase().map((ej) => [
      (ej.nombre || "").trim().toLocaleLowerCase("es"),
      { nombre: ej.nombre, grupo: ej.grupo, material: ej.material || [] },
    ])).values()];
    const rutinas = dias.map((dia) => ({
      dia: CONFIG.NOMBRES_DIAS[dia] || dia,
      ejercicios: getEjerciciosPorDia(dia).map((ej) => ({ nombre: ej.nombre, series: ej.series, repeticiones: ej.reps })),
    }));
    const sesiones = [...(STATE.historialEntrenos || [])]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 4)
      .map((sesion) => ({
        fecha: sesion.fecha,
        dia: CONFIG.NOMBRES_DIAS[sesion.dia] || sesion.dia,
        ejercicios: (sesion.ejercicios || []).slice(0, 12).map((ej) => ({ nombre: ej.nombre, pesoKg: Number(ej.peso) || 0, series: Number(ej.series) || 0, repeticiones: String(ej.reps || "") })),
      }));
    const mediciones = [...(STATE.mediciones || [])].slice(-3).map((medicion) => ({
      fecha: medicion.fecha,
      pesoKg: Number(medicion.peso) || null,
      cinturaCm: Number(medicion.cintura) || null,
    }));
    return {
      objetivoPesoKg: Number(CONFIG.PESO_OBJETIVO) || null,
      rutinaActual: rutinas,
      entrenamientosRecientes: sesiones,
      medicionesRecientes: mediciones,
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
      UI.toast("Configura primero la conexión del asistente", "error");
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
      this.messages.push({ role: "assistant", content: `No he podido responder: ${error.message || "comprueba tu conexión y la configuración del Worker"}` });
    } finally {
      this.enviando = false;
      this.render();
    }
  },
};
