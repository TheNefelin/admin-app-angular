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
├── src/server.ts              → Express SSR + proxy /ssr-api/ + multipart handlers + GET /ssr-api/config (googleClientIds por namespace)
├── src/app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api-service.ts     → CRUD genérico + postWithFile<T>() multipart + deleteResource<T>() image
│   │   │   ├── auth-service.ts    → login Google (popup), refresh (rotación), logout; client ID por namespace (getGoogleClientId(ns) con cache); sesión en sessionStorage por namespace; sessionSignal(ns) reactivo
│   │   │   ├── error-service.ts   → Error signal global (modal en layouts)
│   │   │   ├── success-service.ts → cola de toasts ToastModel[] con auto-cierre a los 5s y cierre manual por id
│   │   │   ├── confirm-service.ts → diálogo de confirmación promise-based: dialog signal + confirm()/accept()/reject()
│   │   │   └── mutation-service.ts → patrón único de mutaciones (isSaving + toast éxito + console.error + onClose solo en éxito); lo usan las 7 páginas CRUD con modal
│   │   └── interceptors/
│   │       ├── auth-interceptor.ts → añade Bearer del namespace de la URL; refresh+retry en 401; logout forzado si el refresh falla
│   │       └── error-interceptor.ts → formatea el detail del backend a error signal (ÚNICA fuente de errores HTTP; las páginas ya no llaman errorService.show)
│   ├── shared/
│   │   ├── base/
│   │   │   └── crud-page.ts       → CrudPage<TModel>: clase base abstracta con señales/métodos de paginación, filtro y reload (totalPages/currentPage/limit/search/getAllPayload + nextPage/prevPage/onFilterChange/onRefreshClick + reload() abstracto)
│   │   ├── components/        → button, loading, image-picker, image-viewer, message-error, modal-error, modal-confirm, pagination-filter, pagination-nav, select-list, select-search, toast-success, google-auth-component
│   │   ├── models/            → pagination, select-item, upload-image-model
│   │   ├── constants/
│   │   │   └── routes-constant.ts → API_NAMESPACE, rutas dashboard
│   │   └── services/          → revalidate-service (SSR)
│   └── features/
│       └── game-guides/
│           ├── game/
│           │   ├── models/     → GameModel (ligero) + GameDetailModel extends GameModel (enriquecido), SaveGameModel
│           │   ├── services/   → GameService (getAllPagination + getDetailById + create/update/delete + uploadImage + deleteImage cover)
│           │   ├── pages/
│           │   │   ├── game-form-page/  → Formulario principal (host de game form + lists + modales de fuentes/personajes/screenshots/maps)
│           │   │   └── game-page/       → lista paginada (hereda CrudPage<GameModel>; usa MutationService)
│           │   └── components/
│           │       ├── game-form-component/    → Form state, cover image (ImagePickerComponent), linkedSignal, validación local con MessageErrorComponent (name/slug 1-100)
│           │       └── image-list-component/   → grid imágenes + delete (output id, placeholder fallback)
│           ├── genre/
│           │   ├── models/     → GenreModel, SaveGenreModel
│           │   ├── services/   → GenreService (CRUD + getAllPagination)
│           │   ├── pages/      → genre-page/ (lista paginada, rxResource, estado agrupado `genre` = { savePayload, isSaving }; hereda CrudPage<GenreModel>; usa MutationService)
│           │   └── components/
│           │       └── genre-form-component/ → dialog modal, validación local con MessageErrorComponent (name 1-50), app-button-component
│           ├── platform/
│           │   ├── models/     → PlatformModel, SavePlatformModel
│           │   ├── services/   → PlatformService (CRUD + getAllPagination)
│           │   ├── pages/      → platform-page/ (lista paginada, rxResource, estado agrupado `platform` = { savePayload, isSaving }; hereda CrudPage<PlatformModel>; usa MutationService)
│           │   └── components/
│           │       └── platform-form-component/ → dialog modal, validación local con MessageErrorComponent (name 1-50), app-button-component
│           ├── screenshot/
│           │   ├── models/     → ScreenshotModel, SaveScreenshotModel
│           │   ├── services/   → ScreenshotService (create con SaveScreenshotModel + file, delete via deleteResource)
│           │   └── components/
│           │       └── screenshot-form-component/ → dialog modal solo creación (ImagePicker aspect-video + alt/sort, valida archivo obligatorio, alt 1-200)
│           ├── map/
│           │   ├── models/     → MapModel, SaveMapModel
│           │   ├── services/   → MapService (create con SaveMapModel + file, delete via deleteResource)
│           │   └── components/
│           │       └── map-form-component/ → dialog modal solo creación (ImagePicker aspecto original `null` + alt/sort, valida archivo obligatorio, alt 1-200)
│           ├── character/
│           │   ├── models/     → CharacterModel, SaveCharacterModel
│           │   ├── services/   → CharacterService (CRUD + uploadImage + deleteImage)
│           │   └── components/
│           │       ├── character-form-component/ → dialog modal crear/modificar (ImagePicker aspect-square, name/slug/description/sort/isPlayable, id/fechas, validación local con MessageErrorComponent)
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
│           │   ├── pages/      → guide-page/ (lista paginada por juego con adventures anidadas, rxResource, toasts success/error, estado agrupado por feature `guide`/`adventure`/`adventureImage`; hereda CrudPage<GuideModel>; usa MutationService)
│           │   └── components/
│           │       ├── guide-form-component/ → dialog modal, validación con MessageErrorComponent, linkedSignal + clearTrigger
│           │       └── guide-list-component/ → accordion por guía (details) que anida adventure-list, outputs onEdit/onDelete
│           └── source/
│               ├── models/     → SourceModel, SaveSourceModel
│               ├── services/   → SourceService (CRUD + getAllPagination)
│               └── components/
│                   ├── source-form-component/ → dialog modal (crear/modificar), validación local con MessageErrorComponent (name max 200, url max 1000), header con id/fechas; abierto desde game-form-page via estado `source.showForm`
│                   └── source-list-component/ → Tabla con lista de fuentes
│       └── portfolio/
│           ├── url-grp/
│           │   ├── models/     → UrlGrpModel (id_url_grp), SaveUrlGrpModel
│           │   ├── services/   → UrlGrpService (getAllPagination + getAll + create/update/delete)
│           │   ├── page/       → url-grp-page/ (lista paginada, estado agrupado `urlGrp` = { savePayload, isSaving }; toasts SuccessService, confirmación ConfirmService, fallbacks ErrorService; hereda CrudPage<UrlGrpModel>; usa MutationService)
│           │   └── components/
│           │       └── url-grp-form-component/ → dialog modal, validación local con MessageErrorComponent, app-button-component
│           ├── url/
│           │   ├── models/     → UrlModel (id_url, id_url_grp), SaveUrlModel
│           │   ├── services/   → UrlService (getAllPagination + create/update/delete)
│           │   ├── page/       → url-page/ (lista paginada + filtro por url-grp, estado agrupado `url` = { savePayload, isSaving }; hereda CrudPage<UrlModelDetail>; usa MutationService)
│           │   └── components/
│           │       └── url-form-component/ → dialog modal, ImagePicker (crear) / display (editar), validación local con MessageErrorComponent
│           ├── language/
│           │   ├── models/     → LanguageModel (id_language), SaveLanguageModel
│           │   ├── services/   → LanguageService (getAllPagination + getAll + create/update/delete + uploadImage/deleteImage)
│           │   ├── page/       → language-page/ (lista paginada, estado agrupado `language` = { savePayload, isSaving }; hereda CrudPage<LanguageModel>; usa MutationService)
│           │   └── components/
│           │       └── language-form-component/ → dialog modal, ImagePicker aspect-square + app-button-component, validación local
│           ├── technology/
│           │   ├── models/     → TechnologyModel (id_technology), SaveTechnologyModel
│           │   ├── services/   → TechnologyService (getAllPagination + getAll + create/update/delete + uploadImage/deleteImage)
│           │   ├── page/       → technology-page/ (lista paginada, estado agrupado `technology` = { savePayload, isSaving }; hereda CrudPage<TechnologyModel>; usa MutationService)
│           │   └── components/
│           │       └── technology-form-component/ → dialog modal, ImagePicker aspect-square + app-button-component, validación local
│           └── project/
│               ├── models/     → ProjectModel (id_project, languages, technologies), SaveProjectModel
│               ├── services/   → ProjectService (getAllPagination + getById + create/update/delete + uploadImage/deleteImage)
│               ├── pages/      → project-page/ (lista paginada, toasts/confirm/error services; hereda CrudPage<ProjectModel>; usa MutationService) + project-form-page/ (form con ImagePicker aspect-video, selects de language/technology, estado agrupado `project` = { isSaving })
│               └── project.routes.ts → rutas ROOT/FORM
```

---

### Game Form Page — Arquitectura

- **GameFormPage** (padre): data fetching via `rxResource` con un solo `isLoading` compartido para todos los GETs; orquesta los CRUD hijos. Es la única fuente de verdad del estado de cada feature.
- **Estado agrupado por feature** (evita flags dispersos): cada CRUD hijo agrupa `savePayload` + `isSaving` en un objeto → `game = { isSaving }`, `source = { savePayload, resetTrigger, isSaving, showForm }`, `character = { savePayload, resetTrigger, isSaving, showForm }`, `screenshot = { isSaving, showForm }`, `map = { isSaving, showForm }`. En **guide-page**: `guide = { savePayload, isSaving }`, `adventure = { savePayload, isSaving }`, `adventureImage = { savePayload, isSaving }`.
- **`handleCrudAction<T>(action, options)`**: helper genérico para CRUD de entidades (sources, characters). `options`: `loading` (signal del feature), `successMsg`, `errorMsg`, `reloadOnSuccess`, `onSuccess` (ej: resetear el form tras guardar), `onFinalize`.
- **`handleImageAction<T>(action, loading, successMsg, errorMsg, options?)`**: helper para operaciones de imagen (screenshots, maps, delete imagen de character). `loading` es la signal `isSaving` de la feature (ej: `this.screenshot.isSaving`). `options?: { onSuccess }` (ej: cerrar el modal tras guardar). Hace reload en `finalize`.
- **Form hijos**: `linkedSignal` reactivo al payload + `clearTrigger` input para resetear. Tras un submit exitoso la página llama `onClearCharacter()` (payload null + resetTrigger++) → el form vuelve a valores por defecto y limpia `selectedFile` (equivale a pulsar Limpiar).
- **GameFormComponent** (hijo): owns form state via `linkedSignal`, recibe `computedGame`, emite `onSubmit` con `{ data: SaveGameModel, file: File | null }`. Cover image se envía como paso separado tras crear/actualizar el game. Usa `ImagePickerComponent` para selección/preview de imagen.
- **Fuentes, screenshots, maps, characters**: CRUD independientes con sus propios componentes y servicios. Se renderizan fuera del `<form>` principal.
- **Secciones protegidas con `@if (isEditMode())`**: solo visibles después de crear el game (cuando existe `game.id`).
- **Reset de formulario**: `clearTrigger` signal + `linkedSignal` — incrementar el trigger reinicia el form a valores por defecto.
- **Sub-recursos en modal**: source, character, screenshot y map usan dialog modales propios (`SourceFormComponent`, `CharacterFormComponent`, `ScreenshotFormComponent`, `MapFormComponent`). La página controla la apertura con el estado `{ feature }.showForm`; `onEditX` setea el payload + abre el modal, `onClearX` (cancelar o tras éxito) cierra + limpia payload + `resetTrigger++`. El `image-form-component` genérico fue eliminado (obsoleto): cada feature tiene su form con `ImagePickerComponent` y el aspecto correcto (character square, screenshot video, map original `null`).

---

### Convenciones (Angular)

- `linkedSignal` para form data reactivo; `clearTrigger` signal para resetear formularios
- **Paginación**: `PaginationRequestModel` (`page`, `limit`, `search`, `filter?`) es el payload de los GET paginados; cada service lo traduce a query params. **`limit` máximo 100** (el backend valida `le=100` → 422 si lo excede). Si necesitás listar todo (ej. dropdown de games), usar `limit: 100`, nunca 999/1000. `filter` es genérico (`number` para `game_id`, objeto para otros) — el service lo mapea al query param específico de la feature
- **`CrudPage<TModel>`** (shared/base): clase base abstracta para páginas de listado paginado. Expone señales `totalPages`/`currentPage`/`limit` (default 10)/`search`, el computed `getAllPayload`, y los métodos `nextPage()`/`prevPage()`/`onFilterChange(filter)`/`onRefreshClick()`. La subclase implementa el abstracto `reload()` (recarga su rxResource de listado) y conserva SUS GETs (`rxResource`) y mutaciones (`MutationService`). **Override**: para cambiar un valor/lógica heredado usar `protected override` (p.ej. `protected override readonly limit = signal<number>(25)` o redefinir `onFilterChange`); requiere palabra `override` por `noImplicitOverride: true`. Las 9 páginas (project, game, language, technology, url-grp, url, genre, platform, guide) la heredan; url-page y guide-page conservan su propio payload con `filter` (`getAllUrlPayload`/`getAllGuidePayload`) — el de la base (`getAllPayload`) es solo para páginas sin filtro
- **Auth por namespace**: la app admin es multi-proyecto → cada proyecto (game-guides, portfolio, futuros .NET) con su propia sesión. Angular usa convención uniforme y el BFF adapta. Sesiones en **sessionStorage** con prefijo `auth.{ns}.access_token/refresh_token/user` (sobreviven a F5, mueren al cerrar la pestaña). `AuthService` expone `sessionSignal(ns)` reactivo por namespace (Map de WritableSignal): `login()`/`logout()` lo actualizan, así el UI se desloguea solo cuando el interceptor fuerza logout
- **GoogleAuthComponent** (shared): botón login + dropdown (avatar, nombre, rol, logout). Usa `effect()` en el constructor — NO escribir signals en constructor (NG0950, prohibido en SSR). Lee `sessionSignal(ns)` en vez de `this.authService` mutable. Renderizado solo donde el layout lo define vía `@Input authConfig?: {namespace, label}` en el navbar; actualmente solo GuideGamesLayout
- **authInterceptor**: extrae ns de `/ssr-api/{ns}/...`, añade `Authorization: Bearer` a toda request del ns (excluye `/auth/`), hace refresh+retry en 401. Si el refresh falla → `void authService.logout(ns)` (limpia sesión + sessionSignal → el componente de login reaparece sin recargar). Correr tras `errorInterceptor` (auth primero) en `app.config.ts`
- **Mensajes de error reales**: en handlers del feature usar `err?.error?.detail || err?.message || fallback` — el errorInterceptor ya formatea, no sobrescribir con mensajes genéricos
- **Feedback de éxito/error**:
  - **Éxito → `SuccessService`** (toast, patrón nuevo): `successService.show(msg)` acumula en una cola (`toasts` signal, `ToastModel[]`); cada toast se auto-elimina a los 5s (`setTimeout` por id) y se puede cerrar clickeándolo (`clear(id)`). Los layouts renderizan `app-toast-success-component` (`toast toast-end`) leyendo `successService.toasts()`. Solo en operaciones de escritura (create/update/delete), NO en GETs
  - **Error → `ErrorService`** (modal): `errorService.show(msg)` setea un signal único `error`; los layouts renderizan `app-modal-error-component` con `@if (errorService.error(); as msg)` y `(close)="errorService.clear()"`. El `errorInterceptor` lo dispara automáticamente ante cualquier HTTP error
  - **Confirmación → `ConfirmService`** (modal, promise-based): `await confirmService.confirm({ title, message })` abre `app-modal-confirm-component` (renderizado en layouts con `@if (confirmService.dialog(); as dialog)`) y resuelve `Promise<boolean>`. `accept()`/`reject()` resuelven con `true`/`false` y cierran. La página nunca toca `onConfirm`/`onClose` — solo espera el boolean. `isLoading` de la mutación queda en la feature (no en el service). Usado en deletes de genre, platform, game, guide y game-form-page (source, character)
  - **Los forms muestran validaciones locales** con `app-message-error-component` (`@if (errorMessage())`), nunca como toast/modal
  - ⚠️ **Migración completada**: genre, platform, game, game-form-page y **portfolio** (url-grp, url, language, technology, project) ya usan `SuccessService`/`ConfirmService`/`ErrorService`. Los componentes obsoletos `message-success-component`, `modal-action-component` e `image-field-component` fueron eliminados de `shared`
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
- Estado agrupado por feature: cada CRUD hijo usa un objeto `{ savePayload, isSaving }` en la página, nunca signals planos dispersos (`isSavingSource`, `characterSavePayload`, etc.) — aplica en **game-form-page**, **guide-page**, **genre-page**, **platform-page** y las páginas CRUD con modal (language, technology, url-grp, url)
- **`MutationService.run<T>(action, state, options)`** (core service compartido): patrón ÚNICO de referencia para mutaciones (create/update/delete/upload). `state` es el objeto agrupado `{ isSaving }` de la feature; `options`: `successMsg`, `errorMsg`, `onSuccess`, `onFinalize`. Centraliza `isSaving` (set true → `finalize` reset) y `subscribe` (éxito → toast `SuccessService` + `onSuccess`; error → `console.error`). Es el sucesor del helper local `handleMutation` que antes se copiaba en 7 páginas (language, technology, url-grp, url, genre, platform, guide). **No migrar game-form-page**: conserva sus helpers `handleCrudAction`/`handleImageAction` (patrón distinto con reload en finalize) — son intencionalmente locales a esa página compleja
- **Estilo de código**: comillas simples en imports y strings, semicolons siempre — uniforme en todo el proyecto
- **`ImagePickerComponent`** (shared): componente genérico para seleccionar/previsualizar/limpiar imágenes. Inputs: `isLoading`, `aspectRatio` (`'aspect-square' | 'aspect-video' | null` — `null` = aspecto original sin clase), `labelText`, `displayImg`, `clearTrigger`. Outputs: `onSelectedFile(File | null)`, `onDeleteFile()`. Usa el patrón `previewImg signal<{ file: File; dataUrl: string } | null>` interno.
- **Botón delete**: usa `bg-red-500 hover:bg-red-600 text-white` en lugar de `btn-error` de DaisyUI
- **Componentes compartidos**: `select-list-component`, `image-picker-component`, `select-search-component` en shared usan `app-button-component` para botones de acción (evita inline SVGs duplicados)
- **Hydration**: componentes con `File` API o `@if/@else` que causan mismatch usan `ngSkipHydration` en el template padre

---

## Flujo de desarrollo (solo Angular)

Los items del flujo del proyecto original que pertenecen a este dashboard (sus números son los originales de `DEVELOPMENT.md` de la raíz):

2. ✅ **Dashboard Angular**: CRUD Games con slug auto-gen, image upload, paginación
7. ✅ **Characters Angular frontend**: form component (ImagePicker, linkedSignal, validaciones, loading) + list component (tabla, outputs onEdit/onDelete) + service con uploadImage/deleteImage
8. ✅ **Characters Angular en page**: edit/delete/deleteImage conectados, clear tras save exitoso, estado agrupado por feature y helpers `handleCrudAction`/`handleImageAction`
23. ✅ **Auth Google en admin por namespace**: sesiones en sessionStorage por namespace (game-guides/portfolio), botón en navbar solo donde el layout lo define; BFF expone client id y propaga `Authorization` (incl. uploads multipart); admin muestra detail real del backend en errores
34. ✅ **CRUD Guides en admin (Angular)**: feature `guide` completo (models, service con filter→game_id, guide-page paginado por juego con rxResource, guide-form modal con validación + MessageErrorComponent, guide-list collapse); `limit` 5 por página (luego unificado a 10, ver item 46)
35. ✅ **Toasts de éxito (Angular)**: `SuccessService` con cola (`ToastModel[]`, auto-cierre 5s, cierre manual por id) + `toast-success-component` apilado en layouts; guide-page usa `successService.show()` en create/update/delete; `isSavingGuide` se setea después de validar (no deja loading atascado)
38. ✅ **Migrar successMessage a `SuccessService` (Angular)**: genre, platform, game y game-form-page migrados al toast con cola (antes signal inline + message-success-component)
41. ✅ **ConfirmService con modal de confirmación (Angular)**: `ConfirmService` (core) promise-based + `modal-confirm-component` (shared, renderizado en layouts); migrados los deletes de genre, platform, game, guide y game-form-page (source, character); eliminado el patrón viejo `showDeleteModal`/`ModalActionComponent` en game-guides
42. ✅ **CRUD Adventures + AdventureImages en admin (Angular)**: features `adventure` (form modal con description/sort/is_important/is_optional + list con badges) y `adventure-image` (upload multipart con ImagePicker, grid con image-viewer, delete); anidadas bajo cada guía en guide-list (accordion)
43. ✅ **UX accordion persistente + auto-logout en 401 (Angular)**: guide-list nunca se desmonta en refetch (`isLoading() && !hasValue()`); `AuthService.sessionSignal(ns)` reactivo + `authInterceptor` fuerza `logout(ns)` si el refresh falla
44. ✅ **Consistencia game-guides (Angular)** — features a nivel senior:
  - **guide**: longitudes contra `postgre_schema.sql` (title 256, alt 200); `adventure-image-form` modal solo creación + valida archivo obligatorio; header sin `undefined - undefined`; fallback de errores en GETs; confirm de aventura con `Id`/`Sort`; input muerto `isLoading` eliminado de adventure-list; estado agrupado `guide`/`adventure`/`adventureImage` + helper local `handleMutation`
  - **genre/platform**: estado agrupado `{ savePayload, isSaving }` + `handleMutation`; validación local con MessageErrorComponent (name 1-50); fallbacks `errorService` en GET y mutaciones (antes silenciosos); loading `!hasValue()`; botones `app-button-component`; `readonly`, return types, semicolons
  - **source/character**: inconsistencia A resuelta (`errorMessage` output → signal local + MessageErrorComponent; quitados bindings `(errorMessage)` de `game-form-page.html`); source maxlength corregido name 100→200 y url 256→1000 (schema `VARCHAR(200)`/`VARCHAR(1000)`)
  - **screenshot/map**: services pulidos (semicolons, alias `@features`); **forms propios por feature en modal** (`screenshot-form-component` con ImagePicker `aspect-video`, `map-form-component` con aspecto original `null`; `image-form-component` genérico obsoleto eliminado)
  - **dead code eliminado**: `getById` sin uso (genre, platform, source, character), imports `Router`/`ROUTES_CONSTANTS` en genre-page
  - **estilo uniforme** en todas las features: comillas simples, semicolons, alias `@features/...`, `readonly`
  - ✅ **game**: feature completa a nivel senior — `game-service` (alias, semicolons, `getById` muerto eliminado), `game-model`/`game.routes` (alias `@features`), `image-list` (alt validado 1-200 contra schema `VARCHAR(200)`), `game-page` (`editItem` muerto eliminado, fallbacks errorService), `game-form` (validación local con MessageErrorComponent), `game-form-page` (sin `errorMessage` output ni `gameComputed()!`, semicolons, alias), **sub-recursos en modal** (`SourceFormComponent`, `CharacterFormComponent`, `ScreenshotFormComponent`, `MapFormComponent`; `image-form-component` obsoleto eliminado, `ImagePickerComponent` acepta `null` en aspectRatio), **estado agrupado por feature** (`game`/`screenshot`/`map` con `isSaving` propio; `handleImageAction` recibe `loading` por feature)
45. ✅ **Portfolio en admin (Angular)** — migración completa a patrones senior: url-grp, url, language, technology y project migrados a `SuccessService`/`ConfirmService`/`ErrorService` con fallbacks reales, estado agrupado `{ savePayload, isSaving }` + helper local `handleMutation`, spinners `isLoading() && !hasValue()`, botones `app-button-component`, estilos uniformes (comillas simples, semicolons, alias `@features`); `image-field-component` reemplazado por `image-picker-component` en language/technology/project; `project-form-page` reemplazó el manejo manual de imagen (FileReader/previewUrl) por `ImagePickerComponent` y eliminó el `map(result => result)` muerto; `getById` eliminado de services sin uso (url-grp, url, language, technology), conservado en project (lo usa el form page); `getAll()` conservado en url-grp/language/technology (los usan url-page/project-form-page); **componentes obsoletos eliminados de shared**: `message-success-component`, `modal-action-component`, `image-field-component`
51. 🔮 **Futuro**: Dashboard Angular completo, producción
52. ✅ **Refactor de deuda técnica (Angular)** — realizado en sesión de revisión de código:
  - **`strict: true`** en `tsconfig.json` + limpieza de 2 `??` redundantes (warnings NG8102 en image-viewer y select-list)
  - **Manejo de errores unificado**: `errorInterceptor` como ÚNICA fuente de errores HTTP; eliminadas 30 llamadas duplicadas a `errorService.show()` en páginas/forms (antes doble manejo página + interceptor). Solo `error-interceptor.ts` (HTTP) y `google-auth-component.ts` (OAuth, no pasa por HTTP) lo usan
  - **Paginación unificada**: default `limit` 10 en las 8 páginas CRUD (antes guía/otras usaban 5; `pagination-filter` y url-page ya usaban 10)
  - **`MutationService`** (core): patrón único de mutaciones extraído del helper local `handleMutation` duplicado en 7 páginas (language, technology, url-grp, url, genre, platform, guide); `game-form-page` conserva `handleCrudAction`/`handleImageAction` (intencional)
  - **`CrudPage<TModel>`** (shared/base): clase base abstracta con el andamiaje de paginación/filtro/reload; migradas las 9 páginas de listado (project, game, language, technology, url-grp, url, genre, platform, guide). Los GETs (`rxResource`) y mutaciones quedan en cada página
  - **`z-test` eliminado**: ruta `test` + carpeta `features/z-test` removidas
  - **Búsquedas seguras**: los 11 services paginados usan `encodeURIComponent()` en el query param `search` (evita romper URLs con `&`, `=`, `#`, `%`) y unifican `!== ''`
  - Verificado con `npx ng build` (0 errores/warnings)
