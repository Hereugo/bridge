# Troubleshooting

## `ChunkLoadError` (failed to load `/_next/static/chunks/...`)

Usually **stale browser cache** or a **corrupt `.next` folder** after switching branches, changing dependencies, or stopping the dev server mid-compile.

### Fix

1. **Stop** `next dev`.
2. **Delete the build output:**
   ```bash
   rm -rf apps/web/.next
   ```
3. In the browser: DevTools → **Application** → **Service workers** → **Unregister** (if any) → **Clear site data**.
4. **Start again:** `npm run dev -w apps/web`
5. Hard reload: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows/Linux).

## `Cannot find module './383.js'` (or similar under `.next/server`)

The **server bundle is out of sync** with what webpack expects (stale `.next`, interrupted build, or mixed `next dev` / `next start`).

### Fix

```bash
rm -rf apps/web/.next
npm run dev -w apps/web
```

If it persists:

```bash
rm -rf apps/web/.next node_modules apps/web/node_modules
npm install
npm run dev -w apps/web
```

## `ERR_CONNECTION_REFUSED` on `:3000`

Start the web app: `npm run dev -w apps/web`.

## Multiple `package-lock.json` warning

If Next warns about a lockfile outside this repo (e.g. in your home directory), run dev from `bridge/` and avoid a stray `~/package-lock.json` unless you need it.
