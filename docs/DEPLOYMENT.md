# Deployment

The application is a standard Next.js App Router project with **no backend, database or environment
variables**. Any Node.js host works; Vercel is the documented target.

## Requirements

- Node.js 20.x or newer (LTS). Next.js 16 requires Node 18.18+; 20 LTS is recommended.
- npm 9+ (the repository ships a `package-lock.json`).

## Local commands

```bash
npm install          # install dependencies
npm run dev          # development server → http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest unit tests
npm run test:e2e     # playwright end-to-end tests
```

> `npm run test:e2e` builds and starts the app automatically via the Playwright `webServer`
> configuration and reuses an already-running server on port 3000 when one exists.
> Install the browser once with `npm run test:e2e:install` (Chromium).

## Environment variables

**None are required.** The calculator is entirely client-side. There is no `.env` file to create,
and no API keys are used or stored.

## Deploy to Vercel via GitHub integration (recommended)

1. Create a repository and push the project:

   ```bash
   git init
   git add .
   git commit -m "Casio fx-991EX web emulator"
   git branch -M main
   git remote add origin https://github.com/<your-account>/<your-repo>.git
   git push -u origin main
   ```

2. Sign in to <https://vercel.com> and choose **Add New… → Project**.
3. Import the GitHub repository. Vercel auto-detects the framework (**Next.js**).
4. Leave **Build Command** (`next build`), **Output Directory** (`.next`) and **Install Command**
   (`npm install`) at their defaults. Do **not** add environment variables.
5. Press **Deploy**. Every later push to `main` produces a production deployment; other branches get
   preview deployments.

## Deploy with the Vercel CLI (alternative)

```bash
npm install -g vercel
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

The CLI reads the same auto-detected settings; no configuration is required.

## Static export (optional)

Because there is no server-side logic, the app can also be exported as fully static files:

```bash
# next.config.ts → export default { output: "export" }
npm run build      # writes ./out
```

The `out/` directory can then be hosted on any static host. Note that caching options such as
`cacheComponents` should be reviewed before switching to `output: "export"`.

## Verifying a deployment

After deploying, confirm in the dashboard that the build succeeded, then open the deployment URL and
check that pressing `7 × 8 =` shows `56`. Deployment success should never be assumed without
checking the build log and the live URL.
