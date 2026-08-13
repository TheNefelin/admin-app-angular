# Game Guides Admin — Angular (proyecto aparte)

Documentación específica del **dashboard de administración** (`admin-app-angular/`).

> ⚠️ **Importante**: este dashboard es un **proyecto Angular independiente** que gestiona **globalmente varios proyectos** (Game Guides, portfolio, futuros .NET). **NO pertenece** al proyecto original Game Guides: esa app pública está compuesta por **Python (API)** + **Astro (frontend)**, cubierta por el `DEVELOPMENT.md` de la raíz. Este archivo es el `DEVELOPMENT.md` exclusivo de Angular.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 22 (SSR, Signal-based) |
| Bundling | Angular CLI 22 + `pnpm` |
| SSR | Express (`src/server.ts`) |
| Estilos | Tailwind 4 + DaisyUI 5 |
| Estado | Signals (`linkedSignal`, `clearTrigger`, `sessionSignal`) |
| Data fetching | `rxResource` (lecturas) + `subscribe()` (mutaciones) |

---

## Angular Admin — Estructura

```
admin-app-angular/
├── src/server.ts              → Express SSR + proxy /ssr-api/ + multipart handlers + GET /ssr-api/config
├── src/app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api-service.ts     → CRUD genérico + postWithFile<T>() multipart + deleteResource<T>() image
│   │   │   ├── auth-service.ts    → login Google (popup), refresh (rotación), logout; sesión en sessionStorage por namespace; sessionSignal(ns) reactivo
│   │   │   ├── error-service.ts   → Error signal global (modal en layouts)
│   │   │   ├── success-service.ts → cola de toasts ToastModel[] con auto-cierre a los 5s y cierre manual por id
│   │   │   └── confirm-service.ts → diálogo de confirmación promise-based: dialog signal + confirm()/accept()/reject()
│   │   └── interceptors/
│   │       ├── auth-interceptor.ts → añade Bearer del namespace de la URL; refresh+retry en 401; logout forzado si el refresh falla
│   │       └── error-interceptor.ts → formatea el detail del backend a error signal
│   ├── shared/
│   │   ├── components/        → button, loading, image-picker, image-viewer, message-error, message-success, modal-error, modal-confirm, pagination-filter, toast-success, google-auth-component
│   │   ├── models/            → pagination, select-item, upload-image-model
│   │   ├── constants/
│   │   │   └── routes-constant.ts → API_NAMESPACE, rutas dashboard
│   │   └── services/          → revalidate-service (SSR)
│   └── features/
│       └── game-guides/
│           ├── game/
│           │   ├── models/     → GameModel (ligero) + GameDetailModel extends GameModel (enriquecido), SaveGameModel
│           │   ├── services/   → GameService (CRUD + getDetailById + uploadImage + deleteImage cover)
│           │   ├── pages/
│           │   │   ├── game-form-page/  → Formulario principal con pestañas
│           │   │   └── game-list-page/
│           │   └── components/
│           │       ├── game-form-component/    → Form state, cover image (ImagePickerComponent), linkedSignal
│           │       ├── image-form-component/   → input file + alt + submit (linkedSignal, clearTrigger, validation, ngSkipHydration)
│           │       └── image-list-component/   → grid imágenes + delete (output id, placeholder fallback)
│           ├── genre/
│           │   ├── models/     → GenreModel, SaveGenreModel
│           │   ├── services/   → GenreService (CRUD + getAllPagination)
│           │   ├── pages/      → genre-page/ (lista paginada, rxResource, estado agrupado `genre` = { savePayload, isSaving } + helper local `handleMutation`)
│           │   └── components/
│           │       └── genre-form-component/ → dialog modal, validación local con MessageErrorComponent (name 1-50), app-button-component
│           ├── platform/
│           │   ├── models/     → PlatformModel, SavePlatformModel
│           │   ├── services/   → PlatformService (CRUD + getAllPagination)
│           │   ├── pages/      → platform-page/ (lista paginada, rxResource, estado agrupado `platform` = { savePayload, isSaving } + helper local `handleMutation`)
│           │   └── components/
│           │       └── platform-form-component/ → dialog modal, validación local con MessageErrorComponent (name 1-50), app-button-component
│           ├── screenshot/
│           │   ├── models/     → ScreenshotModel, SaveScreenshotModel
│           │   └── services/   → ScreenshotService (create con SaveScreenshotModel + file, delete via deleteResource)
│           ├── map/
│           │   ├── models/     → MapModel, SaveMapModel
│           │   └── services/   → MapService (create con SaveMapModel + file, delete via deleteResource)
│           ├── character/
│           │   ├── models/     → CharacterModel, SaveCharacterModel
│           │   ├── services/   → CharacterService (CRUD + uploadImage + deleteImage)
│           │   └── components/
│           │       ├── character-form-component/ → Form con ImagePicker, name/slug/description/sort/isPlayable; linkedSignal + clearTrigger; grid 1→3 col (sm+); validación local con MessageErrorComponent, loading states y limpieza tras save exitoso
│           │       └── character-list-component/ → Tabla con avatar, descripción, fechas, PJ jugable/sort; outputs onEdit/onDelete
│           ├── adventure/
│           │   ├── models/     → AdventureModel + AdventureDetailModel (agrega images[]) extends SaveAdventureModel
│           │   ├── services/   → AdventureService (CRUD)
│           │   └── components/
│           │       ├── adventure-form-component/ → dialog modal (description, sort_order, is_important, is_optional), linkedSignal + clearTrigger
│           │       └── adventure-list-component/ → badges Importante/Opcional, outputs onEdit/onDelete
│           ├── adventure-image/
│           │   ├── models/     → AdventureImageModel, SaveAdventureImageModel (file)
│           │   ├── services/   → AdventureImageService (uploadImage multipart, deleteImage)
│           │   └── components/
│           │       ├── adventure-image-form-component/ → modal solo creación (ImagePicker + alt/sort, valida archivo obligatorio, alt max 200, linkedSignal + clearTrigger)
│           │       └── adventure-image-list-component/ → grid con image-viewer + delete
│           ├── guide/
│           │   ├── models/     → GuideModel + GuideDetailModel (agrega adventures[]) extends SaveGuideModel (game_id, title, summary, sort_order, is_enabled + id/fechas)
│           │   ├── services/   → GuideService (getAllDetailByGamePagination → GET /guides/detail, CRUD)
│           │   ├── pages/      → guide-page/ (lista paginada por juego con adventures anidadas, rxResource, toasts success/error, estado agrupado por feature `guide`/`adventure`/`adventureImage` + helper local `handleMutation`)
│           │   └── components/
│           │       ├── guide-form-component/ → dialog modal, validación con MessageErrorComponent, linkedSignal + clearTrigger
│           │       └── guide-list-component/ → accordion por guía (details) que anida adventure-list, outputs onEdit/onDelete
│           └── source/
│               ├── models/     → SourceModel, SaveSourceModel
│               ├── services/   → SourceService (CRUD + getAllPagination)
│               └── components/
│                   ├── source-form-component/ → Form inline (name, url, sort); linkedSignal + clearTrigger; validación local con MessageErrorComponent (name max 200, url max 1000)
│                   └── source-list-component/ → Tabla con lista de fuentes
```

