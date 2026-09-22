# LAW8 Admin Console

Angular front end for the LAW8 platform-admin console. It talks to the Tenancy
service and covers tenant onboarding, subscriptions, on-prem licensing, master
data, platform users and roles, and the audit trail. Arabic and English, RTL
aware, with a shared design system in `src/styles.scss`.

## Features

- **Tenants** — registration wizard (cloud and on-prem), organization details,
  provisioning status, seats, attachments.
- **Subscriptions** — billing cycles, seat changes, suspend/cancel, history.
- **Licensing** — activation keys for on-prem installs, activations, renewals.
- **Master data** — regions, countries, currencies, products, features,
  organization types.
- **Users & roles** — platform users and the role permission matrix.
- **Dashboard & audit** — live metrics, per-currency revenue, header
  notifications, and a readable change log.

## Getting started

Requires Node 20+ and a running Tenancy API (see `src/environments`).

```bash
npm install
npm start
```

The app runs at `http://localhost:4200/` and reloads on save.

## Common commands

```bash
npm run build                            # production build into dist/
npm test                                 # unit tests (Vitest)
npx ngc -p tsconfig.app.json --noEmit    # type-check code and templates
```

## Project layout

```
src/app/core        API client, auth, models, shared UI pieces and validators
src/app/features    One folder per area (tenant, subscriptions, setup, ...)
src/app/layout      Shell: sidebar, header, admin layout
public/assets/i18n  ar.json / en.json translation files (keys must match)
```

## Conventions

- Every user-facing string goes through `TranslationService`; `ar.json` and
  `en.json` must stay key-for-key identical.
- Forms put the Arabic name before the English one.
- Lists use the shared `app-ui-pager` (10 rows by default) and show the newest
  records first.
- Create and edit happen in `ui-modal` dialogs, not separate pages.
