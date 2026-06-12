import {
  authenticatedUserResponse,
  authSuccessResponse,
  providerStatusResponse,
} from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string
const labsReviewerApiBaseUrl = Cypress.env('labsReviewerApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

function labsReviewerUrl(endpoint: string): string {
  return `${labsReviewerApiBaseUrl}${endpoint}`
}

function visitSignUp() {
  cy.stubProviderStatus()
  cy.visit('/sign-up')
  cy.wait('@getOAuthProviders')
}

describe('Sign up', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  it('validates required fields, password length, and password confirmation', () => {
    visitSignUp()

    cy.contains('h1', 'Create account').should('be.visible')
    cy.contains('button', 'Create account').click()
    cy.contains('This field is required.').should('be.visible')

    cy.get('input[name="name"]').type('E2E User')
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('short')
    cy.get('input[name="confirmPassword"]').type('different')
    cy.contains('button', 'Create account').click()

    cy.contains('Password must be at least 8 characters.').should('be.visible')
    cy.contains('Passwords must match.').should('be.visible')
  })

  it('submits without confirmPassword, stores the session, and redirects home', () => {
    cy.intercept('GET', labsReviewerUrl('/me'), {
      body: authenticatedUserResponse(),
      statusCode: 200,
    }).as('getMe')
    cy.intercept('GET', labsReviewerUrl('/outputs/makdown'), {
      body: { count: 0, items: [] },
      statusCode: 200,
    }).as('listMarkdownOutputs')
    cy.intercept('GET', labsReviewerUrl('/outputs/pdf'), {
      body: { count: 0, items: [] },
      statusCode: 200,
    }).as('listPdfOutputs')
    cy.intercept('POST', authUrl('/auth/signup'), {
      body: authSuccessResponse(),
      delay: 250,
      statusCode: 200,
    }).as('signUp')

    visitSignUp()

    cy.get('input[name="name"]').type('E2E User')
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password123')
    cy.contains('button', 'Create account').click()

    cy.contains('button', 'Create account')
      .should('be.disabled')
      .and('have.attr', 'aria-busy', 'true')

    cy.wait('@signUp').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.body).to.deep.equal({
        email: 'user@example.com',
        name: 'E2E User',
        password: 'password123',
      })
      expect(request.body).not.to.have.property('confirmPassword')
    })
    cy.wait('@getMe').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.headers.authorization).to.equal('Bearer e2e-session-token')
    })

    cy.location('pathname').should('eq', '/home')
    cy.getCookie('labs_login_session')
      .its('value')
      .should('eq', 'e2e-session-token')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'labs-login.authenticated-user')
      .should('contain', 'user@example.com')
  })

  it('shows backend duplicate-email errors and service fallbacks', () => {
    const cases = [
      {
        message: 'Email already exists.',
        response: {
          body: { error: 'Email already exists.' },
          statusCode: 409,
        },
      },
      {
        message: 'The authentication service is unavailable. Try again soon.',
        response: {
          body: { error: 'Service unavailable.' },
          statusCode: 500,
        },
      },
    ]

    cases.forEach(({ message, response }) => {
      cy.intercept('GET', authUrl('/auth/oauth/providers'), {
        body: providerStatusResponse(),
        statusCode: 200,
      }).as('getOAuthProviders')
      cy.intercept('POST', authUrl('/auth/signup'), response).as('signUp')
      cy.visit('/sign-up')
      cy.wait('@getOAuthProviders')

      cy.get('input[name="name"]').type('E2E User')
      cy.get('input[name="email"]').type('user@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('password123')
      cy.contains('button', 'Create account').click()
      cy.wait('@signUp')

      cy.contains(message).should('be.visible')
    })

    cy.intercept('GET', authUrl('/auth/oauth/providers'), {
      body: providerStatusResponse(),
      statusCode: 200,
    }).as('getOAuthProviders')
    cy.intercept('POST', authUrl('/auth/signup'), {
      forceNetworkError: true,
    }).as('signUp')
    cy.visit('/sign-up')
    cy.wait('@getOAuthProviders')

    cy.get('input[name="name"]').type('E2E User')
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password123')
    cy.contains('button', 'Create account').click()
    cy.wait('@signUp')

    cy.contains(
      'We could not reach the service. Check your connection and try again.',
    ).should('be.visible')
  })
})
