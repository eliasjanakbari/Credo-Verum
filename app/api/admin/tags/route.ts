import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TagID, Tag
      FROM Tag
      ORDER BY Tag ASC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json([], { status: 200 });
  }
}
