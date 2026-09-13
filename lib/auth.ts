import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'ankit@xts.com';
const ADMIN_PASSWORD = 'ankit_755@';
const SESSION_COOKIE = 'xts_admin_session';

export async function verifyAdminCredentials(email: string, pass: string): Promise<boolean> {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASSWORD;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  // Store a simple, checkable token prefix
  const token = 'xts_admin_ok_' + Date.now().toString(36);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  return token;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return !!session && session.value.startsWith('xts_admin_ok_');
}
