import { NextResponse } from 'next/server';
import {
  getArticleById,
  updateArticle,
  deleteArticle,
  checkSlugExists,
  validateSlugFormat
} from '@/lib/db/articles';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { Title, Content, AuthorName, PublishedDate, Status, Slug } = data;

    // Validation
    if (!Title || !Content || !AuthorName || !PublishedDate || !Slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!validateSlugFormat(Slug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }

    // Check if slug exists (excluding current article)
    if (await checkSlugExists(Slug, id)) {
      return NextResponse.json(
        { success: false, error: 'This slug is already in use. Please choose a different one.' },
        { status: 400 }
      );
    }

    await updateArticle(id, {
      Title,
      Slug,
      Content,
      AuthorName,
      PublishedDate: new Date(PublishedDate),
      Status: Status || 'draft',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteArticle(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
