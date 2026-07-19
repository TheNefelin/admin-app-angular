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
//   El frontend (navegador) llama a /ssr-api/{namespace}/{recurso}...
//   El proxy busca la URL base y API Key del namespace, y reenvía la
//   llamada a la API externa correspondiente.
//
//   Namespaces:
//     portfolio    → API_URL_PORTFOLIO + API_KEY_PORTFOLIO
//     game-guides  → API_URL_GAME_GUIDES + API_KEY_GAME_GUIDES
//
//   Ejemplo:
//     GET /ssr-api/portfolio/project/pagination?page=1
//       → GET {API_URL_PORTFOLIO}/project/pagination?page=1
//         + X-API-Key: {API_KEY_PORTFOLIO}
//
// ═══════════════════════════════════════════════════════════════════════
import dotenv from 'dotenv';
dotenv.config();
app.use(express.json());

interface ApiOrigin {
  url: string;
  key: string;
}

const API_ORIGINS: Record<string, ApiOrigin> = {
  portfolio: {
    url: process.env['API_URL_PORTFOLIO']!,
    key: process.env['API_KEY_PORTFOLIO']!,
  },
  'game-guides': {
    url: process.env['API_URL_GAME_GUIDES']!,
    key: process.env['API_KEY_GAME_GUIDES']!,
  },
};

/** Busca la config de la API para un namespace dado. */
function getOrigin(namespace: string): ApiOrigin | undefined {
  return API_ORIGINS[namespace];
}

/** Extrae el namespace de la URL: /ssr-api/{namespace}/... */
function extractNamespace(originalUrl: string): { namespace: string; path: string; query: string } | null {
  const [pathPart, queryString] = originalUrl.split('?');
  const afterPrefix = pathPart.replace('/ssr-api/', '');
  const slashIndex = afterPrefix.indexOf('/');
  const namespace = slashIndex === -1 ? afterPrefix : afterPrefix.slice(0, slashIndex);
  const rest = slashIndex === -1 ? '' : afterPrefix.slice(slashIndex);
  const query = queryString ? `?${queryString}` : '';
  return namespace ? { namespace, path: rest, query } : null;
}

// ─── Upload de imágenes (caso especial) ──────────────────────────────
app.post(
  '/ssr-api/:namespace/:resource/:id/upload-image',
  express.raw({ type: 'multipart/form-data', limit: '10mb' }),
  async (req, res) => {
    try {
      const { namespace, resource, id } = req.params;
      const origin = getOrigin(namespace);

      if (!origin) {
        res.status(404).json({ detail: `Unknown namespace: ${namespace}` });
        return;
      }

      const response = await fetch(`${origin.url}/${resource}/${id}/upload-image`, {
        method: 'POST',
        headers: {
          'X-API-Key': origin.key,
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
app.use('/ssr-api', async (req, res) => {
  try {
    const parsed = extractNamespace(req.originalUrl);

    if (!parsed) {
      res.status(404).json({ detail: 'Invalid path. Use /ssr-api/{namespace}/{resource}' });
      return;
    }

    const origin = getOrigin(parsed.namespace);

    if (!origin) {
      res.status(404).json({ detail: `Unknown namespace: ${parsed.namespace}` });
      return;
    }

    const url = `${origin.url}${parsed.path}${parsed.query}`;

    const options: RequestInit = {
      method: req.method,
      headers: {
        'X-API-Key': origin.key,
        'Content-Type': 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      options.body = JSON.stringify(req.body);
    }

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
