# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Testing

Run the mocked-backend Cypress suite with:

```bash
npm run test:e2e
```

This starts Vite in `e2e` mode on `http://127.0.0.1:5173` and runs Cypress
headlessly. The suite uses `cy.intercept` for auth backend responses, so a real
`auth-service` process is not required for the default test path.

To watch the tests run in a browser, start the e2e dev server in one terminal:

```bash
npm run dev:e2e
```

Then open the interactive Cypress runner in a second terminal:

```bash
npm run cypress:open
```

In Cypress, choose **E2E Testing**, pick a browser, and click a spec such as
`sign-in.cy.ts`. Cypress will open the app at `http://127.0.0.1:5173` and show
each test executing step by step.

For a visible browser from the terminal, keep `npm run dev:e2e` running and use:

```bash
npm run cypress:run -- --headed
```

Use `npm run test:e2e` for the full headless suite, `npm run cypress:open` for
interactive debugging, and `npm run cypress:run -- --headed` when you want the
terminal run with a visible browser.

The e2e environment uses `.env.e2e` with non-secret local values for
`VITE_AUTH_API_BASE_URL`, `VITE_AUTH_API_KEY`, and
`VITE_AUTH_APPLICATION_ID`. The first install after adding Cypress may take
longer while Cypress downloads its browser binary.
