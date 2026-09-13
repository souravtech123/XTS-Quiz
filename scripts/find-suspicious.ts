import { db } from '../lib/db';
import pool from '../lib/pgClient';

async function main() {
  const { rows } = await pool.query(`SELECT * FROM submissions WHERE percentage >= 90 AND time_taken_seconds < 480`);
  console.log('Suspicious submissions:', rows);
  
  const { rows: top } = await pool.query(`SELECT * FROM submissions ORDER BY score DESC, time_taken_seconds ASC LIMIT 10`);
  console.log('Top 10 normal:', top);
  
  process.exit(0);
}

main().catch(console.error);
