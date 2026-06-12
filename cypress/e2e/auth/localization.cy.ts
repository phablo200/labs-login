import {
  authenticatedUserResponse,
  authSuccessResponse,
} from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string
const labsReviewerApiBaseUrl = Cypress.env('labsReviewerApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

function labsReviewerUrl(endpoint: string): string {
  return `${labsReviewerApiBaseUrl}${endpoint}`
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
    cy.wait('@getMe').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request, 'pt')
      expect(request.headers.authorization).to.equal('Bearer e2e-session-token')
    })
    cy.contains('Espaço de revisão').should('be.visible')
  })
})
