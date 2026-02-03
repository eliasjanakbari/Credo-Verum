import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

// Helper function to generate random string IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TagID, Tag
      FROM dbo.Tag
      ORDER BY Tag ASC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { Tag } = await request.json();

    if (!Tag) {
      return NextResponse.json(
        { success: false, error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    const tagId = generateId();

    await pool.request()
      .input('tagId', sql.NVarChar(50), tagId)
      .input('tag', sql.NVarChar, Tag)
      .query(`
        INSERT INTO dbo.Tag (TagID, Tag)
        VALUES (@tagId, @tag)
      `);

    return NextResponse.json({ success: true, tagId });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
