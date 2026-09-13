import { Pool } from 'pg';
import * as fs from 'fs';

// Load .env manually
const envContent = fs.readFileSync('/home/sourav/Desktop/QUIZ-PLATFORM/xts-quiz/.env', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > -1) {
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Connected to Neon DB...');

    // Ensure quiz_config row exists and is Live
    const { rows: cfgRows } = await client.query('SELECT id FROM quiz_config LIMIT 1');
    if (cfgRows.length === 0) {
      await client.query(`
        INSERT INTO quiz_config (title, subtitle, total_questions, time_limit_mins, status, require_student_id, require_phone)
        VALUES ('XTS Tech Arena — Season 1', 'Test your technical knowledge. Challenge yourself.', 10, 10, 'Live', true, true)
      `);
      console.log('quiz_config row created');
    } else {
      await client.query(`UPDATE quiz_config SET status = 'Live' WHERE id = $1`, [cfgRows[0].id]);
      console.log('quiz_config status set to Live');
    }

    // Insert 10 test questions
    const questions = [
      { id: 'q_test_001', question: 'Which data structure follows FIFO (First In First Out) principle?', a: 'Stack', b: 'Queue', c: 'Tree', d: 'Graph', correct: 'B', marks: 1 },
      { id: 'q_test_002', question: 'What is the time complexity of Binary Search on a sorted array?', a: 'O(n)', b: 'O(n log n)', c: 'O(log n)', d: 'O(1)', correct: 'C', marks: 1 },
      { id: 'q_test_003', question: 'Which OSI layer is responsible for end-to-end communication and error recovery?', a: 'Network Layer', b: 'Data Link Layer', c: 'Transport Layer', d: 'Session Layer', correct: 'C', marks: 1 },
      { id: 'q_test_004', question: 'Which SQL command removes all rows from a table without deleting the table structure?', a: 'DELETE', b: 'DROP', c: 'REMOVE', d: 'TRUNCATE', correct: 'D', marks: 1 },
      { id: 'q_test_005', question: 'Which OS scheduling algorithm gives the shortest average waiting time?', a: 'FCFS', b: 'Round Robin', c: 'SJF (Shortest Job First)', d: 'Priority Scheduling', correct: 'C', marks: 1 },
      { id: 'q_test_006', question: 'What does the "this" keyword refer to inside a JavaScript arrow function?', a: 'The arrow function itself', b: 'The enclosing lexical context', c: 'Always the global window object', d: 'undefined', correct: 'B', marks: 1 },
      { id: 'q_test_007', question: 'Which of the following is NOT a valid HTTP method?', a: 'GET', b: 'POST', c: 'FETCH', d: 'DELETE', correct: 'C', marks: 1 },
      { id: 'q_test_008', question: 'In a relational database, what is a "foreign key"?', a: 'A key used for encryption', b: 'A primary key from another table used to link tables', c: 'A composite key made of two columns', d: 'An index key for performance', correct: 'B', marks: 1 },
      { id: 'q_test_009', question: 'Which sorting algorithm has the best worst-case time complexity: O(n log n)?', a: 'Quick Sort', b: 'Bubble Sort', c: 'Merge Sort', d: 'Insertion Sort', correct: 'C', marks: 1 },
      { id: 'q_test_010', question: 'What does CPU stand for in computer architecture?', a: 'Central Processing Unit', b: 'Core Programming Utility', c: 'Computer Processing Unit', d: 'Central Program Uploader', correct: 'A', marks: 1 }
    ];

    let questionsAdded = 0;
    for (const q of questions) {
      const { rows: existing } = await client.query('SELECT id FROM questions WHERE id = $1', [q.id]);
      if (existing.length === 0) {
        await client.query(
          'INSERT INTO questions (id, question, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [q.id, q.question, q.a, q.b, q.c, q.d, q.correct, q.marks]
        );
        questionsAdded++;
      }
    }
    console.log(questionsAdded + ' questions inserted (' + (questions.length - questionsAdded) + ' already existed)');

    // Sync total_questions
    await client.query('UPDATE quiz_config SET total_questions = (SELECT COUNT(*) FROM questions) WHERE id = (SELECT id FROM quiz_config ORDER BY id LIMIT 1)');

    // Insert 5 test students
    const students = [
      { id: 'std_test_001', name: 'Sourav Suman',   email: 'sourav@test.com',  sid: 'XTS2026001', phone: '9876543210' },
      { id: 'std_test_002', name: 'Priya Sharma',   email: 'priya@test.com',   sid: 'XTS2026002', phone: '9876543211' },
      { id: 'std_test_003', name: 'Rahul Verma',    email: 'rahul@test.com',   sid: 'XTS2026003', phone: '9876543212' },
      { id: 'std_test_004', name: 'Anjali Gupta',   email: 'anjali@test.com',  sid: 'XTS2026004', phone: '9876543213' },
      { id: 'std_test_005', name: 'Arjun Mehta',    email: 'arjun@test.com',   sid: 'XTS2026005', phone: '9876543214' },
    ];

    let studentsAdded = 0;
    for (const s of students) {
      const { rows: existing } = await client.query('SELECT id FROM students WHERE id = $1', [s.id]);
      if (existing.length === 0) {
        await client.query(
          "INSERT INTO students (id, full_name, email, student_id, phone, quiz_status) VALUES ($1,$2,$3,$4,$5,'Not Started')",
          [s.id, s.name, s.email.toLowerCase(), s.sid, s.phone]
        );
        studentsAdded++;
      }
    }
    console.log(studentsAdded + ' students inserted (' + (students.length - studentsAdded) + ' already existed)');

    // Summary
    const { rows: qCount } = await client.query('SELECT COUNT(*) as count FROM questions');
    const { rows: sCount } = await client.query('SELECT COUNT(*) as count FROM students');
    const { rows: subCount } = await client.query('SELECT COUNT(*) as count FROM submissions');
    const { rows: cfg } = await client.query('SELECT status, total_questions, time_limit_mins FROM quiz_config LIMIT 1');

    console.log('\n=== DATABASE SUMMARY ===');
    console.log('Questions   : ' + qCount[0].count);
    console.log('Students    : ' + sCount[0].count);
    console.log('Submissions : ' + subCount[0].count);
    console.log('Quiz Status : ' + cfg[0]?.status);
    console.log('Time Limit  : ' + cfg[0]?.time_limit_mins + ' minutes');
    console.log('\n=== TEST STUDENT LOGINS (use at /quiz) ===');
    for (const s of students) {
      console.log(s.name + ' | Email: ' + s.email + ' | Phone: ' + s.phone);
    }
    console.log('\nAdmin Login: http://localhost:3000/admin/login  (admin@xts.org / admin123)');
    console.log('Quiz Page  : http://localhost:3000/quiz');

  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