---

### Game Form Page — Arquitectura

- **GameFormPage** (padre): data fetching via `rxResource` con un solo `isLoading` compartido para todos los GETs; orquesta los CRUD hijos. Es la única fuente de verdad del estado de cada feature.
- **Estado agrupado por feature** (evita flags dispersos): cada CRUD hijo agrupa `savePayload` + `isSaving` en un objeto → `source = { savePayload, isSaving }`, `character = { savePayload, resetTrigger, isSaving }`. Las imágenes (screenshots, maps, delete de imagen) comparten un único `isSavingImage`. El game usa `isSaving`. En **guide-page**: `guide = { savePayload, isSaving }`, `adventure = { savePayload, isSaving }`, `adventureImage = { savePayload, isSaving }`.
- **`handleCrudAction<T>(action, options)`**: helper genérico para CRUD de entidades (sources, characters). `options`: `loading` (signal del feature), `successMsg`, `errorMsg`, `reloadOnSuccess`, `onSuccess` (ej: resetear el form tras guardar), `onFinalize`.
- **`handleImageAction<T>(action, successMsg, errorMsg)`**: helper para operaciones de imagen (screenshots, maps, delete imagen de character/cover). Usa `isSavingImage` fijo y hace reload en `finalize` — no recibe `loading`.
- **Form hijos**: `linkedSignal` reactivo al payload + `clearTrigger` input para resetear. Tras un submit exitoso la página llama `onClearCharacter()` (payload null + resetTrigger++) → el form vuelve a valores por defecto y limpia `selectedFile` (equivale a pulsar Limpiar).
- **GameFormComponent** (hijo): owns form state via `linkedSignal`, recibe `computedGame`, emite `onSubmit` con `{ data: SaveGameModel, file: File | null }`. Cover image se envía como paso separado tras crear/actualizar el game. Usa `ImagePickerComponent` para selección/preview de imagen.
- **Fuentes, screenshots, maps, characters**: CRUD independientes con sus propios componentes y servicios. Se renderizan fuera del `<form>` principal.
- **Secciones protegidas con `@if (isEditMode())`**: solo visibles después de crear el game (cuando existe `game.id`).
- **Reset de formulario**: `clearTrigger` signal + `linkedSignal` — incrementar el trigger reinicia el form a valores por defecto.
- **`ImageFormComponent`**: reemplaza a `ImageUploadComponent`. Usa `linkedSignal` + `clearTrigger`, no recibe `gameId` como input (se asigna en el padre antes de emitir). Incluye validación, `errorMessage` output y `ngSkipHydration` para evitar hydration mismatches.

