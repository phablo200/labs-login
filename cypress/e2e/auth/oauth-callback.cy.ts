import {
  authSuccessResponse,
  providerStatusResponse,
} from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

describe('OAuth callback', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.intercept('GET', authUrl('/auth/oauth/providers'), {
      body: providerStatusResponse(),
      statusCode: 200,
    }).as('getOAuthProviders')
  })

  it('exchanges a success code, stores the session, and returns to sign in', () => {
    cy.intercept('POST', authUrl('/auth/oauth/exchange'), {
      body: authSuccessResponse({ token: 'oauth-session-token' }),
      statusCode: 200,
    }).as('exchangeOAuthCode')

    cy.visit('/signin/callback?status=success&code=e2e-oauth-code')

    cy.contains('Completing provider sign-in...').should('be.visible')
    cy.wait('@exchangeOAuthCode').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.body).to.deep.equal({ code: 'e2e-oauth-code' })
    })

    cy.location('pathname').should('eq', '/sign-in')
    cy.contains('Provider sign-in completed. Continue from sign in.').should(
      'be.visible',
    )
    cy.getCookie('labs_login_session')
      .its('value')
      .should('eq', 'oauth-session-token')
  })

  it('shows safe copy for known backend callback errors', () => {
    cy.visit('/signin/callback?status=error&reason=oauth_state_invalid')

    cy.location('pathname').should('eq', '/sign-in')
    cy.contains('The provider sign-in request is invalid.').should('be.visible')
  })

  it('shows generic fallback copy for unknown errors and missing success codes', () => {
    cy.visit('/signin/callback?status=error&reason=unknown_reason')
    cy.location('pathname').should('eq', '/sign-in')
    cy.contains('We could not complete provider sign-in. Try again.').should(
      'be.visible',
    )

    cy.visit('/signin/callback?status=success')
    cy.location('pathname').should('eq', '/sign-in')
    cy.contains('We could not complete provider sign-in. Try again.').should(
      'be.visible',
    )

    cy.visit('/signin/callback')
    cy.location('pathname').should('eq', '/sign-in')
    cy.contains('We could not complete provider sign-in. Try again.').should(
      'be.visible',
    )
  })

  it('shows backend, service, malformed, and network exchange failures', () => {
    const cases = [
      {
        message: 'OAuth code expired.',
        response: {
          body: { error: 'OAuth code expired.' },
          statusCode: 400,
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
        message: 'Something went wrong. Try again.',
        response: {
          body: '{',
          headers: { 'content-type': 'application/json' },
          statusCode: 200,
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

    cases.forEach(({ message, response }, index) => {
      cy.intercept('POST', authUrl('/auth/oauth/exchange'), response).as(
        'exchangeOAuthCode',
      )
      cy.visit(`/signin/callback?status=success&code=e2e-code-${index}`)
      cy.wait('@exchangeOAuthCode')

      cy.location('pathname').should('eq', '/sign-in')
      cy.contains(message).should('be.visible')
    })
  })
})
