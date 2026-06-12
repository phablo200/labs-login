import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    env: {
      authApiBaseUrl: 'http://127.0.0.1:3001/api',
      labsReviewerApiBaseUrl: 'http://127.0.0.1:3015',
    },
    retries: {
      openMode: 0,
      runMode: process.env.CI ? 2 : 0,
    },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportHeight: 900,
    viewportWidth: 1280,
    video: false,
  },
})
