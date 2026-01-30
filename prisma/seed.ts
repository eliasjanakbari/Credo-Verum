import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Database seeding is no longer needed.');
  console.log('Data is managed directly in the Azure SQL database via the admin interface.');

  // Verify connection and print summary
  const authorCount = await prisma.authors.count();
  const workCount = await prisma.work.count();
  const manuscriptCount = await prisma.manuscript.count();
  const evidenceCount = await prisma.evidence.count();
  const evidencePassageCount = await prisma.evidencePassage.count();
  const witnessCount = await prisma.manuscriptWitness.count();

  console.log('\n📊 Current Database Summary:');
  console.log(`  • Authors: ${authorCount}`);
  console.log(`  • Works: ${workCount}`);
  console.log(`  • Manuscripts: ${manuscriptCount}`);
  console.log(`  • Evidence: ${evidenceCount}`);
  console.log(`  • Evidence Passages: ${evidencePassageCount}`);
  console.log(`  • Manuscript Witnesses: ${witnessCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
