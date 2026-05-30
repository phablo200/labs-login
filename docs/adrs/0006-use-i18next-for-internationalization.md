# ADR 0006: Use i18next for Internationalization

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires Portuguese and English UI support. The backend already uses i18next and detects language from the `accept-language` header. Frontend language choice must control local UI copy and backend-localized messages.

## Decision

The frontend shall use i18next with React integration. Locale resources shall be maintained for `en` and `pt`. The selected language shall be persisted as a user preference and sent to the backend through the `accept-language` header.

The default language shall be English unless browser preference or stored preference indicates Portuguese.

## Consequences

- Frontend and backend localization models are aligned.
- Language switching can affect both UI labels and backend response messages.
- All user-facing strings must be added to locale files instead of hardcoded in components.
- Missing translation keys should be detectable during development.
