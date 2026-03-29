import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: manuscriptId } = await params;
    const { Title, Library, Shelfmark, Date, DigitisedURL, FolioGuide } = await request.json();

    const pool = await getPool();
    await pool.request()
      .input('manuscriptId', sql.NVarChar(50), manuscriptId)
      .input('title', sql.NVarChar, Title || null)
      .input('library', sql.NVarChar, Library)
      .input('shelfmark', sql.NVarChar, Shelfmark)
      .input('date', sql.NVarChar, Date || null)
      .input('digitisedURL', sql.NVarChar, DigitisedURL || null)
      .input('folioGuide', sql.NVarChar, FolioGuide || null)
      .query(`
        UPDATE dbo.Manuscript
        SET Title = @title,
            Library = @library,
            Shelfmark = @shelfmark,
            Date = @date,
            DigitisedURL = @digitisedURL,
            FolioGuide = @folioGuide,
            updatedAt = GETDATE()
        WHERE ManuscriptID = @manuscriptId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating manuscript:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update manuscript' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: manuscriptId } = await params;
    const pool = await getPool();

    // Check if manuscript has related witnesses
    const witnessCheck = await pool.request()
      .input('manuscriptId', sql.NVarChar(50), manuscriptId)
      .query(`
        SELECT COUNT(*) as Count
        FROM dbo.ManuscriptWitness
        WHERE ManuscriptID = @manuscriptId
      `);

    if (witnessCheck.recordset[0].Count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete manuscript with existing witness links. Delete witness links first.',
        },
        { status: 400 }
      );
    }

    // Delete the manuscript
    await pool.request()
      .input('manuscriptId', sql.NVarChar(50), manuscriptId)
      .query(`
        DELETE FROM dbo.Manuscript
        WHERE ManuscriptID = @manuscriptId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting manuscript:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete manuscript' },
      { status: 500 }
    );
  }
}