53. ✅ **Auditoría de calidad (Angular)** — hallazgos de severidad alta corregidos:
  - **XSS almacenado en `select-search-component`**: eliminado `[innerHTML]` y el método `highlight()` (generaba HTML en el `.ts`); nuevo `highlightParts(): HighlightPart[]` puro (segmentos `{ text, marked }`) renderizado en el template con `@for` + interpolación `{{ }}` (escape automático de Angular). Adiós también al regex con metacharacteres (el `indexOf` no necesita escape)
  - **Botón "Refrescar" muerto en `pagination-filter-component`**: conectado `(onClick)` al nuevo `onRefresh()`; tanto el botón como el Enter del form aplican los filtros actuales (sin esperar el debounce de 300ms) y disparan `reload()`. El componente quedó 100% declarativo (sin constructor ni `subscribe` manual): `refreshTrigger` signal + `outputFromObservable`
  - **Modales no pierden datos al fallar el save**: `MutationService.run` (y el helper local `handleCrudAction` de game-form-page) ganaron `onClose`, que corre SOLO en éxito; los `onFinalize` que cerraban/reseteaban modales migraron a `onClose` en genre, platform, url-grp, url, language, technology y guide (3 modales) + game-form-page (source). Si la API falla, el modal queda abierto con los datos intactos
