import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workId } = await params;
    const { Title, AuthorID, Summary, PublishedDateLabel } = await request.json();

    const pool = await getPool();
    await pool.request()
      .input('workId', sql.NVarChar(50), workId)
      .input('title', sql.NVarChar, Title)
      .input('authorId', sql.NVarChar(50), AuthorID || null)
      .input('summary', sql.NVarChar, Summary || null)
      .input('publishedDateLabel', sql.NVarChar, PublishedDateLabel || null)
      .query(`
        UPDATE dbo.Work
        SET Title = @title,
            AuthorID = @authorId,
            Summary = @summary,
            PublishedDateLabel = @publishedDateLabel,
            updatedAt = GETDATE()
        WHERE WorkID = @workId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating work:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update work' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workId } = await params;
    const pool = await getPool();

    // Check if work has related evidence passages
    const passagesCheck = await pool.request()
      .input('workId', sql.NVarChar(50), workId)
      .query(`
        SELECT COUNT(*) as Count
        FROM dbo.EvidencePassage
        WHERE WorkID = @workId
      `);

    if (passagesCheck.recordset[0].Count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete work with existing evidence passages. Delete passages first.',
        },
        { status: 400 }
      );
    }

    // Delete the work
    await pool.request()
      .input('workId', sql.NVarChar(50), workId)
      .query(`
        DELETE FROM dbo.Work
        WHERE WorkID = @workId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete work' },
      { status: 500 }
    );
  }
}
