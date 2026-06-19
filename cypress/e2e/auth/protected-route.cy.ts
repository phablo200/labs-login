import { authenticatedUserResponse } from '../../support/authResponses'

const labsReviewerApiBaseUrl = Cypress.env('labsReviewerApiBaseUrl') as string

function labsReviewerUrl(endpoint: string): string {
  return `${labsReviewerApiBaseUrl}${endpoint}`
}

function stubEmptyProcessList() {
  cy.intercept('GET', labsReviewerUrl('/labs/processes/'), {
    body: [],
    statusCode: 200,
  }).as('listProcesses')
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
    cy.intercept('GET', labsReviewerUrl('/me'), {
      body: authenticatedUserResponse(),
      statusCode: 200,
    }).as('getMe')
    stubEmptyProcessList()
    cy.setSessionCookie('valid-token')

    cy.visit('/home')
    cy.contains('Checking your session...').should('be.visible')

    cy.wait('@getMe').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.headers.authorization).to.equal('Bearer valid-token')
    })
    cy.wait('@listProcesses').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
    cy.contains('h1', 'Start a process').should('be.visible')
    cy.location('pathname').should('eq', '/home')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'labs-login.authenticated-user')
      .should('contain', 'user@example.com')
  })

  it('clears an invalid session cookie and redirects to sign in', () => {
    cy.stubProviderStatus()
    cy.intercept('GET', labsReviewerUrl('/me'), {
      body: { error: 'Invalid token.' },
      statusCode: 401,
    }).as('getMe')
    cy.setSessionCookie('invalid-token')
    cy.window().then((window) => {
      window.localStorage.setItem('labs-login.authenticated-user', '{}')
    })

    cy.visit('/home')
    cy.wait('@getMe')

    cy.location('pathname').should('eq', '/sign-in')
    cy.getCookie('labs_login_session').should('be.null')
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'labs-login.authenticated-user')
      .should('be.null')
  })

  it('clears the session when token validation cannot reach the service', () => {
    cy.stubProviderStatus()
    cy.intercept('GET', labsReviewerUrl('/me'), {
      forceNetworkError: true,
    }).as('getMe')
    cy.setSessionCookie('network-failure-token')

    cy.visit('/home')
    cy.wait('@getMe')

    cy.location('pathname').should('eq', '/sign-in')
    cy.getCookie('labs_login_session').should('be.null')
  })
})
