# Conectar el Entrenador IA de NicoGym

La app publicada en GitHub Pages es estática. Por seguridad, la llamada a OpenAI se hace desde el Cloudflare Worker de `worker/coach.js`; nunca pongas `OPENAI_API_KEY` en el código de NicoGym.

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

La URL y la clave de acceso se conservan solo en `sessionStorage` de esa sesión del navegador. Pulsa **Desconectar** para borrarlas antes de cerrar una sesión compartida.

## Datos y alcance

Al enviar una consulta se transmiten a OpenAI el mensaje, las rutinas actuales, el catálogo de ejercicios, hasta cuatro entrenamientos recientes y las últimas tres mediciones de peso/cintura. NicoGym no envía fotos, nombre ni notas de las sesiones. La conversación no se guarda en el estado de NicoGym y la solicitud al API indica `store: false`.

El asistente puede revisar el entrenamiento y redactar propuestas basadas en ejercicios existentes. No cambia ni guarda rutinas, no diagnostica lesiones y no genera dietas: NicoGym aún no tiene un módulo de nutrición.
