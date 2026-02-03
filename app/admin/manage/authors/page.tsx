'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Author {
  AuthorID: string;
  Name: string;
  Lifespan: string;
  Bio: string;
}

export default function ManageAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Lifespan: '',
    Bio: '',
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/authors');
      const data = await response.json();
      setAuthors(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setLoading(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      Name: author.Name,
      Lifespan: author.Lifespan || '',
      Bio: author.Bio || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;

    try {
      const response = await fetch(`/api/admin/authors/${editingAuthor.AuthorID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Author updated successfully!');
        setEditingAuthor(null);
        fetchAuthors();
      } else {
        alert('Error updating author');
      }
    } catch (error) {
      console.error('Error updating author:', error);
      alert('Error updating author');
    }
  };

  const handleDelete = async (authorId: string, authorName: string) => {
    if (!confirm(`Are you sure you want to delete "${authorName}"? This may affect related works and evidence.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/authors/${authorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Author deleted successfully!');
        fetchAuthors();
      } else {
        const result = await response.json();
        alert(`Error deleting author: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting author:', error);
      alert('Error deleting author');
    }
  };

  const filteredAuthors = authors.filter((author) =>
    author.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <h1 className="text-3xl font-extrabold mb-8">Manage Authors</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search authors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-md"
          />
        </div>

        {/* Edit Modal */}
        {editingAuthor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Author</h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lifespan</label>
                  <input
                    type="text"
                    value={formData.Lifespan}
                    onChange={(e) => setFormData({ ...formData, Lifespan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Biography</label>
                  <textarea
                    value={formData.Bio}
                    onChange={(e) => setFormData({ ...formData, Bio: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingAuthor(null)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Authors List */}
        <div className="space-y-4">
          {filteredAuthors.length === 0 ? (
            <p className="text-slate-600">No authors found.</p>
          ) : (
            filteredAuthors.map((author) => (
              <div
                key={author.AuthorID}
                className="bg-white border-2 border-slate-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">
                      {author.Name}
                      {author.Lifespan && (
                        <span className="text-slate-600 font-normal ml-2">
                          ({author.Lifespan})
                        </span>
                      )}
                    </h2>
                    {author.Bio && (
                      <p className="text-slate-700 whitespace-pre-wrap">{author.Bio}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">ID: {author.AuthorID}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(author)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(author.AuthorID, author.Name)}
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
