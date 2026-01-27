import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT DISTINCT EvidenceType
      FROM dbo.Evidence
      WHERE EvidenceType IS NOT NULL
      ORDER BY EvidenceType ASC
    `);

    return NextResponse.json(result.recordset.map(r => r.EvidenceType));
  } catch (error) {
    console.error('Error fetching evidence types:', error);
    return NextResponse.json([], { status: 200 });
  }
}
