import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT AuthorID, Name, Lifespan, Bio
      FROM dbo.Authors
      ORDER BY Name ASC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { Name, Lifespan, Bio } = await request.json();

    if (!Name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    const authorId = generateId();

    await pool.request()
      .input('authorId', sql.NVarChar(50), authorId)
      .input('name', sql.NVarChar, Name)
      .input('lifespan', sql.NVarChar, Lifespan || null)
      .input('bio', sql.NVarChar, Bio || null)
      .query(`
        INSERT INTO dbo.Authors (AuthorID, Name, Lifespan, Bio, createdAt, updatedAt)
        VALUES (@authorId, @name, @lifespan, @bio, GETDATE(), GETDATE())
      `);

    return NextResponse.json({ success: true, authorId });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create author' },
      { status: 500 }
    );
  }
}
