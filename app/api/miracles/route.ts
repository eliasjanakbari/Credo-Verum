import { NextResponse } from 'next/server';
import { getAllMiracles, getMiraclesByCategory, getMiraclesByGospel, searchMiracles } from '@/lib/db/miracles';
import type { MiracleCategory } from '@/lib/types/miracles';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as MiracleCategory | null;
    const gospel = searchParams.get('gospel') as 'Matthew' | 'Mark' | 'Luke' | 'John' | null;
    const search = searchParams.get('search');

    let miracles;

    if (search) {
      // Search miracles by text
      miracles = await searchMiracles(search);
    } else if (gospel) {
      // Filter by gospel
      miracles = await getMiraclesByGospel(gospel);
    } else if (category) {
      // Filter by category
      miracles = await getMiraclesByCategory(category);
    } else {
      // Get all miracles
      miracles = await getAllMiracles();
    }

    return NextResponse.json(miracles);
  } catch (error) {
    console.error('Error fetching miracles:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([], { status: 200 });
  }
}
