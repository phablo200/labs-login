# UI Guidelines: MeLogin

## Status

Accepted

## Date

2026-05-30

## Context

MeLogin is a focused authentication frontend for sign in, sign up, password recovery, reset password, and future provider login. The primary visual reference is `me-login-1.png`: a desktop split-screen layout with an expressive illustration area and a clear form area. The final product should keep that memorable split composition and magenta accent language, but with a more professional finish than the reference.

Secondary references support clean card forms, strong primary buttons, and mobile-first auth flows.

## Decision 1: Visual Direction

MeLogin shall use a professional split-auth design with a warm illustrated brand panel and a calm, high-clarity form panel.

- Use the left side on desktop for brand artwork, short value copy, and subtle decorative elements.
- Use the right side on desktop for the active authentication form.
- Keep illustration playful but restrained; avoid overly cartoonish or distracting visuals.
- Use generous whitespace, clear form hierarchy, and predictable controls.
- Product name shall be `MeLogin`.

## Decision 2: Layout System

Desktop layout shall use two columns:

- Brand panel: 55-60% width.
- Form panel: 40-45% width.
- Minimum viewport target: `1024px` and above.

Mobile and narrow tablet layouts shall use a single-column flow:

- Hide or reduce large artwork.
- Keep the form first.
- Show compact brand identity above the form.
- Preserve all flows as dedicated screens: sign in, sign up, forgot password, reset password, OTP verification, and success states.

Forms should sit in a constrained column:

- Desktop form max width: `420px`.
- Mobile horizontal padding: `24px`.
- Vertical spacing between form groups: `16px`.

## Decision 3: Color Tokens

Light mode shall be the default.

```text
color.brand.primary: #8A1F5D
color.brand.primaryHover: #74184F
color.brand.primaryActive: #5E123F
color.brand.accent: #D96C8E
color.brand.warmBg: #FFE6C8
color.brand.warmBgSoft: #FFF3E4

color.text.primary: #2F2F35
color.text.secondary: #6F6F78
color.text.muted: #9A9AA3
color.surface.page: #FFFFFF
color.surface.panel: #FFFFFF
color.surface.input: #FFFFFF
color.border.default: #DCDCE3
color.border.strong: #B9B9C3

color.feedback.error: #C93636
color.feedback.success: #16A66A
color.feedback.warning: #B7791F
color.feedback.info: #3563E9
```

Dark mode shall be supported with equivalent contrast:

```text
color.dark.page: #111116
color.dark.panel: #181820
color.dark.input: #20202A
color.dark.border: #343442
color.dark.text.primary: #F4F4F6
color.dark.text.secondary: #C0C0C8
color.dark.text.muted: #8C8C98
color.dark.brand.primary: #D65C9E
color.dark.brand.primaryHover: #E276AE
color.dark.brand.warmBg: #2A1B24
```

## Decision 4: Typography

Use a modern sans-serif stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Type scale:

- Page title: `32px`, weight `700`, line-height `1.2`.
- Form title: `28px`, weight `700`, line-height `1.25`.
- Section title: `20px`, weight `650`.
- Body: `16px`, weight `400`, line-height `1.5`.
- Label: `14px`, weight `500`.
- Helper/error text: `13px`, weight `400`.
- Button text: `15px`, weight `700`.

Avoid negative letter spacing. Text must never overflow buttons, inputs, or compact cards.

## Decision 5: Components and States

### Buttons

Primary buttons shall be full-width on auth forms.

- Height: `48px`.
- Border radius: `6px`.
- Background: `color.brand.primary`.
- Text: white.
- Disabled: muted background, reduced contrast, `not-allowed` cursor.
- Loading: preserve button width and show a spinner or loading label.

Secondary and provider buttons shall use neutral surfaces with borders.

Provider buttons for Google and GitHub shall remain disabled until backend OAuth endpoints exist. Disabled provider buttons must still be visible, with tooltip or helper text explaining that the option is unavailable.

### Inputs

Inputs shall be simple, rectangular, and accessible.

- Height: `46px`.
- Border radius: `6px`.
- Border: `1px solid color.border.default`.
- Focus border: `color.brand.primary`.
- Error border: `color.feedback.error`.
- Placeholder text: muted.

Password fields shall support visibility toggles with an icon button and accessible label.

### Toasts

Toasts shall appear in the top-right on desktop and top-center on mobile.

- Backend 4xx errors show the backend `error` message.
- Backend success messages show the backend `message` value.
- Generic 5xx/network failures use localized fallback copy.
- Toasts must not replace inline validation errors.

## Decision 6: Form Flow Guidelines

All auth forms shall provide:

- Clear title and one short supporting line.
- Inline validation near the related input.
- One primary action.
- One secondary navigation link for the alternate flow.
- Keyboard-accessible submit behavior.

Screen-specific expectations:

- Sign in: email, password, remember/session affordance if implemented, forgot password link, disabled Google/GitHub buttons.
- Sign up: name, email, password, confirm password, disabled Google/GitHub buttons.
- Forgot password: email field and success-safe message that does not reveal account existence.
- Reset password: new password, confirm password, token read from URL.
- OTP verification: six-code input pattern only when OTP login is implemented.
- Success state: concise confirmation and next action.

## Decision 7: Accessibility

The interface shall meet WCAG 2.1 AA intent for authentication screens.

- Every input requires a visible label or equivalent accessible label.
- Focus states must be visible in light and dark mode.
- Color cannot be the only validation indicator.
- Error messages must be associated with fields.
- Provider buttons, icon buttons, language controls, and password toggles must have accessible names.
- Form navigation must work with keyboard only.

## Decision 8: Internationalization

UI copy shall support English and Portuguese.

- Language selection shall be visible or reachable from auth screens.
- Copy should be concise and avoid text that expands poorly in Portuguese.
- Layouts must tolerate longer translated labels.
- The selected language shall align with the backend `accept-language` header.

## Decision 9: Imagery and Brand Panel

The desktop brand panel shall use a warm background inspired by the primary reference, but with professional composition.

- Use one main illustration or generated bitmap-style visual.
- Decorative particles, circles, or shapes may be used sparingly.
- Artwork must not compete with form readability.
- Brand copy should be short, for example: “Access your workspace securely.”
- Avoid using skull or novelty imagery directly unless intentionally approved for brand identity.

## Consequences

- The UI can scale from the current small app to additional auth flows without changing visual language.
- Desktop screens get a recognizable brand moment while mobile remains task-focused.
- Dark mode and i18n add implementation complexity but prevent later redesign pressure.
- Provider login is visually represented but correctly blocked until backend OAuth support exists.

## Open Questions

- Final illustration asset is not selected yet.
- Final dark mode toggle placement is not defined.
- Exact Portuguese and English copy should be specified during screen-level implementation specs.
