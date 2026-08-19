# SKILL: Angular — Patrón Senior (transversal)

Guía de referencia para construir aplicaciones web con **Angular (SSR, Signal-based) + Tailwind + DaisyUI**, siguiendo una arquitectura y convenciones senior validadas en producción. Es **transversal**: los ejemplos son genéricos (CRUD de administración, listados paginados, formularios, uploads, auth, multitenancy por namespace) y aplican a cualquier dominio — dashboards, catálogos, SaaS, lo que sea.

Este archivo es un **skill**: se lee para replicar el patrón en cualquier proyecto Angular nuevo. No es una receta dogmática, es la lista de decisiones que convierten un CRUD simple en un admin mantenible.

**Servicios externos (todos opcionales según el proyecto, y por eso se configuran como tal):**
- **Auth**: Google OAuth (popup) + JWT con refresh rotation — reemplazable por cualquier proveedor OAuth.
- **Backend**: cualquier API REST (`/ssr-api/{namespace}/...`) accedida únicamente vía proxy SSR — el patrón aplica a cualquier stack.
- **SSR**: Angular 22 + Express (adaptador estándar) — el patrón aplica a cualquier host Node.

---

## 1. ¿Por qué este patrón es SENIOR?

Porque resuelve los problemas que matan a las apps Angular cuando crecen, con decisiones **justificadas**, no por moda:

| Decisión | Problema que resuelve |
|----------|----------------------|
| **SSR con Express (`src/server.ts`)** | La app admin carga con la API disponible y no con HTML vacío; el render de las rutas se controla con `RenderMode` por página (`Client` para dashboards sin prerender) |
| **Proxy SSR `/ssr-api/[...]` + handlers multipart** | El frontend **nunca ve** credenciales de la API (quedan solo en el servidor). Un solo punto traduce todo el tráfico, incluido el upload de imágenes con `form-data` |
| **Signals + `rxResource` para lecturas** | Estado reactivo declarativo, sin `subscribe()` manual en componentes; los GETs exponen `isLoading()`/`hasValue()`/`error()` |
| **`MutationService` para mutaciones** | Un único patrón de create/update/delete/upload: `isSaving` + toast de éxito + `console.error` + callback `onClose` que corre SOLO en éxito (si falla, el modal queda abierto con los datos intactos) |
| **`output()` con nombres sin prefijo `on`** | La regla `no-output-on-prefix` de Angular ESLint: los outputs se nombran `submit`/`closed`/`delete`, no `onSubmit`/`onClose`/`onDelete` — evita confusión con listeners DOM |
| **`CrudPage<TModel>` (clase base abstracta)** | Todo listado paginado comparte señales (`totalPages`/`currentPage`/`limit`/`search`) y métodos (`nextPage`/`prevPage`/`onFilterChange`/`onRefreshClick`); la subclase solo implementa `reload()` |
| **Paginación unificada** | `PaginationRequestModel` (`page`, `limit`, `search`, `filter?`) para todos los GET paginados; `limit` acotado (máx. 100) acorde a la API; `filter` tipado por feature |
| **`linkedSignal` + `clearTrigger` en formularios** | El form data reacciona al payload (edit mode) y se resetea a valores por defecto incrementando un trigger — sin `patchValue` manual ni estado zombie |
| **Auth multi-tenant por namespace** | Sesión en `sessionStorage` con prefijo `auth.{namespace}.access_token/refresh_token/user`; el interceptor añade el Bearer según el namespace de la URL, hace refresh+retry en 401 y fuerza logout si el refresh falla |
| **Auth con `sessionSignal(ns)` reactivo** | El estado de login es una signal por namespace: al forzar logout la UI se re-sincroniza sola, sin recargar |
| **`ErrorService` (modal) + `SuccessService` (toast) + `ConfirmService` (promise-based)** | Feedback de usuario centralizado: errores HTTP en modal vía interceptor (única fuente), éxitos en cola de toasts con auto-cierre, confirmaciones con `await confirm()` que resuelve `boolean` |
| **ESLint con `angular-eslint` v22** | Lint de TS + templates (accesibilidad incluida) en `pnpm lint`, 0 errores — el refactor deja de ser a ciegas |
| **Spinner solo en carga inicial** | `isLoading() && !hasValue()` en vez de `isLoading()`: al refetchear la lista no se desmonta (acordeón/expansión conserva su estado) |
| **`(ngSubmit)` en lugar de `(submit)`** | `NgForm.onSubmit` devuelve `false` en forms normales y Angular llama `preventDefault()` automáticamente — Enter no recarga la página |
| **Formularios con `(ngSubmit)` + validation local** | El Enter del form dispara el submit sin recargar; las validaciones se muestran con un componente de mensaje local, nunca como toast/modal |

