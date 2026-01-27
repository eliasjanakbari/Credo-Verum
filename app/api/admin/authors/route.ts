import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

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
