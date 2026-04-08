import { getPool } from './sql-helpers';
import sql from 'mssql';

export interface Article {
  ArticleID: string;
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: Date;
  Status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch all published articles (public-facing)
 */
export async function getAllPublishedArticles(): Promise<Article[]> {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT
      ArticleID, Title, Slug, Content, AuthorName,
      PublishedDate, Status, createdAt, updatedAt
    FROM dbo.Article
    WHERE Status = 'published'
    ORDER BY PublishedDate DESC
  `);

  return result.recordset;
}

/**
 * Fetch all articles (admin-only, includes drafts)
 */
export async function getAllArticles(): Promise<Article[]> {
  const pool = await getPool();

  const result = await pool.request().query(`
    SELECT
      ArticleID, Title, Slug, Content, AuthorName,
      PublishedDate, Status, createdAt, updatedAt
    FROM dbo.Article
    ORDER BY createdAt DESC
  `);

  return result.recordset;
}

/**
 * Fetch single article by slug (public-facing)
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const pool = await getPool();

  const result = await pool.request()
    .input('slug', sql.NVarChar(255), slug)
    .query(`
      SELECT
        ArticleID, Title, Slug, Content, AuthorName,
        PublishedDate, Status, createdAt, updatedAt
      FROM dbo.Article
      WHERE Slug = @slug AND Status = 'published'
    `);

  return result.recordset.length > 0 ? result.recordset[0] : null;
}

/**
 * Fetch single article by ID (admin-only)
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const pool = await getPool();

  const result = await pool.request()
    .input('id', sql.NVarChar(50), id)
    .query(`
      SELECT
        ArticleID, Title, Slug, Content, AuthorName,
        PublishedDate, Status, createdAt, updatedAt
      FROM dbo.Article
      WHERE ArticleID = @id
    `);

  return result.recordset.length > 0 ? result.recordset[0] : null;
}

/**
 * Create new article
 */
export async function createArticle(data: {
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: Date;
  Status?: string;
}): Promise<string> {
  const pool = await getPool();
  const articleId = Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);

  await pool.request()
    .input('articleId', sql.NVarChar(50), articleId)
    .input('title', sql.NVarChar(255), data.Title)
    .input('slug', sql.NVarChar(255), data.Slug)
    .input('content', sql.NVarChar(sql.MAX), data.Content)
    .input('authorName', sql.NVarChar(255), data.AuthorName)
    .input('publishedDate', sql.DateTime2, data.PublishedDate)
    .input('status', sql.NVarChar(20), data.Status || 'draft')
    .query(`
      INSERT INTO dbo.Article
        (ArticleID, Title, Slug, Content, AuthorName, PublishedDate, Status, createdAt, updatedAt)
      VALUES
        (@articleId, @title, @slug, @content, @authorName, @publishedDate, @status, GETDATE(), GETDATE())
    `);

  return articleId;
}

/**
 * Update existing article
 */
export async function updateArticle(id: string, data: {
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: Date;
  Status?: string;
}): Promise<void> {
  const pool = await getPool();

  await pool.request()
    .input('articleId', sql.NVarChar(50), id)
    .input('title', sql.NVarChar(255), data.Title)
    .input('slug', sql.NVarChar(255), data.Slug)
    .input('content', sql.NVarChar(sql.MAX), data.Content)
    .input('authorName', sql.NVarChar(255), data.AuthorName)
    .input('publishedDate', sql.DateTime2, data.PublishedDate)
    .input('status', sql.NVarChar(20), data.Status || 'draft')
    .query(`
      UPDATE dbo.Article
      SET Title = @title,
          Slug = @slug,
          Content = @content,
          AuthorName = @authorName,
          PublishedDate = @publishedDate,
          Status = @status,
          updatedAt = GETDATE()
      WHERE ArticleID = @articleId
    `);
}

/**
 * Delete article
 */
export async function deleteArticle(id: string): Promise<void> {
  const pool = await getPool();

  await pool.request()
    .input('articleId', sql.NVarChar(50), id)
    .query(`
      DELETE FROM dbo.Article
      WHERE ArticleID = @articleId
    `);
}

/**
 * Check if slug exists (for validation)
 */
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const pool = await getPool();

  const query = excludeId
    ? `SELECT COUNT(*) as Count FROM dbo.Article WHERE Slug = @slug AND ArticleID != @excludeId`
    : `SELECT COUNT(*) as Count FROM dbo.Article WHERE Slug = @slug`;

  const request = pool.request().input('slug', sql.NVarChar(255), slug);

  if (excludeId) {
    request.input('excludeId', sql.NVarChar(50), excludeId);
  }

  const result = await request.query(query);
  return result.recordset[0].Count > 0;
}

/**
 * Generate unique slug from title
 */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  // Convert title to slug format
  let baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/-+/g, '-')       // Replace multiple - with single -
    .substring(0, 200);        // Limit length

  // Check if slug exists
  let slug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate slug format
 */
export function validateSlugFormat(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
