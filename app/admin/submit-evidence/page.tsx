'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function SubmitEvidenceContent() {
  const searchParams = useSearchParams();
  const urlDraftId = searchParams.get('draftId');

  const [authors, setAuthors] = useState<Author[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [evidenceTypes, setEvidenceTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<number | null>(urlDraftId ? parseInt(urlDraftId) : null);

  const DRAFT_STORAGE_KEY = 'evidence_submission_draft';

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

    // Evidence
    evidenceType: '',
    category: '',
    newEvidenceType: '',
    newCategory: '',
    evidenceTitle: '',

    // Evidence Passage
    passageText: '',
    originalLanguage: '',
    originalTranslationText: '',
    passageReference: '',
    digitisedURL: '',

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
    // Load draft from database if draftId in URL, otherwise from localStorage
    if (urlDraftId) {
      loadDraftFromDatabase(parseInt(urlDraftId));
    } else {
      loadDraftFromLocalStorage();
    }
  }, [urlDraftId]);

  // Auto-save to localStorage when form data changes
  useEffect(() => {
    if (!loading) {
      saveDraftToLocalStorage();
    }
  }, [formData, loading]);

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

  // Draft management functions
  const saveDraftToLocalStorage = () => {
    try {
      const draftData = {
        formData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
    }
  };

  const loadDraftFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draftData = JSON.parse(saved);
        if (draftData.formData) {
          setFormData(draftData.formData);
          setLastSaved(new Date(draftData.savedAt).toLocaleTimeString());
        }
      }
    } catch (error) {
      console.error('Error loading draft from localStorage:', error);
    }
  };

  const loadDraftFromDatabase = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/drafts/${id}`);
      const data = await response.json();

      if (data.DraftData) {
        setFormData(data.DraftData);
        setDraftId(id);
        setLastSaved(new Date(data.UpdatedDate).toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error loading draft from database:', error);
      // Fall back to localStorage if database load fails
      loadDraftFromLocalStorage();
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setLastSaved(null);
    setDraftId(null);
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
      evidenceType: '',
      category: '',
      newEvidenceType: '',
      newCategory: '',
      evidenceTitle: '',
      passageText: '',
      originalLanguage: '',
      originalTranslationText: '',
      passageReference: '',
      digitisedURL: '',
      manuscriptId: '',
      newManuscriptTitle: '',
      newManuscriptLibrary: '',
      newManuscriptShelfmark: '',
      newManuscriptDate: '',
      newManuscriptDigitisedURL: '',
      newManuscriptImageURL: '',
      selectedTags: [],
    });
  };

  const saveDraftToDatabase = async () => {
    setSavingDraft(true);
    try {
      const response = await fetch('/api/admin/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftId,
          formData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setDraftId(result.draftId);
        alert('Draft saved successfully!');
      } else {
        alert('Error saving draft: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving draft to database:', error);
      alert('Error saving draft. Please try again.');
    } finally {
      setSavingDraft(false);
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
          evidenceType: '',
          category: '',
          newEvidenceType: '',
          newCategory: '',
          evidenceTitle: '',
          passageText: '',
          originalLanguage: '',
          originalTranslationText: '',
          passageReference: '',
          digitisedURL: '',
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
                  Evidence Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.evidenceTitle}
                  onChange={(e) => setFormData({ ...formData, evidenceTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Enter evidence title..."
                />
              </div>

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
                  placeholder="Christus, the founder of the name, had undergone the death penalty in the reign of Tiberius, by sentence of the procurator Pontius Pilatus…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Original Language
                </label>
                <select
                  value={formData.originalLanguage}
                  onChange={(e) => setFormData({ ...formData, originalLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- Select Language --</option>
                  <option value="grc">🇬🇷 Ancient Greek (grc)</option>
                  <option value="la">🇮🇹 Latin (la)</option>
                  <option value="he">🇮🇱 Hebrew (he)</option>
                  <option value="arc">Aramaic (arc)</option>
                  <option value="cop">Coptic (cop)</option>
                  <option value="syc">Syriac (syc)</option>
                </select>
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
                  placeholder="Auctor nominis eius Christus Tiberio imperitante per procuratorem Pontium Pilatum supplicio adfectus erat…"
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

          {/* Draft Status & Actions */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-600">
                {lastSaved ? (
                  <span>Auto-saved at {lastSaved}</span>
                ) : (
                  <span>Draft will auto-save as you type</span>
                )}
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear Draft
              </button>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </button>

              <button
                type="button"
                onClick={saveDraftToDatabase}
                disabled={savingDraft}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {savingDraft ? 'Saving...' : 'Save Draft to Database'}
              </button>

              <Link
                href="/admin"
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
              >
                Cancel
              </Link>
            </div>

            {draftId && (
              <p className="text-sm text-green-600 mt-2">
                Draft ID: {draftId} - You can resume this draft later from the admin dashboard.
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

export default function SubmitEvidence() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-slate-500">Loading form...</div>
      </main>
    }>
      <SubmitEvidenceContent />
    </Suspense>
  );
}
