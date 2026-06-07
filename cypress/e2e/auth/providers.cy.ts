import {
  oauthAuthorizeResponse,
  providerStatusResponse,
} from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

describe('Provider login buttons', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  it('shows disabled controls when provider status cannot be loaded', () => {
    cy.intercept('GET', authUrl('/auth/oauth/providers'), {
      forceNetworkError: true,
    }).as('getOAuthProviders')

    cy.visit('/sign-in')
    cy.wait('@getOAuthProviders')

    cy.findProviderButton('Continue with Google').should('be.disabled')
    cy.findProviderButton('Continue with GitHub').should('be.disabled')
    cy.contains('Provider login is unavailable').should('be.visible')
  })

  it('keeps missing or disabled providers unavailable', () => {
    cy.intercept('GET', authUrl('/auth/oauth/providers'), {
      body: providerStatusResponse([
        { enabled: false, provider: 'google' },
        { enabled: false, provider: 'github' },
      ]),
      statusCode: 200,
    }).as('getOAuthProviders')

    cy.visit('/sign-in')
    cy.wait('@getOAuthProviders')

    cy.findProviderButton('Continue with Google')
      .should('be.disabled')
      .and('have.attr', 'title', 'Google login is not available right now.')
    cy.findProviderButton('Continue with GitHub')
      .should('be.disabled')
      .and('have.attr', 'title', 'GitHub login is not available right now.')
  })

  it('starts backend-owned provider authorization for enabled providers', () => {
    const redirectTarget = `${Cypress.config(
      'baseUrl',
    )}/sign-in?providerRedirect=google`

    cy.intercept('GET', authUrl('/auth/oauth/providers'), {
      body: providerStatusResponse([
        { enabled: true, provider: 'google' },
        { enabled: true, provider: 'github' },
      ]),
      statusCode: 200,
    }).as('getOAuthProviders')
    cy.intercept('POST', authUrl('/auth/oauth/google/authorize'), {
      body: oauthAuthorizeResponse(redirectTarget),
      delay: 250,
      statusCode: 200,
    }).as('authorizeGoogle')

    cy.visit('/sign-in')
    cy.wait('@getOAuthProviders')
    cy.findProviderButton('Continue with Google').should('not.be.disabled')
    cy.findProviderButton('Continue with GitHub').should('not.be.disabled')

    cy.findProviderButton('Continue with Google').click()
    cy.findProviderButton('Continue with Google')
      .should('be.disabled')
      .and('have.attr', 'aria-busy', 'true')
      .and('contain.text', 'Redirecting...')
    cy.findProviderButton('Continue with GitHub').should('be.disabled')

    cy.wait('@authorizeGoogle').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.body).to.deep.equal({
        redirect_uri: `${Cypress.config('baseUrl')}/signin/callback`,
      })
    })

    cy.location('pathname').should('eq', '/sign-in')
    cy.location('search').should('eq', '?providerRedirect=google')
  })
})
