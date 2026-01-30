import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db/sql-helpers';
import sql from 'mssql';

export async function POST(request: Request) {
  try {
    const { pendingId, action, reviewNotes } = await request.json();

    if (!pendingId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse pendingId as integer
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
        // Helper function to generate random string IDs (database uses string IDs)
        const generateId = (): string => {
          return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        };

        // Helper function to get valid string ID or null
        const getStringId = (value: any): string | null => {
          if (!value || value === '') return null;
          return String(value);
        };

        // 1. Create or get Author
        let authorId = getStringId(submissionData.authorId);

        if (!authorId && submissionData.newAuthorName) {
          const newAuthorId = generateId();

          await transaction.request()
            .input('authorId', sql.NVarChar, newAuthorId)
            .input('name', sql.NVarChar, submissionData.newAuthorName)
            .input('lifespan', sql.NVarChar, submissionData.newAuthorLifespan || null)
            .input('bio', sql.NVarChar, submissionData.newAuthorBio || null)
            .query(`
              INSERT INTO dbo.Authors (AuthorID, Name, Lifespan, Bio, updatedAt)
              VALUES (@authorId, @name, @lifespan, @bio, GETDATE());
            `);
          authorId = newAuthorId;
        }

        // 2. Create or get Work
        let workId = safeParseInt(submissionData.workId);

        if (!workId && submissionData.newWorkTitle) {
          // Convert year to January 1st date if provided
          let publishedDateValue = null;
          if (submissionData.newWorkPublishedYear) {
            const year = parseInt(submissionData.newWorkPublishedYear);
            if (!isNaN(year)) {
              publishedDateValue = new Date(year, 0, 1); // January 1st of the year
            }
          }

          // Get next WorkID (table doesn't use auto-increment)
          const maxWorkIdResult = await transaction.request()
            .query(`SELECT ISNULL(MAX(WorkID), 0) + 1 AS NextID FROM dbo.Works`);
          const nextWorkId = maxWorkIdResult.recordset[0].NextID;

          await transaction.request()
            .input('workId', sql.Int, nextWorkId)
            .input('authorId', sql.Int, authorId)
            .input('title', sql.NVarChar, submissionData.newWorkTitle)
            .input('summary', sql.NVarChar, submissionData.newWorkSummary || null)
            .input('publishedDateLabel', sql.NVarChar, submissionData.newWorkPublishedDate || null)
            .input('publishedDate', sql.Date, publishedDateValue)
            .query(`
              INSERT INTO dbo.Works (WorkID, AuthorID, Title, Summary, PublishedDateLabel, PublishedDate, updatedAt)
              VALUES (@workId, @authorId, @title, @summary, @publishedDateLabel, @publishedDate, GETDATE());
            `);
          workId = nextWorkId;
        }

        // 3. Create Evidence
        // Use new values if provided, otherwise use selected existing values
        const categoryValue = submissionData.category || submissionData.newCategory;
        const evidenceTypeValue = submissionData.evidenceType || submissionData.newEvidenceType;

        // Get next EvidenceID (table doesn't use auto-increment)
        const maxEvidenceIdResult = await transaction.request()
          .query(`SELECT ISNULL(MAX(EvidenceID), 0) + 1 AS NextID FROM dbo.Evidence`);
        const evidenceId = maxEvidenceIdResult.recordset[0].NextID;

        await transaction.request()
          .input('evidenceId', sql.Int, evidenceId)
          .input('title', sql.NVarChar, submissionData.evidenceTitle || null)
          .input('category', sql.NVarChar, categoryValue)
          .input('evidenceType', sql.NVarChar, evidenceTypeValue)
          .query(`
            INSERT INTO dbo.Evidence (EvidenceID, Title, Category, EvidenceType, updatedAt)
            VALUES (@evidenceId, @title, @category, @evidenceType, GETDATE());
          `);

        // 4. Create EvidencePassage
        // Get next EvidencePassageID (table doesn't use auto-increment)
        const maxPassageIdResult = await transaction.request()
          .query(`SELECT ISNULL(MAX(EvidencePassageID), 0) + 1 AS NextID FROM dbo.EvidencePassage`);
        const evidencePassageId = maxPassageIdResult.recordset[0].NextID;

        await transaction.request()
          .input('evidencePassageId', sql.Int, evidencePassageId)
          .input('evidenceId', sql.Int, evidenceId)
          .input('workId', sql.Int, workId)
          .input('passageText', sql.NVarChar, submissionData.passageText)
          .input('originalLanguage', sql.NVarChar, submissionData.originalLanguage || null)
          .input('originalText', sql.NVarChar, submissionData.originalTranslationText || null)
          .input('reference', sql.NVarChar, submissionData.passageReference || null)
          .input('digitisedURL', sql.NVarChar, submissionData.digitisedURL || null)
          .query(`
            INSERT INTO dbo.EvidencePassage (EvidencePassageID, EvidenceID, WorkID, PassageText, OriginalLanguage, OriginalTranslationText, Reference, DigitisedURL, updatedAt)
            VALUES (@evidencePassageId, @evidenceId, @workId, @passageText, @originalLanguage, @originalText, @reference, @digitisedURL, GETDATE());
          `);

        // 5. Create or link manuscript if provided
        let manuscriptId = safeParseInt(submissionData.manuscriptId);

        // Create new manuscript if fields are provided
        if (!manuscriptId && submissionData.newManuscriptShelfmark && submissionData.newManuscriptLibrary) {
          // Get next ManuscriptID (table doesn't use auto-increment)
          const maxManuscriptIdResult = await transaction.request()
            .query(`SELECT ISNULL(MAX(ManuscriptID), 0) + 1 AS NextID FROM dbo.Manuscript`);
          const nextManuscriptId = maxManuscriptIdResult.recordset[0].NextID;

          await transaction.request()
            .input('manuscriptId', sql.Int, nextManuscriptId)
            .input('title', sql.NVarChar, submissionData.newManuscriptTitle || null)
            .input('library', sql.NVarChar, submissionData.newManuscriptLibrary)
            .input('shelfmark', sql.NVarChar, submissionData.newManuscriptShelfmark)
            .input('date', sql.NVarChar, submissionData.newManuscriptDate || null)
            .input('digitisedURL', sql.NVarChar, submissionData.newManuscriptDigitisedURL || null)
            .query(`
              INSERT INTO dbo.Manuscript (ManuscriptID, Title, Library, Shelfmark, Date, DigitisedURL, updatedAt)
              VALUES (@manuscriptId, @title, @library, @shelfmark, @date, @digitisedURL, GETDATE());
            `);
          manuscriptId = nextManuscriptId;
        }

        // Link manuscript to evidence passage if we have one
        if (manuscriptId) {
          // Get next ManuscriptWitnessID (table doesn't use auto-increment)
          const maxWitnessIdResult = await transaction.request()
            .query(`SELECT ISNULL(MAX(ManuscriptWitnessID), 0) + 1 AS NextID FROM dbo.ManuscriptWitness`);
          const nextWitnessId = maxWitnessIdResult.recordset[0].NextID;

          // Insert into ManuscriptWitness table which links passages to manuscripts
          await transaction.request()
            .input('witnessId', sql.Int, nextWitnessId)
            .input('evidencePassageId', sql.Int, evidencePassageId)
            .input('manuscriptId', sql.Int, manuscriptId)
            .input('imageURL', sql.NVarChar, submissionData.newManuscriptImageURL || null)
            .query(`
              INSERT INTO dbo.ManuscriptWitness (ManuscriptWitnessID, EvidencePassageID, ManuscriptID, ImageURL, updatedAt)
              VALUES (@witnessId, @evidencePassageId, @manuscriptId, @imageURL, GETDATE());
            `);
        }

        // 6. Add tags
        if (submissionData.selectedTags && submissionData.selectedTags.length > 0) {
          for (const tag of submissionData.selectedTags) {
            const tagId = safeParseInt(tag);
            if (tagId !== null) {
              await transaction.request()
                .input('evidenceId', sql.Int, evidenceId)
                .input('tagId', sql.Int, tagId)
                .query(`
                  INSERT INTO dbo.EvidenceTag (EvidenceID, TagID, updatedAt)
                  VALUES (@evidenceId, @tagId, GETDATE());
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
