import { NextResponse } from 'next/server';
import { getAllMiracles, getMiraclesByCategory, searchMiracles } from '@/lib/db/miracles';
import type { MiracleCategoryType } from '@/lib/types/sources';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as MiracleCategoryType | null;
    const search = searchParams.get('search');

    let miracles;

    if (search) {
      // Search miracles by text
      miracles = await searchMiracles(search);
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