---

## 2. Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 22 (SSR, Signal-based) |
| Bundling | Angular CLI 22 + `pnpm` |
| SSR | Express (`src/server.ts`) |
| Estilos | Tailwind 4 + DaisyUI 5 |
| Estado | Signals (`linkedSignal`, `clearTrigger`, `sessionSignal`) |
| Data fetching | `rxResource` (lecturas) + `MutationService` (mutaciones) |
| Lint | ESLint 10 (flat config, `angular-eslint` v22) |
| Typecheck | `ng build` (valida plantillas) + `strict: true` |

> ⚠️ **TypeScript**: el proyecto usa `typescript@~6.0.0`. Verificar la versión compatible con la de Angular antes de instalar.

---

## 3. Estructura de carpetas (plantilla)

```
admin/
├── src/server.ts                  → Express SSR + proxy /ssr-api/ + handlers multipart
├── eslint.config.js               → flat config: angular-eslint tsRecommended + templateRecommended + templateAccessibility; ignores dist/
└── src/app/
    ├── core/
    │   ├── services/
    │   │   ├── api-service.ts     → CRUD genérico + postWithFile<T>() multipart + deleteResource<T>()
    │   │   ├── auth-service.ts    → login OAuth, refresh (rotación), logout; sesión en sessionStorage por namespace; sessionSignal(ns)
    │   │   ├── error-service.ts   → Error signal global (modal)
    │   │   ├── success-service.ts → cola de toasts con auto-cierre y cierre manual
    │   │   ├── confirm-service.ts → diálogo promise-based (dialog signal + confirm()/accept()/reject())
    │   │   └── mutation-service.ts → patrón único de mutaciones (isSaving + toast + onClose en éxito)
    │   └── interceptors/
    │       ├── auth-interceptor.ts    → Bearer del namespace; refresh+retry en 401; logout si falla
    │       └── error-interceptor.ts   → formatea el detail del backend a la error signal (única fuente)
    ├── shared/
    │   ├── base/
    │   │   └── crud-page.ts       → CrudPage<TModel>: paginación/filtro/reload abstracto
    │   ├── components/            → button, loading, image-picker, image-viewer, modal-confirm, pagination-filter, select-list, select-search, toast-success, ...
    │   ├── models/                → pagination, select-item, ...
    │   └── constants/
    │       └── routes-constant.ts → API_NAMESPACE, rutas
    └── features/
        └── {domain}/
            ├── {feature}/
            │   ├── models/        → Model + SaveModel (fuente única, nunca duplicar)
            │   ├── services/      → CRUD + uploads
            │   ├── pages/         → {feature}-page/ (lista paginada) + {feature}-form-page/ (form complejo)
            │   └── components/    → {feature}-form-component/ (modal), {feature}-list-component/ (tabla/grid)
            └── {feature}.routes.ts
```

**Regla**: un feature CRUD = `models/` + `services/` + `pages/` + `components/`. Los componentes se agrupan por feature, nunca en un `components/` global con todo.

---

## 4. Convenciones de capas

### 4.1 Servicios — todos pasan por `ApiService`

- **Nunca** `HttpClient` directo en páginas/componentes: todo pasa por el `ApiService` genérico (inyecta el namespace del recurso).
- GET paginados devuelven el payload tipado del recurso; los `query params` (search, limit, filter) se serializan con `encodeURIComponent()` en `search`.
- Upload multipart: `postWithFile<T>()` con los form fields del recurso; delete de imagen: `deleteResource<T>()`.
- Búsquedas seguras: `search` siempre con `encodeURIComponent()` (evita romper URLs con `&`, `=`, `#`, `%`) y `!== ''`.

### 4.2 Páginas de listado — `CrudPage<TModel>`

```ts
// shared/base/crud-page.ts (esqueleto)
export abstract class CrudPage<TModel> {
  protected readonly totalPages = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly limit = signal<number>(10);
  protected readonly search = signal('');

  protected readonly getAllPayload = computed(() => ({
    page: this.currentPage(),
    limit: this.limit(),
    search: this.search(),
  }));

  nextPage(): void { ... }
  prevPage(): void { ... }
  onFilterChange(filter: { search: string; limit: number }): void { ... }
  onRefreshClick(): void { ... }
  abstract reload(): void;
}
```

- La subclase implementa `reload()` (recarga su `rxResource`) y conserva SUS GETs y mutaciones.
- **Override**: para cambiar un valor/lógica heredado usar `protected override` (requiere palabra `override` por `noImplicitOverride: true`).
- Streams `rxResource` **puros**: el side-effect de `totalPages.set()` va en helpers (`mapPaginated`/`emptyPaginated`), nunca dentro del `map` — si no, la paginación queda stale cuando una request falla.

