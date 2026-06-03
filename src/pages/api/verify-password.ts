import type { APIRoute } from 'astro'
import { createHash } from 'node:crypto'

// Cookie the server sets on successful login. /api/upload checks for this
// before accepting an upload, so the password gate can't be faked client-side.
export const AUTH_COOKIE = 'rocky_upload'

// We store a hash of the password as the cookie value (not the password itself),
// so the secret never travels back to the browser even in an httpOnly cookie.
export function authToken(password: string) {
  return createHash('sha256').update(password).digest('hex')
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { password } = body

    // Get the upload password from environment
    const correctPassword = import.meta.env.UPLOAD_PASSWORD

    if (!correctPassword) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Password not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (password === correctPassword) {
      cookies.set(AUTH_COOKIE, authToken(correctPassword), {
        httpOnly: true,
        secure: import.meta.env.PROD, // off on http://localhost during dev
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Incorrect password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
