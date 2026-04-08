import { NextResponse } from 'next/server';
import { getAllPublishedArticles } from '@/lib/db/articles';

export async function GET() {
  try {
    const articles = await getAllPublishedArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json([], { status: 200 });
  }
}
