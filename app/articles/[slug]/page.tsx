import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { getArticleBySlug } from '@/lib/db/articles';

async function getArticle(slug: string) {
  try {
    const article = await getArticleBySlug(slug);
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Sanitize HTML content
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
                <time dateTime={article.PublishedDate}>
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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  // Extract plain text preview from HTML
  const plainText = article.Content.replace(/<[^>]*>/g, '').substring(0, 160);

  return {
    title: `${article.Title} | Credo Verum`,
    description: plainText,
    openGraph: {
      title: article.Title,
      description: plainText,
      type: 'article',
      publishedTime: article.PublishedDate,
      authors: [article.AuthorName],
    },
  };
}
