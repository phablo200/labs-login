const SESSION_COOKIE_NAME = 'melogin_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60

function getCookieAttributes(maxAge: number): string {
  const attributes = [
    `max-age=${maxAge}`,
    'path=/',
    'SameSite=Lax',
  ]

  if (window.location.protocol === 'https:') {
    attributes.push('Secure')
  }

  return attributes.join('; ')
}

export function saveSessionToken(token: string): void {
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; ${getCookieAttributes(SESSION_MAX_AGE_SECONDS)}`
}

export function getSessionToken(): string | null {
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith(`${SESSION_COOKIE_NAME}=`),
  )

  if (!sessionCookie) {
    return null
  }

  const [, value] = sessionCookie.split('=')

  return value ? decodeURIComponent(value) : null
}

export function clearSessionToken(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; ${getCookieAttributes(0)}`
}
