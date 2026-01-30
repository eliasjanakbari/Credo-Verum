import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const pool = await getPool();

    // Store the entire form data as JSON string in the PendingSubmission table
    const submissionDataJson = JSON.stringify(formData);

    const result = await pool.request()
      .input('submissionData', sql.NVarChar, submissionDataJson)
      .query(`
        INSERT INTO PendingSubmission (SubmissionData, Status, SubmittedDate)
        VALUES (@submissionData, 'Pending', GETDATE());
        SELECT SCOPE_IDENTITY() AS PendingID;
      `);

    const pendingId = result.recordset[0].PendingID;

    return NextResponse.json({
      success: true,
      pendingId,
      message: 'Evidence submitted for approval',
    });
  } catch (error) {
    console.error('Error submitting evidence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit evidence' },
      { status: 500 }
    );
  }
}
