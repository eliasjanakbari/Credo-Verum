import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';

export async function GET() {
  try {
    const pool = await getPool();

    // Fetch manuscripts
    const manuscriptsResult = await pool.request().query(`
      SELECT ManuscriptID, Title, Library, Shelfmark, Date, DigitisedURL
      FROM dbo.Manuscript
      ORDER BY Shelfmark ASC
    `);

    // Fetch witnesses with their evidence passage info
    const witnessesResult = await pool.request().query(`
      SELECT
        mw.WitnessID,
        mw.ManuscriptID,
        mw.EvidencePassageID,
        mw.ImageURL,
        ep.Reference as PassageReference,
        e.Title as EvidenceTitle,
        e.EvidenceID
      FROM dbo.ManuscriptWitness mw
      LEFT JOIN dbo.EvidencePassage ep ON mw.EvidencePassageID = ep.EvidencePassageID
      LEFT JOIN dbo.Evidence e ON ep.EvidenceID = e.EvidenceID
    `);

    // Group witnesses by manuscript
    const witnessMap = new Map();
    for (const witness of witnessesResult.recordset) {
      if (!witnessMap.has(witness.ManuscriptID)) {
        witnessMap.set(witness.ManuscriptID, []);
      }
      witnessMap.get(witness.ManuscriptID).push(witness);
    }

    // Combine manuscripts with their witnesses
    const manuscripts = manuscriptsResult.recordset.map(m => ({
      ...m,
      witnesses: witnessMap.get(m.ManuscriptID) || [],
    }));

    return NextResponse.json(manuscripts);
  } catch (error) {
    console.error('Error fetching manuscripts:', error);
    return NextResponse.json([], { status: 200 });
  }
}
