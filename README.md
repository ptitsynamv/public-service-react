# Public Service React

[![React](https://img.shields.io/badge/React-16.6-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-4.0-764ABC?logo=redux&logoColor=white)](https://redux.js.org/)
[![Redux-Saga](https://img.shields.io/badge/Redux--Saga-0.16-999999?logo=reduxsaga&logoColor=white)](https://redux-saga.js.org/)
[![Express](https://img.shields.io/badge/Express-4.16-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%205-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Webpack](https://img.shields.io/badge/Webpack-4-8DD6F9?logo=webpack&logoColor=black)](https://webpack.js.org/)
[![Node](https://img.shields.io/badge/Node-8.x%20(lts%2Fcarbon)-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Build Status](https://img.shields.io/travis/com/ptitsynamv/public-service-react/master?logo=travis)](https://app.travis-ci.com/github/ptitsynamv/public-service-react)

A full-stack web app for checking household utility data. You log in and view your water meter readings (cold and hot water, kitchen and bathroom). Each reading set is keyed by a Telegram `chatId`, so it can pair with a Telegram bot.

The frontend is built on [react-boilerplate](https://github.com/react-boilerplate/react-boilerplate) 3.7. The Express + MongoDB REST API runs in the same Node process.

> **Status:** early work in progress. Some boilerplate demo pages, such as the GitHub repos list on the home page, are still in the app.

---

## Features

- **JWT authentication:** email and password login, with Passport-JWT protecting the API routes. Logging in with an email that isn't registered yet creates the account automatically.
- **Water meter readings:** shows cold and hot water readings for the kitchen and bathroom, stored per Telegram `chatId` in MongoDB.
- **Single-process full stack:** one Express server serves both the React app and the `/api` endpoints.
- **Predictable state:** Redux with Immutable.js, side effects in redux-saga, and memoized selectors from reselect.
- **Code splitting:** pages load lazily through `loadable-components`, and their reducers and sagas are injected when the page mounts.
- **Developer experience:** hot module reloading in development, plop generators for new components and containers, ESLint + Prettier, and a pre-commit lint hook.
- **i18n-ready:** react-intl with English and German translation catalogs.

## Tech stack

| Layer    | Technologies                                                                               |
| -------- | ------------------------------------------------------------------------------------------ |
| Frontend | React 16, React Router 4, Redux, redux-saga, Immutable.js, reselect, styled-components, react-intl |
| Backend  | Node.js, Express 4, Mongoose 5, Passport + passport-jwt, jsonwebtoken, bcryptjs            |
| Tooling  | Webpack 4, Babel 7, Jest 23 + Enzyme, ESLint (Airbnb) + Prettier, plop                     |

---

## Prerequisites

| Requirement | Version                     | Notes                                                       |
| ----------- | --------------------------- | ----------------------------------------------------------- |
| Node.js     | **8.x** (`lts/carbon`)      | Pinned in [.nvmrc](.nvmrc). Node 10 usually works too.      |
| npm         | **≥ 5**                     | Checked by a `preinstall` script.                           |
| MongoDB     | 3.6+ (local or Atlas)       | Needed for login and meter data.                            |
| Git         | any                         |                                                             |

### ⚠️ Legacy Node compatibility

This project uses a 2018 toolchain: webpack 4, Babel 7.1, Jest 23 and native image-optimization binaries. **It will not build on current Node releases.** On Node 17 and later, webpack 4 fails with `ERR_OSSL_EVP_UNSUPPORTED`, and some native dependencies fail to install. Use a Node version manager to switch to the pinned version:

**macOS / Linux ([nvm](https://github.com/nvm-sh/nvm)):**

```bash
nvm install    # reads .nvmrc -> lts/carbon (Node 8)
nvm use
```

**Windows ([nvm-windows](https://github.com/coreybutler/nvm-windows)):** this tool doesn't read `.nvmrc`, so give it the version explicitly.

```bash
nvm install 8.17.0
nvm use 8.17.0
```

If you have to stay on a newer Node, you can work around the OpenSSL error with `NODE_OPTIONS=--openssl-legacy-provider`. This setup is not supported, though.

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/ptitsynamv/public-service-react.git
cd public-service-react
nvm use              # or: nvm use 8.17.0 on Windows
npm install
```

### 2. Configure the server

The development config file is git-ignored, so you need to create it yourself. **Without it, `npm start` crashes on startup.**

Create `server/config/keys.dev.js`:

```js
module.exports = {
  mongoUrl: 'mongodb://localhost:27017/public-service',
  jwt: 'replace-with-a-long-random-secret',
};
```

In production (`NODE_ENV=production`), the server reads [server/config/keys.prod.js](server/config/keys.prod.js) instead, which takes its values from environment variables:

| Variable    | Purpose                                                    |
| ----------- | ---------------------------------------------------------- |
| `MONDO_URI` | MongoDB connection string (the name is spelled like this in the code) |
| `JWT`       | Secret used to sign and verify JWTs                        |
| `PORT`      | HTTP port (default `3000`)                                 |
| `HOST`      | Bind host (optional)                                       |

### 3. Start MongoDB

Use a local `mongod`, Docker, or an Atlas cluster. With Docker:

```bash
docker run -d --name public-service-mongo -p 27017:27017 mongo:4.4
```

### 4. Run the app

```bash
npm start
```

Open **http://localhost:3000**. The webpack dev middleware compiles the frontend in memory and enables hot reloading.

### 5. (Optional) Seed meter data

The app has no endpoint for creating meter readings yet, so add a document manually. The `chatId` must match the one the client sends, which is currently hard-coded in [app/containers/MenuPage/saga.js](app/containers/MenuPage/saga.js):

```js
// mongosh mongodb://localhost:27017/public-service
db.waterServiceMeters.insertOne({
  chatId: 280601079,
  coldWaterKitchen: '00123',
  coldWaterBathroom: '00456',
  hotWaterKitchen: '00078',
  hotWaterBathroom: '00090',
});
```

Then go to `/login`, sign in with any email and password (the account is created on first login), and click the water-meter button on `/menu`.

---

## Available scripts

| Command                    | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `npm start`                | Dev server with hot reloading (`--port <n>` to change the port)       |
| `npm run start:tunnel`     | Dev server exposed through an ngrok tunnel                           |
| `npm run build`            | Production build into `build/`                                       |
| `npm run start:prod`       | Serve the production build (`NODE_ENV=production`)                   |
| `npm run start:production` | Test, build, and serve in one step                                   |
| `npm run lint`             | ESLint over the whole project                                        |
| `npm run lint:eslint:fix`  | ESLint with autofix                                                  |
| `npm test`                 | Lint, then Jest with coverage                                        |
| `npm run test:watch`       | Jest in watch mode                                                   |
| `npm run generate`         | Scaffold a component, container, or language                         |
| `npm run extract-intl`     | Extract react-intl messages into `app/translations/`                 |
| `npm run analyze`          | Webpack bundle analysis                                              |

To run a single test file without the lint step and coverage threshold:

```bash
npx cross-env NODE_ENV=test jest app/containers/HomePage/tests/saga.test.js
```

> ⚠️ Avoid `npm run clean`. It resets `app/` to an empty boilerplate and **deletes the project's custom pages**.

---

## API reference

All endpoints accept and return JSON.

| Method | Endpoint                     | Auth            | Body                    | Response                               |
| ------ | ---------------------------- | --------------- | ----------------------- | -------------------------------------- |
| POST   | `/api/auth/login`            | –               | `{ email, password }`   | `{ token: "Bearer <jwt>" }` (1 h TTL)  |
| POST   | `/api/water-service-meters`  | `Authorization` | `{ chatId }`            | Meter document, or `400 Meter not found` |

The `token` value already includes the `Bearer ` prefix. Send it unchanged as the `Authorization` header:

```bash
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"secret"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -X POST localhost:3000/api/water-service-meters \
  -H "Authorization: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"chatId":280601079}'
```

---

## Project structure

```text
public-service-react/
├── app/                         # React frontend (module root: imports resolve from here)
│   ├── app.js                   # Client entry: store, router, i18n provider
│   ├── configureStore.js        # Redux store + saga middleware
│   ├── reducers.js              # Root reducer (global, language, login, router)
│   ├── components/              # Presentational, stateless UI (Button, Header, Form, …)
│   ├── containers/              # Connected pages/features
│   │   ├── App/                 # Root layout, routes, global selectors (makeSelectToken)
│   │   ├── LoginPage/           # Login form + auth saga -> redirects to /menu
│   │   ├── MenuPage/            # Water-meter view + API saga
│   │   ├── LanguageProvider/    # react-intl provider
│   │   └── HomePage/, FeaturePage/, …  # Boilerplate demo pages
│   ├── translations/            # i18n catalogs (en, de)
│   └── utils/                   # injectReducer / injectSaga, request helper, history
├── server/                      # Express backend (same process as the dev server)
│   ├── index.js                 # Server entry: middleware, Mongo connection, API routes
│   ├── config/                  # keys.js -> keys.dev.js (local, git-ignored) | keys.prod.js (env)
│   ├── routes/                  # /api/auth, /api/water-service-meters
│   ├── controllers/             # Route handlers
│   ├── models/                  # Mongoose schemas: User, WaterServiceMeter
│   └── middlewares/             # Passport JWT strategy, webpack dev / static prod serving
├── internals/                   # Build tooling
│   ├── webpack/                 # Base, dev, and prod webpack configs
│   ├── generators/              # plop templates for `npm run generate`
│   ├── testing/                 # Jest + Enzyme setup
│   └── scripts/                 # analyze, extract-intl, clean, npm version check
├── docs/                        # Upstream react-boilerplate documentation
├── jest.config.js
├── babel.config.js
└── .nvmrc                       # lts/carbon (Node 8)
```

### How a request flows

```text
LoginPage ──LOGIN_REQUEST──▶ login saga ──POST /api/auth/login──▶ auth controller ──▶ MongoDB (users)
    ◀── LOGIN_SUCCESS (token in Redux) ── redirect to /menu
MenuPage ──WATER_SERVICE_METERS_REQUEST──▶ menu saga ──POST /api/water-service-meters (JWT)──▶ passport ──▶ MongoDB (waterServiceMeters)
```

---

## Known limitations

- The Telegram `chatId` is hard-coded on the client. The planned source is Telegram integration.
- The JWT is kept only in Redux, so reloading the page logs you out.
- The jest coverage gate (98%) fails until the custom pages and server code have tests.

## Further reading

The upstream boilerplate docs in [docs/](docs/) cover Redux, sagas, i18n, testing, and deployment in depth.

## License

[MIT](LICENSE.md). Based on react-boilerplate © 2018 Maximilian Stoiber.
