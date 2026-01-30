import { getPool } from './sql-helpers';
import type { Miracle, MiracleCategory, GospelReference } from '../types/miracles';

/**
 * Helper function to group and transform SQL results into Miracle format
 */
function groupSQLResults(rows: any[]): Miracle[] {
  const miracleMap = new Map<string, Miracle>();

  for (const row of rows) {
    if (!miracleMap.has(row.EvidenceID)) {
      miracleMap.set(row.EvidenceID, {
        id: row.EvidenceID,
        category: row.Category as MiracleCategory,
        name: row.Title,
        description: row.Summary || '',
        significance: '', // TheologicalSignificance table removed
        tags: [],
        gospelReferences: [],
      });
    }

    // Add gospel reference if present and not already added
    const miracle = miracleMap.get(row.EvidenceID)!;
    if (row.WorkTitle && !miracle.gospelReferences.some(g => g.gospel === row.WorkTitle.replace('Gospel of ', ''))) {
      const gospelName = row.WorkTitle.replace('Gospel of ', '') as 'Matthew' | 'Mark' | 'Luke' | 'John';

      miracle.gospelReferences.push({
        gospel: gospelName,
        reference: '', // Reference is not stored in the new schema
        verse: row.PassageText || undefined,
      });
    }
  }

  return Array.from(miracleMap.values());
}

/**
 * Fetch all miracles from the database
 */
export async function getAllMiracles(): Promise<Miracle[]> {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT
      e.EvidenceID,
      e.Title,
      e.Category,
      e.Summary,
      ep.PassageText as PassageText,
      w.Title as WorkTitle
    FROM Evidence e
    LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
    LEFT JOIN Work w ON ep.WorkID = w.WorkID
    WHERE e.EvidenceType = 'Miracles'
    ORDER BY e.createdAt ASC
  `);

  return groupSQLResults(result.recordset);
}

/**
 * Fetch a single miracle by ID
 */
export async function getMiracleById(id: string): Promise<Miracle | null> {
  const pool = await getPool();

  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT
        e.EvidenceID,
        e.Title,
        e.Category,
        e.Summary,
        ep.PassageText as PassageText,
        w.Title as WorkTitle
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      WHERE e.EvidenceID = @id AND e.EvidenceType = 'Gospel Account'
    `);

  const miracles = groupSQLResults(result.recordset);
  return miracles.length > 0 ? miracles[0] : null;
}

/**
 * Fetch miracles by category
 */
export async function getMiraclesByCategory(category: MiracleCategory): Promise<Miracle[]> {
  const pool = await getPool();

  const result = await pool.request()
    .input('category', category)
    .query(`
      SELECT
        e.EvidenceID,
        e.Title,
        e.Category,
        e.Summary,
        ep.PassageText as PassageText,
        w.Title as WorkTitle
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      WHERE e.Category = @category AND e.EvidenceType = 'Gospel Account'
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}

/**
 * Search miracles by text (searches in title and summary)
 */
export async function searchMiracles(searchTerm: string): Promise<Miracle[]> {
  const pool = await getPool();

  const result = await pool.request()
    .input('search', `%${searchTerm}%`)
    .query(`
      SELECT
        e.EvidenceID,
        e.Title,
        e.Category,
        e.Summary,
        ep.PassageText as PassageText,
        w.Title as WorkTitle
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      WHERE e.EvidenceType = 'Miracles'
        AND (e.Title LIKE @search OR e.Summary LIKE @search)
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}

/**
 * Fetch miracles by gospel
 */
export async function getMiraclesByGospel(gospel: 'Matthew' | 'Mark' | 'Luke' | 'John'): Promise<Miracle[]> {
  const pool = await getPool();

  const result = await pool.request()
    .input('gospel', `Gospel of ${gospel}`)
    .query(`
      SELECT DISTINCT
        e.EvidenceID,
        e.Title,
        e.Category,
        e.Summary,
        ep.PassageText as PassageText,
        w.Title as WorkTitle
      FROM Evidence e
      LEFT JOIN EvidencePassage ep ON e.EvidenceID = ep.EvidenceID
      LEFT JOIN Work w ON ep.WorkID = w.WorkID
      WHERE e.EvidenceType = 'Miracles'
        AND w.Title = @gospel
      ORDER BY e.createdAt ASC
    `);

  return groupSQLResults(result.recordset);
}
