import { authenticatedUserResponse } from '../../support/authResponses'

const labsReviewerApiBaseUrl = Cypress.env('labsReviewerApiBaseUrl') as string

const processResponse = {
  created_at: '2026-06-19T12:00:00.000Z',
  data: [],
  file: 'Globalfy Job Offer Summary',
  id: 'process-123',
  status: 'WRITTING',
  user_id: 'user-e2e',
}

const secondProcessResponse = {
  created_at: '2026-06-18T12:00:00.000Z',
  data: [],
  file: 'MongoDB Atlas Connection Issue',
  id: 'process-456',
  status: 'SUCCEEDED',
  user_id: 'user-e2e',
}

const succeededProcessResultResponse = {
  ...secondProcessResponse,
  data: [
    {
      children: [],
      finished_at: '2026-06-19T12:03:00.000Z',
      id: 'agent-succeeded',
      loop_from: null,
      loop_to: null,
      name: 'Extract outline',
      status: 'SUCCEEDED',
    },
  ],
}

function labsReviewerUrl(endpoint: string): string {
  return `${labsReviewerApiBaseUrl}${endpoint}`
}

function stubAuthenticatedSession() {
  cy.intercept('GET', '**/me', {
    body: authenticatedUserResponse(),
    statusCode: 200,
  }).as('getMe')
}

function stubProcessList(processes = [processResponse, secondProcessResponse]) {
  cy.intercept('GET', labsReviewerUrl('/labs/processes/'), {
    body: processes,
    statusCode: 200,
  }).as('listProcesses')
}

function stubProcessNotes(processId = 'process-123') {
  cy.intercept('GET', labsReviewerUrl(`/labs/processes/notes/${processId}`), {
    body: [
      {
        created_at: '2026-06-19T12:01:00.000Z',
        description: 'First saved note',
        id: 'note-1',
        process_status_id: processId,
        updated_at: '2026-06-19T12:01:00.000Z',
      },
    ],
    statusCode: 200,
  }).as('listProcessNotes')
}

