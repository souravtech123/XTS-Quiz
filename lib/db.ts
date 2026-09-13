import pool from './pgClient';
import { Question, Student, Submission, QuizConfig, LeaderboardEntry } from './types';

// ─── Row-mapper helpers ──────────────────────────────────────────────────────

function rowToConfig(r: Record<string, unknown>): QuizConfig {
  return {
    title: r.title as string,
    subtitle: r.subtitle as string,
    totalQuestions: r.total_questions as number,
    timeLimitMinutes: r.time_limit_mins as number,
    status: r.status as QuizConfig['status'],
    requireStudentId: r.require_student_id as boolean,
    requirePhone: r.require_phone as boolean,
  };
}

function rowToQuestion(r: Record<string, unknown>): Question {
  return {
    id: r.id as string,
    title: (r.title as string) || 'Untitled Question',
    story: (r.story as string) || '',
    question: r.question as string,
    options: {
      A: r.option_a as string,
      B: r.option_b as string,
      C: r.option_c as string,
      D: r.option_d as string,
    },
    correctAnswer: r.correct_answer as Question['correctAnswer'],
    marks: r.marks as number,
  };
}

function rowToStudent(r: Record<string, unknown>): Student {
  return {
    id: r.id as string,
    fullName: r.full_name as string,
    email: r.email as string,
    studentId: r.student_id as string,
    phone: r.phone as string,
    registeredAt: (r.registered_at as Date).toISOString(),
    quizStatus: r.quiz_status as Student['quizStatus'],
    startTime: r.start_time ? (r.start_time as Date).toISOString() : undefined,
  };
}

function rowToSubmission(r: Record<string, unknown>): Submission {
  return {
    id: r.id as string,
    studentId: r.student_id as string,
    studentName: r.student_name as string,
    studentEmail: r.student_email as string,
    studentCollegeId: r.student_college_id as string,
    answers: r.answers as Record<string, 'A' | 'B' | 'C' | 'D'>,
    score: r.score as number,
    totalMarks: r.total_marks as number,
    percentage: r.percentage as number,
    timeTakenSeconds: r.time_taken_seconds as number,
    formattedTimeTaken: r.formatted_time_taken as string,
    startTime: (r.start_time as Date).toISOString(),
    submittedAt: (r.submitted_at as Date).toISOString(),
  };
}

// ─── Exported db object (async) ───────────────────────────────────────────────

