import { messageResponse } from '../../support/authResponses'

const authApiBaseUrl = Cypress.env('authApiBaseUrl') as string

function authUrl(endpoint: string): string {
  return `${authApiBaseUrl}${endpoint}`
}

describe('Reset password', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  it('shows the missing token state', () => {
    cy.visit('/reset-password')

    cy.contains('h1', 'Reset password').should('be.visible')
    cy.contains('No recovery token was provided.').should('be.visible')
    cy.contains('a', 'Request recovery link')
      .should('be.visible')
      .and('have.attr', 'href', '/password-recovery')
  })

  it('validates password fields', () => {
    cy.visit('/reset-password?token=e2e-reset-token')

    cy.contains('Recovery token detected.').should('be.visible')
    cy.contains('button', 'Reset password').click()
    cy.contains('This field is required.').should('be.visible')

    cy.get('input[name="newPassword"]').type('short')
    cy.get('input[name="confirmPassword"]').type('different')
    cy.contains('button', 'Reset password').click()
    cy.contains('Password must be at least 8 characters.').should('be.visible')
    cy.contains('Passwords must match.').should('be.visible')
  })

  it('submits token and new_password, shows success, and redirects to sign in', () => {
    cy.intercept('PATCH', authUrl('/auth/reset-password'), {
      body: messageResponse('Password reset complete.'),
      delay: 250,
      statusCode: 200,
    }).as('resetPassword')
    cy.visit('/reset-password?token=e2e-reset-token')

    cy.get('input[name="newPassword"]').type('password123')
    cy.get('input[name="confirmPassword"]').type('password123')
    cy.contains('button', 'Reset password').click()

    cy.contains('button', 'Reset password')
      .should('be.disabled')
      .and('have.attr', 'aria-busy', 'true')

    cy.wait('@resetPassword').then(({ request }) => {
      cy.assertAuthHeaders(request)
      expect(request.body).to.deep.equal({
        new_password: 'password123',
        token: 'e2e-reset-token',
      })
      expect(request.body).not.to.have.property('newPassword')
    })

    cy.contains('Password reset complete.').should('be.visible')
    cy.location('pathname').should('eq', '/sign-in')
  })

  it('shows backend, service, and network error messages', () => {
    const cases = [
      {
        message: 'Reset token expired.',
        response: {
          body: { error: 'Reset token expired.' },
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
        message:
          'We could not reach the service. Check your connection and try again.',
        response: {
          forceNetworkError: true,
        },
      },
    ]

    cases.forEach(({ message, response }) => {
      cy.intercept('PATCH', authUrl('/auth/reset-password'), response).as(
        'resetPassword',
      )
      cy.visit('/reset-password?token=e2e-reset-token')
      cy.get('input[name="newPassword"]').type('password123')
      cy.get('input[name="confirmPassword"]').type('password123')
      cy.contains('button', 'Reset password').click()
      cy.wait('@resetPassword')

      cy.contains(message).should('be.visible')
    })
  })
})