---

### Convenciones (Angular)

- `linkedSignal` para form data reactivo; `clearTrigger` signal para resetear formularios
- **Paginación**: `PaginationRequestModel` (`page`, `limit`, `search`, `filter?`) es el payload de los GET paginados; cada service lo traduce a query params. **`limit` máximo 100** (el backend valida `le=100` → 422 si lo excede). Si necesitás listar todo (ej. dropdown de games), usar `limit: 100`, nunca 999/1000. `filter` es genérico (`number` para `game_id`, objeto para otros) — el service lo mapea al query param específico de la feature
- **Auth por namespace**: la app admin es multi-proyecto → cada proyecto (game-guides, portfolio, futuros .NET) con su propia sesión. Angular usa convención uniforme y el BFF adapta. Sesiones en **sessionStorage** con prefijo `auth.{ns}.access_token/refresh_token/user` (sobreviven a F5, mueren al cerrar la pestaña). `AuthService` expone `sessionSignal(ns)` reactivo por namespace (Map de WritableSignal): `login()`/`logout()` lo actualizan, así el UI se desloguea solo cuando el interceptor fuerza logout
- **GoogleAuthComponent** (shared): botón login + dropdown (avatar, nombre, rol, logout). Usa `effect()` en el constructor — NO escribir signals en constructor (NG0950, prohibido en SSR). Lee `sessionSignal(ns)` en vez de `this.authService` mutable. Renderizado solo donde el layout lo define vía `@Input authConfig?: {namespace, label}` en el navbar; actualmente solo GuideGamesLayout
- **authInterceptor**: extrae ns de `/ssr-api/{ns}/...`, añade `Authorization: Bearer` a toda request del ns (excluye `/auth/`), hace refresh+retry en 401. Si el refresh falla → `void authService.logout(ns)` (limpia sesión + sessionSignal → el componente de login reaparece sin recargar). Correr tras `errorInterceptor` (auth primero) en `app.config.ts`
- **Mensajes de error reales**: en handlers del feature usar `err?.error?.detail || err?.message || fallback` — el errorInterceptor ya formatea, no sobrescribir con mensajes genéricos
- **Feedback de éxito/error**:
  - **Éxito → `SuccessService`** (toast, patrón nuevo): `successService.show(msg)` acumula en una cola (`toasts` signal, `ToastModel[]`); cada toast se auto-elimina a los 5s (`setTimeout` por id) y se puede cerrar clickeándolo (`clear(id)`). Los layouts renderizan `app-toast-success-component` (`toast toast-end`) leyendo `successService.toasts()`. Solo en operaciones de escritura (create/update/delete), NO en GETs
  - **Error → `ErrorService`** (modal): `errorService.show(msg)` setea un signal único `error`; los layouts renderizan `app-modal-error-component` con `@if (errorService.error(); as msg)` y `(close)="errorService.clear()"`. El `errorInterceptor` lo dispara automáticamente ante cualquier HTTP error
  - **Confirmación → `ConfirmService`** (modal, promise-based): `await confirmService.confirm({ title, message })` abre `app-modal-confirm-component` (renderizado en layouts con `@if (confirmService.dialog(); as dialog)`) y resuelve `Promise<boolean>`. `accept()`/`reject()` resuelven con `true`/`false` y cierran. La página nunca toca `onConfirm`/`onClose` — solo espera el boolean. `isLoading` de la mutación queda en la feature (no en el service). Usado en deletes de genre, platform, game, guide y game-form-page (source, character)
  - **Los forms muestran validaciones locales** con `app-message-error-component` (`@if (errorMessage())`), nunca como toast/modal
  - ⚠️ **Migración en curso**: guide-page, genre, platform, game y game-form-page ya usan `SuccessService` y `ConfirmService`. Solo **portfolio** usa los patrones viejos `successMessage` signal + `app-message-success-component` y `showDeleteModal` + `app-modal-action-component` — migrar al `SuccessService`/`ConfirmService` cuando se retome
