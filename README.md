# Cellix SmartFlow Balance — Cloudflare V1

This version is specifically built for Cloudflare Workers + Browser Run.

It does NOT use Express, standard Playwright, or a static-assets directory.
It uses Cloudflare's `@cloudflare/puppeteer` and a Browser Run binding.

## 1. Cloudflare secrets

In Cloudflare Workers → Settings → Variables and Secrets, add:

- `SMARTFLOW_USERNAME` — your SmartFlow username
- `SMARTFLOW_PASSWORD` — your SmartFlow password
- `ADMIN_TEST_TOKEN` — any long random value used only for the diagnostic endpoint

Do NOT put these values in GitHub or source code.

## 2. Browser Run

The Wrangler config already contains:

"browser": { "binding": "BROWSER" }

Cloudflare will provide the Browser Run binding.

## 3. Deploy

Build command:
    npm install

Deploy command:
    npx wrangler deploy

Do NOT use a Static Site / assets directory.

## 4. First test

After deployment, open:

    https://YOUR-WORKER-DOMAIN/admin/diagnostic

and send this header:

    x-admin-token: YOUR_ADMIN_TEST_TOKEN

The diagnostic logs into SmartFlow and returns:
- final URL
- page title
- visible page text
- links
- buttons

This is the information needed to map the exact Report page.

## 5. Important

The customer `/api/check` endpoint is intentionally not wired to guessed SmartFlow selectors yet.
After the first diagnostic succeeds, the exact Report URL/search controls/status columns can be mapped and the final lookup can be completed.

This avoids guessing the SmartFlow internals and breaking the deployment.
