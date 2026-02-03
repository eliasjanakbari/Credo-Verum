'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Manuscript {
  ManuscriptID: string;
  Title: string;
  Library: string;
  Shelfmark: string;
  Date: string;
  DigitisedURL: string;
}

export default function ManageManuscripts() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingManuscript, setEditingManuscript] = useState<Manuscript | null>(null);
  const [formData, setFormData] = useState({
    Title: '',
    Library: '',
    Shelfmark: '',
    Date: '',
    DigitisedURL: '',
  });

  useEffect(() => {
    fetchManuscripts();
  }, []);

  const fetchManuscripts = async () => {
    try {
      const response = await fetch('/api/admin/manuscripts');
      const data = await response.json();
      setManuscripts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
      setLoading(false);
    }
  };

  const handleEdit = (manuscript: Manuscript) => {
    setEditingManuscript(manuscript);
    setFormData({
      Title: manuscript.Title || '',
      Library: manuscript.Library || '',
      Shelfmark: manuscript.Shelfmark || '',
      Date: manuscript.Date || '',
      DigitisedURL: manuscript.DigitisedURL || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManuscript) return;

    try {
      const response = await fetch(`/api/admin/manuscripts/${editingManuscript.ManuscriptID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Manuscript updated successfully!');
        setEditingManuscript(null);
        fetchManuscripts();
      } else {
        const result = await response.json();
        alert(`Error updating manuscript: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating manuscript:', error);
      alert('Error updating manuscript');
    }
  };

  const handleDelete = async (manuscriptId: string, shelfmark: string) => {
    if (!confirm(`Are you sure you want to delete manuscript "${shelfmark}"? This may affect related witnesses.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/manuscripts/${manuscriptId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Manuscript deleted successfully!');
        fetchManuscripts();
      } else {
        const result = await response.json();
        alert(`Error deleting manuscript: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting manuscript:', error);
      alert('Error deleting manuscript');
    }
  };

  const filteredManuscripts = manuscripts.filter((manuscript) =>
    manuscript.Shelfmark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manuscript.Library?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manuscript.Title?.toLowerCase().includes(searchTerm.toLowerCase())
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

        <h1 className="text-3xl font-extrabold mb-8">Manage Manuscripts</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search manuscripts by shelfmark, library, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-md"
          />
        </div>

        {/* Edit Modal */}
        {editingManuscript && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Manuscript</h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.Title}
                    onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Library *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., British Library"
                    value={formData.Library}
                    onChange={(e) => setFormData({ ...formData, Library: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Shelfmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., MS Add. 43725"
                    value={formData.Shelfmark}
                    onChange={(e) => setFormData({ ...formData, Shelfmark: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="text"
                    placeholder="e.g., 4th century"
                    value={formData.Date}
                    onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Digitised URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.DigitisedURL}
                    onChange={(e) => setFormData({ ...formData, DigitisedURL: e.target.value })}
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
                    onClick={() => setEditingManuscript(null)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manuscripts List */}
        <div className="space-y-4">
          {filteredManuscripts.length === 0 ? (
            <p className="text-slate-600">No manuscripts found.</p>
          ) : (
            filteredManuscripts.map((manuscript) => (
              <div
                key={manuscript.ManuscriptID}
                className="bg-white border-2 border-slate-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-1">{manuscript.Shelfmark}</h2>
                    <p className="text-slate-600 mb-2">
                      {manuscript.Library}
                      {manuscript.Date && ` • ${manuscript.Date}`}
                    </p>
                    {manuscript.Title && (
                      <p className="text-slate-700 mb-2">{manuscript.Title}</p>
                    )}
                    {manuscript.DigitisedURL && (
                      <a
                        href={manuscript.DigitisedURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-700 text-sm"
                      >
                        View Digitised Version
                      </a>
                    )}
                    <p className="text-sm text-slate-500 mt-2">ID: {manuscript.ManuscriptID}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(manuscript)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(manuscript.ManuscriptID, manuscript.Shelfmark)}
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
