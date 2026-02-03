'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Author {
  AuthorID: string;
  Name: string;
}

interface Work {
  WorkID: string;
  AuthorID: string;
  Title: string;
  Summary: string;
  PublishedDateLabel: string;
  AuthorName: string;
}

export default function ManageWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState({
    Title: '',
    AuthorID: '',
    Summary: '',
    PublishedDateLabel: '',
  });

  useEffect(() => {
    fetchWorks();
    fetchAuthors();
  }, []);

  const fetchWorks = async () => {
    try {
      const response = await fetch('/api/admin/works');
      const data = await response.json();
      setWorks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching works:', error);
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleEdit = (work: Work) => {
    setEditingWork(work);
    setFormData({
      Title: work.Title,
      AuthorID: work.AuthorID || '',
      Summary: work.Summary || '',
      PublishedDateLabel: work.PublishedDateLabel || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork) return;

    try {
      const response = await fetch(`/api/admin/works/${editingWork.WorkID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Work updated successfully!');
        setEditingWork(null);
        fetchWorks();
      } else {
        const result = await response.json();
        alert(`Error updating work: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating work:', error);
      alert('Error updating work');
    }
  };

  const handleDelete = async (workId: string, workTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${workTitle}"? This may affect related evidence passages.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/works/${workId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Work deleted successfully!');
        fetchWorks();
      } else {
        const result = await response.json();
        alert(`Error deleting work: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting work:', error);
      alert('Error deleting work');
    }
  };

  const filteredWorks = works.filter((work) =>
    work.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (work.AuthorName && work.AuthorName.toLowerCase().includes(searchTerm.toLowerCase()))
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

        <h1 className="text-3xl font-extrabold mb-8">Manage Works</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search works by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-md"
          />
        </div>

        {/* Edit Modal */}
        {editingWork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Work</h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <select
                    value={formData.AuthorID}
                    onChange={(e) => setFormData({ ...formData, AuthorID: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">-- Select Author --</option>
                    {authors.map((author) => (
                      <option key={author.AuthorID} value={author.AuthorID}>
                        {author.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Published Date Label</label>
                  <input
                    type="text"
                    placeholder="e.g., c. 100 AD"
                    value={formData.PublishedDateLabel}
                    onChange={(e) => setFormData({ ...formData, PublishedDateLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <textarea
                    value={formData.Summary}
                    onChange={(e) => setFormData({ ...formData, Summary: e.target.value })}
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
                    onClick={() => setEditingWork(null)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Works List */}
        <div className="space-y-4">
          {filteredWorks.length === 0 ? (
            <p className="text-slate-600">No works found.</p>
          ) : (
            filteredWorks.map((work) => (
              <div
                key={work.WorkID}
                className="bg-white border-2 border-slate-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-1">{work.Title}</h2>
                    <p className="text-slate-600 mb-2">
                      by {work.AuthorName || 'Unknown Author'}
                      {work.PublishedDateLabel && ` • ${work.PublishedDateLabel}`}
                    </p>
                    {work.Summary && (
                      <p className="text-slate-700 whitespace-pre-wrap">{work.Summary}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">ID: {work.WorkID}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(work)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(work.WorkID, work.Title)}
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
