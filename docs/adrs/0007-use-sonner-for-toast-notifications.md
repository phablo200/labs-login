# ADR 0007: Use Sonner for Toast Notifications

## Status

Accepted

## Date

2026-05-30

## Context

The SRS requires toast messages for backend 4xx errors and success messages from password recovery and reset flows. Toasts should be lightweight, accessible where possible, and simple to trigger from auth hooks.

## Decision

The frontend shall use Sonner for toast notifications. A single toast host shall be mounted at the application root. Auth flows shall show:

- `response.error` for backend 4xx responses.
- Localized generic authentication errors when `error` is absent.
- Localized generic unexpected-error messages for 5xx or network failures.
- Backend `message` values for successful password recovery and reset flows.

Field validation errors shall remain inline and shall not be replaced by toasts.

## Consequences

- Toast behavior is consistent across auth screens.
- Components avoid custom notification infrastructure.
- Sonner becomes a dependency.
- Accessibility must be verified in implementation, especially screen reader announcement behavior.
