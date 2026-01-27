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

    const pool = await getPool();

    // Get the pending submission
    const submissionResult = await pool.request()
      .input('pendingId', sql.Int, pendingId)
      .query(`
        SELECT SubmissionData
        FROM PendingSubmission
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

    if (action === 'approve') {
      // Begin transaction
      const transaction = pool.transaction();
      await transaction.begin();

      try {
        // 1. Create or get Author
        let authorId = submissionData.authorId ? parseInt(submissionData.authorId) : null;

        if (!authorId && submissionData.newAuthorName) {
          const authorResult = await transaction.request()
            .input('name', sql.NVarChar, submissionData.newAuthorName)
            .input('lifespan', sql.NVarChar, submissionData.newAuthorLifespan || null)
            .input('bio', sql.NVarChar, submissionData.newAuthorBio || null)
            .query(`
              INSERT INTO dbo.Authors (Name, Lifespan, Bio)
              VALUES (@name, @lifespan, @bio);
              SELECT SCOPE_IDENTITY() AS AuthorID;
            `);
          authorId = authorResult.recordset[0].AuthorID;
        }

        // 2. Create or get Work
        let workId = submissionData.workId ? parseInt(submissionData.workId) : null;

        if (!workId && submissionData.newWorkTitle) {
          // Convert year to January 1st date if provided
          let publishedDateValue = null;
          if (submissionData.newWorkPublishedYear) {
            const year = parseInt(submissionData.newWorkPublishedYear);
            if (!isNaN(year)) {
              publishedDateValue = new Date(year, 0, 1); // January 1st of the year
            }
          }

          const workResult = await transaction.request()
            .input('authorId', sql.Int, authorId)
            .input('title', sql.NVarChar, submissionData.newWorkTitle)
            .input('summary', sql.NVarChar, submissionData.newWorkSummary || null)
            .input('publishedDateLabel', sql.NVarChar, submissionData.newWorkPublishedDate || null)
            .input('publishedDate', sql.Date, publishedDateValue)
            .query(`
              INSERT INTO dbo.Works (AuthorID, Title, Summary, PublishedDateLabel, PublishedDate)
              VALUES (@authorId, @title, @summary, @publishedDateLabel, @publishedDate);
              SELECT SCOPE_IDENTITY() AS WorkID;
            `);
          workId = workResult.recordset[0].WorkID;
        }

        // 3. Create Evidence
        // Use new values if provided, otherwise use selected existing values
        const categoryValue = submissionData.category || submissionData.newCategory;
        const evidenceTypeValue = submissionData.evidenceType || submissionData.newEvidenceType;

        const evidenceResult = await transaction.request()
          .input('category', sql.NVarChar, categoryValue)
          .input('evidenceType', sql.NVarChar, evidenceTypeValue)
          .query(`
            INSERT INTO dbo.Evidence (Category, EvidenceType)
            VALUES (@category, @evidenceType);
            SELECT SCOPE_IDENTITY() AS EvidenceID;
          `);
        const evidenceId = evidenceResult.recordset[0].EvidenceID;

        // 4. Create EvidencePassage
        await transaction.request()
          .input('evidenceId', sql.Int, evidenceId)
          .input('workId', sql.Int, workId)
          .input('passageText', sql.NVarChar, submissionData.passageText)
          .input('summary', sql.NVarChar, submissionData.passageSummary || null)
          .input('reference', sql.NVarChar, submissionData.passageReference || null)
          .input('originalText', sql.NVarChar, submissionData.originalTranslationText || null)
          .input('digitisedURL', sql.NVarChar, submissionData.digitisedURL || null)
          .query(`
            INSERT INTO EvidencePassage (EvidenceID, WorkID, PassageText, Summary, Reference, OriginalTranslationText, DigitisedURL)
            VALUES (@evidenceId, @workId, @passageText, @summary, @reference, @originalText, @digitisedURL);
          `);

        // 5. Create or link manuscript if provided
        let manuscriptId = submissionData.manuscriptId ? parseInt(submissionData.manuscriptId) : null;

        // Create new manuscript if fields are provided
        if (!manuscriptId && submissionData.newManuscriptShelfmark && submissionData.newManuscriptLibrary) {
          const manuscriptResult = await transaction.request()
            .input('title', sql.NVarChar, submissionData.newManuscriptTitle || null)
            .input('library', sql.NVarChar, submissionData.newManuscriptLibrary)
            .input('shelfmark', sql.NVarChar, submissionData.newManuscriptShelfmark)
            .input('date', sql.NVarChar, submissionData.newManuscriptDate || null)
            .input('digitisedURL', sql.NVarChar, submissionData.newManuscriptDigitisedURL || null)
            .query(`
              INSERT INTO dbo.Manuscript (Title, Library, Shelfmark, Date, DigitisedURL)
              VALUES (@title, @library, @shelfmark, @date, @digitisedURL);
              SELECT SCOPE_IDENTITY() AS ManuscriptID;
            `);
          manuscriptId = manuscriptResult.recordset[0].ManuscriptID;
        }

        // Link manuscript to evidence passage if we have one
        if (manuscriptId) {
          // Get the EvidencePassageID we just created
          const passageResult = await transaction.request()
            .input('evidenceId', sql.Int, evidenceId)
            .query(`
              SELECT TOP 1 EvidencePassageID FROM dbo.EvidencePassage WHERE EvidenceID = @evidenceId
            `);

          if (passageResult.recordset.length > 0) {
            const evidencePassageId = passageResult.recordset[0].EvidencePassageID;

            // Insert into ManuscriptWitness table which links passages to manuscripts
            await transaction.request()
              .input('evidencePassageId', sql.NVarChar, evidencePassageId)
              .input('manuscriptId', sql.NVarChar, manuscriptId)
              .input('imageURL', sql.NVarChar, submissionData.newManuscriptImageURL || null)
              .query(`
                INSERT INTO dbo.[Manuscript Witness] (EvidencePassageID, ManuscriptID, ImageURL)
                VALUES (@evidencePassageId, @manuscriptId, @imageURL);
              `);
          }
        }

        // 6. Add tags
        if (submissionData.selectedTags && submissionData.selectedTags.length > 0) {
          for (const tagId of submissionData.selectedTags) {
            await transaction.request()
              .input('evidenceId', sql.Int, evidenceId)
              .input('tagId', sql.Int, tagId)
              .query(`
                INSERT INTO EvidenceTag (EvidenceID, TagID)
                VALUES (@evidenceId, @tagId);
              `);
          }
        }

        // 7. Update pending submission status
        await transaction.request()
          .input('pendingId', sql.Int, pendingId)
          .input('reviewNotes', sql.NVarChar, reviewNotes || null)
          .query(`
            UPDATE PendingSubmission
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
      } catch (error) {
        // Rollback on error
        await transaction.rollback();
        throw error;
      }
    } else if (action === 'reject') {
      // Just update the status to rejected
      await pool.request()
        .input('pendingId', sql.Int, pendingId)
        .input('reviewNotes', sql.NVarChar, reviewNotes || null)
        .query(`
          UPDATE PendingSubmission
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
