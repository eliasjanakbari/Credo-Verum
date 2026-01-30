'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Draft {
  DraftID: number;
  DraftData: any;
  CreatedDate: string;
  UpdatedDate: string;
}

export default function AdminDashboard() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/admin/drafts');
      const data = await response.json();
      setDrafts(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoadingDrafts(false);
    }
  };

  const deleteDraft = async (draftId: number) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const response = await fetch(`/api/admin/drafts/${draftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrafts(drafts.filter(d => d.DraftID !== draftId));
      } else {
        alert('Error deleting draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Error deleting draft');
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Submit Evidence */}
          <Link
            href="/admin/submit-evidence"
            className="block p-6 bg-white border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-bold mb-2">Submit Evidence</h2>
            <p className="text-slate-600">
              Add new historical evidence, manuscripts, or sources to the database.
            </p>
          </Link>

          {/* Pending Approvals */}
          <Link
            href="/admin/approvals"
            className="block p-6 bg-white border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-bold mb-2">Pending Approvals</h2>
            <p className="text-slate-600">
              Review and approve submitted evidence before publishing.
            </p>
          </Link>

          {/* Manage Data */}
          <Link
            href="/admin/manage"
            className="block p-6 bg-white border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:shadow-lg transition-all"
          >
            <h2 className="text-xl font-bold mb-2">Manage Data</h2>
            <p className="text-slate-600">
              Edit or delete existing authors, works, manuscripts, and tags.
            </p>
          </Link>
        </div>

        {/* Saved Drafts Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Saved Drafts</h2>

          {loadingDrafts ? (
            <p className="text-slate-600">Loading drafts...</p>
          ) : drafts.length === 0 ? (
            <p className="text-slate-600">No saved drafts.</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div
                  key={draft.DraftID}
                  className="bg-white border-2 border-slate-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      Draft #{draft.DraftID}
                      {draft.DraftData?.newAuthorName && (
                        <span className="text-slate-600 ml-2">
                          - {draft.DraftData.newAuthorName}
                        </span>
                      )}
                      {draft.DraftData?.newWorkTitle && (
                        <span className="text-slate-600">
                          : {draft.DraftData.newWorkTitle}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">
                      Last updated: {new Date(draft.UpdatedDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/submit-evidence?draftId=${draft.DraftID}`}
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                    >
                      Resume
                    </Link>
                    <button
                      onClick={() => deleteDraft(draft.DraftID)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
