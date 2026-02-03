import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT ManuscriptID, Title, Library, Shelfmark, Date, DigitisedURL
      FROM dbo.Manuscript
      ORDER BY Shelfmark ASC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching manuscripts:', error);
    return NextResponse.json([], { status: 200 });
  }
}
