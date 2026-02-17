# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## UMC auto-sync (every 24h)

1. Copy `.env.umc.example` to `.env.umc` and fill:
   - `UMC_PORTAL_URL`, `UMC_PHONE`, `UMC_PASSWORD`
   - login selectors + table selectors/column indexes for your UMC page
2. Run one-time sync:
   - `npm run sync:umc`
3. Schedule every 24h (Windows Task Scheduler):
   - Program: `npm`
   - Arguments: `run sync:umc`
   - Start in: project folder

The script writes `public/data/umc-complaints.json`.
The script also upserts UMC complaints into Neon when `DATABASE_URL` is set.

## Neon database setup

1. Copy `.env.server.example` to `.env.server`
2. Set:
   - `DATABASE_URL=postgresql://<your-neon-connection-string>`
   - `PORT=4000` (optional)
3. Run migration:
   - `npm run db:migrate`
4. Start backend:
   - `npm run server`
5. Start frontend in another terminal:
   - `npm run dev`

Vite proxies `/api` to `http://localhost:4000`.

## Import existing complaint data

If you exported old local data into a JSON file:

- `npm run import:complaints -- <path-to-json>`

The importer upserts using `(portal_name, complaint_id)` so duplicates are not created.
