// Seed database using mssql package directly
const sql = require('mssql');
const { createId } = require('@paralleldrive/cuid2');

// Import data - will be loaded via tsx
let sources, miracles;
try {
    ({ sources } = require('./data/sources.ts'));
    ({ miracles } = require('./data/miracles.ts'));
} catch (e) {
    console.error('Error loading data files:', e.message);
    console.log('Please ensure data/sources.ts and data/miracles.ts exist');
    process.exit(1);
}

const config = {
    server: 'credoverum-server.database.windows.net',
    database: 'credoverum-db',
    user: 'credoverum-admin',
    password: 'JV}O4!a9sP!S0[1FVRJ',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    port: 1433
};

async function seedDatabase() {
    let pool;

    try {
        console.log('🌱 Starting database seed...\n');
        console.log('🔗 Connecting to Azure SQL...');
        pool = await sql.connect(config);
        console.log('✅ Connected\n');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await pool.request().query('DELETE FROM [PassageConnection]');
        await pool.request().query('DELETE FROM [Manuscript Witness]');
        await pool.request().query('DELETE FROM [Evidence Passage]');
        await pool.request().query('DELETE FROM [ManuscriptWork]');
        await pool.request().query('DELETE FROM [Manuscript]');
        await pool.request().query('DELETE FROM [Work]');
        await pool.request().query('DELETE FROM [Authors]');
        await pool.request().query('DELETE FROM [Existence]');
        await pool.request().query('DELETE FROM [Miracles]');
        await pool.request().query('DELETE FROM [Evidence]');
        console.log('✅ Existing data cleared\n');

        // Track created records to avoid duplicates
        const authorMap = new Map(); // author name -> AuthorID
        const workMap = new Map(); // work title -> WorkID
        const manuscriptMap = new Map(); // shelfmark -> ManuscriptID

        // Seed Evidence Sources
        console.log('📚 Seeding evidence sources...');
        for (const source of sources) {
            // 1. Create or get Author
            let authorId = authorMap.get(source.author);
            if (!authorId) {
                authorId = createId();
                await pool.request()
                    .input('AuthorID', sql.NVarChar, authorId)
                    .input('Name', sql.NVarChar, source.author)
                    .input('Lifespan', sql.NVarChar, source.authorLifespan || null)
                    .input('Bio', sql.NVarChar, source.authorDescription || null)
                    .input('updatedAt', sql.DateTime2, new Date())
                    .query(`
                        INSERT INTO [Authors] ([AuthorID], [Name], [Lifespan], [Bio], [updatedAt])
                        VALUES (@AuthorID, @Name, @Lifespan, @Bio, @updatedAt)
                    `);
                authorMap.set(source.author, authorId);
                console.log(`  ✓ Created author: ${source.author}`);
            }

            // 2. Create or get Work
            let workId = workMap.get(source.work);
            if (!workId) {
                workId = createId();
                await pool.request()
                    .input('WorkID', sql.NVarChar, workId)
                    .input('AuthorID', sql.NVarChar, authorId)
                    .input('Title', sql.NVarChar, source.work)
                    .input('updatedAt', sql.DateTime2, new Date())
                    .query(`
                        INSERT INTO [Work] ([WorkID], [AuthorID], [Title], [updatedAt])
                        VALUES (@WorkID, @AuthorID, @Title, @updatedAt)
                    `);
                workMap.set(source.work, workId);
                console.log(`  ✓ Created work: ${source.work}`);
            }

            // 3. Create Evidence
            const evidenceId = source.id;
            const title = `${source.author} - ${source.work}${source.section ? ' ' + source.section : ''}`;
            await pool.request()
                .input('EvidenceID', sql.NVarChar, evidenceId)
                .input('Title', sql.NVarChar, title)
                .input('EvidenceType', sql.NVarChar, source.evidenceType)
                .input('Category', sql.NVarChar, source.category)
                .input('Summary', sql.NVarChar, source.passageSummary)
                .input('updatedAt', sql.DateTime2, new Date())
                .query(`
                    INSERT INTO [Evidence] ([EvidenceID], [Title], [EvidenceType], [Category], [Summary], [updatedAt])
                    VALUES (@EvidenceID, @Title, @EvidenceType, @Category, @Summary, @updatedAt)
                `);
            console.log(`  ✓ Created evidence: ${evidenceId}`);

            // 4. Create Evidence Passage
            const evidencePassageId = createId();
            await pool.request()
                .input('EvidencePassageID', sql.NVarChar, evidencePassageId)
                .input('EvidenceID', sql.NVarChar, evidenceId)
                .input('WorkID', sql.NVarChar, workId)
                .input('PassageText', sql.NVarChar, source.quoteEnglish)
                .input('OriginalLanguage', sql.NVarChar, source.language)
                .input('OriginalTranslationText', sql.NVarChar, source.quoteOriginal)
                .input('updatedAt', sql.DateTime2, new Date())
                .query(`
                    INSERT INTO [Evidence Passage] ([EvidencePassageID], [EvidenceID], [WorkID], [Passage/Text], [OriginalLanguage], [OriginalTranslationText], [updatedAt])
                    VALUES (@EvidencePassageID, @EvidenceID, @WorkID, @PassageText, @OriginalLanguage, @OriginalTranslationText, @updatedAt)
                `);

            // 5. Create Manuscripts and Manuscript Witnesses
            for (const manuscript of source.manuscripts) {
                let manuscriptId = manuscriptMap.get(manuscript.shelfmark);

                if (!manuscriptId) {
                    manuscriptId = createId();
                    const manuscriptTitle = `${manuscript.library} - ${manuscript.shelfmark}`;
                    await pool.request()
                        .input('ManuscriptID', sql.NVarChar, manuscriptId)
                        .input('Title', sql.NVarChar, manuscriptTitle)
                        .input('Library', sql.NVarChar, manuscript.library)
                        .input('Shelfmark', sql.NVarChar, manuscript.shelfmark)
                        .input('Date', sql.NVarChar, manuscript.date)
                        .input('DigitisedURL', sql.NVarChar, manuscript.digitizedUrl || null)
                        .input('updatedAt', sql.DateTime2, new Date())
                        .query(`
                            INSERT INTO [Manuscript] ([ManuscriptID], [Title], [Library], [Shelfmark], [Date], [DigitisedURL], [updatedAt])
                            VALUES (@ManuscriptID, @Title, @Library, @Shelfmark, @Date, @DigitisedURL, @updatedAt)
                        `);
                    manuscriptMap.set(manuscript.shelfmark, manuscriptId);
                    console.log(`  ✓ Created manuscript: ${manuscript.shelfmark}`);

                    // Create ManuscriptWork junction
                    await pool.request()
                        .input('ManuscriptID', sql.NVarChar, manuscriptId)
                        .input('WorkID', sql.NVarChar, workId)
                        .query(`
                            INSERT INTO [ManuscriptWork] ([ManuscriptID], [WorkID])
                            VALUES (@ManuscriptID, @WorkID)
                        `);
                }

                // Create Manuscript Witness
                const witnessId = createId();
                await pool.request()
                    .input('WitnessID', sql.NVarChar, witnessId)
                    .input('EvidencePassageID', sql.NVarChar, evidencePassageId)
                    .input('ManuscriptID', sql.NVarChar, manuscriptId)
                    .query(`
                        INSERT INTO [Manuscript Witness] ([WitnessID], [EvidencePassageID], [ManuscriptID])
                        VALUES (@WitnessID, @EvidencePassageID, @ManuscriptID)
                    `);
            }

            // 6. Create Existence record (if evidence is about Jesus' existence)
            if (source.tags.includes('Mentions Jesus') || source.tags.includes('Crucifixion')) {
                await pool.request()
                    .input('EvidenceID', sql.NVarChar, evidenceId)
                    .query(`
                        INSERT INTO [Existence] ([EvidenceID])
                        VALUES (@EvidenceID)
                    `);
            }
        }
        console.log(`✅ Seeded ${sources.length} evidence sources\n`);

        // Seed Miracles
        console.log('✨ Seeding miracles...');
        for (const miracle of miracles) {
            // 1. Create Evidence for the miracle
            const evidenceId = miracle.id;
            await pool.request()
                .input('EvidenceID', sql.NVarChar, evidenceId)
                .input('Title', sql.NVarChar, miracle.name)
                .input('EvidenceType', sql.NVarChar, 'Gospel Account')
                .input('Category', sql.NVarChar, miracle.category)
                .input('Summary', sql.NVarChar, miracle.description)
                .input('updatedAt', sql.DateTime2, new Date())
                .query(`
                    INSERT INTO [Evidence] ([EvidenceID], [Title], [EvidenceType], [Category], [Summary], [updatedAt])
                    VALUES (@EvidenceID, @Title, @EvidenceType, @Category, @Summary, @updatedAt)
                `);

            // 2. Create Miracle record
            await pool.request()
                .input('EvidenceID', sql.NVarChar, evidenceId)
                .input('TheologicalSignificance', sql.NVarChar, miracle.significance)
                .input('updatedAt', sql.DateTime2, new Date())
                .query(`
                    INSERT INTO [Miracles] ([EvidenceID], [TheologicalSignificance], [updatedAt])
                    VALUES (@EvidenceID, @TheologicalSignificance, @updatedAt)
                `);

            console.log(`  ✓ Created miracle: ${miracle.name}`);

            // 3. Create Evidence Passages for each Gospel reference
            for (const gospelRef of miracle.gospelReferences) {
                // Get or create Gospel work
                const gospelWorkKey = `Gospel of ${gospelRef.gospel}`;
                let gospelWorkId = workMap.get(gospelWorkKey);

                if (!gospelWorkId) {
                    // Create author (Gospel writer)
                    let gospelAuthorId = authorMap.get(gospelRef.gospel);
                    if (!gospelAuthorId) {
                        gospelAuthorId = createId();
                        await pool.request()
                            .input('AuthorID', sql.NVarChar, gospelAuthorId)
                            .input('Name', sql.NVarChar, gospelRef.gospel)
                            .input('Lifespan', sql.NVarChar, null)
                            .input('Bio', sql.NVarChar, `Gospel writer - ${gospelRef.gospel}`)
                            .input('updatedAt', sql.DateTime2, new Date())
                            .query(`
                                INSERT INTO [Authors] ([AuthorID], [Name], [Lifespan], [Bio], [updatedAt])
                                VALUES (@AuthorID, @Name, @Lifespan, @Bio, @updatedAt)
                            `);
                        authorMap.set(gospelRef.gospel, gospelAuthorId);
                    }

                    gospelWorkId = createId();
                    await pool.request()
                        .input('WorkID', sql.NVarChar, gospelWorkId)
                        .input('AuthorID', sql.NVarChar, gospelAuthorId)
                        .input('Title', sql.NVarChar, gospelWorkKey)
                        .input('updatedAt', sql.DateTime2, new Date())
                        .query(`
                            INSERT INTO [Work] ([WorkID], [AuthorID], [Title], [updatedAt])
                            VALUES (@WorkID, @AuthorID, @Title, @updatedAt)
                        `);
                    workMap.set(gospelWorkKey, gospelWorkId);
                }

                // Create Evidence Passage
                const passageId = createId();
                await pool.request()
                    .input('EvidencePassageID', sql.NVarChar, passageId)
                    .input('EvidenceID', sql.NVarChar, evidenceId)
                    .input('WorkID', sql.NVarChar, gospelWorkId)
                    .input('PassageText', sql.NVarChar, gospelRef.verse || miracle.description)
                    .input('OriginalLanguage', sql.NVarChar, 'Greek')
                    .input('OriginalTranslationText', sql.NVarChar, gospelRef.verse)
                    .input('updatedAt', sql.DateTime2, new Date())
                    .query(`
                        INSERT INTO [Evidence Passage] ([EvidencePassageID], [EvidenceID], [WorkID], [Passage/Text], [OriginalLanguage], [OriginalTranslationText], [updatedAt])
                        VALUES (@EvidencePassageID, @EvidenceID, @WorkID, @PassageText, @OriginalLanguage, @OriginalTranslationText, @updatedAt)
                    `);
            }
        }
        console.log(`✅ Seeded ${miracles.length} miracles\n`);

        // Verify seeded data
        console.log('📊 Database Summary:');
        const tables = [
            'Authors', 'Work', 'Manuscript', 'Evidence',
            'Evidence Passage', 'Miracles', 'Existence', 'Manuscript Witness'
        ];

        for (const table of tables) {
            const result = await pool.request().query(`SELECT COUNT(*) as count FROM [${table}]`);
            console.log(`  • ${table}: ${result.recordset[0].count}`);
        }

        console.log('\n✅ Database seeding completed successfully!');

    } catch (err) {
        console.error('❌ Error seeding database:', err.message);
        console.error(err);
        process.exit(1);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

seedDatabase();
