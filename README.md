# DOP — Digital Oil Properties Global

Premium, responsive B2B energy marketplace demonstration built with Vite, React and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Production build: `npm run build`. The static output is written to `dist/`.

## Demo accounts

- Customer: `buyer@dop.demo` / `Demo123!`
- Admin: `admin@dop.demo` / `Demo123!`

These are illustrative local credentials, not secure authentication. Data, catalog changes, favorites, quote basket and sessions are stored only in the current browser's `localStorage`.

## Architecture and boundaries

- `HashRouter` provides static-host-safe navigation.
- Reusable catalog, product, quote, authentication, account and admin views share typed local state.
- The quote flow does not send data externally and no payment is captured.
- Product pricing, inventory, certifications, logistics and availability are not represented as live or verified.

For production, replace local demo state with a secured backend, database, server-side validation, audited role-based authentication, product/inventory services, RFQ workflow, document storage, observability and appropriate compliance controls. Add a regulated payment provider only after legal/commercial review; never handle card data directly.

## GitHub Pages

The included Actions workflow builds and deploys `dist/`. In repository Settings → Pages, select **GitHub Actions** as the source. No repository or external deployment is created by this project itself.
