import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ═══════════════════════════════════════════════════════════════════════
// PROXY - BFF (Backend For Frontend)
// ═══════════════════════════════════════════════════════════════════════
//
// ¿Qué hace esto?
//   Angular corre en el navegador. Si llamara DIRECTAMENTE a la API
//   externa, las API keys quedarían expuestas en el código del cliente.
//   Este proxy intermedia todas las llamadas: el navegador pide a
//   /ssr-api/*, el servidor Node recibe, agrega la API key, reenvía
//   a la API externa y devuelve la respuesta.
//
//   Es un patrón BFF (Backend For Frontend) — el backend que habla
//   específicamente con el frontend.
//
// ═══════════════════════════════════════════════════════════════════════
import dotenv from 'dotenv';
dotenv.config();
app.use(express.json());

// API_KEY → Se envía en cada request a la API externa como header
// 'X-API-Key'. Nunca llega al navegador.
const API_KEY = process.env['API_KEY']!;

// API_ORIGINS → Mapa que vincula cada "recurso" (project, language, etc.)
// con la URL base de la API que le corresponde.
//
//   Ejemplo:
//     project → API_URL_PORTFOLIO (http://api.portfolio.com/api)
//     game-guide → API_URL_GAME_GUIDES (http://api.guides.com/api)
//
//   Si el frontend pide /ssr-api/project/1, el proxy busca "project"
//   en este mapa, obtiene la URL base y reenvía la llamada.
//
//   Para agregar un nuevo recurso, solo hay que añadirlo aquí.
const API_ORIGINS: Record<string, string> = {
  project:    process.env['API_URL_PORTFOLIO']!,
  language:   process.env['API_URL_PORTFOLIO']!,
  technology: process.env['API_URL_PORTFOLIO']!,
  'url-grp':  process.env['API_URL_PORTFOLIO']!,
  url:        process.env['API_URL_PORTFOLIO']!,
  'game-guide': process.env['API_URL_GAME_GUIDES']!,
};

/** Busca la URL base de la API para un recurso dado. */
function getOrigin(resource: string): string | undefined {
  return API_ORIGINS[resource];
}

// ─── Upload de imágenes (caso especial) ──────────────────────────────
//
//   Las imágenes se envían como "multipart/form-data" (raw), NO como
//   JSON. Por eso necesita su propio handler con express.raw().
//
//   Express intenta parsear el body de todos los requests como JSON
//   (express.json() al inicio). Para multipart, express.json() lo
//   ignora porque el Content-Type no es application/json, y este
//   handler recibe el body crudo (Buffer) para reenviarlo igual.
//
app.post(
  '/ssr-api/:resource/:id/upload-image',
  express.raw({ type: 'multipart/form-data', limit: '10mb' }),
  async (req, res) => {
    try {
      const { resource, id } = req.params;
      const origin = getOrigin(resource);

      // Si el recurso no está en API_ORIGINS, no sabemos a dónde enviarlo
      if (!origin) {
        res.status(404).json({ detail: `Unknown resource: ${resource}` });
        return;
      }

      // Reenvía el archivo exactamente como llegó (raw)
      const response = await fetch(`${origin}/${resource}/${id}/upload-image`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': req.headers['content-type'] as string,
        },
        body: new Uint8Array(req.body as Buffer),
      });

      const text = await response.text();
      res.status(response.status).json(text ? JSON.parse(text) : null);
    } catch (err) {
      console.error('[server.ts] upload error:', err);
      res.status(502).json({ detail: 'Error al subir la imagen' });
    }
  },
);

// ─── Proxy genérico para todo /ssr-api/ ──────────────────────────────
//
//   Este middleware captura TODAS las llamadas a /ssr-api/* sin importar
//   el método (GET, POST, PUT, DELETE) y las reenvía a la API externa.
//
//   Flujo para cada request:
//     1. Extrae el "recurso" de la URL (project, language, etc.)
//     2. Busca la URL base en API_ORIGINS
//     3. Reconstruye la URL completa con el path y query string
//     4. Agrega la API key y (si aplica) el body JSON
//     5. Hace fetch a la API externa
//     6. Devuelve la misma respuesta al frontend
//
//   Ejemplo:
//     Frontend pide:  GET /ssr-api/project/pagination?page=1
//     Proxy envía:     GET http://api.portfolio.com/api/project/pagination?page=1
//                      Con header: X-API-Key: <secreto>
//     Proxy devuelve:  La respuesta JSON exacta que devolvió la API
//
app.use('/ssr-api', async (req, res) => {
  try {
    // 1. Extraer el recurso de la URL
    //    /ssr-api/project/pagination?page=1 → "project"
    const afterPrefix = req.originalUrl.split('?')[0].replace('/ssr-api/', '');
    const resource = afterPrefix.split('/')[0];
    const origin = getOrigin(resource);

    if (!origin) {
      res.status(404).json({ detail: `Resource '${resource}' not mapped to any API origin` });
      return;
    }

    // 2. Reconstruir la URL externa completa
    //    Con req.originalUrl.replace('/ssr-api', '') aprovechamos que
    //    la URL del frontend es idéntica a la de la API externa, salvo
    //    el prefijo /ssr-api.
    const url = `${origin}${req.originalUrl.replace('/ssr-api', '')}`;

    // 3. Armar el request. Solo POST/PUT/PATCH llevan body.
    const options: RequestInit = {
      method: req.method,
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }

    // 4. Ejecutar el fetch y devolver la respuesta
    const response = await fetch(url, options);
    const text = await response.text();

    res.status(response.status).json(text ? JSON.parse(text) : null);
  } catch (err) {
    console.error(`[server.ts] proxy error:`, err);
    res.status(502).json({ detail: 'Error de conexión con el servicio externo' });
  }
});
// -----------------------------------------------------------------------

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
