# DEV Checklist — music-app-lucida

Breve guía para preparar el entorno y reproducir la API y frontend localmente.

Requisitos mínimos
- Node.js >= 18 (recomendado 18.x o 20.x+)
- npm (v8+)
- FFmpeg (binario disponible en PATH)
- Windows: PowerShell o WSL disponible

Instalación de dependencias
1. Desde la raíz del repo:

```powershell
npm install
```

Arrancar en desarrollo
- API:

```powershell
# desde la raíz
npm run dev -w @lucida/api
# o dentro de apps/api
npm run dev
```

- Web (Nuxt):

```powershell
npm run dev -w @lucida/web
# o dentro de apps/web
npm run dev
```

Variables de entorno importantes
- Para `apps/api` (configurar en entorno o .env):
  - `SOUNDCLOUD_OAUTH_TOKEN` (opcional) — token SoundCloud
  - `TIDAL_*` (opcional) — credenciales Tidal si aplica
  - `DEEZER_ARL` (opcional)
  - `QOBUZ_*` (opcional)
  - `YANDEX_MUSIC_TOKEN` (opcional)
  - `PORT` (opcional) — puerto de la API (por defecto 3000)

Notas de depuración
- Asegúrate que `ffmpeg` esté disponible en PATH; sin él el embedding de portada falla.
- Si el scraping de Lucida falla con HTML en lugar de JSON, puede deberse a Cloudflare o cambios en la página; revisar logs en `apps/api` (console.error) y ver `LucidaDownloader` / `LucidaClient`.
- Si `globalThis.fetch` falta en el runtime, usa Node >=18 o instala polyfill.

Comandos útiles para reproducir y capturar logs
```powershell
# iniciar API (muestra logs en consola)
npm run dev -w @lucida/api
or
$env:PORT=3001; npm run dev -w @lucida/api

# en otra terminal, probar búsqueda simple contra la API (ejemplo):
curl "http://localhost:3000/api/search?q=artist+name"
```

Próximos pasos recomendados
- Ejecutar el API y realizar una búsqueda para capturar errores reproducibles.
- Proveer variables de entorno si se quiere probar descargas reales.
- Si falla `ffmpeg`, instalarlo desde https://ffmpeg.org/ y añadir a PATH.

Cloudflare / scraping nota
- Si `apps/api` al hacer scraping contra `lucida.to` devuelve HTML con "<title>Just a moment..." o un `403` con header `cf-mitigated: challenge`, Cloudflare está bloqueando la petición (Managed Challenge).
- Opciones para resolverlo:
  - Prueba rápida: mejorar headers en el cliente HTTP (baja probabilidad contra Managed Challenge). Ejemplo en `apps/api/scraper/lucida-client-quick.js`.
  - Solución recomendada: usar FlareSolverr como proxy. Ejecuta:

```powershell
docker run -d -p 8191:8191 ghcr.io/FlareSolverr/FlareSolverr:latest
```

  y desde Node hacer POST a `http://localhost:8191/v1` (ver `apps/api/scraper/lucida-client-flaresolverr.js`).
  - Alternativa: usar Playwright para obtener HTML y cookies directamente (`apps/api/scraper/lucida-client-playwright.js`).

Consejos:
- No expongas FlareSolverr públicamente sin autenticación.
- Cachea respuestas y cookies cuando sea posible para reducir resoluciones.
- Busca endpoints JSON internos en `lucida.to` (XHR) que puedan estar menos protegidos.
