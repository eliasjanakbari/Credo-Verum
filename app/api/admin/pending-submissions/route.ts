import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT PendingID, SubmissionData, Status, SubmittedBy, SubmittedDate, ReviewedBy, ReviewedDate, ReviewNotes
      FROM PendingSubmission
      WHERE Status = 'Pending'
      ORDER BY SubmittedDate DESC
    `);

    // Parse the JSON data for each submission
    const submissions = result.recordset.map(row => ({
      ...row,
      SubmissionData: typeof row.SubmissionData === 'string'
        ? JSON.parse(row.SubmissionData)
        : row.SubmissionData,
    }));

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    return NextResponse.json([], { status: 200 });
  }
}
