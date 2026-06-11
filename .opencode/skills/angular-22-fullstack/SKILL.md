---
name: angular-22-fullstack
description: Guía completa para desarrollo frontend con Angular 22 SSR + TailwindCSS + DaisyUI. Establece estructura, patrones y mejores prácticas para el proyecto Admin Manager.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  framework: angular
  angular_version: "22.0"
  typescript_version: "6.0"
  node_version: "22+"
  package_manager: pnpm
---

> ⚠️ **Reglas del proyecto:**
> 1. No modificar el código sin autorización explícita.
> 2. Angular solo se usará con **pnpm**.

---

## Tabla de Contenidos

1. [Setup y Configuración](#1-setup-y-configuración)
2. [Arquitectura del Proyecto](#2-arquitectura-del-proyecto)
3. [Path Aliases](#3-path-aliases)
4. [Angular 22 — Novedades Clave](#4-angular-22--novedades-clave)
5. [Core Layer](#5-core-layer)
6. [Data Layer — Contratos API](#6-data-layer--contratos-api)
7. [Features — Patrón Senior](#7-features--patrón-senior)
8. [SSR y Variables de Entorno](#8-ssr-y-variables-de-entorno)
9. [Templates y Control Flow](#9-templates-y-control-flow)
10. [Testing](#10-testing)
11. [Checklist de Código Senior](#11-checklist-de-código-senior)

---

## 1. Setup y Configuración

### 1.1 Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | v22+ (v26 soportado) |
| TypeScript | 6.0+ |
| pnpm | 11+ |
| Angular CLI | 22+ |

### 1.2 Crear Proyecto Nuevo

```bash
ng new admin-app-angular --package-manager=pnpm
```

### 1.3 Dependencias del Proyecto Actual

```json
{
  "dependencies": {
    "@angular/core": "^22.0.0",
    "@angular/ssr": "^22.0.0",
    "@angular/forms": "^22.0.0",
    "daisyui": "^5.5.23",
    "tailwindcss": "^4.1.12",
    "dotenv": "^17.4.2",
    "express": "^5.1.0",
    "rxjs": "~7.8.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.12",
    "typescript": "~6.0.2",
    "vitest": "^4.0.8",
    "jsdom": "^28.0.0"
  }
}
```

### 1.4 Comandos Útiles

```bash
# Crear componente sin CSS
ng g c features/url/pages/url-page --style=none

# Crear servicio (genera @Service() por defecto en v22)
ng g s features/url/services/url-service

# Crear interfaz/modelo
ng g i features/url/models/url-model

# Crear interceptor
ng g interceptor core/interceptors/error

# Servir con SSR
ng serve
```

---

## 2. Arquitectura del Proyecto

```
src/app/
├── core/
│   ├── interceptors/
│   │   └── error-interceptor.ts        # HttpInterceptorFn funcional
│   ├── models/
│   │   └── api-response.model.ts        # ApiResponseModel<T>
│   └── services/
│       ├── api-service.ts               # HTTP genérico (@Service)
│       ├── notification.service.ts      # Toast-based notifications
│       └── theme.service.ts             # Tema light/dark con persistencia
├── data/                                # Contratos de API separados
│   ├── language/
│   ├── technology/
│   ├── project/
│   ├── url-grp/
│   └── url/
├── features/                            # Lazy-loaded features
│   └── <feature>/
│       ├── routes.ts                    # Rutas lazy
│       ├── pages/
│       │   ├── <feature>-page/          # Smart container
│       │   └── <feature>-form-page/     # Smart container
│       ├── components/
│       │   ├── <feature>-form/          # Dumb component
│       │   └── <feature>-table/         # Dumb component
│       ├── services/
│       │   └── <feature>-service.ts     # Wrapper de ApiService
│       └── models/
│           └── <feature>-model.ts       # Modelos de la feature
├── layouts/
│   └── main-layout/                     # Layout principal
├── shared/
│   ├── components/
│   │   ├── header/
│   │   ├── loading/
│   │   ├── toast/
│   │   ├── confirm-dialog/
│   │   ├── table/
│   │   └── theme-toggle/
│   ├── constants/
│   ├── models/
│   └── validators/
├── utils/
├── app.config.ts
├── app.config.server.ts
├── app.routes.ts
├── app.server.routes.ts
├── app.ts
└── server.ts                            # Express SSR server
```

---

## 3. Path Aliases

### 3.1 Configuración Moderna (sin `baseUrl` deprecated)

En `tsconfig.app.json`, la forma correcta Angular 22+ es NO usar `baseUrl` y definir `paths` con rutas completas relativas:

```json
{
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": ["node"],
    "paths": {
      "@core/*": ["./src/app/core/*"],
      "@data/*": ["./src/app/data/*"],
      "@features/*": ["./src/app/features/*"],
      "@layouts/*": ["./src/app/layouts/*"],
      "@shared/*": ["./src/app/shared/*"],
      "@utils/*": ["./src/app/utils/*"],
      "@env/*": ["./src/environments/*"]
    }
  }
}
```

---

## 4. Angular 22 — Novedades Clave

### 4.1 `@Service()` Decorator (NUEVO)

Reemplaza `@Injectable({ providedIn: 'root' })`. Es más conciso y semántico. El CLI genera esto por defecto en v22.

**Limitación:** Debe usar `inject()` en lugar de constructor injection.

```typescript
@Service()
export class UrlService {
  private apiService = inject(ApiService);

  getById(id: number): Observable<UrlModel | null> {
    return this.apiService.getById<UrlModel | null>('url', id);
  }
}
```

Si no quieres `providedIn: 'root'`, usa `autoProvided: false`:

```typescript
@Service({ autoProvided: false })
export class ScopedService { }
```

### 4.2 OnPush como Default

Desde Angular 22, los componentes usan `OnPush` por defecto. No es necesario especificarlo. Con signals todo funciona correctamente.

### 4.3 Signal Forms — Estables

Signal Forms ya no son experimentales. Estables para producción.

```typescript
import { form, model, required, minLength } from '@angular/forms/signals';

@Service()
export class MyFormService {
  protected readonly userForm = form(
    model,
    form => {
      required(form.name);
      minLength(form.name, 3);
    }
  );
}
```

Nuevos métodos en v22:
- `getError('validatorName')` — obtiene error específico
- `reloadValidation()` — re-ejecuta validadores async
- `minDate()` / `maxDate()` — validación de fechas
- `debounce(field, 'blur')` — debounce on blur

### 4.4 Resources Estables

`resource()`, `rxResource()`, `httpResource()` son estables. Son la forma recomendada para data fetching reactivo.

```typescript
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-url-page',
  template: `
    @if (urlResource.hasValue()) {
      <pre>{{ urlResource.value() | json }}</pre>
    } @else if (urlResource.isLoading()) {
      <p>Cargando...</p>
    } @else if (urlResource.error()) {
      <p>Error: {{ urlResource.error() }}</p>
    }
  `
})
export class UrlPage {
  private readonly urlService = inject(UrlService);
  protected readonly id = signal(1);
  protected readonly urlResource = rxResource({
    request: () => this.id(),
    loader: ({ request: id }) =>
      this.urlService.getById(id).pipe(
        catchError(err => {
          console.error('Error fetching URL:', err);
          return of(null);
        })
      ),
  });
}
```

### 4.5 `httpResource()` — Data Fetching Reactivo

`httpResource()` es un wrapper sobre `HttpClient` que devuelve signals. Soporta interceptors y toda la pila HTTP de Angular.

```typescript
import { httpResource } from '@angular/common/http';

@Component({...})
export class UserProfile {
  userId = input.required<string>();

  user = httpResource(() => `/api/user/${this.userId()}`);

  // Con request completo
  userDetailed = httpResource(() => ({
    url: `/api/user/${this.userId()}`,
    method: 'GET',
    headers: { 'X-Special': 'true' },
    params: { detailed: 'true' },
  }));

  // Con parse/validate (Zod, Valibot)
  userValidated = httpResource(() => `/api/user/${this.userId()}`, {
    parse: (response) => userSchema.parse(response),
  });
}
```

### 4.6 `injectAsync()` — Lazy Loading de Servicios

```typescript
@Service()
export class AdminComponent {
  private reportService = injectAsync(
    () => import('./report.service').then(m => m.ReportService),
    { prefetch: onIdle } // precarga cuando el browser está idle
  );

  async exportPdf() {
    const service = await this.reportService();
    await service.exportPdf();
  }
}
```

### 4.7 `debounced()` — Señales con Debounce

```typescript
import { debounced } from '@angular/core';

@Component({...})
export class SearchComponent {
  protected readonly query = signal('');
  protected readonly debouncedQuery = debounced(() => this.query(), 300);

  protected readonly results = httpResource(
    () => `/api/search?q=${this.debouncedQuery.value()}`
  );
}
```

### 4.8 `provideBrowserGlobalErrorListeners()`

Captura errores globales (`unhandledrejection`, `error`) y los envía al `ErrorHandler`.

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
  ]
};
```

### 4.9 Fetch API como Default

`withFetch()` ya no es necesario. El HTTP client usa Fetch por defecto. Para reportProgress, usa `reportUploadProgress` / `reportDownloadProgress`.

### 4.10 SSR — Incremental Hydration por Default

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideServerRendering(
      { maxResponseBodySize: 2 * 1024 * 1024 }, // 2MB
      withRoutes(serverRoutes)
    ),
  ]
};
```

---

## 5. Core Layer

### 5.1 ApiService Genérico

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class ApiService {
  private http = inject(HttpClient);

  getAll<T>(resource: string): Observable<T> {
    return this.http.get<T>(`/api/${resource}`);
  }

  getById<T>(resource: string, id: number): Observable<T> {
    return this.http.get<T>(`/api/${resource}/${id}`);
  }

  create<T>(resource: string, body: unknown): Observable<T> {
    return this.http.post<T>(`/api/${resource}`, body);
  }

  update<T>(resource: string, id: number, body: unknown): Observable<T> {
    return this.http.put<T>(`/api/${resource}/${id}`, body);
  }

  delete<T>(resource: string, id: number): Observable<T> {
    return this.http.delete<T>(`/api/${resource}/${id}`);
  }
}
```

### 5.2 Error Interceptor

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      console.error('[HTTP Error]', error);
      // Aquí se puede integrar NotificationService
      return throwError(() => error);
    })
  );
};
```

### 5.3 App Config — HttpClient Automático

> ⚠️ Desde **Angular v21**, `provideHttpClient()` **no es necesario**. HttpClient se provee automáticamente. Si usas interceptors, puedes agregarlos directamente.

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
  ]
};
```

Si necesitas interceptors, usa `withInterceptors` en el provider automático (opcional):

```typescript
import { withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withIncrementalHydration()),
    // Solo si usas interceptors:
    withInterceptorsFromDi(),
  ]
};
```

---

## 6. Data Layer — Contratos API

Separar modelos de BD de DTOs de API es una práctica senior.

```
src/app/data/url/
├── url.model.ts        # Modelo de la entidad (desde API)
└── url.api.ts          # Interfaces request/response específicas
```

```typescript
// data/url/url.model.ts
export interface UrlModel {
  id_url: number;
  name: string;
  link: string;
  is_enable: boolean;
  id_urlgrp: number;
  created_at: string;
  updated_at: string;
}

// data/url/url.api.ts
export interface CreateUrlRequest {
  name: string;
  link: string;
  id_urlgrp: number;
}

export interface UpdateUrlRequest {
  name?: string;
  link?: string;
  is_enable?: boolean;
  id_urlgrp?: number;
}

export interface UrlListResponse {
  is_success: boolean;
  data: UrlModel[];
  message?: string;
}

export interface UrlDetailResponse {
  is_success: boolean;
  data: UrlModel;
  message?: string;
}
```

---

## 7. Features — Patrón Senior

### 7.1 Smart + Dumb Components

**Smart Component** (Page): Orquesta, llama servicios, maneja estado.

```typescript
@Component({
  selector: 'app-url-page',
  imports: [JsonPipe],
  template: `
    @if (urlResource.hasValue()) {
      <pre>{{ urlResource.value() | json }}</pre>
    } @else if (urlResource.isLoading()) {
      <app-loading />
    } @else if (urlResource.error()) {
      <p>Error al cargar</p>
    }
  `,
})
export class UrlPage {
  private readonly urlService = inject(UrlService);
  protected readonly id = signal(1);
  protected readonly urlResource = rxResource({
    request: () => this.id(),
    loader: ({ request: id }) =>
      this.urlService.getById(id).pipe(
        catchError(err => {
          console.error(err);
          return of(null);
        })
      ),
  });
}
```

**Dumb Component:** Solo recibe inputs y emite outputs. Sin dependencias de servicios.

```typescript
@Component({
  selector: 'app-url-form',
  imports: [FormsModule],
  template: `
    <form>
      <input [(ngModel)]="url.name" name="name" placeholder="Nombre" />
      <input [(ngModel)]="url.link" name="link" placeholder="Link" />
      <button (click)="save.emit()">Guardar</button>
    </form>
  `,
})
export class UrlFormComponent {
  readonly url = input.required<UrlModel>();
  readonly save = output<void>();
}
```

### 7.2 Lazy Loading Routes

```typescript
// features/url/routes.ts
export const URL_ROUTES: Routes = [
  {
    path: '',
    component: UrlPage,
  },
  {
    path: 'new',
    component: UrlFormPage,
  },
  {
    path: ':id',
    component: UrlFormPage,
  },
];

// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.HomePage) },
      { path: 'url', loadChildren: () => import('@features/url/routes').then(m => m.URL_ROUTES) },
      { path: 'language', loadChildren: () => import('@features/language/routes').then(m => m.LANGUAGE_ROUTES) },
      { path: 'technology', loadChildren: () => import('@features/technology/routes').then(m => m.TECHNOLOGY_ROUTES) },
      { path: 'url-grp', loadChildren: () => import('@features/url-grp/routes').then(m => m.URL_GRP_ROUTES) },
      { path: 'project', loadChildren: () => import('@features/project/routes').then(m => m.PROJECT_ROUTES) },
    ],
  },
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFoundPage) },
];
```

### 7.3 Servicio por Feature

```typescript
@Service()
export class UrlService {
  private api = inject(ApiService);
  private readonly endpoint = 'url';

