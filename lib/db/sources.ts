import { getPool } from './sql-helpers';
import type { EvidenceSource, EvidenceCategory, ManuscriptWitness } from '../types/sources';

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
        category: row.Category as EvidenceCategory,
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
 * Fetch all evidence sources from the database
 */
export async function getAllSources(): Promise<EvidenceSource[]> {
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
    WHERE e.EvidenceType != 'Miracle'
    ORDER BY e.createdAt ASC
  `);

  return groupSQLResults(result.recordset);
}

/**
 * Fetch a single evidence source by ID
 */
export async function getSourceById(id: string): Promise<EvidenceSource | null> {
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
      WHERE e.EvidenceID = @id
    `);

  const sources = groupSQLResults(result.recordset);
  return sources.length > 0 ? sources[0] : null;
}

/**
 * Fetch sources by category
 */
export async function getSourcesByCategory(category: EvidenceCategory): Promise<EvidenceSource[]> {
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
      WHERE e.Category = @category AND e.EvidenceType != 'Gospel Account'
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}

/**
 * Search sources by text (searches in title and summary)
 */
export async function searchSources(searchTerm: string): Promise<EvidenceSource[]> {
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
      WHERE e.EvidenceType != 'Miracle'
        AND (e.Title LIKE @search OR e.Summary LIKE @search OR e.EvidenceType LIKE @search)
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}
