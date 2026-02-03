'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tag {
  TagID: string;
  Tag: string;
}

interface Evidence {
  EvidenceID: string;
  Title: string;
  Category: string;
  EvidenceType: string;
  Summary: string;
  createdAt: string;
  EvidencePassageID: string;
  PassageText: string;
  OriginalLanguage: string;
  OriginalTranslationText: string;
  Reference: string;
  DigitisedURL: string;
  WorkID: string;
  WorkTitle: string;
  AuthorID: string;
  AuthorName: string;
  tags: Tag[];
}

const EVIDENCE_TYPES = ['Gospel Account', 'Miracle', 'Quote', 'Reference', 'Manuscript'];
const CATEGORIES = ['Roman', 'Jewish', 'Christian', 'Nature', 'Healing', 'Resurrection', 'Demons'];

export default function ManageEvidence() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [formData, setFormData] = useState({
    Title: '',
    Category: '',
    EvidenceType: '',
    Summary: '',
    EvidencePassageID: '',
    PassageText: '',
    OriginalLanguage: '',
    OriginalTranslationText: '',
    Reference: '',
    DigitisedURL: '',
    selectedTags: [] as string[],
  });

  useEffect(() => {
    fetchEvidence();
    fetchTags();
  }, []);

  const fetchEvidence = async () => {
    try {
      const response = await fetch('/api/admin/evidence');
      const data = await response.json();
      setEvidence(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      setAllTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleEdit = (item: Evidence) => {
    setEditingEvidence(item);
    setFormData({
      Title: item.Title || '',
      Category: item.Category || '',
      EvidenceType: item.EvidenceType || '',
      Summary: item.Summary || '',
      EvidencePassageID: item.EvidencePassageID || '',
      PassageText: item.PassageText || '',
      OriginalLanguage: item.OriginalLanguage || '',
      OriginalTranslationText: item.OriginalTranslationText || '',
      Reference: item.Reference || '',
      DigitisedURL: item.DigitisedURL || '',
      selectedTags: item.tags ? item.tags.map(t => t.TagID) : [],
    });
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvidence) return;

    try {
      const response = await fetch(`/api/admin/evidence/${editingEvidence.EvidenceID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Evidence updated successfully!');
        setEditingEvidence(null);
        fetchEvidence();
      } else {
        const result = await response.json();
        alert(`Error updating evidence: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating evidence:', error);
      alert('Error updating evidence');
    }
  };

  const handleDelete = async (evidenceId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title || 'this evidence'}"? This will also delete all related passages and tags.`)) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const response = await fetch(`/api/admin/evidence/${evidenceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Evidence deleted successfully!');
        fetchEvidence();
      } else {
        const result = await response.json();
        alert(`Error deleting evidence: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      alert('Error deleting evidence');
    }
  };

  const filteredEvidence = evidence.filter((item) => {
    const matchesSearch =
      (item.Title && item.Title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.PassageText && item.PassageText.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.AuthorName && item.AuthorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.WorkTitle && item.WorkTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = !filterType || item.EvidenceType === filterType;

    return matchesSearch && matchesType;
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

        <h1 className="text-3xl font-extrabold mb-8">Manage Evidence</h1>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title, passage, author, or work..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-slate-300 rounded-md"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-md"
          >
            <option value="">All Types</option>
            {EVIDENCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <p className="text-slate-600 mb-4">
          Showing {filteredEvidence.length} of {evidence.length} evidence entries
        </p>

        {/* Edit Modal */}
        {editingEvidence && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Evidence</h2>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium mb-2">Evidence Type *</label>
                    <select
                      required
                      value={formData.EvidenceType}
                      onChange={(e) => setFormData({ ...formData, EvidenceType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">-- Select Type --</option>
                      {EVIDENCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      required
                      value={formData.Category}
                      onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">-- Select Category --</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reference</label>
                    <input
                      type="text"
                      placeholder="e.g., Chapter 5, Verse 12"
                      value={formData.Reference}
                      onChange={(e) => setFormData({ ...formData, Reference: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <textarea
                    value={formData.Summary}
                    onChange={(e) => setFormData({ ...formData, Summary: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Passage Text (English)</label>
                  <textarea
                    value={formData.PassageText}
                    onChange={(e) => setFormData({ ...formData, PassageText: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Original Language</label>
                    <input
                      type="text"
                      placeholder="e.g., grc (Greek), la (Latin)"
                      value={formData.OriginalLanguage}
                      onChange={(e) => setFormData({ ...formData, OriginalLanguage: e.target.value })}
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Original Text</label>
                  <textarea
                    value={formData.OriginalTranslationText}
                    onChange={(e) => setFormData({ ...formData, OriginalTranslationText: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                {/* Tags Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-md bg-slate-50">
                    {allTags.length === 0 ? (
                      <p className="text-slate-500 text-sm">No tags available</p>
                    ) : (
                      allTags.map((tag) => (
                        <button
                          key={tag.TagID}
                          type="button"
                          onClick={() => handleTagToggle(tag.TagID)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.selectedTags.includes(tag.TagID)
                              ? 'bg-sky-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700 hover:border-sky-400'
                          }`}
                        >
                          {tag.Tag}
                        </button>
                      ))
                    )}
                  </div>
                  {formData.selectedTags.length > 0 && (
                    <p className="text-sm text-slate-500 mt-1">
                      {formData.selectedTags.length} tag{formData.selectedTags.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
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
                    onClick={() => setEditingEvidence(null)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Evidence List */}
        <div className="space-y-4">
          {filteredEvidence.length === 0 ? (
            <p className="text-slate-600">No evidence found.</p>
          ) : (
            filteredEvidence.map((item) => (
              <div
                key={item.EvidenceID}
                className="bg-white border-2 border-slate-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.EvidenceType === 'Miracle' ? 'bg-purple-100 text-purple-800' :
                        item.EvidenceType === 'Gospel Account' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {item.EvidenceType}
                      </span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                        {item.Category}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-1">
                      {item.Title || 'Untitled Evidence'}
                    </h2>

                    {item.AuthorName && (
                      <p className="text-slate-600 mb-2">
                        by {item.AuthorName}
                        {item.WorkTitle && ` in "${item.WorkTitle}"`}
                        {item.Reference && ` • ${item.Reference}`}
                      </p>
                    )}

                    {item.PassageText && (
                      <p className="text-slate-700 line-clamp-3 mb-2">
                        {item.PassageText.substring(0, 300)}
                        {item.PassageText.length > 300 && '...'}
                      </p>
                    )}

                    {/* Display tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag.TagID}
                            className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-xs"
                          >
                            {tag.Tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-slate-500">ID: {item.EvidenceID}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.EvidenceID, item.Title)}
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
