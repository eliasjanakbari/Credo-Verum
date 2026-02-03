'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tag {
  TagID: string;
  Tag: string;
}

export default function ManageTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    Tag: '',
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      const data = await response.json();
      setTags(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setLoading(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setCreatingNew(false);
    setFormData({
      Tag: tag.Tag,
    });
  };

  const handleCreate = () => {
    setCreatingNew(true);
    setEditingTag(null);
    setFormData({
      Tag: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (creatingNew) {
        const response = await fetch('/api/admin/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('Tag created successfully!');
          setCreatingNew(false);
          fetchTags();
        } else {
          const result = await response.json();
          alert(`Error creating tag: ${result.error || 'Unknown error'}`);
        }
      } else if (editingTag) {
        const response = await fetch(`/api/admin/tags/${editingTag.TagID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          alert('Tag updated successfully!');
          setEditingTag(null);
          fetchTags();
        } else {
          const result = await response.json();
          alert(`Error updating tag: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Error saving tag');
    }
  };

  const handleDelete = async (tagId: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete tag "${tagName}"? This will remove it from all associated evidence.`)) {
      return;
    }

    // Small delay to ensure confirm dialog fully closes
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Tag deleted successfully!');
        fetchTags();
      } else {
        const result = await response.json();
        alert(`Error deleting tag: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Error deleting tag');
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.Tag.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-extrabold">Manage Tags</h1>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + New Tag
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-md"
          />
        </div>

        {/* Edit/Create Modal */}
        {(editingTag || creatingNew) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {creatingNew ? 'Create New Tag' : 'Edit Tag'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tag Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.Tag}
                    onChange={(e) => setFormData({ ...formData, Tag: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="e.g., Resurrection, Divinity, Miracles"
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
                    onClick={() => {
                      setEditingTag(null);
                      setCreatingNew(false);
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

        {/* Tags List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.length === 0 ? (
            <p className="text-slate-600 col-span-full">No tags found.</p>
          ) : (
            filteredTags.map((tag) => (
              <div
                key={tag.TagID}
                className="bg-white border-2 border-slate-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold">{tag.Tag}</h2>
                    <p className="text-sm text-slate-500">ID: {tag.TagID}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.TagID, tag.Tag)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
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
