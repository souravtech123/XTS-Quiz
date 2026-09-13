import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const leaderboard = await db.getLeaderboard();
  const winner = await db.getWinner();

  return NextResponse.json({ leaderboard, winner });
}
