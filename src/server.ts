import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import dotenv from 'dotenv';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Proxy fetch to external API -------------------------------------------
dotenv.config();

const API_URL = process.env['API_URL'];
const API_KEY = process.env['API_KEY'];

async function fetchExternal(url: string, options: any = {}) {
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!,
      ...(options.headers || {})
    }
  });
}

app.get('/api/:resource', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}`,
    {
      method: 'GET'
    }
  );

  res.json(await response.json());
});

app.get('/api/:resource/:id', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}/${req.params.id}`,
    {
      method: 'GET'
    }
  );

  res.json(await response.json());
});

app.post('/api/:resource', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}`,
    {
      method: 'POST',
      body: JSON.stringify(req.body)
    }
  );

  res.json(await response.json());
});

app.put('/api/:resource/:id', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}/${req.params.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(req.body)
    }
  );

  res.json(await response.json());
});

app.delete('/api/:resource/:id', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}/${req.params.id}`,
    {
      method: 'DELETE'
    }
  );

  res.json(await response.json());
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
