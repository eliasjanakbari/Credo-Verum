import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

// Helper function to generate random string IDs (database uses nvarchar IDs)
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to get valid string ID or null
function getStringId(value: any): string | null {
  if (!value || value === '') return null;
  return String(value);
}

// Valid ISO 639 language codes for ancient languages
const validLanguageCodes = ['grc', 'la', 'he', 'arc', 'cop', 'syc'];

// Helper function to convert language input to valid ISO code
function getLanguageCode(value: any): string {
  if (!value || value === '') return 'grc';
  const val = String(value).toLowerCase().trim();

  // If it's already a valid ISO code, return it (padded to 3 chars if needed)
  if (validLanguageCodes.includes(val)) return val;
  if (validLanguageCodes.includes(val.substring(0, 3))) return val.substring(0, 3);
  if (validLanguageCodes.includes(val.substring(0, 2))) return val.substring(0, 2);

  // Map common language names to ISO codes
  if (val.includes('greek')) return 'grc';
  if (val.includes('latin')) return 'la';
  if (val.includes('hebrew')) return 'he';
  if (val.includes('aramaic')) return 'arc';
  if (val.includes('coptic')) return 'cop';
  if (val.includes('syriac')) return 'syc';

  // Default to Ancient Greek
  return 'grc';
}

