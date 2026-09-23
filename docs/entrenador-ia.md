# Conectar el Entrenador IA de NicoGym

La app publicada en GitHub Pages es estática. Por seguridad, la llamada a OpenAI se hace desde el Cloudflare Worker de `worker/coach.js`; nunca pongas `OPENAI_API_KEY` en el código de NicoGym. Esta activación del servidor es una tarea técnica única; no forma parte del uso normal de NicoGym.

## 1. Crear el Worker

1. En Cloudflare, abre **Workers & Pages**, crea un Worker y abre su editor de código.
2. Sustituye el ejemplo por el contenido de `worker/coach.js` y despliega.
3. En **Settings → Variables and Secrets**, añade:
   - `OPENAI_API_KEY`: tipo **Secret**, con una clave de API de OpenAI.
   - `APP_ACCESS_TOKEN`: tipo **Secret**, con una contraseña aleatoria propia de al menos 32 caracteres. No uses ni compartas aquí la clave de OpenAI.
   - `ALLOWED_ORIGINS`: tipo texto, valor `https://nikosala.github.io`.
   - `OPENAI_MODEL`: opcional; por defecto se usa `gpt-5-mini`.
4. Despliega de nuevo después de guardar los secretos.

Para generar una clave de acceso en PowerShell:

```powershell
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$secretBytes = New-Object byte[] 32
$rng.GetBytes($secretBytes)
[BitConverter]::ToString($secretBytes).Replace('-', '').ToLower()
```

Guarda el valor generado en el secreto `APP_ACCESS_TOKEN`. La limitación de peticiones incluida en el Worker es por instancia y sirve como protección básica; configura también reglas de limitación de Cloudflare y límites/alertas de gasto en el proyecto de API.

## 2. Conectar NicoGym

1. Copia la URL pública del Worker y añade `/coach` (por ejemplo `https://mi-worker.<subdominio>.workers.dev/coach`).
2. En NicoGym abre **Más → Entrenador IA**.
3. Introduce esa URL y el mismo valor de `APP_ACCESS_TOKEN` que guardaste en Cloudflare.

La dirección y la clave de acceso son ajustes técnicos de conexión, no la clave de OpenAI. Se conservan solo en `sessionStorage` de esa pestaña. Para usar la app sin repetir esos datos tras cerrar el navegador, quien publica NicoGym debe preconfigurar el endpoint y resolver la autenticación en el despliegue; no incluyas secretos en el JavaScript público.

## Datos y alcance

El nivel se estima en el móvil según los entrenamientos y semanas activas registrados en el último año. Es orientativo y puedes elegir o corregir el nivel. El perfil (nivel, objetivo, días, duración y material) se guarda en una clave local independiente de `STATE`; no se sincroniza ni se incluye en los backups existentes.

Al enviar una consulta se comparten con OpenAI el mensaje, ese perfil, la rutina semanal y el catálogo de ejercicios. El historial se resume localmente en cantidades para estimar el nivel; NicoGym no envía sesiones individuales, cargas, mediciones de peso/cintura, fotos, nombre ni notas. Se requiere marcar la casilla de consentimiento en la pantalla. La conversación no se guarda en el estado de NicoGym y la solicitud al API indica `store: false`.

El asistente puede revisar el entrenamiento y redactar propuestas basadas en ejercicios existentes. No cambia ni guarda rutinas, no diagnostica lesiones y no genera dietas: NicoGym aún no tiene un módulo de nutrición.
