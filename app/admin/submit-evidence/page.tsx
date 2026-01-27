'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Author {
  AuthorID: number;
  Name: string;
  Lifespan: string;
  Bio: string;
}

interface Work {
  WorkID: number;
  Title: string;
  Summary: string;
  PublishedDateLabel: string;
  OriginalLanguage: string;
  AuthorName: string;
}

interface Manuscript {
  ManuscriptID: number;
  Library: string;
  Shelfmark: string;
  Date: string;
  DigitisedURL: string;
  ImageURL: string;
}

interface Tag {
  TagID: number;
  Tag: string;
}

export default function SubmitEvidence() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [evidenceTypes, setEvidenceTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    // Author selection or creation
    authorId: '',
    newAuthorName: '',
    newAuthorLifespan: '',
    newAuthorBio: '',

    // Work selection or creation
    workId: '',
    newWorkTitle: '',
    newWorkSummary: '',
    newWorkPublishedDate: '',
    newWorkPublishedYear: '',

    // Evidence Passage
    passageText: '',
    passageSummary: '',
    passageReference: '',
    originalTranslationText: '',
    digitisedURL: '',

    // Evidence
    evidenceType: '',
    category: '',
    newEvidenceType: '',
    newCategory: '',

    // Manuscript selection or creation
    manuscriptId: '',
    newManuscriptTitle: '',
    newManuscriptLibrary: '',
    newManuscriptShelfmark: '',
    newManuscriptDate: '',
    newManuscriptDigitisedURL: '',
    newManuscriptImageURL: '',

    // Tags
    selectedTags: [] as number[],
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (formData.authorId) {
      fetchWorks(formData.authorId);
    } else {
      setWorks([]);
    }
  }, [formData.authorId]);

  useEffect(() => {
    if (formData.evidenceType) {
      // Fetch categories filtered by selected evidence type
      fetchCategories(formData.evidenceType);
      // Reset category when evidence type changes
      setFormData(prev => ({ ...prev, category: '', newCategory: '' }));
    } else {
      // No evidence type selected or creating new - show all categories
      fetchAllCategories();
    }
  }, [formData.evidenceType]);

  const fetchDropdownData = async () => {
    try {
      const [authorsRes, manuscriptsRes, tagsRes, evidenceTypesRes] = await Promise.all([
        fetch('/api/admin/authors'),
        fetch('/api/admin/manuscripts'),
        fetch('/api/admin/tags'),
        fetch('/api/admin/evidence-types'),
      ]);

      const authorsData = await authorsRes.json();
      const manuscriptsData = await manuscriptsRes.json();
      const tagsData = await tagsRes.json();
      const evidenceTypesData = await evidenceTypesRes.json();

      setAuthors(authorsData);
      setEvidenceTypes(evidenceTypesData);
      setManuscripts(manuscriptsData);
      setTags(tagsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setLoading(false);
    }
  };

  const fetchWorks = async (authorId: string) => {
    try {
      const response = await fetch(`/api/admin/works?authorId=${authorId}`);
      const data = await response.json();
      setWorks(data);
    } catch (error) {
      console.error('Error fetching works:', error);
    }
  };

  const fetchCategories = async (evidenceType: string) => {
    try {
      const response = await fetch(`/api/admin/evidence-categories?evidenceType=${encodeURIComponent(evidenceType)}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await fetch('/api/admin/evidence-categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching all categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/submit-evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Evidence submitted successfully! It will be reviewed before publishing.');
        // Reset form
        setFormData({
          authorId: '',
          newAuthorName: '',
          newAuthorLifespan: '',
          newAuthorBio: '',
          workId: '',
          newWorkTitle: '',
          newWorkSummary: '',
          newWorkPublishedDate: '',
          newWorkPublishedYear: '',
          passageText: '',
          passageSummary: '',
          passageReference: '',
          originalTranslationText: '',
          digitisedURL: '',
          evidenceType: '',
          category: '',
          newEvidenceType: '',
          newCategory: '',
          manuscriptId: '',
          newManuscriptTitle: '',
          newManuscriptLibrary: '',
          newManuscriptShelfmark: '',
          newManuscriptDate: '',
          newManuscriptDigitisedURL: '',
          newManuscriptImageURL: '',
          selectedTags: [],
        });
      } else {
        alert('Error submitting evidence. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting evidence:', error);
      alert('Error submitting evidence. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
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
        setFormData(prev => ({
          ...prev,
          newManuscriptImageURL: result.url,
        }));
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

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sky-600 hover:text-sky-700">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold mb-8">Submit Evidence</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Author Section */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Author</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Existing Author
                </label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- Create New Author --</option>
                  {authors.map((author) => (
                    <option key={author.AuthorID} value={author.AuthorID}>
                      {author.Name} {author.Lifespan && `(${author.Lifespan})`}
                    </option>
                  ))}
                </select>
              </div>

              {!formData.authorId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Author Name *
                    </label>
                    <input
                      type="text"
                      required={!formData.authorId}
                      value={formData.newAuthorName}
                      onChange={(e) => setFormData({ ...formData, newAuthorName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="Publius Cornelius Tacitus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Lifespan
                    </label>
                    <input
                      type="text"
                      value={formData.newAuthorLifespan}
                      onChange={(e) => setFormData({ ...formData, newAuthorLifespan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="c. AD 56 – c. 120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Biography
                    </label>
                    <textarea
                      value={formData.newAuthorBio}
                      onChange={(e) => setFormData({ ...formData, newAuthorBio: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="Tacitus was a Roman senator, provincial governor, and historian of the early 2nd century AD. He is widely regarded as one of Rome's most careful and critical historians."
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Work Section */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Work</h2>

            <div className="space-y-4">
              {formData.authorId && works.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Existing Work
                  </label>
                  <select
                    value={formData.workId}
                    onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="">-- Create New Work --</option>
                    {works.map((work) => (
                      <option key={work.WorkID} value={work.WorkID}>
                        {work.Title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!formData.workId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Work Title *
                    </label>
                    <input
                      type="text"
                      required={!formData.workId}
                      value={formData.newWorkTitle}
                      onChange={(e) => setFormData({ ...formData, newWorkTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="Lives of the Caesars"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Work Summary
                    </label>
                    <textarea
                      value={formData.newWorkSummary}
                      onChange={(e) => setFormData({ ...formData, newWorkSummary: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="Lives of the Caesars is a set of imperial biographies covering Julius Caesar through Domitian. Suetonius focuses on character, administration, scandals, and notable events."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Published Date Label
                    </label>
                    <input
                      type="text"
                      value={formData.newWorkPublishedDate}
                      onChange={(e) => setFormData({ ...formData, newWorkPublishedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="c. AD 120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Published Year (use negative for BC, e.g., -50 for 50 BC)
                    </label>
                    <input
                      type="number"
                      value={formData.newWorkPublishedYear}
                      onChange={(e) => setFormData({ ...formData, newWorkPublishedYear: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="120"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Evidence Section */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Evidence Details</h2>

            <div className="space-y-4">
              {/* Evidence Type - First */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Evidence Type *
                </label>
                <select
                  required={!formData.newEvidenceType}
                  value={formData.evidenceType}
                  onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value, newEvidenceType: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- Select or Create New --</option>
                  {evidenceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {!formData.evidenceType && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Evidence Type
                  </label>
                  <input
                    type="text"
                    value={formData.newEvidenceType}
                    onChange={(e) => setFormData({ ...formData, newEvidenceType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="Enter new evidence type..."
                  />
                </div>
              )}

              {/* Category - Second, filtered by Evidence Type if one is selected */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category *
                  {formData.evidenceType && (
                    <span className="text-slate-500 font-normal ml-2">
                      (filtered by {formData.evidenceType})
                    </span>
                  )}
                </label>
                <select
                  required={!formData.newCategory}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, newCategory: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- Select or Create New --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {formData.evidenceType && categories.length === 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    No existing categories for this evidence type. Create a new one below.
                  </p>
                )}
              </div>

              {!formData.category && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Category
                  </label>
                  <input
                    type="text"
                    value={formData.newCategory}
                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="Enter new category..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Passage Text (English) *
                </label>
                <textarea
                  required
                  value={formData.passageText}
                  onChange={(e) => setFormData({ ...formData, passageText: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Enter the English translation of the passage..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Original Text (if available)
                </label>
                <textarea
                  value={formData.originalTranslationText}
                  onChange={(e) => setFormData({ ...formData, originalTranslationText: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Enter the original language text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Passage Summary
                </label>
                <textarea
                  value={formData.passageSummary}
                  onChange={(e) => setFormData({ ...formData, passageSummary: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Brief summary of the passage significance..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reference (e.g., "Book 18, Chapter 3")
                </label>
                <input
                  type="text"
                  value={formData.passageReference}
                  onChange={(e) => setFormData({ ...formData, passageReference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Digitised URL (link to source text)
                </label>
                <input
                  type="url"
                  value={formData.digitisedURL}
                  onChange={(e) => setFormData({ ...formData, digitisedURL: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Manuscript Section */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Manuscript (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Existing Manuscript
                </label>
                <select
                  value={formData.manuscriptId}
                  onChange={(e) => setFormData({ ...formData, manuscriptId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- Create New Manuscript --</option>
                  {manuscripts.map((manuscript) => (
                    <option key={manuscript.ManuscriptID} value={manuscript.ManuscriptID}>
                      {manuscript.Shelfmark} - {manuscript.Library} ({manuscript.Date})
                    </option>
                  ))}
                </select>
              </div>

              {!formData.manuscriptId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.newManuscriptTitle}
                      onChange={(e) => setFormData({ ...formData, newManuscriptTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g., Codex Sinaiticus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Library *
                    </label>
                    <input
                      type="text"
                      value={formData.newManuscriptLibrary}
                      onChange={(e) => setFormData({ ...formData, newManuscriptLibrary: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g., British Library"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Shelfmark *
                    </label>
                    <input
                      type="text"
                      value={formData.newManuscriptShelfmark}
                      onChange={(e) => setFormData({ ...formData, newManuscriptShelfmark: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g., Add MS 43725"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date *
                    </label>
                    <input
                      type="text"
                      value={formData.newManuscriptDate}
                      onChange={(e) => setFormData({ ...formData, newManuscriptDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g., 4th century"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Digitised URL
                    </label>
                    <input
                      type="url"
                      value={formData.newManuscriptDigitisedURL}
                      onChange={(e) => setFormData({ ...formData, newManuscriptDigitisedURL: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Manuscript Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <p className="text-sm text-slate-500">Uploading image...</p>
                      )}
                      {formData.newManuscriptImageURL && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600 mb-2">Image uploaded successfully!</p>
                          <img
                            src={formData.newManuscriptImageURL}
                            alt="Uploaded manuscript"
                            className="max-w-xs max-h-48 rounded border border-slate-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-slate-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Tags</h2>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.TagID}
                  type="button"
                  onClick={() => handleTagToggle(tag.TagID)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.selectedTags.includes(tag.TagID)
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {tag.Tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>

            <Link
              href="/admin"
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
