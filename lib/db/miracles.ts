import { getPool } from './sql-helpers';
import type { EvidenceSource, MiracleCategoryType } from '../types/sources';

/**
 * Helper function to group and transform SQL results into EvidenceSource format
 */
function groupSQLResults(rows: any[]): EvidenceSource[] {
  const evidenceMap = new Map<string, EvidenceSource>();

  for (const row of rows) {
    if (!evidenceMap.has(row.EvidenceID)) {
      // Create links array with passage digitised URL if available
      const links: any[] = [];
      if (row.PassageDigitisedURL) {
        links.push({
          label: 'Source to Text',
          url: row.PassageDigitisedURL,
          type: 'translation',
        });
      }

      evidenceMap.set(row.EvidenceID, {
        id: row.EvidenceID,
        category: row.Category as MiracleCategoryType,
        author: row.AuthorName || 'Unknown',
        authorLifespan: row.AuthorLifespan || undefined,
        authorDescription: row.AuthorBio || '',
        work: row.WorkTitle || 'Unknown',
        workDescription: row.WorkSummary || '',
        section: row.PassageReference || undefined,
        date: row.PublishedDateLabel || '',
        language: row.OriginalLanguage || 'Unknown',
        quoteOriginal: row.OriginalTranslationText || '',
        quoteEnglish: row.PassageText || '',
        passageSummary: row.Summary || '',
        evidenceType: row.EvidenceType,
        tags: [],
        links: links,
        manuscripts: [],
      });
    }

    // Add manuscript if present and not already added
    const evidence = evidenceMap.get(row.EvidenceID)!;
    if (row.ManuscriptShelfmark && !evidence.manuscripts.some(m => m.shelfmark === row.ManuscriptShelfmark)) {
      evidence.manuscripts.push({
        library: row.ManuscriptLibrary,
        shelfmark: row.ManuscriptShelfmark,
        date: row.ManuscriptDate,
        digitizedUrl: row.ManuscriptDigitisedURL || '',
        imageUrl: row.ManuscriptImageURL || undefined,
        notes: undefined,
      });
    }

    // Add tag if present and not already added
    if (row.Tag && !evidence.tags.includes(row.Tag)) {
      evidence.tags.push(row.Tag);
    }
  }

  return Array.from(evidenceMap.values());
}

/**
 * Fetch all miracles from the database
 */
export async function getAllMiracles(): Promise<EvidenceSource[]> {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT
      e.EvidenceID,
      e.Title as EvidenceTitle,
      e.EvidenceType,
      e.Category,
      e.Summary,
      e.createdAt as EvidenceDate,
      ep.PassageText as PassageText,
      ep.OriginalLanguage,
      ep.OriginalTranslationText,
      ep.DigitisedURL as PassageDigitisedURL,
      ep.Reference as PassageReference,
      w.Title as WorkTitle,
      w.Summary as WorkSummary,
      w.PublishedDateLabel,
      a.Name as AuthorName,
      a.Lifespan as AuthorLifespan,
      a.Bio as AuthorBio,
      mw.ImageURL as ManuscriptImageURL,
      m.Library as ManuscriptLibrary,
      m.Shelfmark as ManuscriptShelfmark,
      m.Date as ManuscriptDate,
      m.DigitisedURL as ManuscriptDigitisedURL,
      t.Tag
    FROM Evidence e
    LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
    LEFT JOIN Work w ON ep.WorkID = w.WorkID
    LEFT JOIN Authors a ON w.AuthorID = a.AuthorID
    LEFT JOIN ManuscriptWitness mw ON ep.EvidencePassageID = mw.EvidencePassageID
    LEFT JOIN Manuscript m ON mw.ManuscriptID = m.ManuscriptID
    LEFT JOIN EvidenceTag et ON e.EvidenceID = et.EvidenceID
    LEFT JOIN Tag t ON et.TagID = t.TagID
    WHERE e.EvidenceType = 'Miracle'
    ORDER BY e.createdAt ASC
  `);

  return groupSQLResults(result.recordset);
}

/**
 * Fetch a single miracle by ID
 */
export async function getMiracleById(id: string): Promise<EvidenceSource | null> {
  const pool = await getPool();

  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT
        e.EvidenceID,
        e.Title as EvidenceTitle,
        e.EvidenceType,
        e.Category,
        e.Summary,
        e.createdAt as EvidenceDate,
        ep.PassageText as PassageText,
        ep.OriginalLanguage,
        ep.OriginalTranslationText,
        ep.DigitisedURL as PassageDigitisedURL,
        ep.Reference as PassageReference,
        w.Title as WorkTitle,
        w.Summary as WorkSummary,
        w.PublishedDateLabel,
        a.Name as AuthorName,
        a.Lifespan as AuthorLifespan,
        a.Bio as AuthorBio,
        mw.ImageURL as ManuscriptImageURL,
        m.Library as ManuscriptLibrary,
        m.Shelfmark as ManuscriptShelfmark,
        m.Date as ManuscriptDate,
        m.DigitisedURL as ManuscriptDigitisedURL,
        t.Tag
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      LEFT JOIN Authors a ON w.AuthorID = a.AuthorID
      LEFT JOIN ManuscriptWitness mw ON ep.EvidencePassageID = mw.EvidencePassageID
      LEFT JOIN Manuscript m ON mw.ManuscriptID = m.ManuscriptID
      LEFT JOIN EvidenceTag et ON e.EvidenceID = et.EvidenceID
      LEFT JOIN Tag t ON et.TagID = t.TagID
      WHERE e.EvidenceID = @id AND e.EvidenceType = 'Miracles'
    `);

  const miracles = groupSQLResults(result.recordset);
  return miracles.length > 0 ? miracles[0] : null;
}

