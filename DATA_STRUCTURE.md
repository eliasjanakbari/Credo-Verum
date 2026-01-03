# Data Structure Documentation

This document outlines the data structures used in the Jesus Hub application, designed to be easily migrated to Azure (or any other backend/database solution).

## Overview

The application currently uses TypeScript data files that can be migrated to a database. The structure is designed with the following principles:

- **Separation of Concerns**: Different evidence types (historical sources, miracles) are separated
- **Extensibility**: Easy to add new categories and items
- **Type Safety**: Full TypeScript support for all data structures
- **Database Ready**: Structures map cleanly to relational or NoSQL databases

---

## 1. Historical Evidence Data Structure

**File**: `/data/sources.ts`

### Types

#### `EvidenceCategory`
```typescript
type EvidenceCategory = 'Roman' | 'Jewish' | 'Christian';
```

#### `EvidenceLink`
```typescript
interface EvidenceLink {
  label: string;
  url: string;
  type: 'manuscript' | 'translation' | 'article' | 'reference' | 'image';
}
```

#### `ManuscriptWitness`
```typescript
interface ManuscriptWitness {
  library: string;
  shelfmark: string;
  date: string;
  digitizedUrl: string;
  imageUrl?: string;
  notes?: string;
}
```

#### `EvidenceSource`
```typescript
interface EvidenceSource {
  id: string;                    // Unique identifier
  category: EvidenceCategory;    // Roman, Jewish, or Christian
  author: string;                // Full name of author
  authorLifespan?: string;       // e.g., "c. AD 56 – c. 120"
  authorDescription: string;     // Who was this author?
  work: string;                  // Title of the work
  workDescription: string;       // What is this work about?
  section?: string;              // e.g., "15.44"
  date: string;                  // When was this written?
  language: string;              // Original language
  quoteOriginal: string;         // Quote in original language
  quoteEnglish: string;          // English translation
  passageSummary: string;        // What does this passage tell us?
  evidenceType: string;          // e.g., "Roman – Non-Christian"
  tags: string[];                // Searchable tags
  links: EvidenceLink[];         // Related links
  manuscripts: ManuscriptWitness[]; // Manuscript evidence
}
```

### Database Migration Plan

**Suggested Azure Cosmos DB Schema** (NoSQL):
```json
{
  "id": "tacitus-annals-15-44",
  "type": "evidence-source",
  "category": "Roman",
  "author": {
    "name": "Publius Cornelius Tacitus",
    "lifespan": "c. AD 56 – c. 120",
    "description": "..."
  },
  "work": {
    "title": "Annals",
    "description": "...",
    "section": "15.44"
  },
  "dating": "c. AD 116",
  "language": "Latin",
  "quote": {
    "original": "...",
    "english": "..."
  },
  "passageSummary": "...",
  "evidenceType": "Roman – Non-Christian",
  "tags": ["Mentions Jesus", "Crucifixion", "Persecution"],
  "links": [...],
  "manuscripts": [...]
}
```

**Suggested Azure SQL Schema**:
```sql
-- Main evidence sources table
CREATE TABLE EvidenceSources (
    Id NVARCHAR(255) PRIMARY KEY,
    Category NVARCHAR(50),
    Author NVARCHAR(255),
    AuthorLifespan NVARCHAR(100),
    AuthorDescription NVARCHAR(MAX),
    Work NVARCHAR(255),
    WorkDescription NVARCHAR(MAX),
    Section NVARCHAR(50),
    Date NVARCHAR(100),
    Language NVARCHAR(50),
    QuoteOriginal NVARCHAR(MAX),
    QuoteEnglish NVARCHAR(MAX),
    PassageSummary NVARCHAR(MAX),
    EvidenceType NVARCHAR(100)
);

-- Links table (one-to-many)
CREATE TABLE EvidenceLinks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SourceId NVARCHAR(255) FOREIGN KEY REFERENCES EvidenceSources(Id),
    Label NVARCHAR(255),
    Url NVARCHAR(500),
    Type NVARCHAR(50)
);

-- Manuscripts table (one-to-many)
CREATE TABLE ManuscriptWitnesses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SourceId NVARCHAR(255) FOREIGN KEY REFERENCES EvidenceSources(Id),
    Library NVARCHAR(255),
    Shelfmark NVARCHAR(100),
    Date NVARCHAR(100),
    DigitizedUrl NVARCHAR(500),
    ImageUrl NVARCHAR(500),
    Notes NVARCHAR(MAX)
);

-- Tags table (many-to-many)
CREATE TABLE Tags (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) UNIQUE
);

CREATE TABLE SourceTags (
    SourceId NVARCHAR(255) FOREIGN KEY REFERENCES EvidenceSources(Id),
    TagId INT FOREIGN KEY REFERENCES Tags(Id),
    PRIMARY KEY (SourceId, TagId)
);
```

---

## 2. Miracles Data Structure

**File**: `/data/miracles.ts`

### Types

#### `MiracleCategory`
```typescript
type MiracleCategory = 'Nature' | 'Healing' | 'Resurrection' | 'Casting out demons';
```

#### `GospelReference`
```typescript
interface GospelReference {
  gospel: 'Matthew' | 'Mark' | 'Luke' | 'John';
  reference: string;  // e.g., "8:23-27"
  verse?: string;     // Optional: actual verse text
}
```

