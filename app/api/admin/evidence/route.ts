import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        e.EvidenceID,
        e.Title,
        e.Category,
        e.EvidenceType,
        e.Summary,
        e.createdAt,
        ep.EvidencePassageID,
        ep.PassageText,
        ep.OriginalLanguage,
        ep.OriginalTranslationText,
        ep.Reference,
        ep.DigitisedURL,
        w.WorkID,
        w.Title as WorkTitle,
        a.AuthorID,
        a.Name as AuthorName
      FROM dbo.Evidence e
      LEFT JOIN dbo.EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN dbo.Work w ON ep.WorkID = w.WorkID
      LEFT JOIN dbo.Authors a ON w.AuthorID = a.AuthorID
      ORDER BY e.createdAt DESC
    `);

    // Group by evidence (since there might be multiple passages per evidence)
    const evidenceMap = new Map();
    for (const row of result.recordset) {
      if (!evidenceMap.has(row.EvidenceID)) {
        evidenceMap.set(row.EvidenceID, {
          EvidenceID: row.EvidenceID,
          Title: row.Title,
          Category: row.Category,
          EvidenceType: row.EvidenceType,
          Summary: row.Summary,
          createdAt: row.createdAt,
          EvidencePassageID: row.EvidencePassageID,
          PassageText: row.PassageText,
          OriginalLanguage: row.OriginalLanguage,
          OriginalTranslationText: row.OriginalTranslationText,
          Reference: row.Reference,
          DigitisedURL: row.DigitisedURL,
          WorkID: row.WorkID,
          WorkTitle: row.WorkTitle,
          AuthorID: row.AuthorID,
          AuthorName: row.AuthorName,
        });
      }
    }

    return NextResponse.json(Array.from(evidenceMap.values()));
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json([], { status: 200 });
  }
}