54. ✅ **Auth por namespace + SSR client render (Angular)**:
  - **Google client ID por app**: `server.ts` expone `GET /ssr-api/config` → `{ googleClientIds }` (mapa por namespace); `AuthService.getGoogleClientId(ns)` busca el ID de esa app, lo cachea en `Map` y lanza error claro si no está configurado (caso portfolio hoy). Una feature futura solo agrega `GOOGLE_CLIENT_ID_<FEATURE>` al `.env.demo` + su entrada en `GOOGLE_CLIENT_IDS` de `server.ts`. Variable renombrada `PUBLIC_GOOGLE_CLIENT_ID` → `GOOGLE_CLIENT_ID_GAME_GUIDES` (server-only, sin prefijo `PUBLIC_`)
  - **`loadGoogleScript` robusto**: rechaza en `onerror` del script y en timeout de 10s (antes el botón quedaba "Cargando..." para siempre si Google estaba bloqueado); `loginWithGoogle` chequea `window.google` antes de usarlo
  - **SSR sin prerender**: `app.routes.server.ts` usa un solo catch-all `RenderMode.Client` (eliminadas las 4 entradas de form pages redundantes). Build confirma `Prerendered 0 static routes` — las páginas de admin se renderizan en el cliente con la API disponible, sin HTML vacío ni doble carga
  - **Sesión**: se mantiene `sessionStorage` por namespace (muere al cerrar pestaña/navegador, sobrevive F5, no es localStorage)
