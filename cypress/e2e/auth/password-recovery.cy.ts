import { messageResponse } from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

describe('Password recovery', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.visit('/password-recovery')
  })

  it('validates the email field', () => {
    cy.contains('h1', 'Recover password').should('be.visible')
    cy.contains('button', 'Send recovery link').click()
    cy.contains('This field is required.').should('be.visible')

    cy.get('input[name="email"]').type('not-an-email')
    cy.contains('button', 'Send recovery link').click()
    cy.contains('Enter a valid email address.').should('be.visible')
  })

  it('shows the backend success message and submits expected headers', () => {
    cy.intercept('POST', authUrl('/auth/forgot-password'), {
      body: messageResponse('Recovery email queued.'),
      delay: 250,
      statusCode: 200,
    }).as('passwordRecovery')

    cy.get('input[name="email"]').type('user@example.com')
    cy.contains('button', 'Send recovery link').click()

    cy.contains('button', 'Send recovery link')
      .should('be.disabled')
      .and('have.attr', 'aria-busy', 'true')

    cy.wait('@passwordRecovery').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.body).to.deep.equal({ email: 'user@example.com' })
    })
    cy.contains('Recovery email queued.').should('be.visible')
  })

  it('shows backend, service, and network error messages', () => {
    const cases = [
      {
        message: 'Recovery is temporarily blocked.',
        response: {
          body: { error: 'Recovery is temporarily blocked.' },
          statusCode: 429,
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
      cy.intercept('POST', authUrl('/auth/forgot-password'), response).as(
        'passwordRecovery',
      )
      cy.visit('/password-recovery')
      cy.get('input[name="email"]').type('user@example.com')
      cy.contains('button', 'Send recovery link').click()
      cy.wait('@passwordRecovery')

      cy.contains(message).should('be.visible')
    })
  })
})