  getAll(): Observable<UrlListResponse> {
    return this.api.getAll<UrlListResponse>(this.endpoint);
  }

  getById(id: number): Observable<UrlDetailResponse> {
    return this.api.getById<UrlDetailResponse>(this.endpoint, id);
  }

  create(data: CreateUrlRequest): Observable<UrlDetailResponse> {
    return this.api.create<UrlDetailResponse>(this.endpoint, data);
  }

  update(id: number, data: UpdateUrlRequest): Observable<UrlDetailResponse> {
    return this.api.update<UrlDetailResponse>(this.endpoint, id, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(this.endpoint, id);
  }
}
```

---

## 8. SSR y Variables de Entorno

### 8.1 Servidor Express con dotenv

```typescript
// server.ts
import 'dotenv/config';
import { ngExpressEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// Las variables de entorno están disponibles aquí
const API_URL = process.env['API_URL'] ?? 'http://localhost:8000';
const API_KEY = process.env['API_KEY'] ?? '';
```

### 8.2 Pasar Variables al Frontend via TransferState

```typescript
// app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: 'API_URL', useValue: process.env['API_URL'] ?? '' },
    { provide: 'API_KEY', useValue: process.env['API_KEY'] ?? '' },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

```typescript
// core/services/config.service.ts
import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';

const API_URL_KEY = makeStateKey<string>('apiUrl');
const API_KEY_KEY = makeStateKey<string>('apiKey');

@Service()
export class ConfigService {
  private state = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  get apiUrl(): string {
    if (isPlatformServer(this.platformId)) {
      const value = inject('API_URL' as any);
      this.state.set(API_URL_KEY, value);
      return value;
    }
    return this.state.get(API_URL_KEY, '');
  }

  get apiKey(): string {
    if (isPlatformServer(this.platformId)) {
      const value = inject('API_KEY' as any);
      this.state.set(API_KEY_KEY, value);
      return value;
    }
    return this.state.get(API_KEY_KEY, '');
  }
}
```

---

## 9. Templates y Control Flow

### 9.1 Nuevo Control Flow (v17+)

Usar `@if`, `@for`, `@switch` en lugar de `*ngIf`, `*ngFor`:

```html
@if (urlResource.hasValue()) {
  <app-url-form [url]="urlResource.value()" />
} @else if (urlResource.isLoading()) {
  <app-loading />
} @else if (urlResource.error(); let error) {
  <app-error-message [message]="error.message" />
} @else {
  <p>No hay datos</p>
}

@for (url of urlListResource.value(); track url.id_url) {
  <div>{{ url.name }}</div>
} @empty {
  <p>No hay URLs registradas</p>
}

@switch (status()) {
  @case ('loading') { <p>Cargando...</p> }
  @case ('error') { <p>Error</p> }
  @default { <p>Contenido</p> }
}
```

### 9.2 `@let` (v21+)

```html
@let url = urlResource.value();
@if (url) {
  <h1>{{ url.name }}</h1>
  <a [href]="url.link">{{ url.link }}</a>
}
```

### 9.3 `@defer` con idle timeout (v22+)

```html
@defer (on idle(500ms)) {
  <heavy-component />
} @placeholder {
  <p>Cargando componente pesado...</p>
} @loading (minimum 500ms) {
  <p>Renderizando...</p>
}
```

---

## 10. Testing

### 10.1 Vitest como Default

Angular 22 usa Vitest como test runner por defecto.

```typescript
// url-service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UrlService } from './url-service';

describe('UrlService', () => {
  let service: UrlService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UrlService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get URL by id', () => {
    const mockResponse = { is_success: true, data: { id_url: 1, name: 'Test' } };

    service.getById(1).subscribe(response => {
      expect(response.is_success).toBeTrue();
    });

    const req = httpMock.expectOne('/api/url/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

### 10.2 TestBed.getLastFixture() (v22+)

```typescript
beforeEach(() => TestBed.createComponent(UrlPage));

test('should display URL', () => {
  const fixture = TestBed.getLastFixture();
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('URL');
});
```

---

## 11. Checklist de Código Senior

### Arquitectura
- [ ] Feature-based con lazy loading (`loadChildren` / `loadComponent`)
- [ ] Smart + Dumb componentes separados
- [ ] Data layer separado de feature models
- [ ] Servicios con `@Service()` (no `@Injectable`)

### Estado y Reactividad
- [ ] Signals para estado local (`signal`, `computed`)
- [ ] `rxResource` / `httpResource` para data fetching (no suscripciones manuales)
- [ ] `catchError` con logging, no silenciar errores
- [ ] `hasValue()` antes de leer `value()` en resources
- [ ] Evitar `map(r => r)` — código muerto

### Templates
- [ ] Control flow (`@if`, `@for`, `@switch`) sin `*ngIf`/`*ngFor`
- [ ] `@let` para variables locales
- [ ] `track` en `@for` con ID único
- [ ] `@defer` para componentes pesados
- [ ] Optional chaining correcto (`?.`)

### HTTP y API
- [ ] `provideHttpClient` con interceptors en `app.config.ts`
- [ ] `provideBrowserGlobalErrorListeners()` para errores globales
- [ ] Interceptor funcional con manejo de errores
- [ ] Path aliases con `@` (sin `baseUrl` deprecated)

### SSR y Seguridad
- [ ] `.env` para API keys (no `environment.ts`)
- [ ] `TransferState` para pasar secretos del server al cliente
- [ ] Secretos nunca en el bundle del cliente
- [ ] Incremental hydration activado

### Testing
- [ ] Vitest (no Karma)
- [ ] `provideHttpClientTesting` para mock HTTP
- [ ] Tests concobertos: listar, crear, error, empty state

### General
- [ ] `inject()` sin constructor injection
- [ ] `protected readonly` para miembros del template
- [ ] OnPush implícito (default en v22)
- [ ] `input()` / `output()` funcionales
- [ ] Nombres en español (UI, mensajes)
- [ ] SIN NgModules (todo standalone)
- [ ] pnpm siempre (nunca npm)
- [ ] No modificar código sin autorización

---

## Recursos

- [Angular 22 Release Notes](https://github.com/angular/angular/releases/tag/v22.0.0)
- [Angular API Reference](https://angular.dev/api)
- [Signal Forms Guide](https://angular.dev/guide/forms/signal-forms)
- [Resources Guide](https://angular.dev/guide/signals/resource)
- [httpResource Guide](https://angular.dev/guide/http/http-resource)
- [SSR Guide](https://angular.dev/guide/server-rendering)
- [Tailwind + Angular Guide](https://angular.dev/guide/tailwind)
- [Angular Style Guide](https://angular.dev/style-guide)
- [Error Handling Best Practices](https://angular.dev/best-practices/error-handling)

---
*Angular 22 SSR Development Skill*
*Versión: 1.0*
*Basado en Angular v22.0.1 + TypeScript 6.0*