- `rxResource` para lecturas; `subscribe()` para mutaciones (create/delete/upload)
- **Listados con estado colapsable**: no desmontar la lista en refetch → usar `isLoading() && !hasValue()` en vez de solo `isLoading()` para el spinner; así el accordion/expansión conserva su estado abierto al guardar (guide-page)
- Todos los métodos HTTP pasan por `ApiService` genérico
- `ApiService.getDetailById<T>(ns, resource, id)` → `/ssr-api/{ns}/{resource}/{id}/detail` (para recursos con response enriquecido; ej: `GameService.getDetailById` usado por GameFormPage)
- Upload multipart: `postWithFile<T>()` para crear sub-recursos con archivo (screenshots, maps) o actualizar imagen (games, characters)
- Upload cover game: `postWithFile<T>()` con form fields `{ game_id }` a `POST /games/upload-image`
- Upload character image: `postWithFile<T>()` con form fields `{ id }` a `POST /characters/upload-image`
- Delete image genérico: `deleteResource<T>()` a `DELETE /{resource}/{id}/image` (games cover, characters, maps, screenshots)
- CRUD imágenes: padre inyecta servicio, componente hijo emite modelo via `output`
- `handleCrudAction<T>` abstrae el patrón CRUD de entidades (sources, characters); `handleImageAction<T>` el de operaciones de imagen (screenshots, maps, delete de imagen) — ver sección Game Form Page
- Estado agrupado por feature: cada CRUD hijo usa un objeto `{ savePayload, isSaving }` en la página, nunca signals planos dispersos (`isSavingSource`, `characterSavePayload`, etc.) — aplica en **game-form-page**, **guide-page**, **genre-page** y **platform-page**
- **`handleMutation<T>(action, state, options)`** (guide-page): helper LOCAL simple para mutaciones. `options`: `successMsg`, `errorMsg`, `onSuccess`, `onFinalize`. Centraliza `isSaving` (set true → `finalize` reset) y `subscribe` (éxito → toast + `onSuccess`; error → `console.error` + `errorService` con fallback). **Es el patrón de referencia para mutaciones**: más simple que `handleCrudAction`/`handleImageAction` (game-form-page) — **no consolidar** ni migrar game-form-page; usar `handleMutation` en features futuras
- **Estilo de código**: comillas simples en imports y strings, semicolons siempre — uniforme en todo el proyecto
- **`ImagePickerComponent`** (shared): componente genérico para seleccionar/previsualizar/limpiar imágenes. Inputs: `isLoading`, `aspectRatio`, `labelText`, `displayImg`. Outputs: `onSelectedFile(File | null)`, `onDeleteFile()`. Usa el patrón `previewImg signal<{ file: File; dataUrl: string } | null>` interno.
- **Botón delete**: usa `bg-red-500 hover:bg-red-600 text-white` en lugar de `btn-error` de DaisyUI
- **Componentes compartidos**: `select-list-component`, `image-picker-component`, `image-field-component` en shared usan `app-button-component` para botones de acción (evita inline SVGs duplicados)
- **Hydration**: componentes con `File` API o `@if/@else` que causan mismatch usan `ngSkipHydration` en el template padre
- **Pendiente portfolio (al final del proyecto)**: `image-field-component` será reemplazado por `image-picker-component`

---

## Flujo de desarrollo (solo Angular)

Los items del flujo del proyecto original que pertenecen a este dashboard (sus números son los originales de `DEVELOPMENT.md` de la raíz):