describe('Labs Reviewer dashboard', () => {
  beforeEach(() => {
    cy.clearAuthState()
    cy.setSessionCookie()
  })

  it('renders recent processes and restores the selected process from the URL', () => {
    stubAuthenticatedSession()
    stubProcessList()
    stubProcessNotes()

    cy.visit('/home?process_id=process-123')

    cy.wait('@getMe').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
    cy.wait('@listProcesses').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.url).to.include('/labs/processes/')
    })
    cy.wait('@listProcessNotes').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.url).to.include('/labs/processes/notes/process-123')
    })

    cy.contains('button', 'Globalfy Job Offer Summary').should(
      'have.attr',
      'aria-current',
      'page',
    )
    cy.contains('First saved note').should('be.visible')
    cy.location('search').should('eq', '?process_id=process-123')
  })

  it('selects a succeeded recent process and opens the result page', () => {
    stubAuthenticatedSession()
    stubProcessList()
    cy.intercept('GET', labsReviewerUrl('/labs/processes/process-456/status'), {
      body: succeededProcessResultResponse,
      statusCode: 200,
    }).as('getSecondProcessStatus')

    cy.visit('/home')
    cy.wait('@getMe')
    cy.wait('@listProcesses')

    cy.contains('button', 'MongoDB Atlas Connection Issue').click()
    cy.location('pathname').should('eq', '/review-result')
    cy.location('search').should('eq', '?process_id=process-456')
    cy.wait('@getSecondProcessStatus').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
  })

  it('selects a writing recent process and keeps the edit page', () => {
    stubAuthenticatedSession()
    stubProcessList()
    stubProcessNotes()

    cy.visit('/home')
    cy.wait('@getMe')
    cy.wait('@listProcesses')

    cy.contains('button', 'Globalfy Job Offer Summary').click()
    cy.location('pathname').should('eq', '/home')
    cy.location('search').should('eq', '?process_id=process-123')
    cy.wait('@listProcessNotes')
    cy.contains('First saved note').should('be.visible')
  })

  it('creates a process, saves a note, edits it, and submits review', () => {
    stubAuthenticatedSession()
    let processListCallCount = 0

    cy.intercept('GET', labsReviewerUrl('/labs/processes/'), (request) => {
      processListCallCount += 1
      request.reply({
        body:
          processListCallCount === 1
            ? []
            : [
                {
                  ...processResponse,
                  file: '2026-06-19 12:00:00',
                  id: 'process-new',
                },
              ],
        statusCode: 200,
      })
    }).as('listProcesses')
    cy.intercept('POST', labsReviewerUrl('/labs/processes/create'), {
      body: {
        created_at: '2026-06-19T12:00:00.000Z',
        file: '2026-06-19 12:00:00',
        id: 'process-new',
        status: 'WRITTING',
        user_id: 'user-e2e',
      },
      delay: 100,
      statusCode: 200,
    }).as('createProcess')
    cy.intercept('GET', labsReviewerUrl('/labs/processes/notes/process-new'), {
      body: [],
      statusCode: 200,
    }).as('listNewProcessNotes')
    cy.intercept('POST', labsReviewerUrl('/labs/processes/notes/process-new'), {
      body: {
        created_at: '2026-06-19T12:01:00.000Z',
        description: 'Draft note',
        id: 'note-new',
        process_status_id: 'process-new',
        updated_at: '2026-06-19T12:01:00.000Z',
      },
      statusCode: 200,
    }).as('createNote')
    cy.intercept(
      'POST',
      labsReviewerUrl('/labs/processes/notes/process-new?id=note-new'),
      {
        body: {
          created_at: '2026-06-19T12:01:00.000Z',
          description: 'Edited note',
          id: 'note-new',
          process_status_id: 'process-new',
          updated_at: '2026-06-19T12:02:00.000Z',
        },
        statusCode: 200,
      },
    ).as('editNote')
    cy.intercept('POST', labsReviewerUrl('/labs/review/process-new'), {
      body: {
        message: 'Processing started.',
        output_file: 'process_new_reviewd.md',
        process_id: 'process-new',
      },
      statusCode: 200,
    }).as('startReview')

    cy.visit('/home')
    cy.wait('@getMe')
    cy.wait('@listProcesses')

    cy.contains('button', 'New process').first().click()
    cy.contains('button', 'New process').first().should('be.disabled')
    cy.wait('@createProcess').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.body ?? '').to.equal('')
    })
    cy.location('search').should('eq', '?process_id=process-new')
    cy.wait('@listProcesses')
    cy.wait('@listNewProcessNotes')

    cy.get('textarea[aria-label="Ask or add notes for this process"]').type(
      'Draft note',
    )
    cy.get('button[aria-label="Send note"]').click()
    cy.wait('@createNote').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.body).to.deep.equal({ note: 'Draft note' })
    })
    cy.contains('Draft note').should('be.visible')

    cy.contains('button', 'Edit note').click()
    cy.get('textarea[aria-label="Edit note"]').clear().type('Edited note')
    cy.contains('button', 'Save').click()
    cy.wait('@editNote').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.body).to.deep.equal({ note: 'Edited note' })
    })
    cy.contains('Edited note').should('be.visible')

    cy.contains('button', 'Submit').click()
    cy.wait('@startReview').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
    cy.location('pathname').should('eq', '/review-result')
    cy.location('search').should('eq', '?process_id=process-new')
  })

  it('uploads .txt note files and validates unsupported files', () => {
    stubAuthenticatedSession()
    stubProcessList()
    stubProcessNotes()
    cy.intercept(
      'POST',
      labsReviewerUrl('/labs/processes/files-note/process-123'),
      {
        body: {
          created_at: '2026-06-19T12:04:00.000Z',
          description: 'File note body',
          id: 'file-note',
          process_status_id: 'process-123',
          updated_at: '2026-06-19T12:04:00.000Z',
        },
        statusCode: 200,
      },
    ).as('uploadFileNote')

    cy.visit('/home?process_id=process-123')
    cy.wait('@getMe')
    cy.wait('@listProcesses')
    cy.wait('@listProcessNotes')

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('plain text'),
        fileName: 'notes.pdf',
        mimeType: 'application/pdf',
      },
      { force: true },
    )
    cy.contains('Attach a .md or .txt file.').should('be.visible')

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('File note body'),
        fileName: 'notes.txt',
        mimeType: 'text/plain',
      },
      { force: true },
    )
    cy.wait('@uploadFileNote').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
      expect(request.headers['content-type']).to.contain('multipart/form-data')
      expect(request.headers).not.to.have.property('x-api-key')
      expect(request.headers).not.to.have.property('x-application-id')
    })
    cy.contains('File note body').should('be.visible')
  })

  it('renders the result page empty state when process_id is missing', () => {
    stubAuthenticatedSession()
    stubProcessList([])

    cy.visit('/review-result')
    cy.wait('@getMe')
    cy.wait('@listProcesses')

    cy.contains('h1', 'Review result').should('be.visible')
    cy.contains('No process id was provided for this result page.').should(
      'be.visible',
    )
    cy.contains('a', 'Back to dashboard').should('have.attr', 'href', '/home')
  })

  it('renders succeeded status and opens successful agent results', () => {
    stubAuthenticatedSession()
    stubProcessList()
    cy.intercept('GET', labsReviewerUrl('/labs/processes/process-456/status'), {
      body: succeededProcessResultResponse,
      statusCode: 200,
    }).as('getProcessStatus')
    cy.intercept('GET', labsReviewerUrl('/labs/agent-process/agent-succeeded'), {
      body: {
        children: [],
        finished_at: '2026-06-19T12:03:00.000Z',
        id: 'agent-succeeded',
        loop_from: null,
        loop_to: null,
        name: 'Extract outline',
        result: 'Outline result body',
        status: 'SUCCEEDED',
      },
      statusCode: 200,
    }).as('getAgentProcess')

    cy.visit('/review-result?process_id=process-456')
    cy.window().then((win) => {
      const writeText = cy.stub().as('writeText').resolves()

      Object.defineProperty(win.navigator, 'clipboard', {
        configurable: true,
        value: { writeText },
      })
    })
    cy.wait('@getMe')
    cy.wait('@listProcesses').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
    cy.wait('@getProcessStatus').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })

    cy.contains('button', 'MongoDB Atlas Connection Issue').should(
      'have.attr',
      'aria-current',
      'page',
    )
    cy.contains('Succeeded').should('be.visible')
    cy.contains('Waiting for backend file metadata').should('not.exist')
    cy.contains('button', 'Extract outline').should('not.be.disabled').click()

    cy.wait('@getAgentProcess').then(({ request }) => {
      cy.assertLabsReviewerHeaders(request)
    })
    cy.contains('h2', 'Extract outline').should('be.visible')
    cy.contains('Outline result body').should('be.visible')
    cy.get('button[aria-label="Copy Result"]').click()
    cy.get('@writeText').should('have.been.calledWith', 'Outline result body')
  })

  it('redirects writing result URLs back to the edit page', () => {
    stubAuthenticatedSession()
    stubProcessList()
    stubProcessNotes()
    cy.intercept('GET', labsReviewerUrl('/labs/processes/process-123/status'), {
      body: processResponse,
      statusCode: 200,
    }).as('getProcessStatus')

    cy.visit('/review-result?process_id=process-123')
    cy.wait('@getMe')
    cy.wait('@listProcesses')
    cy.wait('@getProcessStatus')

    cy.location('pathname').should('eq', '/home')
    cy.location('search').should('eq', '?process_id=process-123')
    cy.wait('@listProcessNotes')
    cy.contains('First saved note').should('be.visible')
  })

  it('opens the selected process for editing from the result title', () => {
    stubAuthenticatedSession()
    stubProcessList()
    stubProcessNotes('process-456')
    cy.intercept('GET', labsReviewerUrl('/labs/processes/process-456/status'), {
      body: succeededProcessResultResponse,
      statusCode: 200,
    }).as('getProcessStatus')

    cy.visit('/review-result?process_id=process-456')
    cy.wait('@getMe')
    cy.wait('@listProcesses')
    cy.wait('@getProcessStatus')

    cy.get('a[aria-label="Edit Notes"]')
      .should('have.attr', 'href', '/home?process_id=process-456')
      .and('have.attr', 'title', 'Edit Notes')
      .click()

    cy.location('pathname').should('eq', '/home')
    cy.location('search').should('eq', '?process_id=process-456')
    cy.wait('@listProcesses')
    cy.wait('@listProcessNotes')
    cy.contains('First saved note').should('be.visible')
    cy.contains('button', 'Submit').should('be.visible')
  })
})
