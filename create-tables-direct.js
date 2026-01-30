// Direct SQL table creation using mssql package
const sql = require('mssql');

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

// SQL DDL statements to create all tables based on Prisma schema
const createTableSQL = `
-- Drop existing tables if they exist (in reverse dependency order)
IF OBJECT_ID('[PassageConnection]', 'U') IS NOT NULL DROP TABLE [PassageConnection];
IF OBJECT_ID('ManuscriptWitness', 'U') IS NOT NULL DROP TABLE ManuscriptWitness;
IF OBJECT_ID('EvidencePassage', 'U') IS NOT NULL DROP TABLE EvidencePassage;
IF OBJECT_ID('[ManuscriptWork]', 'U') IS NOT NULL DROP TABLE [ManuscriptWork];
IF OBJECT_ID('[Manuscript]', 'U') IS NOT NULL DROP TABLE [Manuscript];
IF OBJECT_ID('[Work]', 'U') IS NOT NULL DROP TABLE [Work];
IF OBJECT_ID('[Authors]', 'U') IS NOT NULL DROP TABLE [Authors];
IF OBJECT_ID('[Evidence]', 'U') IS NOT NULL DROP TABLE [Evidence];

-- Create Authors table
CREATE TABLE [Authors] (
    [AuthorID] NVARCHAR(1000) NOT NULL,
    [Name] NVARCHAR(1000) NOT NULL,
    [Lifespan] NVARCHAR(1000),
    [Bio] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Authors_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Authors_pkey] PRIMARY KEY CLUSTERED ([AuthorID])
);

-- Create Work table
CREATE TABLE [Work] (
    [WorkID] NVARCHAR(1000) NOT NULL,
    [AuthorID] NVARCHAR(1000) NOT NULL,
    [Title] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Work_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Work_pkey] PRIMARY KEY CLUSTERED ([WorkID]),
    CONSTRAINT [Work_AuthorID_fkey] FOREIGN KEY ([AuthorID]) REFERENCES [Authors]([AuthorID]) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Manuscript table
CREATE TABLE [Manuscript] (
    [ManuscriptID] NVARCHAR(1000) NOT NULL,
    [Title] NVARCHAR(1000) NOT NULL,
    [Library] NVARCHAR(MAX) NOT NULL,
    [Shelfmark] NVARCHAR(1000) NOT NULL,
    [Date] NVARCHAR(1000) NOT NULL,
    [DigitisedURL] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Manuscript_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Manuscript_pkey] PRIMARY KEY CLUSTERED ([ManuscriptID])
);

-- Create ManuscriptWork junction table
CREATE TABLE [ManuscriptWork] (
    [ManuscriptID] NVARCHAR(1000) NOT NULL,
    [WorkID] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ManuscriptWork_pkey] PRIMARY KEY CLUSTERED ([ManuscriptID], [WorkID]),
    CONSTRAINT [ManuscriptWork_ManuscriptID_fkey] FOREIGN KEY ([ManuscriptID]) REFERENCES [Manuscript]([ManuscriptID]) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT [ManuscriptWork_WorkID_fkey] FOREIGN KEY ([WorkID]) REFERENCES [Work]([WorkID]) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Evidence table
CREATE TABLE [Evidence] (
    [EvidenceID] NVARCHAR(1000) NOT NULL,
    [Title] NVARCHAR(1000) NOT NULL,
    [EvidenceType] NVARCHAR(1000) NOT NULL,
    [Category] NVARCHAR(1000) NOT NULL,
    [Summary] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Evidence_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Evidence_pkey] PRIMARY KEY CLUSTERED ([EvidenceID])
);

-- Create Evidence Passage table
CREATE TABLE EvidencePassage (
    [EvidencePassageID] NVARCHAR(1000) NOT NULL,
    [EvidenceID] NVARCHAR(1000) NOT NULL,
    [WorkID] NVARCHAR(1000) NOT NULL,
    PassageText NVARCHAR(MAX) NOT NULL,
    [OriginalLanguage] NCHAR(3),
    [OriginalTranslationText] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [EvidencePassage_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [EvidencePassage_pkey] PRIMARY KEY CLUSTERED ([EvidencePassageID]),
    CONSTRAINT [EvidencePassage_EvidenceID_fkey] FOREIGN KEY ([EvidenceID]) REFERENCES [Evidence]([EvidenceID]) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT [EvidencePassage_WorkID_fkey] FOREIGN KEY ([WorkID]) REFERENCES [Work]([WorkID]) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Manuscript Witness table
CREATE TABLE ManuscriptWitness (
    [WitnessID] NVARCHAR(1000) NOT NULL,
    [EvidencePassageID] NVARCHAR(1000) NOT NULL,
    [ManuscriptID] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ManuscriptWitness_pkey] PRIMARY KEY CLUSTERED ([WitnessID]),
    CONSTRAINT [ManuscriptWitness_EvidencePassageID_fkey] FOREIGN KEY ([EvidencePassageID]) REFERENCES EvidencePassage([EvidencePassageID]) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT [ManuscriptWitness_ManuscriptID_fkey] FOREIGN KEY ([ManuscriptID]) REFERENCES [Manuscript]([ManuscriptID]) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create PassageConnection table
CREATE TABLE [PassageConnection] (
    [ConnectionID] NVARCHAR(1000) NOT NULL,
    [FromEvidencePassageID] NVARCHAR(1000) NOT NULL,
    [ToEvidencePassageID] NVARCHAR(1000) NOT NULL,
    [ConnectionType] NVARCHAR(1000),
    [Lifespan] NVARCHAR(1000),
    [Bio] NVARCHAR(MAX),
    [AuthorID] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PassageConnection_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PassageConnection_pkey] PRIMARY KEY CLUSTERED ([ConnectionID]),
    CONSTRAINT [PassageConnection_AuthorID_fkey] FOREIGN KEY ([AuthorID]) REFERENCES [Authors]([AuthorID]) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX [Work_AuthorID_idx] ON [Work]([AuthorID]);
CREATE INDEX [EvidencePassage_EvidenceID_idx] ON EvidencePassage([EvidenceID]);
CREATE INDEX [EvidencePassage_WorkID_idx] ON EvidencePassage([WorkID]);
CREATE INDEX [ManuscriptWitness_EvidencePassageID_idx] ON ManuscriptWitness([EvidencePassageID]);
CREATE INDEX [ManuscriptWitness_ManuscriptID_idx] ON ManuscriptWitness([ManuscriptID]);
CREATE INDEX [PassageConnection_AuthorID_idx] ON [PassageConnection]([AuthorID]);
`;

async function createTables() {
    try {
        console.log('🔗 Connecting to Azure SQL Database...');
        console.log('   Server:', config.server);
        console.log('   Database:', config.database);
        console.log('   User:', config.user);
        console.log();

        const pool = await sql.connect(config);
        console.log('✅ Connected successfully!\n');

        console.log('🗂️  Creating database tables...');
        const result = await pool.request().query(createTableSQL);

        console.log('✅ All tables created successfully!\n');

        // Verify tables were created
        const tableCheck = await pool.request().query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        console.log('📊 Tables in database:');
        tableCheck.recordset.forEach(row => {
            console.log('   ✓', row.TABLE_NAME);
        });

        await pool.close();
        console.log('\n✅ Database setup complete!');
        console.log('\nNext step: Run "npm run db:seed" to populate the database with your data.');

    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
        if (err.precedingErrors) {
            err.precedingErrors.forEach((e, i) => {
                console.error(`   Error ${i + 1}:`, e.message);
            });
        }
        process.exit(1);
    }
}

createTables();