2. ✅ **Dashboard Angular**: CRUD Games con slug auto-gen, image upload, paginación
7. ✅ **Characters Angular frontend**: form component (ImagePicker, linkedSignal, validaciones, loading) + list component (tabla, outputs onEdit/onDelete) + service con uploadImage/deleteImage
8. ✅ **Characters Angular en page**: edit/delete/deleteImage conectados, clear tras save exitoso, estado agrupado por feature y helpers `handleCrudAction`/`handleImageAction`
23. ✅ **Auth Google en admin por namespace**: sesiones en sessionStorage por namespace (game-guides/portfolio), botón en navbar solo donde el layout lo define; BFF expone client id y propaga `Authorization` (incl. uploads multipart); admin muestra detail real del backend en errores
34. ✅ **CRUD Guides en admin (Angular)**: feature `guide` completo (models, service con filter→game_id, guide-page paginado por juego con rxResource, guide-form modal con validación + MessageErrorComponent, guide-list collapse); `limit` 5 por página
35. ✅ **Toasts de éxito (Angular)**: `SuccessService` con cola (`ToastModel[]`, auto-cierre 5s, cierre manual por id) + `toast-success-component` apilado en layouts; guide-page usa `successService.show()` en create/update/delete; `isSavingGuide` se setea después de validar (no deja loading atascado)
38. ✅ **Migrar successMessage a `SuccessService` (Angular)**: genre, platform, game y game-form-page migrados al toast con cola (antes signal inline + message-success-component)
41. ✅ **ConfirmService con modal de confirmación (Angular)**: `ConfirmService` (core) promise-based + `modal-confirm-component` (shared, renderizado en layouts); migrados los deletes de genre, platform, game, guide y game-form-page (source, character); eliminado el patrón viejo `showDeleteModal`/`ModalActionComponent` en game-guides
42. ✅ **CRUD Adventures + AdventureImages en admin (Angular)**: features `adventure` (form modal con description/sort/is_important/is_optional + list con badges) y `adventure-image` (upload multipart con ImagePicker, grid con image-viewer, delete); anidadas bajo cada guía en guide-list (accordion)
43. ✅ **UX accordion persistente + auto-logout en 401 (Angular)**: guide-list nunca se desmonta en refetch (`isLoading() && !hasValue()`); `AuthService.sessionSignal(ns)` reactivo + `authInterceptor` fuerza `logout(ns)` si el refresh falla
44. ✅ **Consistencia game-guides (Angular)** — features a nivel senior:
  - **guide**: longitudes contra `postgre_schema.sql` (title 256, alt 200); `adventure-image-form` modal solo creación + valida archivo obligatorio; header sin `undefined - undefined`; fallback de errores en GETs; confirm de aventura con `Id`/`Sort`; input muerto `isLoading` eliminado de adventure-list; estado agrupado `guide`/`adventure`/`adventureImage` + helper local `handleMutation`
  - **genre/platform**: estado agrupado `{ savePayload, isSaving }` + `handleMutation`; validación local con MessageErrorComponent (name 1-50); fallbacks `errorService` en GET y mutaciones (antes silenciosos); loading `!hasValue()`; botones `app-button-component`; `readonly`, return types, semicolons
  - **source/character**: inconsistencia A resuelta (`errorMessage` output → signal local + MessageErrorComponent; quitados bindings `(errorMessage)` de `game-form-page.html`); source maxlength corregido name 100→200 y url 256→1000 (schema `VARCHAR(200)`/`VARCHAR(1000)`)
  - **screenshot/map**: services pulidos (semicolons, alias `@features`)
  - **dead code eliminado**: `getById` sin uso (genre, platform, source, character), imports `Router`/`ROUTES_CONSTANTS` en genre-page
  - **estilo uniforme** en todas las features: comillas simples, semicolons, alias `@features/...`, `readonly`
  - ⏳ **Pendiente `game`**: componente de imagen obsoleto (`image-form`/`image-list`), forms no-dialog, `errorMessage` output del game-form, comillas dobles/`getById`, pulido general
45. ⏳ **Pendiente (al final del proyecto)**: portfolio — migrar al `SuccessService`/`ConfirmService` y reemplazar `image-field-component` por `image-picker-component`
51. 🔮 **Futuro**: Dashboard Angular completo, producción

---

## Frontend — Dev (Angular)

```bash
cd admin-app-angular
pnpm dev        # servir con SSR
pnpm build      # build SSR
pnpm start      # servidor Express
```

Referencias de patrones senior: `admin-app-angular/SKILL.md` (checklist de código senior, Angular 22 Signals, SSR).