/**
 * Fetch miracles by category
 */
export async function getMiraclesByCategory(category: MiracleCategoryType): Promise<EvidenceSource[]> {
  const pool = await getPool();

  const result = await pool.request()
    .input('category', category)
    .query(`
      SELECT
        e.EvidenceID,
        e.Title as EvidenceTitle,
        e.EvidenceType,
        e.Category,
        e.Summary,
        e.createdAt as EvidenceDate,
        ep.PassageText as PassageText,
        ep.OriginalLanguage,
        ep.OriginalTranslationText,
        ep.DigitisedURL as PassageDigitisedURL,
        ep.Reference as PassageReference,
        w.Title as WorkTitle,
        w.Summary as WorkSummary,
        w.PublishedDateLabel,
        a.Name as AuthorName,
        a.Lifespan as AuthorLifespan,
        a.Bio as AuthorBio,
        mw.ImageURL as ManuscriptImageURL,
        m.Library as ManuscriptLibrary,
        m.Shelfmark as ManuscriptShelfmark,
        m.Date as ManuscriptDate,
        m.DigitisedURL as ManuscriptDigitisedURL,
        t.Tag
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      LEFT JOIN Authors a ON w.AuthorID = a.AuthorID
      LEFT JOIN ManuscriptWitness mw ON ep.EvidencePassageID = mw.EvidencePassageID
      LEFT JOIN Manuscript m ON mw.ManuscriptID = m.ManuscriptID
      LEFT JOIN EvidenceTag et ON e.EvidenceID = et.EvidenceID
      LEFT JOIN Tag t ON et.TagID = t.TagID
      WHERE e.Category = @category AND e.EvidenceType = 'Miracles'
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}

/**
 * Search miracles by text (searches in title and summary)
 */
export async function searchMiracles(searchTerm: string): Promise<EvidenceSource[]> {
  const pool = await getPool();

  const result = await pool.request()
    .input('search', `%${searchTerm}%`)
    .query(`
      SELECT
        e.EvidenceID,
        e.Title as EvidenceTitle,
        e.EvidenceType,
        e.Category,
        e.Summary,
        e.createdAt as EvidenceDate,
        ep.PassageText as PassageText,
        ep.OriginalLanguage,
        ep.OriginalTranslationText,
        ep.DigitisedURL as PassageDigitisedURL,
        ep.Reference as PassageReference,
        w.Title as WorkTitle,
        w.Summary as WorkSummary,
        w.PublishedDateLabel,
        a.Name as AuthorName,
        a.Lifespan as AuthorLifespan,
        a.Bio as AuthorBio,
        mw.ImageURL as ManuscriptImageURL,
        m.Library as ManuscriptLibrary,
        m.Shelfmark as ManuscriptShelfmark,
        m.Date as ManuscriptDate,
        m.DigitisedURL as ManuscriptDigitisedURL,
        t.Tag
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      LEFT JOIN Authors a ON w.AuthorID = a.AuthorID
      LEFT JOIN ManuscriptWitness mw ON ep.EvidencePassageID = mw.EvidencePassageID
      LEFT JOIN Manuscript m ON mw.ManuscriptID = m.ManuscriptID
      LEFT JOIN EvidenceTag et ON e.EvidenceID = et.EvidenceID
      LEFT JOIN Tag t ON et.TagID = t.TagID
      WHERE e.EvidenceType = 'Miracle'
        AND (e.Title LIKE @search OR e.Summary LIKE @search)
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}
