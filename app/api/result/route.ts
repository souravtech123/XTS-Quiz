import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required.' }, { status: 400 });
    }

    const student = await db.findStudentByEmailOrId(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const submission = await db.getSubmissionForStudent(student.id);
    if (!submission) {
      return NextResponse.json({ error: 'No quiz submission found for student.' }, { status: 404 });
    }

    // STRICT ISOLATION: Return ONLY individual student result fields
    return NextResponse.json({
      success: true,
      studentName: student.fullName,
      studentEmail: student.email,
      studentId: student.studentId,
      score: submission.score,
      totalMarks: submission.totalMarks,
      percentage: submission.percentage,
      timeTaken: submission.formattedTimeTaken,
      submittedAt: submission.submittedAt,
      status: 'Submitted'
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Result retrieval failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
