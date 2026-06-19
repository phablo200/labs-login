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

function stubEmptyProcessList() {
  cy.intercept('GET', labsReviewerUrl('/labs/processes/'), {
    body: [],
    statusCode: 200,
  }).as('listProcesses')
}

function visitSignIn() {
  cy.stubProviderStatus()
  cy.visit('/sign-in')
  cy.wait('@getOAuthProviders')
}

describe('Sign in', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  it('validates required and invalid email fields', () => {
    visitSignIn()

    cy.contains('h1', 'Sign in').should('be.visible')
    cy.contains('button', 'Sign in').click()
    cy.contains('This field is required.').should('be.visible')

    cy.get('input[name="email"]').type('not-an-email')
    cy.get('input[name="password"]').type('password')
    cy.contains('button', 'Sign in').click()
    cy.contains('Enter a valid email address.').should('be.visible')
  })

  it('submits credentials, disables while pending, stores the session, and redirects home', () => {
    cy.intercept('GET', labsReviewerUrl('/me'), {
      body: authenticatedUserResponse(),
      statusCode: 200,
    }).as('getMe')
    stubEmptyProcessList()
    cy.intercept('POST', authUrl('/auth/signin'), {
      body: authSuccessResponse(),
      delay: 250,
      statusCode: 200,
    }).as('signIn')

    visitSignIn()

    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.contains('button', 'Sign in').click()

    cy.contains('button', 'Sign in')
      .should('be.disabled')
      .and('have.attr', 'aria-busy', 'true')

    cy.wait('@signIn').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.body).to.deep.equal({
        email: 'user@example.com',
        password: 'password123',
      })
    })
    cy.wait('@getMe').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.headers.authorization).to.equal('Bearer e2e-session-token')
    })

    cy.location('pathname').should('eq', '/home')
    cy.wait('@listProcesses')
    cy.contains('h1', 'Start a process').should('be.visible')
    cy.getCookie('labs_login_session')
      .its('value')
      .should('eq', 'e2e-session-token')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'labs-login.authenticated-user')
      .should('contain', 'user@example.com')
  })

  it('shows backend, service, and network error messages', () => {
    const cases = [
      {
        message: 'Invalid credentials.',
        response: {
          body: { error: 'Invalid credentials.' },
          statusCode: 401,
        },
      },
      {
        message: 'The authentication service is unavailable. Try again soon.',
        response: {
          body: { error: 'Service unavailable.' },
          statusCode: 500,
        },
      },
      {
        message:
          'We could not reach the service. Check your connection and try again.',
        response: {
          forceNetworkError: true,
        },
      },
    ]

    cases.forEach(({ message, response }) => {
      cy.intercept('GET', authUrl('/auth/oauth/providers'), {
        body: providerStatusResponse(),
        statusCode: 200,
      }).as('getOAuthProviders')
      cy.intercept('POST', authUrl('/auth/signin'), response).as('signIn')
      cy.visit('/sign-in')
      cy.wait('@getOAuthProviders')

      cy.get('input[name="email"]').type('user@example.com')
      cy.get('input[name="password"]').type('password123')
      cy.contains('button', 'Sign in').click()
      cy.wait('@signIn')

      cy.contains(message).should('be.visible')
    })
  })
})