### 4.3 Mutaciones — `MutationService`

```ts
// core/services/mutation-service.ts (esqueleto)
run<T>(action: Observable<T>, state: { isSaving: WritableSignal<boolean> },
       options?: { successMsg?: string; errorMsg?: string; onSuccess?: () => void; onClose?: () => void; onFinalize?: () => void }): void {
  state.isSaving.set(true);
  action.pipe(finalize(() => state.isSaving.set(false))).subscribe({
    next: () => { if (succeeded) options?.onClose?.(); toast.success(...); options?.onSuccess?.(); },
    error: err => console.error(...),
  });
}
```

- **`onClose` corre SOLO en éxito**: si la API falla, el modal queda abierto con los datos intactos (el usuario no pierde lo escrito).
- Estado `isSaving` agrupado por feature (`{ savePayload, isSaving }`), nunca signals planos dispersos.

### 4.4 Formularios — `linkedSignal` + `clearTrigger`

```ts
// esqueleto de form component en modal
formData = linkedSignal<SaveModel | null, FormState>(() => this.buildEmptyFormState());
clearTrigger = input<number>(0);
effect(() => { this.clearTrigger(); this.resetForm(); });
```

- El form reacciona al payload (editar) y se resetea al incrementar `clearTrigger`.
- Validaciones **locales** con componente de mensaje (`MessageErrorComponent`), nunca toast/modal.
- Submit con `(ngSubmit)` (no `(submit)`) — previene la recarga por Enter.

### 4.5 Componentes — outputs y accesibilidad

- **Outputs sin prefijo `on`**: `submit`, `closed`, `delete`, `edit`, `selectedFile`, `deleteFile`, `confirm`... La regla `no-output-on-prefix` de Angular ESLint lo exige.
- **No nombrar outputs como eventos DOM nativos** (`close`, `click`, `submit`): `no-output-native` los marca. Usar `closed`/`clicked`/`submitted`.
- **Métodos handler `onXxx(...)` son correctos**: la regla aplica solo a `output()`/`@Output()`, no a métodos.
- **Labels**: usar `<label>` solo cuando hay un control asociado (`for` + `id`, o asociación implícita envolviendo el input). Encabezados de sección → `span`; contenedores sin control → `div` (`label-has-associated-control`).
- **Interactivos**: elementos clickeables no nativos necesitan `role="button"` + `tabindex="0"` + handler de teclado (`keydown.enter/space`) (`interactive-supports-focus`, `click-events-have-key-events`).
- **Spinner de carga**: `isLoading() && !hasValue()` para no desmontar la lista en refetch.

---

## 5. Auth multi-tenant (por namespace)

El patrón más distintivo: **una app admin gestiona varios proyectos** (game-guides, portfolio, futuros .NET), cada uno con su propia sesión.

```
GET /ssr-api/config                    → { googleClientIds } (mapa por namespace)
POST /ssr-api/{namespace}/auth/google  → login con el client ID de ese namespace
GET/POST/DELETE /ssr-api/{namespace}/{resource}  → CRUD con Bearer del namespace
```

- **Sesión**: `sessionStorage` con prefijo `auth.{namespace}.access_token/refresh_token/user` — sobrevive a F5, muere al cerrar la pestaña.
- **`sessionSignal(ns)`** reactivo por namespace: `login()`/`logout()` lo actualizan → el UI se desloguea solo cuando el interceptor fuerza logout.
- **authInterceptor**: extrae ns de la URL, añade `Authorization: Bearer`, hace refresh+retry en 401. Si el refresh falla → `logout(ns)` (limpia sesión + signal).
- **Client ID por app**: el BFF expone el mapa y el AuthService lo cachea; lanza error claro si no está configurado.
- **Nunca escribir signals en el constructor** (NG0950, prohibido en SSR): usar `effect()` con lectura de signals.

---

## 6. Feedback de usuario (Error/Success/Confirm)

- **Error → `ErrorService`** (modal): `errorService.show(msg)` setea una signal única; los layouts renderizan el modal. El `errorInterceptor` lo dispara automáticamente ante cualquier HTTP error (única fuente; las páginas no llaman `errorService.show`).
- **Éxito → `SuccessService`** (toast): `show(msg)` acumula en cola (`ToastModel[]`), auto-cierre a los 5s + cierre manual. Solo en operaciones de escritura.
- **Confirmación → `ConfirmService`** (promise-based): `await confirmService.confirm({ title, message })` resuelve `boolean`. La página **nunca** toca los outputs del modal (`confirm`/`closed`), solo espera el boolean.
- **Validaciones de formulario** → componente local de mensaje, nunca toast/modal.
- **Mensajes de error reales**: `err?.error?.detail || err?.message || fallback` — el interceptor ya formatea, no sobrescribir con genéricos.

