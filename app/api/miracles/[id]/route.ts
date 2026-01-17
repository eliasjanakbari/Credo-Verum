import { NextResponse } from 'next/server';
import { getMiracleById } from '@/lib/db/miracles';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const miracle = await getMiracleById(id);

    if (!miracle) {
      return NextResponse.json(
        { error: 'Miracle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(miracle);
  } catch (error) {
    console.error('Error fetching miracle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch miracle' },
      { status: 500 }
    );
  }
}
