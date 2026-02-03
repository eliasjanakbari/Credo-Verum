import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params;
    const { Name, Lifespan, Bio } = await request.json();

    const pool = await getPool();
    await pool.request()
      .input('authorId', sql.NVarChar(50), authorId)
      .input('name', sql.NVarChar, Name)
      .input('lifespan', sql.NVarChar, Lifespan || null)
      .input('bio', sql.NVarChar, Bio || null)
      .query(`
        UPDATE dbo.Authors
        SET Name = @name,
            Lifespan = @lifespan,
            Bio = @bio,
            updatedAt = GETDATE()
        WHERE AuthorID = @authorId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update author' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: authorId } = await params;
    const pool = await getPool();

    // Check if author has related works
    const worksCheck = await pool.request()
      .input('authorId', sql.NVarChar(50), authorId)
      .query(`
        SELECT COUNT(*) as Count
        FROM dbo.Work
        WHERE AuthorID = @authorId
      `);

    if (worksCheck.recordset[0].Count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete author with existing works. Delete works first.',
        },
        { status: 400 }
      );
    }

    // Delete the author
    await pool.request()
      .input('authorId', sql.NVarChar(50), authorId)
      .query(`
        DELETE FROM dbo.Authors
        WHERE AuthorID = @authorId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete author' },
      { status: 500 }
    );
  }
}
