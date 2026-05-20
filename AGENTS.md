# Healthity Frontend

## Project Summary

Healthity is a Telegram WebApp frontend for helping people build and maintain healthy habits. The product focuses on activity tracking, wellness routines, reminders, and light gamification around personal health.

The app is intended to support use cases such as:

- reminding a person to stand up after sitting too long;
- sending recurring Telegram reminders for health, fitness, food, water, meditation, or other custom habits;
- tracking daily activity progress and personal goals;
- motivating users through character progress, levels, backgrounds, items, and friendly competition;
- letting users customize their visual environment and character-related activity setup.

The deployed backend is available at:

- `https://healthity.ru`
- API default: `https://healthity.ru/api/v1`

Backend repository context:

- `https://github.com/Limoliyalo/backend.git`

## Tech Stack

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Nuxt UI
- Nuxt Icon
- Nuxt Image
- Tailwind CSS
- Telegram WebApp SDK
- Firebase deployment tooling

The app is client-rendered:

```ts
ssr: false
```

## Important Commands

```bash
npm run dev
npm run build
npm run generate
npm run preview
npm run deploy
npx eslint app
```

If port `3000` is busy, run Nuxt on another port:

```bash
npm run dev -- --host 127.0.0.1 --port 3010
```

## High-Level Architecture

The project uses Nuxt's `app/` directory structure:

- `app/app.vue` - root app shell and startup loader gate.
- `app/pages/` - route pages.
- `app/layouts/` - shared page layouts.
- `app/components/` - reusable UI and feature components.
- `app/stores/` - Pinia stores for domain state and API loading.
- `app/composables/` - shared composables, including API access.
- `app/plugins/` - client plugins such as Telegram WebApp init.
- `app/types/` - TypeScript API/domain types.
- `app/assets/` - local images, video, and global CSS.

## Startup Flow

The app has a centralized startup/bootstrap process in:

```text
app/stores/app-bootstrap.store.ts
```

On app entry:

1. Telegram init data is read in `app/plugins/initTelegram.client.ts`.
2. `app/app.vue` shows `AppLoader` until bootstrap is ready.
3. Bootstrap validates/registers the backend user.
4. It loads the character, user statistics, active background, activities, character items, and item positions for the active background.
5. It preloads critical images before showing the main UI.
6. Secondary data such as shop catalog, categories, and settings is warm-loaded after the first stable render.

This exists to prevent the home screen from flickering while backgrounds, items, and progress data are still loading.

## Data Loading Rules

Prefer centralized store loading over component-level API calls.

Use `ensure*Loaded()` methods for normal page/component reads:

```ts
await userStore.ensureUserStatisticLoaded()
await itemsStore.ensureItemsCatalogLoaded()
```

Use `force = true` after mutations or retry flows, when cached data may be stale:

```ts
await userStore.loadUserStatistic(true)
await characterStore.loadMyCharacter(true)
```

Avoid putting direct API calls inside small visual components. Components such as progress bars, level badges, and activity lists should mostly read Pinia state and render it.

## API Layer

The shared API helper is:

```text
app/composables/useApi.ts
```

It uses `runtimeConfig.public.apiBase`, defaulting to:

```text
https://healthity.ru/api/v1
```

Override it with:

```bash
NUXT_PUBLIC_API_BASE=<api-url>
```

API errors use a structured `ApiError` with `status`, `url`, and `body`. Prefer:

```ts
isApiStatus(error, 404)
```

over parsing error text.

## Domain Stores

Important stores:

- `user.store.ts` - Telegram user, auth init data, statistics, settings.
- `character.store.ts` - current character and registration state.
- `activities.store.ts` - activity type catalog, base activities, daily activity progress.
- `backgrounds.store.ts` - background catalog, purchased/equipped backgrounds, active home background.
- `items.store.ts` - item catalog, character items, active item positions per background.
- `categories.store.ts` - item categories.
- `friends.store.ts` - friends and friend profile info.
- `notifications.store.ts` - Telegram notification/reminder status.
- `app-bootstrap.store.ts` - app startup orchestration and loader state.

Many stores use:

- loaded flags;
- in-flight promise dedupe;
- computed maps for fast id lookup;
- `force` parameters for explicit refresh after mutations.

## UI and Product Notes

The app is a Telegram Mini App, so UI should stay compact, touch-friendly, and mobile-first.

Avoid building marketing/landing-page style screens. The main experience should be the usable health tracking interface.

Important visible areas:

- home screen with active background and positioned items;
- activity picker;
- profile/activity progress;
- shop for items and backgrounds;
- settings for reminders/quiet hours;
- friends screen;
- character registration flow.

Loader behavior:

- `AppLoader` uses `app/assets/Loader.png` as a full-screen image.
- Progress UI is rendered over the image.
- If startup lasts more than 30 seconds, show the user a message to reopen the app.

## Telegram and Reminders

Telegram WebApp init is handled client-side. The frontend reads Telegram user/init data and sends authenticated API requests using the init data as a bearer token.

The product direction includes health reminders in Telegram, for example:

- stand up after sitting too long;
- drink water;
- log food;
- exercise;
- meditate;
- any other custom recurring wellness reminder.

Reminder and quiet-time UI lives under settings-related components and notification stores.

## Development Guidelines

- Keep global data loading in stores/bootstrap, not leaf components.
- Prefer `ensure*Loaded()` for read paths and `load*(true)` after writes.
- Do not parse HTTP statuses from error strings.
- Do not add debug-only UI such as fake money buttons.
- Avoid `alert()` for normal UX; use component state or Nuxt UI feedback.
- Use computed maps when repeatedly looking up entities by id.
- When changing background/item equip logic, distinguish entity ids from join-record ids.
- After frontend changes, verify with `npm run build`.
- For UI changes, also check the local app in browser.

## Known Build Notes

Nuxt Fonts may warn when external font provider metadata cannot be fetched in restricted network environments. The production build can still pass.

`npx eslint app` currently passes with warnings only. Existing warnings are mostly Vue template style warnings such as self-closing HTML void elements and attribute order.
