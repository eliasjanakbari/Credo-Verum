import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;
    const { Tag } = await request.json();

    const pool = await getPool();
    await pool.request()
      .input('tagId', sql.NVarChar(50), tagId)
      .input('tag', sql.NVarChar, Tag)
      .query(`
        UPDATE dbo.Tag
        SET Tag = @tag
        WHERE TagID = @tagId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;
    const pool = await getPool();

    // First, delete all EvidenceTag associations
    await pool.request()
      .input('tagId', sql.NVarChar(50), tagId)
      .query(`
        DELETE FROM dbo.EvidenceTag
        WHERE TagID = @tagId
      `);

    // Then delete the tag
    await pool.request()
      .input('tagId', sql.NVarChar(50), tagId)
      .query(`
        DELETE FROM dbo.Tag
        WHERE TagID = @tagId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
