import { providerStatusResponse } from './authResponses'

const sessionCookieName = 'labs_login_session'
const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

Cypress.Commands.add('authUrl', authUrl)

Cypress.Commands.add('clearAuthState', () => {
  cy.clearCookie(sessionCookieName)
  cy.clearLocalStorage('labs-login.language')
})

Cypress.Commands.add('setSessionCookie', (token = 'e2e-session-token') => {
  cy.setCookie(sessionCookieName, token)
})

Cypress.Commands.add('assertAuthHeaders', (request, language = 'en') => {
  expect(request.headers).to.include({
    'accept-language': language,
    'x-api-key': 'e2e-api-key',
    'x-application-id': 'e2e-application',
  })
  expect(request.headers['content-type']).to.contain('application/json')
})

Cypress.Commands.add('stubProviderStatus', (providers = []) => {
  cy.intercept('GET', authUrl('/auth/oauth/providers'), {
    body: providerStatusResponse(providers),
    statusCode: 200,
  }).as('getOAuthProviders')
})

Cypress.Commands.add('findProviderButton', (label) => {
  return cy.get(`button[aria-label="${label}"]`)
})

Cypress.Commands.add('injectAxeAndCheck', () => {
  cy.injectAxe()
  cy.checkA11y(undefined, {
    includedImpacts: ['critical', 'serious'],
  })
})
