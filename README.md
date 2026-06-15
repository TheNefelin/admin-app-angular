# Admin Manager - App Angular 22 SSR

### Dependencies
```sh
npm install -g pnpm
```
- [DaisuUI](https://daisyui.com/docs/install/)

### Environment .env
```sh
pnpm add dotenv
```
- server.ts fetch external API
```ts
import dotenv from 'dotenv';
dotenv.config();
app.use(express.json());

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

app.get('/ssr-api/:resource', async (req, res) => {
  const response = await fetchExternal(
    req.url.replace('/ssr-api', ''),
    { method: 'GET' }
  );

  res.json(await response.json());
});

app.get('/ssr-api/:resource/:id', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}/${req.params.id}`,
    { method: 'GET' }
  );

  res.json(await response.json());
});

app.post('/ssr-api/:resource', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}`,
    {
      method: 'POST',
      body: JSON.stringify(req.body)
    }
  );

  res.json(await response.json());
});

app.put('/ssr-api/:resource/:id', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}/${req.params.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(req.body)
    }
  );

  res.json(await response.json());
});

app.delete('/ssr-api/:resource/:id', async (req, res) => {
  const response = await fetchExternal(
    `/${req.params.resource}/${req.params.id}`,
    { method: 'DELETE' }
  );

  try {
    res.json(await response.json());
  } catch {
    res.status(204).end();
  }
});
```

### SSR Proxy — server.ts

El proxy SSR redirige peticiones del frontend al backend Python (`API_URL`).  
Angular envía requests a `/ssr-api/:resource`, Express los reenvía a `http://127.0.0.1:8000/api/:resource`.

**Requisito:** `express.json()` debe registrarse **antes** de las rutas proxy para que `req.body` tenga el JSON parseado:

```ts
const app = express();
app.use(express.json());        // ← necesario para POST/PUT con body
```

**Rutas implementadas:**

| Método | Ruta SSR | Backend destino |
|--------|----------|-----------------|
| GET | `/ssr-api/:resource` | `GET /api/:resource?query` |
| GET | `/ssr-api/:resource/:id` | `GET /api/:resource/:id` |
| POST | `/ssr-api/:resource` | `POST /api/:resource` (body JSON) |
| PUT | `/ssr-api/:resource/:id` | `PUT /api/:resource/:id` (body JSON) |
| DELETE | `/ssr-api/:resource/:id` | `DELETE /api/:resource/:id` |

**Detalles:**
- El header `X-API-Key` se inyecta automáticamente en todas las requests.
- Solo el endpoint GET de listado preserva el query string (`req.url`); los demás usan `req.params`.
- `fetchExternal()` serializa `req.body` con `JSON.stringify` — si falta `express.json()`, el backend recibe body vacío.
- DELETE puede retornar 204 sin body — se usa `response.text()` + `JSON.parse` condicional para evitar `SyntaxError: Unexpected end of JSON input`.

### Shortcut
- tsconfig.app.json
```json
"compilerOptions": {
  "paths": {
    "@core/*": ["./src/app/core/*"],
    "@features/*": ["./src/app/features/*"],
    "@layouts/*": ["./src/app/layouts/*"],
    "@shared/*": ["./src/app/shared/*"]
  }  
}
```

### Commands
```sh
# Component
ng generate component features/technology/components/technology-form-component --style=none
ng generate component shared/components/image-field-component --style=none
# Model
ng generate interface shared/models/upload-image-model
# Service
ng generate service features/technology/services/technology-service
# Interceptor
ng generate interceptor core/interceptors/error
# Module
ng generate module module-name
```

---
---
---
---
---

# AdminAppAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
