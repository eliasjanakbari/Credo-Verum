'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import DOMPurify from 'dompurify';

interface Article {
  ArticleID: string;
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: string;
  Status: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        if (!res.ok) {
          setArticle(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setArticle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching article:', error);
        setArticle(null);
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3EEEA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden p-8 md:p-12">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    notFound();
  }

  // Sanitize HTML content (client-side only)
  const sanitizedContent = DOMPurify.sanitize(article.Content);

  return (
    <main className="min-h-screen bg-[#F3EEEA]">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Article Header */}
          <article className="p-8 md:p-12">
            <header className="mb-8 pb-8 border-b border-slate-200">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-cinzel">
                {article.Title}
              </h1>

              <div className="flex items-center text-slate-600 text-sm">
                <span className="font-medium">{article.AuthorName}</span>
                <span className="mx-2">•</span>
                <time dateTime={new Date(article.PublishedDate).toISOString()}>
                  {new Date(article.PublishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </header>

            {/* Article Content */}
            <div
              className="prose prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[#776b5d] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-em:italic
                prose-blockquote:border-l-4 prose-blockquote:border-[#776b5d] prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:text-slate-700
                prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-slate-900 prose-pre:text-slate-100
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                prose-li:mb-2
                prose-img:rounded-lg prose-img:shadow-lg
                [&_p]:mb-6"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </article>
        </div>
      </div>
    </main>
  );
}
