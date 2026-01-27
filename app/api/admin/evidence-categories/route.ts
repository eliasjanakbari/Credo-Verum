import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const evidenceType = searchParams.get('evidenceType');

    const pool = await getPool();

    let query = `
      SELECT DISTINCT Category
      FROM dbo.Evidence
      WHERE Category IS NOT NULL
    `;

    if (evidenceType) {
      query += ` AND EvidenceType = @evidenceType`;
    }

    query += ` ORDER BY Category ASC`;

    const request_db = pool.request();
    if (evidenceType) {
      request_db.input('evidenceType', sql.NVarChar, evidenceType);
    }

    const result = await request_db.query(query);

    return NextResponse.json(result.recordset.map(r => r.Category));
  } catch (error) {
    console.error('Error fetching evidence categories:', error);
    return NextResponse.json([], { status: 200 });
  }
}
