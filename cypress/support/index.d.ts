/// <reference types="cypress" />
/// <reference types="cypress-axe" />

import type { Interception } from 'cypress/types/net-stubbing'
import type { OAuthProvidersResponse } from '../../src/features/auth/types'

declare global {
  namespace Cypress {
    interface Chainable {
      authUrl(endpoint: string): string
      clearAuthState(): Chainable<void>
      setSessionCookie(token?: string): Chainable<void>
      assertAuthHeaders(
        request: Interception['request'],
        language?: 'en' | 'pt',
      ): Chainable<void>
      stubProviderStatus(
        providers?: OAuthProvidersResponse['providers'],
      ): Chainable<void>
      findProviderButton(label: string): Chainable<JQuery<HTMLButtonElement>>
      injectAxeAndCheck(): Chainable<void>
    }
  }
}

export {}
