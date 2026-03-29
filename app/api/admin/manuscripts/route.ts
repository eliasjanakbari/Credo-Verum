import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET() {
  try {
    const pool = await getPool();

    // Fetch manuscripts
    const manuscriptsResult = await pool.request().query(`
      SELECT ManuscriptID, Title, Library, Shelfmark, Date, DigitisedURL, FolioGuide
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
        mw.HighlightImageURL,
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

export async function POST(request: Request) {
  try {
    const { Title, Library, Shelfmark, Date, DigitisedURL, FolioGuide } = await request.json();

    if (!Library || !Shelfmark) {
      return NextResponse.json(
        { success: false, error: 'Library and Shelfmark are required' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    const manuscriptId = generateId();

    await pool.request()
      .input('manuscriptId', sql.NVarChar(50), manuscriptId)
      .input('title', sql.NVarChar, Title || null)
      .input('library', sql.NVarChar, Library)
      .input('shelfmark', sql.NVarChar, Shelfmark)
      .input('date', sql.NVarChar, Date || null)
      .input('digitisedURL', sql.NVarChar, DigitisedURL || null)
      .input('folioGuide', sql.NVarChar, FolioGuide || null)
      .query(`
        INSERT INTO dbo.Manuscript (ManuscriptID, Title, Library, Shelfmark, Date, DigitisedURL, FolioGuide, createdAt, updatedAt)
        VALUES (@manuscriptId, @title, @library, @shelfmark, @date, @digitisedURL, @folioGuide, GETDATE(), GETDATE())
      `);

    return NextResponse.json({ success: true, manuscriptId });
  } catch (error) {
    console.error('Error creating manuscript:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create manuscript' },
      { status: 500 }
    );
  }
}
