import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evidenceId } = await params;
    const {
      Title,
      Category,
      EvidenceType,
      Summary,
      EvidencePassageID,
      PassageText,
      OriginalLanguage,
      OriginalTranslationText,
      Reference,
      DigitisedURL,
    } = await request.json();

    const pool = await getPool();

    // Update Evidence
    await pool.request()
      .input('evidenceId', sql.NVarChar(50), evidenceId)
      .input('title', sql.NVarChar, Title || null)
      .input('category', sql.NVarChar, Category)
      .input('evidenceType', sql.NVarChar, EvidenceType)
      .input('summary', sql.NVarChar, Summary || null)
      .query(`
        UPDATE dbo.Evidence
        SET Title = @title,
            Category = @category,
            EvidenceType = @evidenceType,
            Summary = @summary,
            updatedAt = GETDATE()
        WHERE EvidenceID = @evidenceId
      `);

    // Update EvidencePassage if it exists
    if (EvidencePassageID) {
      await pool.request()
        .input('passageId', sql.NVarChar(50), EvidencePassageID)
        .input('passageText', sql.NVarChar, PassageText || null)
        .input('originalLanguage', sql.NVarChar, OriginalLanguage || null)
        .input('originalTranslationText', sql.NVarChar, OriginalTranslationText || null)
        .input('reference', sql.NVarChar, Reference || null)
        .input('digitisedURL', sql.NVarChar, DigitisedURL || null)
        .query(`
          UPDATE dbo.EvidencePassage
          SET PassageText = @passageText,
              OriginalLanguage = @originalLanguage,
              OriginalTranslationText = @originalTranslationText,
              Reference = @reference,
              DigitisedURL = @digitisedURL,
              updatedAt = GETDATE()
          WHERE EvidencePassageID = @passageId
        `);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating evidence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update evidence' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: evidenceId } = await params;
    const pool = await getPool();

    // Start transaction to delete all related data
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // 1. Delete ManuscriptWitness entries linked to this evidence's passages
      await transaction.request()
        .input('evidenceId', sql.NVarChar(50), evidenceId)
        .query(`
          DELETE mw FROM dbo.ManuscriptWitness mw
          INNER JOIN dbo.EvidencePassage ep ON mw.EvidencePassageID = ep.EvidencePassageID
          WHERE ep.EvidenceID = @evidenceId
        `);

      // 2. Delete EvidenceTag entries
      await transaction.request()
        .input('evidenceId', sql.NVarChar(50), evidenceId)
        .query(`
          DELETE FROM dbo.EvidenceTag
          WHERE EvidenceID = @evidenceId
        `);

      // 3. Delete EvidencePassage entries
      await transaction.request()
        .input('evidenceId', sql.NVarChar(50), evidenceId)
        .query(`
          DELETE FROM dbo.EvidencePassage
          WHERE EvidenceID = @evidenceId
        `);

      // 4. Delete the Evidence itself
      await transaction.request()
        .input('evidenceId', sql.NVarChar(50), evidenceId)
        .query(`
          DELETE FROM dbo.Evidence
          WHERE EvidenceID = @evidenceId
        `);

      await transaction.commit();

      return NextResponse.json({ success: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete evidence' },
      { status: 500 }
    );
  }
}
