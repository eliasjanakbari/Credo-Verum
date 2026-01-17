# ERD Implementation Summary

This document explains how your ERD design has been implemented in the Prisma schema and how it maps to your existing data.

## Database Schema Overview

The database follows a **normalized relational design** that separates concerns into distinct tables:

### Core Tables

#### 1. **Authors**
- Stores author information (Tacitus, Josephus, Gospel writers, etc.)
- Fields: `AuthorID`, `Name`, `Lifespan`, `Bio`
- One author can have multiple works

#### 2. **Work**
- Stores literary works (Annals, Antiquities, Gospels, etc.)
- Fields: `WorkID`, `AuthorID`, `Title`
- Each work belongs to one author
- One work can appear in multiple manuscripts

#### 3. **Manuscript**
- Physical manuscript copies of works
- Fields: `ManuscriptID`, `Title`, `Library`, `Shelfmark`, `Date`, `DigitisedURL`
- Examples: Mediceus II, Vatican manuscripts

#### 4. **ManuscriptWork** (Junction Table)
- Links manuscripts to the works they contain
- Many-to-many relationship: one manuscript can contain multiple works

#### 5. **Evidence**
- Core evidence records (both historical sources and miracles)
- Fields: `EvidenceID`, `Title`, `EvidenceType`, `Category`, `Summary`
- Acts as the base table for all evidence

#### 6. **EvidencePassage**
- Specific passages from works that serve as evidence
- Fields: `EvidencePassageID`, `EvidenceID`, `WorkID`, `PassageText`, `OriginalLanguage`, `OriginalTranslationText`
- Links evidence to specific works
- Contains the actual quoted text

#### 7. **ManuscriptWitness**
- Links evidence passages to the manuscripts that preserve them
- Fields: `WitnessID`, `EvidencePassageID`, `ManuscriptID`
- Shows which manuscripts contain which evidence

#### 8. **Existence**
- Specialized table for evidence of Jesus' existence
- 1:1 relationship with Evidence table
- Only populated for evidence about Jesus' historical existence

#### 9. **Miracles**
- Specialized table for miracle evidence
- Fields: `EvidenceID`, `TheologicalSignificance`
- 1:1 relationship with Evidence table

#### 10. **PassageConnection**
- Links between evidence passages (for future use)
- Fields: `ConnectionID`, `FromEvidencePassageID`, `ToEvidencePassageID`, `ConnectionType`, `AuthorID`
- Can link passages that reference each other

## How Your Data Maps to the ERD

### Historical Sources (from `data/sources.ts`)

For each source like Tacitus - Annals 15.44:

```
Author (Tacitus)
  └─> Work (Annals)
       └─> Manuscript (Mediceus II)
            └─> ManuscriptWork (junction)
       └─> EvidencePassage (Annals 15.44 text)
            └─> ManuscriptWitness (links passage to manuscript)
            └─> Evidence (Tacitus reference to Christus)
                 └─> Existence (marks as evidence of Jesus)
```

**Tables Created:**
1. `Authors` record for Tacitus
2. `Work` record for Annals
3. `Manuscript` record for Mediceus II
4. `ManuscriptWork` junction linking manuscript to work
5. `Evidence` record with category "Roman", type "Roman – Non-Christian"
6. `EvidencePassage` with the Latin and English quotes
7. `ManuscriptWitness` linking the passage to the manuscript
8. `Existence` record (since it mentions Jesus)

### Miracles (from `data/miracles.ts`)

For each miracle like "Calming of the Storm":

```
Authors (Matthew, Mark, Luke)
  └─> Works (Gospel of Matthew, Gospel of Mark, Gospel of Luke)
       └─> EvidencePassages (one per Gospel reference)
            └─> Evidence (Calming of the Storm)
                 └─> Miracles (with theological significance)
```

**Tables Created:**
1. `Authors` records for each Gospel writer (Matthew, Mark, Luke, John)
2. `Work` records for each Gospel
3. `Evidence` record with category matching miracle category, type "Gospel Account"
4. `EvidencePassage` for each Gospel reference (Matthew 8:23-27, Mark 4:35-41, etc.)
5. `Miracles` record with theological significance

## Benefits of This Design

### 1. **Eliminates Duplication**
- Authors like "Josephus" appear once, even if they wrote multiple works
- Works like "Antiquities" appear once, even if cited multiple times
- Manuscripts are shared across works

### 2. **Flexible Relationships**
- Can track multiple manuscripts for the same work
- Can link multiple passages from the same work
- Can connect related passages

