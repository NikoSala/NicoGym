# Entrenador IA gratuito de NicoGym

La app de GitHub Pages es estática. El asistente usa un Worker de Cloudflare y Workers AI, sin una API de OpenAI ni claves de proveedor. El modelo configurado es `@cf/qwen/qwen3.8-27b`.

## Coste y límite

Workers AI incluye una cuota gratuita de 10.000 Neurons por día. Mantén la cuenta en el plan Workers Free. Si se alcanza la cuota diaria, las respuestas fallarán hasta que se restablezca; no cambies al plan Workers Paid si quieres mantener el coste en cero. El Worker Free también tiene límites de solicitudes diarios.

## Activación inicial

1. Inicia sesión en Cloudflare y crea un Worker llamado `nicogym-entrenador`.
2. En el editor del Worker pega el contenido de `worker/coach.js` y despliega una primera versión.
3. Abre **Settings → Bindings → Add binding → Workers AI**. Usa `AI` como nombre de variable y guarda/despliega. Este binding permite llamar al modelo sin guardar una clave de proveedor.
4. En **Settings → Variables and Secrets**, configura `ALLOWED_ORIGINS` como texto con el valor `https://nikosala.github.io`.
5. Crea un secreto `APP_ACCESS_TOKEN` con una contraseña aleatoria larga (al menos 32 caracteres) y vuelve a desplegar.
6. Copia la URL del Worker y añade `/coach`, por ejemplo `https://nicogym-entrenador.tu-subdominio.workers.dev/coach`.
7. En NicoGym abre **Más → Entrenador IA → Configuración técnica** y guarda la URL y el mismo secreto de acceso. Es un ajuste inicial de esa sesión del navegador; no introduzcas una clave de OpenAI, porque ya no se utiliza.

También se incluye `worker/wrangler.jsonc` para quien despliegue mediante Wrangler: define el binding `AI`, `workers.dev` y el origen permitido. El secreto `APP_ACCESS_TOKEN` debe añadirse por separado como secreto, nunca como variable pública.

## Datos y privacidad

El nivel se estima en este dispositivo a partir de cantidades agregadas del historial del último año; el usuario puede corregirlo. El perfil (nivel, objetivo, días, duración y material) se guarda en una clave local independiente de `STATE`, no se sincroniza ni se incluye en los backups existentes.

Al enviar una consulta, se envían a Cloudflare Workers AI el mensaje, el perfil, la rutina semanal, el catálogo de ejercicios y los últimos mensajes visibles de la conversación. NicoGym no añade automáticamente nombre, peso, cintura, fotos, notas ni sesiones individuales/cargas al contexto; cualquier dato que escribas manualmente en el mensaje sí se envía. Cloudflare indica que no usa el contenido de Workers AI para entrenar modelos ni mejorar sus servicios, y que no lo almacena salvo que se vincule un servicio de almacenamiento. La solicitud no se guarda en el estado de NicoGym.

El asistente solo propone borradores con ejercicios del catálogo recibido. No guarda ni modifica rutinas, no diagnostica lesiones y no genera dietas: NicoGym aún no tiene módulo de nutrición.
