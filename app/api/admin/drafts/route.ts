import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

// Get all drafts
export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT DraftID, DraftData, CreatedDate, UpdatedDate
      FROM dbo.SubmissionDraft
      ORDER BY UpdatedDate DESC
    `);

    // Parse the JSON data for each draft
    const drafts = result.recordset.map(row => ({
      ...row,
      DraftData: typeof row.DraftData === 'string'
        ? JSON.parse(row.DraftData)
        : row.DraftData,
    }));

    return NextResponse.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Save or update a draft
export async function POST(request: Request) {
  try {
    const { draftId, formData } = await request.json();
    const pool = await getPool();
    const draftDataJson = JSON.stringify(formData);

    let resultDraftId = draftId;

    if (draftId) {
      // Update existing draft
      await pool.request()
        .input('draftId', sql.Int, draftId)
        .input('draftData', sql.NVarChar, draftDataJson)
        .query(`
          UPDATE dbo.SubmissionDraft
          SET DraftData = @draftData,
              UpdatedDate = GETDATE()
          WHERE DraftID = @draftId
        `);
    } else {
      // Create new draft
      const result = await pool.request()
        .input('draftData', sql.NVarChar, draftDataJson)
        .query(`
          INSERT INTO dbo.SubmissionDraft (DraftData, CreatedDate, UpdatedDate)
          VALUES (@draftData, GETDATE(), GETDATE());
          SELECT SCOPE_IDENTITY() AS DraftID;
        `);
      resultDraftId = result.recordset[0].DraftID;
    }

    return NextResponse.json({
      success: true,
      draftId: resultDraftId,
      message: draftId ? 'Draft updated' : 'Draft created',
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