export async function POST(request: Request) {
  try {
    const { pendingId, action, reviewNotes } = await request.json();

    if (!pendingId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse pendingId as integer (PendingSubmission uses int for PendingID)
    const pendingIdInt = parseInt(pendingId, 10);
    if (isNaN(pendingIdInt)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pendingId format' },
        { status: 400 }
      );
    }

    console.log('Processing submission:', { pendingId, pendingIdInt, action });

    const pool = await getPool();

    // Get the pending submission
    const submissionResult = await pool.request()
      .input('pendingId', sql.Int, pendingIdInt)
      .query(`
        SELECT SubmissionData
        FROM dbo.PendingSubmission
        WHERE PendingID = @pendingId
      `);

    if (submissionResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    const submissionData = typeof submissionResult.recordset[0].SubmissionData === 'string'
      ? JSON.parse(submissionResult.recordset[0].SubmissionData)
      : submissionResult.recordset[0].SubmissionData;

    // Debug: Log submission data to identify problematic values
    console.log('Submission data received:', {
      authorId: submissionData.authorId,
      workId: submissionData.workId,
      manuscriptId: submissionData.manuscriptId,
      selectedTags: submissionData.selectedTags,
    });

    if (action === 'approve') {
      // Begin transaction
      const transaction = pool.transaction();
      await transaction.begin();

      try {
        // 1. Create or get Author (AuthorID is nvarchar(50))
        let authorId = getStringId(submissionData.authorId);

        if (!authorId && submissionData.newAuthorName) {
          const newAuthorId = generateId();

          await transaction.request()
            .input('authorId', sql.NVarChar(50), newAuthorId)
            .input('name', sql.NVarChar, submissionData.newAuthorName)
            .input('lifespan', sql.NVarChar, submissionData.newAuthorLifespan || null)
            .input('bio', sql.NVarChar, submissionData.newAuthorBio || null)
            .query(`
              INSERT INTO dbo.Authors (AuthorID, Name, Lifespan, Bio, createdAt, updatedAt)
              VALUES (@authorId, @name, @lifespan, @bio, GETDATE(), GETDATE());
            `);
          authorId = newAuthorId;
        }

        // 2. Create or get Work (WorkID is nvarchar(50))
        let workId = getStringId(submissionData.workId);

        if (!workId && submissionData.newWorkTitle) {
          const newWorkId = generateId();

          // Parse year from publishedDate label if available, default to year 100 AD
          let publishedYear = 100;
          if (submissionData.newWorkPublishedYear) {
            const parsed = parseInt(submissionData.newWorkPublishedYear);
            if (!isNaN(parsed)) publishedYear = parsed;
          }

          await transaction.request()
            .input('workId', sql.NVarChar(50), newWorkId)
            .input('authorId', sql.NVarChar(50), authorId)
            .input('title', sql.NVarChar, submissionData.newWorkTitle)
            .input('summary', sql.NVarChar, submissionData.newWorkSummary || null)
            .input('publishedDateLabel', sql.NVarChar, submissionData.newWorkPublishedDate || null)
            .input('publishedDate', sql.Date, new Date(publishedYear, 0, 1))
            .query(`
              INSERT INTO dbo.Work (WorkID, AuthorID, Title, Summary, PublishedDateLabel, PublishedDate, createdAt, updatedAt)
              VALUES (@workId, @authorId, @title, @summary, @publishedDateLabel, @publishedDate, GETDATE(), GETDATE());
            `);
          workId = newWorkId;
        }

        // 3. Create Evidence (EvidenceID is nvarchar(50))
        const categoryValue = submissionData.category || submissionData.newCategory;
        const evidenceTypeValue = submissionData.evidenceType || submissionData.newEvidenceType;
        const evidenceId = generateId();

        await transaction.request()
          .input('evidenceId', sql.NVarChar(50), evidenceId)
          .input('title', sql.NVarChar, submissionData.evidenceTitle || null)
          .input('category', sql.NVarChar, categoryValue)
          .input('evidenceType', sql.NVarChar, evidenceTypeValue)
          .query(`
            INSERT INTO dbo.Evidence (EvidenceID, Title, Category, EvidenceType, createdAt, updatedAt)
            VALUES (@evidenceId, @title, @category, @evidenceType, GETDATE(), GETDATE());
          `);

        // 4. Create EvidencePassage (EvidencePassageID is nvarchar(50))
        const evidencePassageId = generateId();

        await transaction.request()
          .input('evidencePassageId', sql.NVarChar(50), evidencePassageId)
          .input('evidenceId', sql.NVarChar(50), evidenceId)
          .input('workId', sql.NVarChar(50), workId)
          .input('passageText', sql.NVarChar, submissionData.passageText)
          .input('originalLanguage', sql.NVarChar, getLanguageCode(submissionData.originalLanguage))
          .input('originalText', sql.NVarChar, submissionData.originalTranslationText || null)
          .input('reference', sql.NVarChar, submissionData.passageReference || null)
          .input('digitisedURL', sql.NVarChar, submissionData.digitisedURL || null)
          .query(`
            INSERT INTO dbo.EvidencePassage (EvidencePassageID, EvidenceID, WorkID, PassageText, OriginalLanguage, OriginalTranslationText, Reference, DigitisedURL, createdAt, updatedAt)
            VALUES (@evidencePassageId, @evidenceId, @workId, @passageText, @originalLanguage, @originalText, @reference, @digitisedURL, GETDATE(), GETDATE());
          `);

        // 5. Create or link manuscript if provided (ManuscriptID is nvarchar(50))
        let manuscriptId = getStringId(submissionData.manuscriptId);

        // Create new manuscript if fields are provided
        if (!manuscriptId && submissionData.newManuscriptShelfmark && submissionData.newManuscriptLibrary) {
          const newManuscriptId = generateId();

          await transaction.request()
            .input('manuscriptId', sql.NVarChar(50), newManuscriptId)
            .input('title', sql.NVarChar, submissionData.newManuscriptTitle || null)
            .input('library', sql.NVarChar, submissionData.newManuscriptLibrary)
            .input('shelfmark', sql.NVarChar, submissionData.newManuscriptShelfmark)
            .input('date', sql.NVarChar, submissionData.newManuscriptDate || null)
            .input('digitisedURL', sql.NVarChar, submissionData.newManuscriptDigitisedURL || null)
            .query(`
              INSERT INTO dbo.Manuscript (ManuscriptID, Title, Library, Shelfmark, Date, DigitisedURL, createdAt, updatedAt)
              VALUES (@manuscriptId, @title, @library, @shelfmark, @date, @digitisedURL, GETDATE(), GETDATE());
            `);
          manuscriptId = newManuscriptId;
        }

        // Link manuscript to evidence passage if we have one (WitnessID is nvarchar(50))
        if (manuscriptId) {
          const witnessId = generateId();

          await transaction.request()
            .input('witnessId', sql.NVarChar(50), witnessId)
            .input('evidencePassageId', sql.NVarChar(50), evidencePassageId)
            .input('manuscriptId', sql.NVarChar(50), manuscriptId)
            .input('imageURL', sql.NVarChar, submissionData.newManuscriptImageURL || null)
            .query(`
              INSERT INTO dbo.ManuscriptWitness (WitnessID, EvidencePassageID, ManuscriptID, ImageURL)
              VALUES (@witnessId, @evidencePassageId, @manuscriptId, @imageURL);
            `);
        }

        // 6. Add tags (TagID is nvarchar(50))
        if (submissionData.selectedTags && submissionData.selectedTags.length > 0) {
          for (const tag of submissionData.selectedTags) {
            const tagId = getStringId(tag);
            if (tagId) {
              await transaction.request()
                .input('evidenceId', sql.NVarChar(50), evidenceId)
                .input('tagId', sql.NVarChar(50), tagId)
                .query(`
                  INSERT INTO dbo.EvidenceTag (EvidenceID, TagID)
                  VALUES (@evidenceId, @tagId);
                `);
            }
          }
        }

        // 7. Update pending submission status
        await transaction.request()
          .input('pendingId', sql.Int, pendingIdInt)
          .input('reviewNotes', sql.NVarChar, reviewNotes || null)
          .query(`
            UPDATE dbo.PendingSubmission
            SET Status = 'Approved',
                ReviewedDate = GETDATE(),
                ReviewNotes = @reviewNotes
            WHERE PendingID = @pendingId;
          `);

        // Commit transaction
        await transaction.commit();

        return NextResponse.json({
          success: true,
          message: 'Submission approved and published',
          evidenceId,
        });
      } catch (error: any) {
        // Log the actual error before rollback
        console.error('Transaction error details:', error?.message || error);

        // Try to rollback, but handle case where transaction is already aborted
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('Rollback error (transaction may already be aborted):', rollbackError);
        }
        throw error;
      }
    } else if (action === 'reject') {
      // Just update the status to rejected
      await pool.request()
        .input('pendingId', sql.Int, pendingIdInt)
        .input('reviewNotes', sql.NVarChar, reviewNotes || null)
        .query(`
          UPDATE dbo.PendingSubmission
          SET Status = 'Rejected',
              ReviewedDate = GETDATE(),
              ReviewNotes = @reviewNotes
          WHERE PendingID = @pendingId;
        `);

      return NextResponse.json({
        success: true,
        message: 'Submission rejected',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
