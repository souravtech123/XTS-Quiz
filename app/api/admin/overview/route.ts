import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const [students, questions, config, submissions] = await Promise.all([
    db.getStudents(),
    db.getQuestions(),
    db.getConfig(),
    db.getSubmissions(),
  ]);

  const totalRegistered = students.length;
  const totalSubmissions = submissions.length;
  const inProgress = students.filter(s => s.quizStatus === 'In Progress').length;
  const completionRate = totalRegistered > 0 ? Math.round((totalSubmissions / totalRegistered) * 100) : 0;

  return NextResponse.json({
    totalRegistered,
    totalParticipants: totalSubmissions + inProgress,
    totalSubmissions,
    inProgress,
    totalQuestions: questions.length,
    completionRate,
    quizStatus: config.status,
    config
  });
}
