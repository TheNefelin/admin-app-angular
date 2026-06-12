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
```

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
ng generate component shared/components/pagination-nav-component --style=none
# Model
ng generate interface features/url-grp/models/url-grp-model
# Service
ng generate service features/url-grp/services/url-grp-service
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
