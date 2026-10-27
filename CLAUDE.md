# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A "public service" (utilities) app built on **react-boilerplate 3.7** (React 16.6, Redux + redux-saga, Immutable.js, styled-components, react-router 4, react-intl) with a custom **Express + MongoDB (mongoose) + Passport-JWT** API living in the same `server/` process. Most of `app/` is still boilerplate demo code (HomePage/FeaturePage/RepoListItem GitHub-repos demo); the project-specific pieces are `LoginPage`, `MenuPage`, and the `server/` API. The water-meter feature is meant to be keyed by a Telegram `chatId` (currently hard-coded in [app/containers/MenuPage/saga.js](app/containers/MenuPage/saga.js)).

This is a plain JavaScript React project — the global Angular rules do not apply here.

## Commands

Node target is old (`.nvmrc` = `lts/carbon`, Node 8; webpack 4, Jest 23, Babel 7.1). Dependencies are not installed by default (`npm install`; `preinstall` runs a version check).

- `npm start` — dev server: Express on port 3000 (`--port`/`PORT`) with webpack-dev-middleware + HMR, plus the `/api` routes. Requires MongoDB (see Config).
- `npm run build` — production bundle into `build/`; `npm run start:prod` serves it.
- `npm run lint` — ESLint (airbnb + prettier) over the repo; `npm run lint:eslint:fix` to autofix.
- `npm test` — runs lint first (`pretest`), then Jest with coverage. Coverage thresholds in [jest.config.js](jest.config.js) are strict (98% statements/lines/functions, 91% branches) and will fail the run; the custom LoginPage/MenuPage/server code currently has no tests.
- Single test: `npx cross-env NODE_ENV=test jest app/containers/HomePage/tests/saga.test.js` (skips lint and the coverage gate). Tests must live in a `tests/` folder and match `tests/*.test.js`.
- `npm run generate` — plop generators for components/containers/languages (templates in [internals/generators/](internals/generators/)).
- `npm run extract-intl` — extracts react-intl messages into [app/translations/](app/translations/) (`en`, `de`).
- Pre-commit hook runs `lint-staged` (eslint --fix on staged `.js`).

## Config / secrets

[server/config/keys.js](server/config/keys.js) loads `keys.prod.js` when `NODE_ENV=production` (reads env `MONDO_URI` — note the typo — and `JWT`), otherwise `keys.dev.js`. **`keys.dev.js` is gitignored and not present**; create it locally exporting `{ mongoUrl, jwt }` or `npm start` will crash on require.

## Architecture

### Single process: API + frontend
[server/index.js](server/index.js) creates one Express app that:
1. Mounts the frontend via [frontendMiddleware](server/middlewares/frontendMiddleware.js) (dev: in-memory webpack build + catch-all serving `index.html`; prod: static `build/` + catch-all).
2. Connects mongoose, initializes passport with the JWT strategy ([server/middlewares/passport.js](server/middlewares/passport.js)), then registers `/api/auth` and `/api/water-service-meters`.

Gotcha: the frontend middleware (with its `app.get('*')` catch-all) is registered **before** the API routes. The API routes are `POST`, so they still work, but any new `GET /api/...` route will be swallowed by the SPA catch-all unless it's registered before `setup(app, ...)`.

### API (`server/`)
routes → controllers → mongoose models (`users`, `waterServiceMeters`).
- `POST /api/auth/login` — logs in, or **auto-registers** the user if the email doesn't exist. Returns `{ token: "Bearer <jwt>" }` (1h expiry); the `Bearer ` prefix is already included, so the client sends it as-is in `Authorization`.
- `POST /api/water-service-meters` — JWT-protected (`passport.authenticate('jwt', { session: false })`); body `{ chatId }`, returns the meter document.

### Frontend (`app/`)
Standard react-boilerplate structure: `components/` are presentational, `containers/<Feature>/` hold `index.js` + `actions.js`/`constants.js`/`reducer.js`/`saga.js`/`selectors.js`/`messages.js`/`Loadable.js`. Imports resolve from `app/` as a module root (`import X from 'containers/...'`, `'components/...'`, `'utils/...'`).

- Store state is an Immutable `Map` (`redux-immutable`); reducers use `fromJS`/`.set`, selectors use `state.get(...)` with reselect `makeSelect*` factories.
- Reducers/sagas are normally code-split and attached per container via `injectReducer`/`injectSaga` HOCs ([app/utils/](app/utils/)). Exception: the `login` reducer is registered statically in [app/reducers.js](app/reducers.js) **and** injected (with its saga) on the root `App` component, because other features read the token via `makeSelectToken` in [app/containers/App/selectors.js](app/containers/App/selectors.js) (selects `login.token`).
- Login flow: `LoginPage` dispatches `LOGIN_REQUEST` → saga POSTs `/api/auth/login` → `LOGIN_SUCCESS` stores token → saga redirects to `/menu` via `connected-react-router` `push`. The token lives only in Redux (lost on reload).
- `MenuPage` injects the `menu` slice; its saga selects the token and calls the water-meters API.
- Routes are declared in [app/containers/App/index.js](app/containers/App/index.js). Pages are lazy-loaded through each container's `Loadable.js` (`MenuPage` is currently imported directly).
- Custom sagas use raw `fetch` rather than [app/utils/request.js](app/utils/request.js), so non-2xx responses are not thrown as errors.

`internals/` holds webpack configs, Jest setup, generators, and `internals/templates/` (used by `npm run clean` to reset the app to a blank boilerplate — don't run it).
