import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: witnessId } = await params;
    const { ImageURL, HighlightImageURL } = await request.json();

    const pool = await getPool();
    await pool.request()
      .input('witnessId', sql.NVarChar(50), witnessId)
      .input('imageURL', sql.NVarChar, ImageURL || null)
      .input('highlightImageURL', sql.NVarChar, HighlightImageURL || null)
      .query(`
        UPDATE dbo.ManuscriptWitness
        SET ImageURL = @imageURL,
            HighlightImageURL = @highlightImageURL
        WHERE WitnessID = @witnessId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating witness:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update witness' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: witnessId } = await params;
    const pool = await getPool();

    await pool.request()
      .input('witnessId', sql.NVarChar(50), witnessId)
      .query(`
        DELETE FROM dbo.ManuscriptWitness
        WHERE WitnessID = @witnessId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting witness:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete witness' },
      { status: 500 }
    );
  }
}
