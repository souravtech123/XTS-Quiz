import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const students = await db.getStudents();
  return NextResponse.json({ students });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await req.json();
  const { fullName, email, studentId, phone } = body;
  if (!fullName || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
  }

  const newStudent = await db.addStudentManually({
    fullName,
    email,
    studentId: studentId || '',
    phone: phone || ''
  });
  return NextResponse.json({ success: true, student: newStudent });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

  const deleted = await db.deleteStudent(id);
  return NextResponse.json({ success: deleted });
}
