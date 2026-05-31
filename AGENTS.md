# solid-gallery

Desktop gallery app: SolidJS + Vite + Tailwind CSS + Electron + SQLite.

## 核心规则

- 回答使用中文
- 只回答与项目相关的内容，避免无关信息

## Commands

| Command | Action |
|---------|--------|
| `npm start` | Dev server at `http://localhost:3000` |
| `npm run build` | Production build via Vite (output: `dist/`) |
| `npm run lint` | ESLint on `src/**/*.tsx` |
| `npm run compile:tailwind` | Watch-compile Tailwind `src/style/input.css` → `output.css` |
| `npm run dev:electron` | Launch Electron directly (requires dev server running) |
| `npm run package` | `npm run build` + electron-builder (output: `app/`) |
| `npm run serve` | Vite preview of production build |

No test framework is configured — there are no test scripts or dependencies.

## Architecture

- **Entrypoints**: `main.js` (Electron main process), `src/index.tsx` (SolidJS renderer mount)
- **Router**: `@solidjs/router` with HashRouter. Routes: `/:mode` (gallery), `/Folder`, `/pack/:id`
- **Styling**: Tailwind CSS + Less + CSS modules (mixed approach)
- **State**: Custom "shair" reactive library wraps Solid primitives (`src/utils/shair/`)
- **Desktop**: Frameless (`frame: false`), transparent (`transparent: true`), custom window controls in `src/components/top-bar/`
- **HTTP server**: `ImgServer` on port 8081 (`src/server/imgServer.ts`) receives images from a browser extension
- **Crawler**: `src/crawler/fa24.ts` scrapes 24fa.link galleries
- **DB**: SQLite via `sqlite3` npm package (`src/utils/sql/`), schema managed programmatically (no migrations)
- **Thumbnails**: Multi-threaded image compression via Web Workers (`src/utils/functions/worker-thread.js`)

## Key Quirks

- **`nodeIntegration: true` and `contextIsolation: false`** in Electron — full Node.js access in renderer, never use IPC for FS/DB calls
- **Lockfile is `package-lock.json`** — ignore README mention of pnpm
- **`endOfLine: crlf`** in Prettier config — Prettier enforces Windows line endings
- **`noImplicitAny: false`** in tsconfig — TypeScript accepts implicit `any`
- **`preload.js` referenced in package.json but does not exist** — electron-builder will warn
- **Dead/unused code**: `src/utils/a.js`, `App.module.css`, `public/index.html`
- **R18 filter enabled by default** in `src/types/appConfig/config.ts`
- **Console easter egg**: `verifyCode('yty7895123')` sets a localStorage code
- **`sharp` must be unpacked from ASAR** — `asarUnpack` includes `sharp` and `@img/*` in electron-builder config
- **SQL injection risk**: `transformToSQL` builds queries via string interpolation
- **Hardcoded Windows paths** in default config (`E:/图片`, `D:/setu`)
- **Build externalizes `sharp`** in vite config (`rollupOptions.external: ['sharp']`) since it's a native module loaded by Electron
