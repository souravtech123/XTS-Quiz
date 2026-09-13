import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const questions = await db.getQuestions();
  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await req.json();
  const { story, question, options, correctAnswer, marks } = body;

  if (!question || !options || !correctAnswer) {
    return NextResponse.json({ error: 'Question text, options, and correct answer required' }, { status: 400 });
  }

  const newQ = await db.addQuestion({
    story,
    question,
    options,
    correctAnswer,
    marks: marks ? Number(marks) : 1
  });

  return NextResponse.json({ success: true, question: newQ });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updatedFields } = body;
  if (!id) return NextResponse.json({ error: 'Question ID required' }, { status: 400 });

  const updated = await db.updateQuestion(id, updatedFields);
  if (!updated) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  return NextResponse.json({ success: true, question: updated });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Question ID required' }, { status: 400 });

  const deleted = await db.deleteQuestion(id);
  return NextResponse.json({ success: deleted });
}