#### `Miracle`
```typescript
interface Miracle {
  id: string;                           // Unique identifier
  category: MiracleCategory;            // Type of miracle
  name: string;                         // Name of the miracle
  description: string;                  // What happened?
  gospelReferences: GospelReference[];  // Which gospels record this?
  significance: string;                 // Why does this matter theologically?
  tags: string[];                       // Searchable tags
}
```

### Database Migration Plan

**Suggested Azure Cosmos DB Schema** (NoSQL):
```json
{
  "id": "calming-of-the-storm",
  "type": "miracle",
  "category": "Nature",
  "name": "Calming of the Storm",
  "description": "...",
  "gospelReferences": [
    {
      "gospel": "Matthew",
      "reference": "8:23-27",
      "verse": "..."
    }
  ],
  "significance": "...",
  "tags": ["Divine Authority", "Nature Miracle", "Faith"]
}
```

**Suggested Azure SQL Schema**:
```sql
-- Main miracles table
CREATE TABLE Miracles (
    Id NVARCHAR(255) PRIMARY KEY,
    Category NVARCHAR(50),
    Name NVARCHAR(255),
    Description NVARCHAR(MAX),
    Significance NVARCHAR(MAX)
);

-- Gospel references table (one-to-many)
CREATE TABLE GospelReferences (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MiracleId NVARCHAR(255) FOREIGN KEY REFERENCES Miracles(Id),
    Gospel NVARCHAR(50),
    Reference NVARCHAR(50),
    Verse NVARCHAR(MAX)
);

-- Miracle tags table (many-to-many)
CREATE TABLE MiracleTags (
    MiracleId NVARCHAR(255) FOREIGN KEY REFERENCES Miracles(Id),
    TagId INT FOREIGN KEY REFERENCES Tags(Id),
    PRIMARY KEY (MiracleId, TagId)
);
```

---

## 3. API Endpoints for Azure Functions

When migrating to Azure, you'll need these API endpoints:

### Evidence Sources Endpoints
```
GET  /api/sources              - Get all evidence sources
GET  /api/sources/{id}         - Get specific source
GET  /api/sources/category/{category} - Get sources by category
POST /api/sources              - Create new source (admin)
PUT  /api/sources/{id}         - Update source (admin)
DELETE /api/sources/{id}       - Delete source (admin)
```

### Miracles Endpoints
```
GET  /api/miracles             - Get all miracles
GET  /api/miracles/{id}        - Get specific miracle
GET  /api/miracles/category/{category} - Get miracles by category
POST /api/miracles             - Create new miracle (admin)
PUT  /api/miracles/{id}        - Update miracle (admin)
DELETE /api/miracles/{id}      - Delete miracle (admin)
```

---

## 4. Current Implementation

### Frontend Access
```typescript
// Evidence sources
import { sources } from '@/data/sources';

// Filter by category
const romanSources = sources.filter(s => s.category === 'Roman');

// Get counts
const count = sources.reduce((acc, source) => {
  acc[source.category] = (acc[source.category] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

```typescript
// Miracles
import { miracles } from '@/data/miracles';

// Filter by category
const natureMiracles = miracles.filter(m => m.category === 'Nature');

// Get counts
const counts = miracles.reduce((acc, miracle) => {
  acc[miracle.category] = (acc[miracle.category] ?? 0) + 1;
  return acc;
}, {} as Record<MiracleCategory, number>);
```

### Future API Access
```typescript
// Replace static imports with API calls
const sources = await fetch('/api/sources').then(r => r.json());
const miracles = await fetch('/api/miracles').then(r => r.json());
```

---

## 5. Migration Checklist

- [ ] Choose database (Azure Cosmos DB or Azure SQL)
- [ ] Create database schema
- [ ] Set up Azure Functions for API endpoints
- [ ] Migrate data from TypeScript files to database
- [ ] Update frontend to use API calls instead of static imports
- [ ] Add authentication for admin endpoints
- [ ] Set up caching (Azure Redis Cache) for better performance
- [ ] Add content moderation if user submissions are allowed
- [ ] Set up CI/CD pipeline for database migrations

---

## 6. Adding New Data

### Adding a New Evidence Source

Currently, add to `/data/sources.ts`:
```typescript
{
  id: 'unique-id',
  category: 'Roman' | 'Jewish' | 'Christian',
  author: '...',
  // ... rest of fields
}
```

After Azure migration:
```typescript
POST /api/sources
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "id": "unique-id",
  "category": "Roman",
  // ... rest of fields
}
```

### Adding a New Miracle

Currently, add to `/data/miracles.ts`:
```typescript
{
  id: 'unique-id',
  category: 'Nature' | 'Healing' | 'Resurrection' | 'Casting out demons',
  name: '...',
  // ... rest of fields
}
```

After Azure migration:
```typescript
POST /api/miracles
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "id": "unique-id",
  "category": "Nature",
  // ... rest of fields
}
```

---

## 7. Best Practices

1. **Always use unique IDs**: Use kebab-case for IDs (e.g., `calming-of-the-storm`)
2. **Keep descriptions concise but informative**: Users should understand the significance quickly
3. **Include all gospel references**: Don't skip gospels even if not all four record the event
4. **Tag appropriately**: Tags help with search and filtering
5. **Validate data**: Ensure all required fields are present before adding to database
6. **Version your data**: Consider adding a version field for tracking changes
7. **Backup regularly**: Especially important when allowing user submissions

---

## Contact

For questions about data structure or migration, contact the development team.
