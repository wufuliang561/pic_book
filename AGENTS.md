# Repository Guidelines

## Project Structure & Module Organization
- `index.tsx` mounts the React root and wires routing/state; `App.tsx` orchestrates onboarding, upload, generation, and result screens.
- `components/` houses presentational units: screen components, the shared `ProgressBar`, and illustration assets under `components/illustrations/`.
- `services/geminiService.ts` contains Gemini API calls; keep client code here to isolate retry and quota handling.
- `static/images.ts` centralizes local artwork metadata, while `types.ts` defines shared enums and view models.
- `metadata.json` and `vite.config.ts` hold app metadata and bundler wiring; adjust them when changing deployment targets.

## Build, Test, and Development Commands
- `npm install` installs dependencies; re-run after updating `package.json`.
- `npm run dev` launches the Vite dev server on localhost with hot module reload.
- `npm run build` produces the production bundle in `dist/`; use before packaging or deploying.
- `npm run preview` serves the built assets locally to validate the optimized build.

## Coding Style & Naming Conventions
- Use TypeScript with React functional components; prefer 2-space indentation and explicit types on exported members.
- Name files in PascalCase for components (`GeneratingScreen.tsx`) and camelCase for utilities (`geminiService.ts`).
- Co-locate screen-specific styles/assets near their component; keep cross-cutting helpers in `services/` or new `utils/` modules.
- When adding formatting, align with Vite defaults and run your editor’s Prettier integration before committing.

## Testing Guidelines
- Vitest with React Testing Library is the expected stack; add a future `npm test` script invoking `vitest run`.
- Place component specs beside source files as `<Component>.test.tsx`; integration flows can live under `tests/`.
- Target at least smoke coverage for each screen (render + critical interaction) and mock Gemini responses to avoid live calls.
- Document any manual QA steps in the pull request when automated coverage is not yet available.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`) as seen in history; keep summaries under 60 characters.
- Squash work-in-progress commits locally; ensure diff builds and linting pass before pushing.
- Pull requests must include a concise summary, linked issue or task ID, screenshots/GIFs for UI changes, and rollout considerations.

## Security & Configuration Tips
- Store the `GEMINI_API_KEY` only in `.env.local` and never commit secrets; document required variables in README updates.
- Use `services/geminiService.ts` for all Gemini interactions so retry limits, timeouts, and request attribution remain centralized.