---

## 7. SSR y build

- `src/server.ts`: Express + proxy `/ssr-api/{namespace}/{path}` + handlers multipart (`req.is('multipart/form-data')` para validar el upload).
- `app.routes.server.ts`: `RenderMode` por página. Dashboards de admin → `RenderMode.Client` (sin prerender, la API disponible al renderizar en el navegador).
- **Build de producción**: `ng build` (genera `dist/.../server/server.mjs`); `npm start` debe apuntar al **servidor Express de producción** (`node dist/.../server/server.mjs`), **nunca** a `ng serve` (dev server sin SSR).
- **Verificación**: `ng build` valida plantillas + `pnpm lint` (0 errores) — ambos antes de declarar una feature terminada.

---

## 8. Checklist final (¿esto es SENIOR?)

Antes de dar una app Angular por terminada:

- [ ] `ng build` (0 errores, valida plantillas) + `pnpm lint` (0 errores)
- [ ] SSR con Express; `npm start` = build + `node dist/.../server.mjs` (no `ng serve`)
- [ ] Proxy `/ssr-api/...` + handlers multipart validados con `req.is('multipart/form-data')`
- [ ] Signals + `rxResource` para lecturas; sin `subscribe()` manual en componentes de listado
- [ ] `MutationService` con `onClose` solo en éxito (el modal no pierde datos al fallar)
- [ ] Outputs sin prefijo `on` y sin nombres de eventos DOM nativos (`no-output-on-prefix`, `no-output-native`)
- [ ] `CrudPage<TModel>` para listados paginados; streams `rxResource` puros (`mapPaginated`/`emptyPaginated`)
- [ ] `linkedSignal` + `clearTrigger` en formularios; `(ngSubmit)` en todos los forms
- [ ] Labels asociados a controles; elementos interactivos focusables con keydown
- [ ] Auth por namespace (sessionStorage + sessionSignal reactivo + interceptor con refresh/retry/logout)
- [ ] Feedback: `ErrorService` (modal, vía interceptor) + `SuccessService` (toast) + `ConfirmService` (promise-based)
- [ ] Búsquedas con `encodeURIComponent()`; `limit` de paginación acotado
- [ ] `strict: true`; comillas simples y semicolons uniformes; imports con aliases (`@core/*`, `@shared/*`, `@features/*`)
- [ ] `pnpm` (nunca `npm`)

---

## 9. Errores comunes (anti-patrones)

| Anti-patrón | Por qué evitarlo |
|-------------|------------------|
| `npm start` con `ng serve` | Es el dev server sin SSR; producción requiere el servidor Express (`node dist/.../server.mjs`) |
| `subscribe()` manual en listados | Estado no reactivo, propenso a leaks y a estados stale; usar `rxResource` |
| `(submit)` en lugar de `(ngSubmit)` | Enter recarga la página y pierde el form |
| Outputs `onXxx` (`onClick`, `onSubmit`, `onClose`) | Confunde con listeners DOM; la regla `no-output-on-prefix` lo prohíbe |
| Outputs con nombre de evento nativo (`close`, `click`, `submit`) | La regla `no-output-native` lo prohíbe; usar `closed`/`clicked`/`submitted` |
| `isLoading()` solo para el spinner | Desmonta la lista en cada refetch; usar `isLoading() && !hasValue()` |
| `JSON.parse(text)` directo en el servidor | Una respuesta no-JSON del backend explota con 502 genérico; usar un helper seguro que devuelva `{ detail }` |
| Escribir signals en el constructor | NG0950 en SSR; usar `effect()` |
| Labels sin control asociado | Rompe accesibilidad (`label-has-associated-control`); usar `span`/`div` para decorativos |
| Interactivos click-only | Inaccesibles por teclado; agregar `role`, `tabindex` y keydown |
| `errorService.show()` duplicado en páginas | Doble manejo de errores; el interceptor es la única fuente |
| Paginación sin tope (`limit` ilimitado) | El backend responde 422; acotar a 1-100 |
| `getAllPayload` con side-effects en el `map` | Paginación stale al fallar una request |
| Comillas dobles / imports relativos | Inconsistencia que rompe el lint; usar comillas simples + aliases |
| Verificar outputs con `OutputEmitterRef` como si fueran funciones | Confundir método handler y output homónimo (colisión de nombres); renombrar el método |