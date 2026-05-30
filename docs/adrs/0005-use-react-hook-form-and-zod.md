# ADR 0005: Use React Hook Form and Zod for Forms

## Status

Accepted

## Date

2026-05-30

## Context

The application has several forms with similar validation needs: required fields, email format, minimum password length, password confirmation, reset token handling, and OTP code validation. The backend also uses Zod validation, which makes schema alignment practical.

## Decision

The frontend shall use React Hook Form for form state and Zod for validation schemas. Schema definitions shall live near the auth feature forms, either in `src/features/auth/validation.ts` or alongside specific form components when local.

The frontend shall validate before submission:

- Required fields.
- Email format.
- Minimum password length.
- Password confirmation match.
- OTP code length when OTP login is implemented.

Backend 4xx errors shall remain toast-level errors unless a specific field mapping is explicitly added.

## Consequences

- Form behavior remains consistent and testable.
- Zod provides a familiar validation model aligned with the backend.
- React Hook Form keeps form rerenders low.
- Additional dependencies are required.
