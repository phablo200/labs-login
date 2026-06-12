import { authenticatedUserResponse } from '../../support/authResponses'

const labsReviewerApiBaseUrl = Cypress.env('labsReviewerApiBaseUrl') as string

function labsReviewerUrl(endpoint: string): string {
  return `${labsReviewerApiBaseUrl}${endpoint}`
}

function stubAuthenticatedDashboard() {
  cy.intercept('GET', labsReviewerUrl('/me'), {
    body: authenticatedUserResponse(),
    statusCode: 200,
  }).as('getMe')
  cy.intercept('GET', labsReviewerUrl('/outputs/makdown'), {
    body: {
      count: 1,
      items: [
        {
          filename: 'notes_reviewed.md',
          path: '/outputs/markdown/notes_reviewed.md',
        },
      ],
    },
    statusCode: 200,
  }).as('listMarkdownOutputs')
  cy.intercept('GET', labsReviewerUrl('/outputs/pdf'), {
    body: {
      count: 1,
      items: [
        {
          filename: 'notes_reviewed.pdf',
          path: '/outputs/pdf/notes_reviewed.pdf',
        },
      ],
    },
    statusCode: 200,
  }).as('listPdfOutputs')
}

describe('Labs Reviewer dashboard', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.setSessionCookie()
  })

  it('loads generated outputs from labs-reviewer and opens links in a new tab', () => {
    stubAuthenticatedDashboard()

    cy.visit('/home')

    cy.wait('@getMe').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
    cy.wait('@listMarkdownOutputs').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.url).to.include('/outputs/makdown')
    })
    cy.wait('@listPdfOutputs').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.url).to.include('/outputs/pdf')
    })

    cy.contains('h1', 'Review workspace').should('be.visible')
    cy.contains('a', 'notes_reviewed.md')
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'rel', 'noreferrer')
    cy.contains('a', 'notes_reviewed.pdf')
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'rel', 'noreferrer')
  })

  it('validates markdown files before upload', () => {
    stubAuthenticatedDashboard()

    cy.visit('/home')
    cy.wait('@getMe')

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('plain text'),
        fileName: 'notes.txt',
        mimeType: 'text/plain',
      },
      { force: true },
    )

    cy.contains('Select a .md file.').should('be.visible')
    cy.contains('button', 'Send for review').should('be.disabled')
  })

  it('uploads a markdown file and navigates to a process result URL', () => {
    stubAuthenticatedDashboard()
    cy.intercept('POST', labsReviewerUrl('/labs/review'), {
      body: {
        message: 'Processing started.',
        output_file: 'notes_reviewed.md',
        process_id: 'process-123',
      },
      delay: 250,
      statusCode: 200,
    }).as('uploadReview')

    cy.visit('/home')
    cy.wait('@getMe')

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('# Notes'),
        fileName: 'notes.md',
        mimeType: 'text/markdown',
      },
      { force: true },
    )
    cy.contains('button', 'Send for review').click()
    cy.contains('button', 'Send for review')
      .should('be.disabled')
      .and('have.attr', 'aria-busy', 'true')

    cy.wait('@uploadReview').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.headers['content-type']).to.contain('multipart/form-data')
      expect(request.headers).not.to.have.property('x-api-key')
      expect(request.headers).not.to.have.property('x-application-id')
    })

    cy.location('pathname').should('eq', '/review-result')
    cy.location('search').should('eq', '?process_id=process-123')
    cy.contains('Process ID').should('be.visible')
    cy.contains('process-123').should('be.visible')
  })

  it('renders the result page empty state when process_id is missing', () => {
    stubAuthenticatedDashboard()

    cy.visit('/review-result')
    cy.wait('@getMe')

    cy.contains('h1', 'Review result').should('be.visible')
    cy.contains('No process id was provided for this result page.').should(
      'be.visible',
    )
    cy.contains('a', 'Back to dashboard').should('have.attr', 'href', '/home')
  })
})
