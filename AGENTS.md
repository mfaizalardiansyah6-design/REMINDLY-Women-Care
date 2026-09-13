# REMINDLY — Agent Instructions

## Project overview

Laravel 13 + React 19 SPA. Sanctum cookie-based auth. All API routes use `web` middleware under `/api/v1`. MySQL in production; in-memory SQLite for tests. UI text is Indonesian.

## Quick commands

```bash
composer setup              # Full setup (deps, key, migrate, seed, build)
composer test               # Clears config cache, then runs php artisan test
php artisan test --filter=Reminder   # Single feature test
composer dev                # Runs `php artisan dev` with no timeout (artisan dev)
php artisan serve           # Backend on :8000
npm run dev                 # Vite dev server on :5173
php artisan schedule:work   # Reminder notification scheduler
```

## Architecture

### Backend (`app/`)
- `Http/Controllers/Api/V1/` — one controller per domain (14 controllers)
- `Http/Requests/Api/` — FormRequest validation (17 request classes)
- `Http/Resources/` — API Resources for JSON output (14 resource classes)
- `Policies/` — per-model authorization (12 policies; always use `$this->authorize()`)
- `Services/` — ReminderService, PeriodService, ReminderParserService
- `Models/` — 14 Eloquent models (User, Reminder, Note, Task, Category, Location, etc.)
- `Console/Commands/ProcessReminderNotifications.php` — `reminders:process` artisan command

### Frontend (`resources/js/`)
- `app.jsx` — React Router entry with AuthProvider, ThemeProvider, ToastProvider
- `pages/` — one file per page (20 pages)
- `components/ui/` — shared primitives (Button, Card, Modal, Badge, Input, Select, etc.)
- `components/layout/` — AppLayout, AuthLayout
- `api/` — axios modules per domain; `client.js` is the shared axios instance
- `context/` — AuthContext, ThemeContext, ToastContext
- `lib/cn.js` — simple className joiner (no clsx/tailwind-merge)
- `lib/errors.js` — `getApiErrors(err, fallback)` for extracting Laravel validation errors

### Routes (`routes/api.php`)
All routes are prefixed with `/api/v1` and wrapped in `web` middleware. Auth routes have `throttle:auth`. Authenticated routes use `auth` middleware. All models are owned by a user (user-scoped queries).

### Database (`database/`)
- 17 migrations, 13 factories, single DatabaseSeeder
- Demo account: `demo@remindly.test` / `password123`

## Conventions

### PHP
- Uses Laravel 13 PHP attributes (`#[Fillable]`, `#[Hidden]`) instead of `$fillable`/`$hidden` arrays
- Eloquent casts declared via `casts()` method (not `$casts` property)
- Controllers inject services via constructor DI
- Always authorize via `$this->authorize()` in controllers; policies exist for every model
- Return resources directly from controllers (e.g. `return new XResource($model)`); Laravel auto-wraps in `{data: ...}`. Frontend unwraps via `r.data.data ?? r.data`

### Frontend
- React 19, JSX (not TSX), no TypeScript
- Tailwind CSS v4 with custom blush/lavender palette
- Vite 8 with laravel-vite-plugin
- Key frontend libs: `motion` (animations), `lucide-react` (icons), `recharts` (charts), `react-router-dom` v7
- Axios client auto-fetches CSRF cookie before every non-GET request
- 401 responses dispatch `auth:unauthorized` custom event
- `cn()` helper for conditional classes (no clsx/tailwind-merge)
- Glass materials via `.glass` / `.glass-strong` / `.hairline` CSS classes

### Testing
- PHPUnit 12, Feature tests only (10 test files)
- Tests use `RefreshDatabase` trait
- CSRF middleware is explicitly disabled in setUp: `$this->withoutMiddleware(ValidateCsrfToken::class)`
- Tests use `actingAs()` helper for auth; factory-based data
- All tests hit `/api/v1/*` endpoints
- Demo/test data uses factories for all models

### Styling
- 4-space indentation (`.editorconfig`)
- LF line endings

### AI rules
- `.ai/rules/` contains per-file-path conventions (read `.ai/rules/index.md` for the lookup table)
- `.ai/rules/app.md` — strip UTF-8 BOM when generating PHP files via PowerShell

## Gotchas

- `.npmrc` has `ignore-scripts=true`; `composer setup` runs `npm install --ignore-scripts` — postinstall scripts are skipped
- `seederr.txt` documents a known issue: `Reminder::factory()` was undefined at some point. If seeding fails, check that `ReminderFactory` exists in `database/factories/` and the model uses `HasFactory`
- Sanctum stateful domains must include both `localhost:8000` (backend) and `localhost:5173` (Vite dev) in `.env`
- The `composer test` script clears config cache before running `php artisan test` — prefer it over raw `php artisan test` to avoid stale config
- PowerShell can write UTF-8 BOM when generating multiple PHP files via here-strings — see `.ai/rules/app.md` for the fix
