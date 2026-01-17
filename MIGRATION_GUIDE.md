# Migration Guide: TypeScript Data to Azure SQL

This guide explains how to migrate from the existing TypeScript data files to using Azure SQL database with Prisma.

## What Changed

### Before (TypeScript Files)
```typescript
// data/sources.ts
import { sources } from '@/data/sources';

// Data is hard-coded in TypeScript files
const allSources = sources;
```

### After (Azure SQL Database)
```typescript
// Using database helper functions
import { getAllSources } from '@/lib/db/sources';

const allSources = await getAllSources();
```

## Migration Steps

### 1. Set Up Azure SQL Database

Follow the [AZURE_SQL_SETUP.md](./AZURE_SQL_SETUP.md) guide to:
- Create an Azure SQL database
- Get your connection credentials
- Configure your `.env` file

### 2. Create Database Schema

Run these commands to set up the database:

```bash
# Generate Prisma Client
npm run db:generate

# Create tables in Azure SQL
npm run db:push
```

### 3. Seed Your Data

Migrate your existing data from TypeScript files to the database:

```bash
npm run db:seed
```

This will:
- Transfer all data from `data/sources.ts` to the `evidence_sources` table
- Transfer all data from `data/miracles.ts` to the `miracles` table
- Create related records in `evidence_links`, `manuscript_witnesses`, and `gospel_references` tables

### 4. Verify Data Migration

Open Prisma Studio to browse your data:

```bash
npm run db:studio
```

Or use the API routes:
- `http://localhost:3000/api/sources` - View all sources
- `http://localhost:3000/api/miracles` - View all miracles

## Using the Database in Your App

### Server Components (Recommended for Next.js)

```typescript
// app/sources/page.tsx
import { getAllSources } from '@/lib/db/sources';

export default async function SourcesPage() {
  const sources = await getAllSources();

  return (
    <div>
      {sources.map(source => (
        <div key={source.id}>
          <h2>{source.author}</h2>
          <p>{source.passageSummary}</p>
        </div>
      ))}
    </div>
  );
}
```

### API Routes

```typescript
// app/api/sources/route.ts
import { getAllSources } from '@/lib/db/sources';

export async function GET() {
  const sources = await getAllSources();
  return Response.json(sources);
}
```

### Client Components (using API routes)

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { EvidenceSource } from '@/data/sources';

export default function SourcesList() {
  const [sources, setSources] = useState<EvidenceSource[]>([]);

  useEffect(() => {
    fetch('/api/sources')
      .then(res => res.json())
      .then(data => setSources(data));
  }, []);

  return (
    <div>
      {sources.map(source => (
        <div key={source.id}>{source.author}</div>
      ))}
    </div>
  );
}
```

## Available Database Functions

### Sources (`lib/db/sources.ts`)

```typescript
// Get all sources
const sources = await getAllSources();

// Get a specific source by ID
const source = await getSourceById('tacitus-annals-15-44');

// Filter by category
const romanSources = await getSourcesByCategory('Roman');

// Search sources
const results = await searchSources('crucifixion');
```

### Miracles (`lib/db/miracles.ts`)

```typescript
// Get all miracles
const miracles = await getAllMiracles();

// Get a specific miracle by ID
const miracle = await getMiracleById('calming-of-the-storm');

// Filter by category
const natureMiracles = await getMiraclesByCategory('Nature');

// Filter by gospel
const matthewMiracles = await getMiraclesByGospel('Matthew');

// Search miracles
const results = await searchMiracles('water');
```

## API Endpoints

### Sources

- `GET /api/sources` - Get all sources
- `GET /api/sources?category=Roman` - Filter by category
- `GET /api/sources?search=pilate` - Search sources
- `GET /api/sources/[id]` - Get specific source

### Miracles

- `GET /api/miracles` - Get all miracles
- `GET /api/miracles?category=Nature` - Filter by category
- `GET /api/miracles?gospel=Matthew` - Filter by gospel
- `GET /api/miracles?search=storm` - Search miracles
- `GET /api/miracles/[id]` - Get specific miracle

## Database Schema

### Tables Created

1. **evidence_sources** - Main evidence sources table
2. **evidence_links** - Links related to each source
3. **manuscript_witnesses** - Manuscript information for each source
4. **miracles** - Main miracles table
5. **gospel_references** - Gospel references for each miracle

### Relationships

- Each source can have multiple links and manuscripts
- Each miracle can have multiple gospel references
- All relationships use cascade delete (deleting a source deletes its links/manuscripts)

## Data Differences

### Arrays stored as JSON strings

In the database, arrays like `tags` are stored as JSON strings:

```typescript
// In database: tags = '["Mentions Jesus","Crucifixion"]'
// Returned by helper functions: tags = ["Mentions Jesus", "Crucifixion"]
```

The helper functions automatically parse these for you.

### Timestamps added

All records now have `createdAt` and `updatedAt` timestamps:

```typescript
interface EvidenceSource {
  // ... existing fields
  createdAt: Date;    // Automatically added
  updatedAt: Date;    // Automatically updated
}
```

## Benefits of Using Azure SQL

1. **Dynamic Content** - Update data without redeploying your app
2. **Scalability** - Handle more data and users
3. **Search** - Built-in full-text search capabilities
4. **Analytics** - Query and analyze your data
5. **Admin Panel** - Easy to build content management interfaces
6. **Backup** - Automatic backups in Azure
7. **Performance** - Indexed queries for fast retrieval

## Keeping TypeScript Files

You can keep your TypeScript data files as a backup or for:
- Type definitions (already using them for TypeScript types)
- Development without database
- Testing
- Documentation

## Adding New Data

### Option 1: Through Prisma Client

```typescript
import { prisma } from '@/lib/prisma';

await prisma.evidenceSource.create({
  data: {
    id: 'new-source',
    category: 'Roman',
    author: 'Pliny the Younger',
    // ... other fields
    tags: JSON.stringify(['tag1', 'tag2']),
    links: {
      create: [
        { label: 'Reference', url: 'https://...', type: 'reference' }
      ]
    }
  }
});
```

### Option 2: Through TypeScript Files + Re-seed

1. Add data to `data/sources.ts` or `data/miracles.ts`
2. Run `npm run db:seed` to update the database

## Troubleshooting

### Connection Errors

Check your `.env` file has the correct Azure SQL connection string:
```
DATABASE_URL="sqlserver://YOUR_SERVER.database.windows.net:1433;database=YOUR_DB;user=YOUR_USER;password=YOUR_PASSWORD;encrypt=true"
```

### Seed Script Fails

Make sure you've run `npm run db:push` first to create the tables.

### Type Errors

Run `npm run db:generate` to regenerate the Prisma Client types.

### Data Not Showing

Check that the seed completed successfully and verify in Prisma Studio:
```bash
npm run db:studio
```

## Next Steps

1. Update your existing pages/components to use the database functions
2. Build an admin panel to manage content
3. Add search functionality using the search functions
4. Set up proper error handling and loading states
5. Configure caching for better performance
