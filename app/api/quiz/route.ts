import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const config = await db.getConfig();

    if (!studentId) {
      return NextResponse.json({
        config,
        questions: await db.getClientQuestions()
      });
    }

    const student = await db.findPreRegisteredStudent(studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'Registered student record not found. Please contact your admin.' },
        { status: 404 }
      );
    }

    const existingSubmission = await db.getSubmissionForStudent(student.id);
    if (existingSubmission || student.quizStatus === 'Submitted') {
      return NextResponse.json(
        { error: 'You have already submitted this quiz.', isSubmitted: true, student },
        { status: 400 }
      );
    }

    const questions = await db.getClientQuestions();
    return NextResponse.json({ config, student, questions });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load quiz';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, studentId, action } = body;

    const config = await db.getConfig();
    if (config.status !== 'Live' && config.status !== 'Published') {
      return NextResponse.json(
        { error: `Quiz is currently ${config.status}. It is not open for attempts.` },
        { status: 403 }
      );
    }

    const target = identifier || studentId;
    if (!target || !target.trim()) {
      return NextResponse.json(
        { error: 'Please enter your registered Email address or Phone number.' },
        { status: 400 }
      );
    }

    const student = await db.findPreRegisteredStudent(target);
    if (!student) {
      return NextResponse.json(
        { error: 'Access Denied: Your Email / Phone is not registered by the Admin. Please contact your coordinator.' },
        { status: 404 }
      );
    }

    const existingSubmission = await db.getSubmissionForStudent(student.id);
    const isSubmitted = !!existingSubmission || student.quizStatus === 'Submitted';

    if (isSubmitted) {
      return NextResponse.json(
        {
          error: 'You have already completed and submitted this quiz.',
          isSubmitted: true,
          studentId: student.id,
          student
        },
        { status: 400 }
      );
    }

    if (action === 'verify') {
      return NextResponse.json({ verified: true, student, config });
    }

    const nowIso = new Date().toISOString();
    await db.updateStudentStatus(student.id, 'In Progress', nowIso);
    const questions = await db.getClientQuestions();

    return NextResponse.json({
      success: true,
      startTime: nowIso,
      student,
      config,
      questions
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
