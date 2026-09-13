import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { studentId, answers, startTime } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required.' }, { status: 400 });
    }

    const student = await db.findStudentByEmailOrId(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    const submission = await db.evaluateAndSubmit(student.id, answers || {}, startTime);

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score: submission.score,
        totalMarks: submission.totalMarks,
        percentage: submission.percentage,
        formattedTimeTaken: submission.formattedTimeTaken,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Submission evaluation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
