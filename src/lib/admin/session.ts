/**
 * Admin sessions: a password from ADMIN_PASSWORD, and an HMAC-signed,
 * expiring session cookie. Server-only.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "admin_session"
const SESSION_HOURS = 8

const password = () => process.env.ADMIN_PASSWORD ?? ""
/** ADMIN_SECRET signs sessions; falls back to a key derived from the password. */
const secret = () => process.env.ADMIN_SECRET || createHash("sha256").update(`admin:${password()}`).digest("hex")

export const adminEnabled = () => password().length >= 8

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url")

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest()
  const hb = createHash("sha256").update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function checkPassword(candidate: string): boolean {
  return adminEnabled() && safeEqual(candidate, password())
}

export function createSessionToken(now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ exp: now + SESSION_HOURS * 3600_000 })).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token || !adminEnabled()) return false
  const [payload, sig] = token.split(".")
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp: number }
    return typeof exp === "number" && exp > now
  } catch {
    return false
  }
}

export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies()
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value)
}

export async function startSession() {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_HOURS * 3600,
  })
}

export async function endSession() {
  const jar = await cookies()
  jar.delete({ name: SESSION_COOKIE, path: "/admin" })
}
