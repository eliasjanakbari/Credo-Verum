import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');

    const pool = await getPool();

    let query = `
      SELECT w.WorkID, w.AuthorID, w.Title, w.Summary, w.PublishedDateLabel, a.Name as AuthorName
      FROM dbo.Work w
      LEFT JOIN dbo.Authors a ON w.AuthorID = a.AuthorID
    `;

    if (authorId) {
      const result = await pool.request()
        .input('authorId', sql.NVarChar(50), authorId)
        .query(query + ` WHERE w.AuthorID = @authorId ORDER BY w.Title ASC`);
      return NextResponse.json(result.recordset);
    }

    query += ` ORDER BY w.Title ASC`;
    const result = await pool.request().query(query);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching works:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { Title, AuthorID, Summary, PublishedDateLabel, PublishedYear } = await request.json();

    if (!Title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    const workId = generateId();

    // Parse year for PublishedDate, default to year 100 AD
    let publishedYear = 100;
    if (PublishedYear) {
      const parsed = parseInt(PublishedYear);
      if (!isNaN(parsed)) publishedYear = parsed;
    }

    await pool.request()
      .input('workId', sql.NVarChar(50), workId)
      .input('authorId', sql.NVarChar(50), AuthorID || null)
      .input('title', sql.NVarChar, Title)
      .input('summary', sql.NVarChar, Summary || null)
      .input('publishedDateLabel', sql.NVarChar, PublishedDateLabel || null)
      .input('publishedDate', sql.Date, new Date(publishedYear, 0, 1))
      .query(`
        INSERT INTO dbo.Work (WorkID, AuthorID, Title, Summary, PublishedDateLabel, PublishedDate, createdAt, updatedAt)
        VALUES (@workId, @authorId, @title, @summary, @publishedDateLabel, @publishedDate, GETDATE(), GETDATE())
      `);

    return NextResponse.json({ success: true, workId });
  } catch (error) {
    console.error('Error creating work:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create work' },
      { status: 500 }
    );
  }
}
