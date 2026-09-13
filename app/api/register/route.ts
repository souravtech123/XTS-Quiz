import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, studentId, phone } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full Name and Email are required.' },
        { status: 400 }
      );
    }

    const config = await db.getConfig();
    if (config.requireStudentId && !studentId) {
      return NextResponse.json(
        { error: 'Student ID is required by quiz configuration.' },
        { status: 400 }
      );
    }
    if (config.requirePhone && !phone) {
      return NextResponse.json(
        { error: 'Phone number is required by quiz configuration.' },
        { status: 400 }
      );
    }

    const student = await db.registerStudent(fullName, email, studentId || '', phone || '');
    return NextResponse.json({ success: true, student });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
