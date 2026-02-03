import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

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