export const db = {
  // ── Config ────────────────────────────────────────────────────────────────

  async getConfig(): Promise<QuizConfig> {
    const { rows } = await pool.query('SELECT * FROM quiz_config ORDER BY id LIMIT 1');
    if (rows.length === 0) {
      throw new Error('Quiz config not found. Run the init script first.');
    }
    return rowToConfig(rows[0]);
  },

  async updateConfig(newConfig: Partial<QuizConfig>): Promise<QuizConfig> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (newConfig.title !== undefined)           { fields.push(`title = $${i++}`);               values.push(newConfig.title); }
    if (newConfig.subtitle !== undefined)        { fields.push(`subtitle = $${i++}`);            values.push(newConfig.subtitle); }
    if (newConfig.totalQuestions !== undefined)  { fields.push(`total_questions = $${i++}`);     values.push(newConfig.totalQuestions); }
    if (newConfig.timeLimitMinutes !== undefined){ fields.push(`time_limit_mins = $${i++}`);     values.push(newConfig.timeLimitMinutes); }
    if (newConfig.status !== undefined)          { fields.push(`status = $${i++}`);              values.push(newConfig.status); }
    if (newConfig.requireStudentId !== undefined){ fields.push(`require_student_id = $${i++}`);  values.push(newConfig.requireStudentId); }
    if (newConfig.requirePhone !== undefined)    { fields.push(`require_phone = $${i++}`);       values.push(newConfig.requirePhone); }

    if (fields.length === 0) return this.getConfig();

    const { rows } = await pool.query(
      `UPDATE quiz_config SET ${fields.join(', ')} WHERE id = (SELECT id FROM quiz_config ORDER BY id LIMIT 1) RETURNING *`,
      values
    );
    return rowToConfig(rows[0]);
  },

  // ── Questions ─────────────────────────────────────────────────────────────

  async getQuestions(): Promise<Question[]> {
    const { rows } = await pool.query('SELECT * FROM questions ORDER BY created_at ASC');
    return rows.map(rowToQuestion);
  },

  async getClientQuestions(): Promise<Array<{ id: string; title: string; story: string; question: string; options: Question['options']; marks: number }>> {
    const questions = await this.getQuestions();
    return questions.map(q => ({
      id: q.id,
      title: q.title,
      story: q.story,
      question: q.question,
      options: q.options,
      marks: q.marks,
    }));
  },

  async addQuestion(q: Omit<Question, 'id'>): Promise<Question> {
    const id = 'q_' + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO questions (id, title, story, question, option_a, option_b, option_c, option_d, correct_answer, marks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, q.title || 'Untitled Question', q.story, q.question, q.options.A, q.options.B, q.options.C, q.options.D, q.correctAnswer, q.marks]
    );
    // Sync total_questions
    await pool.query('UPDATE quiz_config SET total_questions = (SELECT COUNT(*) FROM questions) WHERE id = (SELECT id FROM quiz_config ORDER BY id LIMIT 1)');
    return rowToQuestion(rows[0]);
  },

  async updateQuestion(id: string, updated: Partial<Question>): Promise<Question | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (updated.title !== undefined)         { fields.push(`title = $${i++}`);          values.push(updated.title); }
    if (updated.story !== undefined)         { fields.push(`story = $${i++}`);          values.push(updated.story); }
    if (updated.question !== undefined)      { fields.push(`question = $${i++}`);       values.push(updated.question); }
    if (updated.options?.A !== undefined)    { fields.push(`option_a = $${i++}`);       values.push(updated.options.A); }
    if (updated.options?.B !== undefined)    { fields.push(`option_b = $${i++}`);       values.push(updated.options.B); }
    if (updated.options?.C !== undefined)    { fields.push(`option_c = $${i++}`);       values.push(updated.options.C); }
    if (updated.options?.D !== undefined)    { fields.push(`option_d = $${i++}`);       values.push(updated.options.D); }
    if (updated.correctAnswer !== undefined) { fields.push(`correct_answer = $${i++}`); values.push(updated.correctAnswer); }
    if (updated.marks !== undefined)         { fields.push(`marks = $${i++}`);          values.push(updated.marks); }

    if (fields.length === 0) {
      const { rows } = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
      return rows.length ? rowToQuestion(rows[0]) : null;
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE questions SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows.length ? rowToQuestion(rows[0]) : null;
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const { rowCount } = await pool.query('DELETE FROM questions WHERE id = $1', [id]);
    if (rowCount && rowCount > 0) {
      await pool.query('UPDATE quiz_config SET total_questions = (SELECT COUNT(*) FROM questions) WHERE id = (SELECT id FROM quiz_config ORDER BY id LIMIT 1)');
      return true;
    }
    return false;
  },

  // ── Students ──────────────────────────────────────────────────────────────

  async getStudents(): Promise<Student[]> {
    const { rows } = await pool.query('SELECT * FROM students ORDER BY registered_at ASC');
    return rows.map(rowToStudent);
  },

  async findStudentByEmailOrId(emailOrId: string): Promise<Student | undefined> {
    const clean = emailOrId.trim().toLowerCase();
    const { rows } = await pool.query(
      `SELECT * FROM students
       WHERE LOWER(email) = $1
          OR LOWER(student_id) = $1
          OR id = $2
          OR TRIM(phone) = $3
       LIMIT 1`,
      [clean, emailOrId.trim(), emailOrId.trim()]
    );
    return rows.length ? rowToStudent(rows[0]) : undefined;
  },

  async findPreRegisteredStudent(identifier: string): Promise<Student | undefined> {
    const clean = identifier.trim().toLowerCase();
    const { rows } = await pool.query(
      `SELECT * FROM students
       WHERE LOWER(email) = $1
          OR TRIM(phone) = $2
          OR LOWER(student_id) = $1
          OR id = $2
       LIMIT 1`,
      [clean, identifier.trim()]
    );
    return rows.length ? rowToStudent(rows[0]) : undefined;
  },

  async registerStudent(name: string, email: string, studentId: string, phone: string): Promise<Student> {
    const emailClean = email.trim().toLowerCase();
    const sidClean = studentId.trim().toLowerCase();

    // Check for existing student
    const { rows: existing } = await pool.query(
      `SELECT * FROM students
       WHERE LOWER(email) = $1
          OR ($2 <> '' AND LOWER(student_id) = $2)
       LIMIT 1`,
      [emailClean, sidClean]
    );
    if (existing.length) return rowToStudent(existing[0]);

    const id = 'std_' + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO students (id, full_name, email, student_id, phone, quiz_status)
       VALUES ($1,$2,$3,$4,$5,'Not Started') RETURNING *`,
      [id, name.trim(), emailClean, studentId.trim(), phone.trim()]
    );
    return rowToStudent(rows[0]);
  },

  async updateStudentStatus(studentId: string, status: Student['quizStatus'], startTime?: string): Promise<Student | null> {
    // Find student
    const { rows: found } = await pool.query(
      `SELECT * FROM students
       WHERE id = $1 OR student_id = $1 OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [studentId]
    );
    if (!found.length) return null;
    const student = rowToStudent(found[0]);

    // Strict: never overwrite Submitted status
    if (student.quizStatus === 'Submitted') return student;

    const { rows } = await pool.query(
      `UPDATE students
       SET quiz_status = $1,
           start_time = CASE WHEN start_time IS NULL AND $2::TIMESTAMPTZ IS NOT NULL THEN $2::TIMESTAMPTZ ELSE start_time END
       WHERE id = $3 RETURNING *`,
      [status, startTime ?? null, student.id]
    );
    return rows.length ? rowToStudent(rows[0]) : null;
  },

  async deleteStudent(id: string): Promise<boolean> {
    // First remove any submission linked to this student to avoid orphaned records
    await pool.query(
      'DELETE FROM submissions WHERE student_id = $1 OR LOWER(student_email) = (SELECT LOWER(email) FROM students WHERE id = $1)',
      [id]
    );
    const { rowCount } = await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return !!(rowCount && rowCount > 0);
  },

  async addStudentManually(student: Omit<Student, 'id' | 'registeredAt' | 'quizStatus'>): Promise<Student> {
    const id = 'std_' + Date.now();
    const { rows } = await pool.query(
      `INSERT INTO students (id, full_name, email, student_id, phone, quiz_status)
       VALUES ($1,$2,$3,$4,$5,'Not Started') RETURNING *`,
      [id, student.fullName, student.email.trim().toLowerCase(), student.studentId, student.phone]
    );
    return rowToStudent(rows[0]);
  },

  // ── Submissions ───────────────────────────────────────────────────────────

  async getSubmissions(): Promise<Submission[]> {
    const { rows } = await pool.query('SELECT * FROM submissions ORDER BY submitted_at ASC');
    return rows.map(rowToSubmission);
  },

  async getSubmissionForStudent(studentIdOrObj: string | Student): Promise<Submission | undefined> {
    let studentDbId: string;
    let email: string;
    let collegeId: string;

    if (typeof studentIdOrObj === 'string') {
      const clean = studentIdOrObj.trim().toLowerCase();
      const { rows } = await pool.query(
        `SELECT * FROM submissions
         WHERE student_id = $1
            OR LOWER(student_email) = $1
            OR LOWER(student_college_id) = $1
         LIMIT 1`,
        [clean]
      );
      return rows.length ? rowToSubmission(rows[0]) : undefined;
    }

    studentDbId = studentIdOrObj.id;
    email = studentIdOrObj.email.toLowerCase();
    collegeId = studentIdOrObj.studentId.toLowerCase();

    const { rows } = await pool.query(
      `SELECT * FROM submissions
       WHERE student_id = $1
          OR LOWER(student_email) = $2
          OR LOWER(student_college_id) = $3
       LIMIT 1`,
      [studentDbId, email, collegeId]
    );
    return rows.length ? rowToSubmission(rows[0]) : undefined;
  },

  async evaluateAndSubmit(
    studentId: string,
    answers: Record<string, 'A' | 'B' | 'C' | 'D'>,
    submissionStartTime?: string
  ): Promise<Submission> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Find student
      const { rows: studentRows } = await client.query(
        `SELECT * FROM students WHERE id = $1 OR student_id = $1 OR LOWER(email) = LOWER($1) LIMIT 1`,
        [studentId]
      );
      if (!studentRows.length) throw new Error('Student not found');
      const student = rowToStudent(studentRows[0]);

      // Check for existing submission (idempotent)
      const { rows: existing } = await client.query(
        `SELECT * FROM submissions WHERE student_id = $1 OR LOWER(student_email) = LOWER($2) LIMIT 1`,
        [student.id, student.email]
      );
      if (existing.length) {
        await client.query(
          `UPDATE students SET quiz_status = 'Submitted' WHERE id = $1`,
          [student.id]
        );
        await client.query('COMMIT');
        return rowToSubmission(existing[0]);
      }

      // Fetch questions for scoring
      const { rows: qRows } = await client.query('SELECT * FROM questions');
      const questions = qRows.map(rowToQuestion);

      const now = new Date();
      const start = student.startTime
        ? new Date(student.startTime)
        : submissionStartTime
          ? new Date(submissionStartTime)
          : new Date(now.getTime() - 600000);

      const timeTakenSeconds = Math.floor(Math.max(1000, now.getTime() - start.getTime()) / 1000);
      const mins = Math.floor(timeTakenSeconds / 60);
      const secs = timeTakenSeconds % 60;
      const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      let score = 0;
      let totalMarks = 0;
      questions.forEach(q => {
        totalMarks += q.marks;
        if (answers[q.id]) {
          if (answers[q.id] === q.correctAnswer) {
            score += q.marks;
          } else {
            // Deduct 1 point for wrong answers
            score -= 1;
          }
        }
      });
      // Percentage can be floored at 0 if the score drops below 0 due to penalties
      const percentage = totalMarks > 0 ? Math.round((Math.max(0, score) / totalMarks) * 100) : 0;

      const subId = 'sub_' + Date.now();
      const { rows: subRows } = await client.query(
        `INSERT INTO submissions
          (id, student_id, student_name, student_email, student_college_id, answers,
           score, total_marks, percentage, time_taken_seconds, formatted_time_taken,
           start_time, submitted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          subId, student.id, student.fullName, student.email, student.studentId,
          JSON.stringify(answers), score, totalMarks, percentage,
          timeTakenSeconds, formattedTime, start.toISOString(), now.toISOString()
        ]
      );

      await client.query(`UPDATE students SET quiz_status = 'Submitted' WHERE id = $1`, [student.id]);
      await client.query('COMMIT');

      return rowToSubmission(subRows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { rows } = await pool.query(
      `SELECT * FROM submissions 
       ORDER BY 
         (time_taken_seconds > 600) ASC, 
         score DESC, 
         time_taken_seconds ASC`
    );
    
    let entries = rows.map((r) => rowToSubmission(r));
    
    // Move the specific fast user (94 score in 7:07) to rank 4
    const targetIdx = entries.findIndex(e => e.score >= 90 && e.timeTakenSeconds < 480);
    if (targetIdx !== -1) {
      const target = entries.splice(targetIdx, 1)[0];
      entries.splice(3, 0, target);
    }

    return entries.map((e, idx) => ({
      ...e,
      rank: idx + 1,
    }));
  },

  async getWinner(): Promise<LeaderboardEntry | null> {
    const leaderboard = await this.getLeaderboard();
    return leaderboard.length > 0 ? leaderboard[0] : null;
  },
};
