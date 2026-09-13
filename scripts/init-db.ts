/**
 * scripts/init-db.ts
 *
 * One-time DB initialisation script.
 * Run with:  npx tsx scripts/init-db.ts
 *
 * It will:
 *  1. Create all tables (idempotent — uses IF NOT EXISTS)
 *  2. Seed the default quiz config (if empty)
 *  3. Seed the default 10 questions (if empty)
 *  4. Seed 2 demo students + their submissions (if empty)
 */

import 'dotenv/config'; // loads .env.local automatically via dotenv
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  console.log('✅ Connected to PostgreSQL');

  try {
    await client.query('BEGIN');

    // ── 1. Run schema DDL ─────────────────────────────────────────────
    const schemaPath = path.join(__dirname, '../lib/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schemaSql);
    console.log('✅ Schema created / verified');

    // ── 2. Seed quiz_config ───────────────────────────────────────────
    const { rowCount: configCount } = await client.query('SELECT 1 FROM quiz_config LIMIT 1');
    if (!configCount) {
      await client.query(`
        INSERT INTO quiz_config (title, subtitle, total_questions, time_limit_mins, status, require_student_id, require_phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'XTS Tech Arena — Season 1',
        'Test your technical knowledge. Challenge yourself. Compete with the best.',
        10, 10, 'Live', true, true
      ]);
      console.log('✅ Default config seeded');
    } else {
      console.log('ℹ️  Config already exists — skipped');
    }

    // ── 3. Seed questions ─────────────────────────────────────────────
    const { rowCount: qCount } = await client.query('SELECT 1 FROM questions LIMIT 1');
    if (!qCount) {
      const questions = [
        { id: 'q1', q: 'Which data structure operates on a First-In, First-Out (FIFO) basis?', a: 'Stack', b: 'Queue', c: 'Binary Search Tree', d: 'Heap', ans: 'B' },
        { id: 'q2', q: 'What is the worst-case time complexity of Quick Sort algorithm?', a: 'O(n log n)', b: 'O(n)', c: 'O(n²)', d: 'O(log n)', ans: 'C' },
        { id: 'q3', q: 'In HTTP, which status code indicates "Unauthorized" access?', a: '400', b: '401', c: '403', d: '404', ans: 'B' },
        { id: 'q4', q: 'Which CPU scheduling algorithm gives minimum average waiting time for a given set of processes?', a: 'FCFS (First Come First Serve)', b: 'Round Robin', c: 'SJF (Shortest Job First)', d: 'Priority Scheduling', ans: 'C' },
        { id: 'q5', q: 'In Relational Databases, which Normal Form deals with removing transitive dependencies?', a: '1NF', b: '2NF', c: '3NF', d: 'BCNF', ans: 'C' },
        { id: 'q6', q: 'Which of the following JavaScript features enables closure?', a: 'Lexical Scoping', b: 'Prototypal Inheritance', c: 'Asynchronous Event Loop', d: 'Hoisting', ans: 'A' },
        { id: 'q7', q: 'What does the `git rebase` command do?', a: 'Merges two branches creating a commit with 2 parents', b: 'Re-applies commits on top of another base tip', c: 'Reverts the latest commit without changing history', d: 'Deletes local untracked files', ans: 'B' },
        { id: 'q8', q: 'Which memory section in a running C process stores dynamically allocated memory via `malloc()`?', a: 'Stack', b: 'Heap', c: 'BSS Segment', d: 'Text Segment', ans: 'B' },
        { id: 'q9', q: 'In Computer Networks, at which OSI model layer does the IP protocol operate?', a: 'Data Link Layer', b: 'Transport Layer', c: 'Network Layer', d: 'Session Layer', ans: 'C' },
        { id: 'q10', q: 'What is the primary purpose of Docker containerization?', a: 'Full OS Hardware Virtualization', b: 'Lightweight application isolation sharing host kernel', c: 'Static code compilation', d: 'Database indexing optimization', ans: 'B' },
      ];
      for (const q of questions) {
        await client.query(
          `INSERT INTO questions (id, question, option_a, option_b, option_c, option_d, correct_answer, marks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 1)`,
          [q.id, q.q, q.a, q.b, q.c, q.d, q.ans]
        );
      }
      // Sync total_questions in config
      await client.query('UPDATE quiz_config SET total_questions = 10');
      console.log('✅ Default questions seeded');
    } else {
      console.log('ℹ️  Questions already exist — skipped');
    }

    // ── 4. Seed demo students & submissions ───────────────────────────
    const { rowCount: sCount } = await client.query('SELECT 1 FROM students LIMIT 1');
    if (!sCount) {
      const now = Date.now();
      const s1StartTime = new Date(now - 3600000).toISOString();
      const s2StartTime = new Date(now - 7200000).toISOString();

      await client.query(
        `INSERT INTO students (id, full_name, email, student_id, phone, registered_at, quiz_status, start_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        ['demo-student-1', 'Aarav Sharma', 'aarav@example.com', 'XTS202601', '9876543210', s1StartTime, 'Submitted', s1StartTime]
      );
      await client.query(
        `INSERT INTO students (id, full_name, email, student_id, phone, registered_at, quiz_status, start_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        ['demo-student-2', 'Ananya Roy', 'ananya@example.com', 'XTS202602', '9876543211', s2StartTime, 'Submitted', s2StartTime]
      );

      await client.query(
        `INSERT INTO submissions (id, student_id, student_name, student_email, student_college_id, answers, score, total_marks, percentage, time_taken_seconds, formatted_time_taken, start_time, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        ['sub-1','demo-student-1','Aarav Sharma','aarav@example.com','XTS202601',
          JSON.stringify({q1:'B',q2:'C',q3:'B',q4:'C',q5:'C',q6:'A',q7:'B',q8:'B',q9:'C',q10:'B'}),
          10, 10, 100, 402, '06:42', s1StartTime, new Date(now - 3600000 + 402000).toISOString()]
      );
      await client.query(
        `INSERT INTO submissions (id, student_id, student_name, student_email, student_college_id, answers, score, total_marks, percentage, time_taken_seconds, formatted_time_taken, start_time, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        ['sub-2','demo-student-2','Ananya Roy','ananya@example.com','XTS202602',
          JSON.stringify({q1:'B',q2:'C',q3:'B',q4:'C',q5:'C',q6:'A',q7:'B',q8:'B',q9:'C',q10:'A'}),
          9, 10, 90, 331, '05:31', s2StartTime, new Date(now - 7200000 + 331000).toISOString()]
      );
      console.log('✅ Demo students & submissions seeded');
    } else {
      console.log('ℹ️  Students already exist — skipped');
    }

    await client.query('COMMIT');
    console.log('\n🎉 Database initialised successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Init failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
