'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Witness {
  WitnessID: string;
  ManuscriptID: string;
  EvidencePassageID: string;
  ImageURL: string;
  PassageReference: string;
  EvidenceTitle: string;
  EvidenceID: string;
}

interface Manuscript {
  ManuscriptID: string;
  Title: string;
  Library: string;
  Shelfmark: string;
  Date: string;
  DigitisedURL: string;
  witnesses: Witness[];
}

export default function ManageManuscripts() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingManuscript, setEditingManuscript] = useState<Manuscript | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [editingWitness, setEditingWitness] = useState<Witness | null>(null);
  const [expandedManuscript, setExpandedManuscript] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    Title: '',
    Library: '',
    Shelfmark: '',
    Date: '',
    DigitisedURL: '',
  });
  const [witnessImageURL, setWitnessImageURL] = useState('');

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

  const handleCreate = () => {
    setCreatingNew(true);
    setEditingManuscript(null);
    setFormData({
      Title: '',
      Library: '',
      Shelfmark: '',
      Date: '',
      DigitisedURL: '',
    });
  };

  const handleEdit = (manuscript: Manuscript) => {
    setEditingManuscript(manuscript);
    setCreatingNew(false);
    setFormData({
      Title: manuscript.Title || '',
      Library: manuscript.Library || '',
      Shelfmark: manuscript.Shelfmark || '',
      Date: manuscript.Date || '',
      DigitisedURL: manuscript.DigitisedURL || '',
    });
  };

  const handleEditWitness = (witness: Witness) => {
    setEditingWitness(witness);
    setWitnessImageURL(witness.ImageURL || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (creatingNew) {
        const response = await fetch('/api/admin/manuscripts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('Manuscript created successfully!');
          setCreatingNew(false);
          fetchManuscripts();
        } else {
          const result = await response.json();
          alert(`Error creating manuscript: ${result.error || 'Unknown error'}`);
        }
      } else if (editingManuscript) {
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
      }
    } catch (error) {
      console.error('Error saving manuscript:', error);
      alert('Error saving manuscript');
    }
  };

  const closeModal = () => {
    setEditingManuscript(null);
    setCreatingNew(false);
  };

  const handleUpdateWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWitness) return;

    try {
      const response = await fetch(`/api/admin/witnesses/${editingWitness.WitnessID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ImageURL: witnessImageURL }),
      });

      if (response.ok) {
        alert('Witness image updated successfully!');
        setEditingWitness(null);
        setWitnessImageURL('');
        fetchManuscripts();
      } else {
        const result = await response.json();
        alert(`Error updating witness: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating witness:', error);
      alert('Error updating witness');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        setWitnessImageURL(result.url);
      } else {
        alert(`Error uploading image: ${result.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteWitness = async (witnessId: string) => {
    if (!confirm('Are you sure you want to delete this witness link?')) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const response = await fetch(`/api/admin/witnesses/${witnessId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Witness deleted successfully!');
        fetchManuscripts();
      } else {
        const result = await response.json();
        alert(`Error deleting witness: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting witness:', error);
      alert('Error deleting witness');
    }
  };

  const handleDelete = async (manuscriptId: string, shelfmark: string) => {
    if (!confirm(`Are you sure you want to delete manuscript "${shelfmark}"? This may affect related witnesses.`)) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

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

  const toggleExpand = (manuscriptId: string) => {
    setExpandedManuscript(expandedManuscript === manuscriptId ? null : manuscriptId);
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

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold">Manage Manuscripts</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + New Manuscript
          </button>
        </div>

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

        {/* Create/Edit Manuscript Modal */}
        {(editingManuscript || creatingNew) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {creatingNew ? 'Create New Manuscript' : 'Edit Manuscript'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Edit Witness Modal */}
        {editingWitness && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Edit Witness Image</h2>

              <div className="mb-4 p-3 bg-slate-50 rounded">
                <p className="text-sm text-slate-600">
                  <strong>Evidence:</strong> {editingWitness.EvidenceTitle || 'Untitled'}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Reference:</strong> {editingWitness.PassageReference || 'N/A'}
                </p>
              </div>

              {/* Current Image */}
              {editingWitness.ImageURL && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Current Image</label>
                  <img
                    src={editingWitness.ImageURL}
                    alt="Current witness"
                    className="max-w-full max-h-64 rounded border border-slate-300"
                  />
                </div>
              )}

              <form onSubmit={handleUpdateWitness} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={witnessImageURL}
                    onChange={(e) => setWitnessImageURL(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Or Upload New Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-slate-500 mt-1">Uploading image...</p>
                  )}
                </div>

                {/* Preview new image */}
                {witnessImageURL && witnessImageURL !== editingWitness.ImageURL && (
                  <div>
                    <label className="block text-sm font-medium mb-2">New Image Preview</label>
                    <img
                      src={witnessImageURL}
                      alt="New witness"
                      className="max-w-full max-h-64 rounded border border-slate-300"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                    disabled={uploadingImage}
                  >
                    Save Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWitness(null);
                      setWitnessImageURL('');
                    }}
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

                    {/* Witnesses count */}
                    {manuscript.witnesses && manuscript.witnesses.length > 0 && (
                      <button
                        onClick={() => toggleExpand(manuscript.ManuscriptID)}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                      >
                        {expandedManuscript === manuscript.ManuscriptID ? '▼' : '▶'} {manuscript.witnesses.length} witness{manuscript.witnesses.length !== 1 ? 'es' : ''} linked
                      </button>
                    )}
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

                {/* Expanded Witnesses Section */}
                {expandedManuscript === manuscript.ManuscriptID && manuscript.witnesses && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h3 className="font-bold text-lg mb-3">Manuscript Witnesses</h3>
                    <div className="space-y-3">
                      {manuscript.witnesses.map((witness) => (
                        <div
                          key={witness.WitnessID}
                          className="bg-slate-50 p-4 rounded-lg flex gap-4"
                        >
                          {/* Image thumbnail */}
                          <div className="flex-shrink-0">
                            {witness.ImageURL ? (
                              <img
                                src={witness.ImageURL}
                                alt="Witness"
                                className="w-24 h-24 object-cover rounded border border-slate-300 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(witness.ImageURL, '_blank')}
                              />
                            ) : (
                              <div className="w-24 h-24 bg-slate-200 rounded border border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>

                          {/* Witness info */}
                          <div className="flex-1">
                            <p className="font-medium">
                              {witness.EvidenceTitle || 'Untitled Evidence'}
                            </p>
                            <p className="text-sm text-slate-600">
                              Reference: {witness.PassageReference || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Witness ID: {witness.WitnessID}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleEditWitness(witness)}
                              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                            >
                              Edit Image
                            </button>
                            <button
                              onClick={() => handleDeleteWitness(witness.WitnessID)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
