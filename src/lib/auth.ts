import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "vitalis_user_session_v2";
const LEGACY_COOKIE = "vitalis_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  goal: string;
};

export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });
  try {
    const jar = await cookies();
    jar.delete(LEGACY_COOKIE);
    jar.set(SESSION_COOKIE, token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
      expires: expiresAt,
    });
  } catch {
    /* ignore cookie write errors in restricted contexts */
  }
  return token;
}

function tokenFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const value = new URL(url).searchParams.get("s");
    return value && value.length >= 20 ? value : null;
  } catch {
    return null;
  }
}

export async function extractToken(request?: Request): Promise<string | null> {
  const fromQuery = tokenFromUrl(request?.url);
  if (fromQuery) return fromQuery;

  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const t = authHeader.slice(7).trim();
      if (t) return t;
    }
    const xToken = request.headers.get("x-session-token");
    if (xToken?.trim()) return xToken.trim();
  }

  try {
    const hdrs = await headers();
    const authHeader = hdrs.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const t = authHeader.slice(7).trim();
      if (t) return t;
    }
    const xToken = hdrs.get("x-session-token");
    if (xToken?.trim()) return xToken.trim();
  } catch {
    /* ignore */
  }

  try {
    const jar = await cookies();
    const c = jar.get(SESSION_COOKIE)?.value;
    if (c) return c;
  } catch {
    /* ignore */
  }

  return null;
}

export async function destroySession(request?: Request): Promise<void> {
  const token = await extractToken(request);
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  try {
    const jar = await cookies();
    jar.delete(LEGACY_COOKIE);
    jar.delete(SESSION_COOKIE);
  } catch {
    /* ignore */
  }
}

export async function getUserFromToken(token: string): Promise<SessionUser | null> {
  if (!token || token.length < 20) return null;
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        goal: users.goal,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUser(request?: Request): Promise<SessionUser | null> {
  const token = await extractToken(request);
  if (!token) return null;
  return getUserFromToken(token);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