55. ✅ **Streams `rxResource` puros (Angular)** — el side-effect de `totalPages.set()` vivía DENTRO del `map` en los 9 streams `getAllPagination`; ahora `CrudPage` expone `mapPaginated(response)` (setea `totalPages` y devuelve `items`) y `emptyPaginated()` (resetea `totalPages` a 1 en error). En cada página el `map` quedó de una línea y el `catchError` vuelve `of(this.emptyPaginated())`, eliminando el estado stale de la paginación cuando una request falla. Aplica a game, guide, genre, platform, project, url, url-grp, language y technology. `GuidePage` ahora extiende `CrudPage<GuideDetailModel>` para que su lista paginada conserve el tipo en el template
56. ✅ **Auditoría de calidad (Angular) — pendientes menores**:
  - **`select-search-component` limpia su selección en silencio al escribir**: `onSearch` borraba `selectedItemInternal` sin avisar al padre (la UI mostraba "sin selección" pero el filtro del padre seguía activo con el item viejo). Ahora emite `cleared` al invalidar la selección → el padre sincroniza (guide-page `onGameClear`, url-page `onUrlGrpClear`)
  - **Tabnabbing**: 4 enlaces externos con `target="_blank"` sin `rel="noopener noreferrer"` (project-page ×2, url-page, navbar-component)
  - **Imports muertos / bug de timer**: `loadGoogleScript` creaba un timeout de 10s que nunca se limpiaba — si el script cargaba, el timer seguía vivo y borraba el script + rechazaba una promesa ya resuelta; ahora `clearTimeout` en `onload`/`onerror`. Eliminado import `finalize` sin usar en game-page

---

## Frontend — Dev (Angular)

```bash
cd admin-app-angular
pnpm dev        # servir con SSR
pnpm build      # build SSR
pnpm start      # servidor Express
```

Referencias de patrones senior: `admin-app-angular/SKILL.md` (checklist de código senior, Angular 22 Signals, SSR).