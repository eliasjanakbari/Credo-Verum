import { NextResponse } from 'next/server';
import { getAllSources, getSourcesByCategory, searchSources } from '@/lib/db/sources';
import type { EvidenceCategory } from '@/data/sources';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as EvidenceCategory | null;
    const search = searchParams.get('search');

    let sources;

    if (search) {
      // Search sources by text
      sources = await searchSources(search);
    } else if (category) {
      // Filter by category
      sources = await getSourcesByCategory(category);
    } else {
      // Get all sources
      sources = await getAllSources();
    }

    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}
