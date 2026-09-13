import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json({ error: 'Email or Student ID is required.' }, { status: 400 });
    }

    const student = await db.findStudentByEmailOrId(identifier);
    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found. Please register first.' },
        { status: 404 }
      );
    }

    const config = await db.getConfig();
    const submission = await db.getSubmissionForStudent(student.id);

    return NextResponse.json({
      success: true,
      student,
      config,
      hasSubmitted: !!submission,
      submissionStatus: student.quizStatus
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
