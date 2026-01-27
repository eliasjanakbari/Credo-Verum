import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('authorId');

    const pool = await getPool();

    let query = `
      SELECT w.WorkID, w.Title, w.Summary, w.PublishedDateLabel, w.OriginalLanguage, a.Name as AuthorName
      FROM Work w
      LEFT JOIN Author a ON w.AuthorID = a.AuthorID
    `;

    if (authorId) {
      query += ` WHERE w.AuthorID = ${authorId}`;
    }

    query += ` ORDER BY w.Title ASC`;

    const result = await pool.request().query(query);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching works:', error);
    return NextResponse.json([], { status: 200 });
  }
}
