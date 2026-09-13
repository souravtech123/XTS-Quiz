import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, destroyAdminSession, isAdminAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid admin email or password.' }, { status: 401 });
    }

    await createAdminSession();
    return NextResponse.json({ success: true, message: 'Authenticated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  return NextResponse.json({ authenticated: isAuth });
}

export async function DELETE() {
  await destroyAdminSession();
  return NextResponse.json({ success: true });
}