### 3. **Extensibility**
- Easy to add new evidence types by extending Evidence table
- PassageConnection allows building a knowledge graph
- Can add new manuscripts without duplicating work/author data

### 4. **Data Integrity**
- Foreign key constraints ensure references remain valid
- Cascade deletes maintain referential integrity
- Normalized structure prevents update anomalies

## Key Differences from Original Implementation

### Before (Flat Structure)
```typescript
{
  id: 'tacitus-annals-15-44',
  author: 'Tacitus',
  authorLifespan: 'c. AD 56 – c. 120',
  work: 'Annals',
  manuscripts: [{ library: '...', shelfmark: '...' }]
}
```

### After (Normalized Structure)
```sql
Authors: { AuthorID, Name: 'Tacitus', Lifespan: 'c. AD 56 – c. 120' }
Work: { WorkID, AuthorID, Title: 'Annals' }
Manuscript: { ManuscriptID, Library: '...', Shelfmark: '...' }
ManuscriptWork: { ManuscriptID, WorkID }
Evidence: { EvidenceID: 'tacitus-annals-15-44', ... }
EvidencePassage: { EvidencePassageID, EvidenceID, WorkID, ... }
ManuscriptWitness: { WitnessID, EvidencePassageID, ManuscriptID }
```

## Database Relationships

### One-to-Many
- `Authors` → `Work` (one author, many works)
- `Work` → `EvidencePassage` (one work, many passages cited)
- `Evidence` → `EvidencePassage` (one evidence, many passages)
- `EvidencePassage` → `ManuscriptWitness` (one passage, many manuscript witnesses)
- `Manuscript` → `ManuscriptWitness` (one manuscript, many witnessed passages)

### Many-to-Many
- `Manuscript` ↔ `Work` (via ManuscriptWork junction)
  - One manuscript can contain multiple works
  - One work can appear in multiple manuscripts

### One-to-One
- `Evidence` ↔ `Existence` (evidence specifically about Jesus' existence)
- `Evidence` ↔ `Miracles` (evidence specifically about miracles)

## Query Examples

### Get all evidence sources with author and work info:
```typescript
const evidences = await prisma.evidence.findMany({
  include: {
    evidencePassages: {
      include: {
        work: {
          include: {
            author: true
          }
        },
        manuscriptWitnesses: {
          include: {
            manuscript: true
          }
        }
      }
    }
  }
});
```

### Find all works by an author:
```typescript
const tacitusWorks = await prisma.work.findMany({
  where: {
    author: {
      Name: { contains: 'Tacitus' }
    }
  }
});
```

### Find all manuscripts containing a specific work:
```typescript
const manuscripts = await prisma.manuscript.findMany({
  where: {
    manuscriptWorks: {
      some: {
        work: {
          Title: 'Annals'
        }
      }
    }
  }
});
```

## Migration Notes

### Preserved
- All original data from `sources.ts` and `miracles.ts`
- Type compatibility with existing TypeScript interfaces
- API endpoints return the same data structure

### Changed
- Tags and links are not stored (were not in ERD)
- Data is now normalized across multiple tables
- Helper functions reconstruct the original format

### Added
- Relationships between authors, works, and manuscripts
- Ability to track manuscript witnesses
- Foundation for passage connections
- Specialized tables for Existence and Miracles

## Future Enhancements

With this ERD structure, you can now easily add:

1. **Passage Connections** - Link related passages (e.g., NT references to OT)
2. **Critical Apparatus** - Track textual variants across manuscripts
3. **Citations** - Track how later works cite earlier ones
4. **Translations** - Multiple translations of the same passage
5. **Scholarly Notes** - Annotations and commentary on passages
6. **Search & Analysis** - Complex queries across the knowledge graph

## Files Modified

1. [prisma/schema.prisma](prisma/schema.prisma) - Complete schema rewrite to match ERD
2. [prisma/seed.ts](prisma/seed.ts) - Updated to populate normalized structure
3. [lib/db/sources.ts](lib/db/sources.ts) - Queries against new schema, returns original format
4. [lib/db/miracles.ts](lib/db/miracles.ts) - Queries against new schema, returns original format
5. API routes work unchanged (use helper functions that abstract the schema)

## Next Steps

1. Set up your Azure SQL database (see [AZURE_SQL_SETUP.md](AZURE_SQL_SETUP.md))
2. Run `npm run db:push` to create tables
3. Run `npm run db:seed` to migrate data
4. Existing code continues to work with the new normalized structure!
