import { authSuccessResponse, tokenValidResponse } from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

describe('Localization', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  it('renders English and Portuguese copy and sends matching accept-language headers', () => {
    cy.stubProviderStatus()
    cy.intercept('POST', authUrl('/auth/signin'), {
      body: { error: 'Invalid credentials.' },
      statusCode: 401,
    }).as('signInEnglish')

    cy.visit('/sign-in')
    cy.wait('@getOAuthProviders').then(({ request }) => {
      cy.assertAuthHeaders(request, 'en')
    })

    cy.contains('h1', 'Sign in').should('be.visible')
    cy.contains('Forgot password?').should('be.visible')
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.contains('button', 'Sign in').click()
    cy.wait('@signInEnglish').then(({ request }) => {
      cy.assertAuthHeaders(request, 'en')
    })

    cy.intercept('GET', authUrl('/auth/validate-token'), {
      body: tokenValidResponse(),
      statusCode: 200,
    }).as('validateToken')
    cy.intercept('POST', authUrl('/auth/signin'), {
      body: authSuccessResponse(),
      statusCode: 200,
    }).as('signInPortuguese')

    cy.get('button[aria-label="Language: English"]').click()
    cy.contains('button[role="menuitemradio"]', 'Portuguese').click()
    cy.contains('h1', 'Entrar').should('be.visible')
    cy.contains('Esqueceu a senha?').should('be.visible')

    cy.get('input[name="email"]').clear().type('user@example.com')
    cy.get('input[name="password"]').clear().type('password123')
    cy.contains('button', 'Entrar').click()
    cy.wait('@signInPortuguese').then(({ request }) => {
      cy.assertAuthHeaders(request, 'pt')
    })
    cy.wait('@validateToken')
    cy.contains('Você está autenticado.').should('be.visible')
  })
})
