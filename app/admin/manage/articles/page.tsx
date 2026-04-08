'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';

interface Article {
  ArticleID: string;
  Title: string;
  Slug: string;
  Content: string;
  AuthorName: string;
  PublishedDate: string;
  Status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// Helper function to generate slug from title
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

// TipTap Editor Component
function RichTextEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sky-600 underline',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4 [&_p]:mb-4',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-slate-300 rounded-md">
      {/* Toolbar */}
      <div className="border-b border-slate-300 bg-slate-50 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('bold') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('italic') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('strike') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Strike
        </button>
        <span className="border-l border-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 3 }) ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          H3
        </button>
        <span className="border-l border-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('bulletList') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('orderedList') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Numbered List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('blockquote') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Quote
        </button>
        <span className="border-l border-slate-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('link') ? 'bg-slate-300' : 'bg-white hover:bg-slate-200'
          }`}
        >
          Link
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default function ManageArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    Title: '',
    Slug: '',
    Content: '',
    AuthorName: '',
    PublishedDate: new Date().toISOString().split('T')[0],
    Status: 'draft' as 'draft' | 'published',
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/articles');
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCreatingNew(true);
    setEditingArticle(null);
    setSlugManuallyEdited(false);
    setFormData({
      Title: '',
      Slug: '',
      Content: '',
      AuthorName: '',
      PublishedDate: new Date().toISOString().split('T')[0],
      Status: 'draft',
    });
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setCreatingNew(false);
    setSlugManuallyEdited(true); // Don't auto-update slug when editing
    setFormData({
      Title: article.Title,
      Slug: article.Slug,
      Content: article.Content,
      AuthorName: article.AuthorName,
      PublishedDate: new Date(article.PublishedDate).toISOString().split('T')[0],
      Status: article.Status,
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setFormData(prev => ({ ...prev, Title: newTitle }));

    // Auto-generate slug from title if not manually edited
    if (!slugManuallyEdited && newTitle) {
      const generatedSlug = generateSlugFromTitle(newTitle);
      setFormData(prev => ({ ...prev, Slug: generatedSlug }));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlugManuallyEdited(true);
    setFormData(prev => ({ ...prev, Slug: newSlug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (creatingNew) {
        const response = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Article created successfully!');
          setCreatingNew(false);
          fetchArticles();
        } else {
          alert(`Error: ${result.error || 'Unknown error'}`);
        }
      } else if (editingArticle) {
        const response = await fetch(`/api/admin/articles/${editingArticle.ArticleID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert('Article updated successfully!');
          setEditingArticle(null);
          fetchArticles();
        } else {
          alert(`Error: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article');
    }
  };

  const handleDelete = async (articleId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Article deleted successfully!');
        fetchArticles();
      } else {
        const result = await response.json();
        alert(`Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };

  const closeModal = () => {
    setEditingArticle(null);
    setCreatingNew(false);
    setSlugManuallyEdited(false);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.AuthorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || article.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/manage" className="text-sky-600 hover:text-sky-700">
            ← Back to Manage Data
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold">Manage Articles</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + New Article
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-slate-300 rounded-md"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Create/Edit Modal */}
        {(editingArticle || creatingNew) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {creatingNew ? 'Create New Article' : 'Edit Article'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.Title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL Slug *
                    <span className="text-slate-500 font-normal ml-2 text-xs">
                      (Auto-generated, but you can edit it)
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.Slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-sm"
                    placeholder="article-url-slug"
                  />
                  {formData.Slug && (
                    <p className="text-xs text-slate-500 mt-1">
                      Preview: <span className="font-mono text-sky-600">/articles/{formData.Slug}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.AuthorName}
                      onChange={(e) => setFormData({ ...formData, AuthorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Published Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.PublishedDate}
                      onChange={(e) => setFormData({ ...formData, PublishedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status *</label>
                  <select
                    required
                    value={formData.Status}
                    onChange={(e) => setFormData({ ...formData, Status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <RichTextEditor
                    content={formData.Content}
                    onChange={(html) => setFormData({ ...formData, Content: html })}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  >
                    {creatingNew ? 'Create' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <p className="text-slate-600">No articles found.</p>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.ArticleID}
                className="bg-white border-2 border-slate-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        article.Status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {article.Status}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-1">{article.Title}</h2>
                    <p className="text-slate-600 mb-2">
                      by {article.AuthorName} • {new Date(article.PublishedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500 font-mono">
                      /articles/{article.Slug}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(article)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.ArticleID, article.Title)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
