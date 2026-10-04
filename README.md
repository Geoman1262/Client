# Cellix SmartFlow Balance — Cloudflare V1

All project files are intentionally in the repository root. There are NO nested source folders.

Files:
- index.js
- package.json
- wrangler.jsonc
- .gitignore
- README.md

Cloudflare settings:
Build command:
    npm install

Deploy command:
    npx wrangler deploy

Cloudflare Workers + Browser Run are used. The Worker entry point is root-level `index.js`.

Add these as Cloudflare Secrets:
- SMARTFLOW_USERNAME
- SMARTFLOW_PASSWORD
- ADMIN_TEST_TOKEN

Do not put credentials in GitHub.

After deployment, the diagnostic endpoint is:
`/admin/diagnostic`

Send the `x-admin-token` header with the value of ADMIN_TEST_TOKEN.

The customer lookup remains intentionally unconnected to guessed SmartFlow selectors until the diagnostic identifies the real Report page.


MOBILE TEST
After deployment, you can open:
    /admin/diagnostic?token=YOUR_ADMIN_TEST_TOKEN

The token is only for this temporary diagnostic test. Do not post the URL or token publicly.


VERSION: CELLIX-SMARTFLOW-V2-FLAT-2026-10-04
