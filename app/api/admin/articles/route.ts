import { NextResponse } from 'next/server';
import { getAllArticles, createArticle, generateUniqueSlug, checkSlugExists, validateSlugFormat } from '@/lib/db/articles';

export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { Title, Content, AuthorName, PublishedDate, Status, Slug } = data;

    // Validation
    if (!Title || !Content || !AuthorName || !PublishedDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle slug
    let finalSlug = Slug;

    if (finalSlug) {
      // User provided a custom slug, validate it
      if (!validateSlugFormat(finalSlug)) {
        return NextResponse.json(
          { success: false, error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
          { status: 400 }
        );
      }

      // Check if slug already exists
      if (await checkSlugExists(finalSlug)) {
        return NextResponse.json(
          { success: false, error: 'This slug is already in use. Please choose a different one.' },
          { status: 400 }
        );
      }
    } else {
      // Auto-generate slug from title
      finalSlug = await generateUniqueSlug(Title);
    }

    const articleId = await createArticle({
      Title,
      Slug: finalSlug,
      Content,
      AuthorName,
      PublishedDate: new Date(PublishedDate),
      Status: Status || 'draft',
    });

    return NextResponse.json({
      success: true,
      articleId,
      slug: finalSlug
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
