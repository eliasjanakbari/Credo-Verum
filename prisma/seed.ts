import { PrismaClient } from '@prisma/client';
import { sources } from '../data/sources';
import { miracles } from '../data/miracles';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data in reverse order of dependencies
  console.log('🧹 Clearing existing data...');
  await prisma.passageConnection.deleteMany();
  await prisma.manuscriptWitness.deleteMany();
  await prisma.evidencePassage.deleteMany();
  await prisma.manuscriptWork.deleteMany();
  await prisma.manuscript.deleteMany();
  await prisma.work.deleteMany();
  await prisma.authors.deleteMany();
  await prisma.existence.deleteMany();
  await prisma.miracles.deleteMany();
  await prisma.evidence.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Track created authors, works, and manuscripts to avoid duplicates
  const authorMap = new Map<string, string>(); // author name -> AuthorID
  const workMap = new Map<string, string>(); // work title -> WorkID
  const manuscriptMap = new Map<string, string>(); // shelfmark -> ManuscriptID

  // Seed Evidence Sources
  console.log('📚 Seeding evidence sources...');
  for (const source of sources) {
    // 1. Create or get Author
    let authorId = authorMap.get(source.author);
    if (!authorId) {
      const author = await prisma.authors.create({
        data: {
          Name: source.author,
          Lifespan: source.authorLifespan,
          Bio: source.authorDescription,
        },
      });
      authorId = author.AuthorID;
      authorMap.set(source.author, authorId);
      console.log(`  ✓ Created author: ${source.author}`);
    }

    // 2. Create or get Work
    let workId = workMap.get(source.work);
    if (!workId) {
      const work = await prisma.work.create({
        data: {
          AuthorID: authorId,
          Title: source.work,
        },
      });
      workId = work.WorkID;
      workMap.set(source.work, workId);
      console.log(`  ✓ Created work: ${source.work}`);
    }

    // 3. Create Evidence
    const evidence = await prisma.evidence.create({
      data: {
        EvidenceID: source.id,
        Title: `${source.author} - ${source.work}${source.section ? ' ' + source.section : ''}`,
        EvidenceType: source.evidenceType,
        Category: source.category,
        Summary: source.passageSummary,
      },
    });
    console.log(`  ✓ Created evidence: ${evidence.EvidenceID}`);

    // 4. Create Evidence Passage
    const evidencePassage = await prisma.evidencePassage.create({
      data: {
        EvidenceID: evidence.EvidenceID,
        WorkID: workId,
        PassageText: source.quoteEnglish,
        OriginalLanguage: source.language,
        OriginalTranslationText: source.quoteOriginal,
      },
    });
    console.log(`  ✓ Created evidence passage: ${evidencePassage.EvidencePassageID}`);

    // 5. Create Manuscripts and Manuscript Witnesses
    for (const manuscript of source.manuscripts) {
      let manuscriptId = manuscriptMap.get(manuscript.shelfmark);

      if (!manuscriptId) {
        const manuscriptRecord = await prisma.manuscript.create({
          data: {
            Title: `${manuscript.library} - ${manuscript.shelfmark}`,
            Library: manuscript.library,
            Shelfmark: manuscript.shelfmark,
            Date: manuscript.date,
            DigitisedURL: manuscript.digitizedUrl,
          },
        });
        manuscriptId = manuscriptRecord.ManuscriptID;
        manuscriptMap.set(manuscript.shelfmark, manuscriptId);
        console.log(`  ✓ Created manuscript: ${manuscript.shelfmark}`);

        // Create ManuscriptWork junction
        await prisma.manuscriptWork.create({
          data: {
            ManuscriptID: manuscriptId,
            WorkID: workId,
          },
        });
      }

      // Create Manuscript Witness
      await prisma.manuscriptWitness.create({
        data: {
          EvidencePassageID: evidencePassage.EvidencePassageID,
          ManuscriptID: manuscriptId,
        },
      });
    }

    // 6. Create Existence record (if evidence is about Jesus' existence)
    if (source.tags.includes('Mentions Jesus') || source.tags.includes('Crucifixion')) {
      await prisma.existence.create({
        data: {
          EvidenceID: evidence.EvidenceID,
        },
      });
    }
  }
  console.log(`✅ Seeded ${sources.length} evidence sources\n`);

  // Seed Miracles
  console.log('✨ Seeding miracles...');
  for (const miracle of miracles) {
    // 1. Create Evidence for the miracle
    const evidence = await prisma.evidence.create({
      data: {
        EvidenceID: miracle.id,
        Title: miracle.name,
        EvidenceType: 'Gospel Account',
        Category: miracle.category,
        Summary: miracle.description,
      },
    });

    // 2. Create Miracle record
    await prisma.miracles.create({
      data: {
        EvidenceID: evidence.EvidenceID,
        TheologicalSignificance: miracle.significance,
      },
    });

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
          const author = await prisma.authors.create({
            data: {
              Name: gospelRef.gospel,
              Lifespan: null,
              Bio: `Gospel writer - ${gospelRef.gospel}`,
            },
          });
          gospelAuthorId = author.AuthorID;
          authorMap.set(gospelRef.gospel, gospelAuthorId);
        }

        const work = await prisma.work.create({
          data: {
            AuthorID: gospelAuthorId,
            Title: gospelWorkKey,
          },
        });
        gospelWorkId = work.WorkID;
        workMap.set(gospelWorkKey, gospelWorkId);
      }

      // Create Evidence Passage
      await prisma.evidencePassage.create({
        data: {
          EvidenceID: evidence.EvidenceID,
          WorkID: gospelWorkId,
          PassageText: gospelRef.verse || miracle.description,
          OriginalLanguage: 'Greek',
          OriginalTranslationText: gospelRef.verse,
        },
      });
    }
  }
  console.log(`✅ Seeded ${miracles.length} miracles\n`);

  // Verify seeded data
  const authorCount = await prisma.authors.count();
  const workCount = await prisma.work.count();
  const manuscriptCount = await prisma.manuscript.count();
  const evidenceCount = await prisma.evidence.count();
  const evidencePassageCount = await prisma.evidencePassage.count();
  const miracleCount = await prisma.miracles.count();
  const existenceCount = await prisma.existence.count();
  const witnessCount = await prisma.manuscriptWitness.count();

  console.log('📊 Database Summary:');
  console.log(`  • Authors: ${authorCount}`);
  console.log(`  • Works: ${workCount}`);
  console.log(`  • Manuscripts: ${manuscriptCount}`);
  console.log(`  • Evidence: ${evidenceCount}`);
  console.log(`  • Evidence Passages: ${evidencePassageCount}`);
  console.log(`  • Miracles: ${miracleCount}`);
  console.log(`  • Existence Records: ${existenceCount}`);
  console.log(`  • Manuscript Witnesses: ${witnessCount}`);
  console.log('\n✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
