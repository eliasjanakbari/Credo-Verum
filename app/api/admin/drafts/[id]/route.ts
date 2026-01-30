import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

// Get a specific draft
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draftId = parseInt(id);
    const pool = await getPool();

    const result = await pool.request()
      .input('draftId', sql.Int, draftId)
      .query(`
        SELECT DraftID, DraftData, CreatedDate, UpdatedDate
        FROM dbo.SubmissionDraft
        WHERE DraftID = @draftId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    const draft = result.recordset[0];
    draft.DraftData = typeof draft.DraftData === 'string'
      ? JSON.parse(draft.DraftData)
      : draft.DraftData;

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

// Delete a draft
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draftId = parseInt(id);
    const pool = await getPool();

    await pool.request()
      .input('draftId', sql.Int, draftId)
      .query(`
        DELETE FROM dbo.SubmissionDraft
        WHERE DraftID = @draftId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
