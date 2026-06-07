const authPages = [
  '/sign-in',
  '/sign-up',
  '/password-recovery',
  '/reset-password?token=e2e-reset-token',
]

function assertNoHorizontalOverflow() {
  cy.document().then((document) => {
    expect(document.documentElement.scrollWidth).to.be.lte(
      document.documentElement.clientWidth,
    )
  })
}

describe('Accessibility and responsive smoke checks', () => {
  beforeEach(() => {
    cy.clearAuthState()
  })

  authPages.forEach((path) => {
    it(`has no critical or serious axe violations on ${path}`, () => {
      if (path === '/sign-in' || path === '/sign-up') {
        cy.stubProviderStatus()
      }

      cy.visit(path)
      cy.injectAxeAndCheck()
    })
  })

  it('does not create horizontal overflow on mobile or desktop auth layouts', () => {
    cy.stubProviderStatus()

    cy.viewport(390, 844)
    cy.visit('/sign-in')
    assertNoHorizontalOverflow()
    cy.get('input[name="email"]').should('be.visible')
    cy.contains('button', 'Sign in').should('be.visible')

    cy.viewport(1280, 900)
    cy.visit('/sign-up')
    assertNoHorizontalOverflow()
    cy.get('input[name="email"]').should('be.visible')
    cy.contains('button', 'Create account').should('be.visible')
  })
})
