import { tokenValidResponse } from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

describe('Protected routes and session validation', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  it('redirects anonymous users to sign in', () => {
    cy.stubProviderStatus()
    cy.visit('/home')

    cy.location('pathname').should('eq', '/sign-in')
    cy.contains('h1', 'Sign in').should('be.visible')
  })

  it('validates an existing session cookie and renders home', () => {
    cy.intercept('GET', authUrl('/auth/validate-token'), {
      body: tokenValidResponse(),
      statusCode: 200,
    }).as('validateToken')
    cy.setSessionCookie('valid-token')

    cy.visit('/home')
    cy.contains('Checking your session...').should('be.visible')

    cy.wait('@validateToken').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.headers.authorization).to.equal('Bearer valid-token')
    })
    cy.contains('h1', 'Home').should('be.visible')
    cy.location('pathname').should('eq', '/home')
  })

  it('clears an invalid session cookie and redirects to sign in', () => {
    cy.stubProviderStatus()
    cy.intercept('GET', authUrl('/auth/validate-token'), {
      body: { error: 'Invalid token.' },
      statusCode: 401,
    }).as('validateToken')
    cy.setSessionCookie('invalid-token')

    cy.visit('/home')
    cy.wait('@validateToken')

    cy.location('pathname').should('eq', '/sign-in')
    cy.getCookie('labs_login_session').should('be.null')
  })

  it('clears the session when token validation cannot reach the service', () => {
    cy.stubProviderStatus()
    cy.intercept('GET', authUrl('/auth/validate-token'), {
      forceNetworkError: true,
    }).as('validateToken')
    cy.setSessionCookie('network-failure-token')

    cy.visit('/home')
    cy.wait('@validateToken')

    cy.location('pathname').should('eq', '/sign-in')
    cy.getCookie('labs_login_session').should('be.null')
  })
})
