# Line Item App

Line-Item is a web app for configuring products and generating priced sales quotes. Users define
products with configurable inputs (options, dropdowns, custom values) and price adders, then
build multi-item quotes by selecting products, choosing configurations, and letting the app
calculate line-item and system pricing automatically.

## Features

- **Product builder** — create products with a name/description, a set of configurable inputs
  (dropdown or custom), and price "adders" that apply based on selected options.
- **Product code formulas & price dictionary** — each unique combination of input selections
  resolves to a product code, which is looked up in a price dictionary to determine the base
  price.
- **Quote builder** — assemble quotes made up of one or more systems, each containing line items
  built from configured products, with adders, quantities, and computed pricing.
- **Light/dark/system theming** — theme preference is persisted and respects the OS preference
  when set to "system".
- **Authentication** — user sign-in via Auth0 (Authorization Code flow with refresh tokens).

> **Note:** Product persistence currently uses browser `localStorage` (seeded from
> `public/data/products.json` on first load) rather than a live backend, so the app works
> entirely client-side today. An HTTP-based `ProductService` is scaffolded for a future API
> integration.

## Tech Stack

- **[Angular](https://angular.dev) 21** (standalone components, signals, new control-flow syntax)
- **TypeScript**
- **RxJS** for async state and event streams
- **Tailwind CSS 4** for styling
- **Auth0** (`@auth0/auth0-angular`) for authentication
- **Vitest** (via `@angular/build:unit-test`) for unit testing
- **AWS S3 + CloudFront** for hosting, deployed via **GitHub Actions**

## Architecture

The app follows an Angular workspace convention that groups code by **feature domain**, and
within each domain, by **role**:

- `feature/` — routed, top-level pages for a domain (e.g. list/edit/new pages).
- `ui/` — presentational components reused within a domain (dumb/reusable UI pieces).
- `data-access/` — services that own state and talk to storage/HTTP (e.g. `*.service.ts`).
- `interfaces/` — TypeScript types/interfaces for the domain's models.
- `utils/` — pure helper functions.

State management is handled with Angular **signals** for local/UI state and **RxJS `Subject`**
as an action/reducer-style pattern inside services (e.g. `LayoutService`), rather than a separate
state management library. Components are standalone (no `NgModule`s), and routes are lazy-loaded
per feature domain via `loadChildren`.

Routing is nested under a shell `LayoutComponent` (sidebar + topbar) with child routes for each
feature area (`products`, `quotes`, `preferences`, `profile`).

### Data flow (products & quotes)

1. Products are defined in the **product builder** (`products/feature/*`), each with inputs,
   adders, and a price dictionary.
2. `ProductHttpService` (`shared/data-access/product.http.service.ts`) persists products to
   `localStorage`, falling back to the seed data in `public/data/products.json` on first run.
2. In the **quote builder** (`quotes/feature/quote-new`), users select products, configure their
   inputs/adders, and the app computes item and system pricing, aggregating into a `QuoteModel`.

## Project Structure

```
src/
├── app/
│   ├── layout/                 # App shell: sidebar, topbar, breadcrumbs, theme state
│   │   ├── data-access/        #   LayoutService (sidebar/theme/breadcrumb state)
│   │   ├── ui/                 #   Sidebar, topbar, app-info components
│   │   └── layout.component.*
│   │
│   ├── products/                # Product configuration domain
│   │   ├── data-access/        #   Product list/edit services
│   │   ├── feature/             #   Routed pages: list, new, edit, edit-adders, edit-prices
│   │   ├── interfaces/          #   Product, ProductInput, ProductAdder, PriceDictionary, etc.
│   │   ├── ui/                  #   Reusable input/adder option components
│   │   ├── utils/               #   Product helper functions (e.g. product code generation)
│   │   └── products.routes.ts
│   │
│   ├── quotes/                  # Quote building domain
│   │   ├── data-access/        #   QuoteNewService
│   │   ├── feature/             #   Routed page: new quote
│   │   ├── interfaces/          #   QuoteModel, QuoteItem, QuoteSystem, etc.
│   │   ├── ui/                  #   Product selector, quote item/adder/input components
│   │   └── quotes.routes.ts
│   │
│   ├── preferences/             # User preferences page
│   ├── profile/                 # User profile edit page
│   │
│   ├── shared/                   # Cross-domain code
│   │   ├── data-access/          #   Auth, HTTP, local-storage services
│   │   ├── ui/                    #   Icons, shared directives
│   │   └── utils/
│   │
│   ├── app.config.ts             # Application-wide providers (router, HTTP, Auth0)
│   ├── app.routes.ts             # Top-level route table
│   └── app.ts                    # Root component
│
├── environments/                 # Environment-specific config (dev/prod, Auth0, API URL)
├── index.html
├── main.ts
└── styles.css / theme.css        # Tailwind entrypoint & theme variables

public/
└── data/products.json            # Seed product data loaded on first run

.github/
├── workflows/                    # CI/CD: deploy to dev, promote/rollback to prod
└── actions/deploy-app-steps/     # Shared composite action (S3 sync + CloudFront invalidation)
```

## Development

### Prerequisites

- Node.js `24.14.1` (see `engines` in `package.json`)

### Setup

```bash
npm install
```

### Local development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on source changes.

### Build

```bash
npm run build
```

Production build artifacts are output to `dist/line-item-app/`.

### Unit tests

```bash
npm test
```

Runs unit tests via Vitest.

## Deployment

The app is deployed to AWS (S3 + CloudFront) through GitHub Actions:

- **`deploy.yml`** — builds and deploys to the `dev` environment on every push to `master`.
- **`promote-or-rollback.yml`** — promotes a previously built artifact to production, or rolls
  back to a prior version.

Build artifacts are versioned by commit SHA and uploaded to an S3 artifact bucket before being
synced to the environment's hosting bucket, with a CloudFront invalidation to refresh the CDN.
