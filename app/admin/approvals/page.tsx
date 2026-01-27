'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PendingSubmission {
  PendingID: number;
  SubmissionData: any;
  Status: string;
  SubmittedBy: string;
  SubmittedDate: string;
}

export default function PendingApprovals() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/pending-submissions');
      const data = await response.json();
      setSubmissions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (pendingId: number) => {
    if (!confirm('Are you sure you want to approve this submission?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/approve-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pendingId,
          action: 'approve',
          reviewNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Submission approved and published successfully!');
        setSelectedSubmission(null);
        setReviewNotes('');
        fetchPendingSubmissions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Error approving submission. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (pendingId: number) => {
    const notes = prompt('Please provide a reason for rejection:');
    if (!notes) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/approve-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pendingId,
          action: 'reject',
          reviewNotes: notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Submission rejected.');
        setSelectedSubmission(null);
        fetchPendingSubmissions();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Error rejecting submission. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
          <Link href="/admin" className="text-sky-600 hover:text-sky-700">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold mb-8">Pending Approvals</h1>

        {submissions.length === 0 ? (
          <p className="text-slate-600">No pending submissions.</p>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission.PendingID}
                className="bg-white border-2 border-slate-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      Submission #{submission.PendingID}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Submitted: {new Date(submission.SubmittedDate).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedSubmission(
                          selectedSubmission?.PendingID === submission.PendingID
                            ? null
                            : submission
                        )
                      }
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                    >
                      {selectedSubmission?.PendingID === submission.PendingID
                        ? 'Hide Details'
                        : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Quick Preview:</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Author:</strong>{' '}
                      {submission.SubmissionData.authorId
                        ? 'Existing Author'
                        : submission.SubmissionData.newAuthorName}
                    </p>
                    <p>
                      <strong>Work:</strong>{' '}
                      {submission.SubmissionData.workId
                        ? 'Existing Work'
                        : submission.SubmissionData.newWorkTitle}
                    </p>
                    <p>
                      <strong>Category:</strong> {submission.SubmissionData.category}
                    </p>
                    <p>
                      <strong>Passage Text:</strong>{' '}
                      {submission.SubmissionData.passageText?.substring(0, 100)}...
                    </p>
                  </div>
                </div>

                {/* Detailed View */}
                {selectedSubmission?.PendingID === submission.PendingID && (
                  <div className="mt-6 space-y-6">
                    {/* Author Details */}
                    <div>
                      <h3 className="font-bold text-lg mb-2">Author</h3>
                      {submission.SubmissionData.authorId ? (
                        <p className="text-sm">Using existing author (ID: {submission.SubmissionData.authorId})</p>
                      ) : (
                        <div className="text-sm space-y-1 bg-blue-50 p-3 rounded">
                          <p><strong>NEW AUTHOR</strong></p>
                          <p><strong>Name:</strong> {submission.SubmissionData.newAuthorName}</p>
                          <p><strong>Lifespan:</strong> {submission.SubmissionData.newAuthorLifespan || 'N/A'}</p>
                          <p><strong>Bio:</strong> {submission.SubmissionData.newAuthorBio || 'N/A'}</p>
                        </div>
                      )}
                    </div>

                    {/* Work Details */}
                    <div>
                      <h3 className="font-bold text-lg mb-2">Work</h3>
                      {submission.SubmissionData.workId ? (
                        <p className="text-sm">Using existing work (ID: {submission.SubmissionData.workId})</p>
                      ) : (
                        <div className="text-sm space-y-1 bg-blue-50 p-3 rounded">
                          <p><strong>NEW WORK</strong></p>
                          <p><strong>Title:</strong> {submission.SubmissionData.newWorkTitle}</p>
                          <p><strong>Summary:</strong> {submission.SubmissionData.newWorkSummary || 'N/A'}</p>
                          <p><strong>Published Date:</strong> {submission.SubmissionData.newWorkPublishedDate || 'N/A'}</p>
                          <p><strong>Language:</strong> {submission.SubmissionData.newWorkLanguage || 'N/A'}</p>
                        </div>
                      )}
                    </div>

                    {/* Evidence Details */}
                    <div>
                      <h3 className="font-bold text-lg mb-2">Evidence Details</h3>
                      <div className="text-sm space-y-2">
                        <p><strong>Category:</strong> {submission.SubmissionData.category}</p>
                        <p><strong>Evidence Type:</strong> {submission.SubmissionData.evidenceType}</p>
                        <p><strong>Reference:</strong> {submission.SubmissionData.passageReference || 'N/A'}</p>

                        <div>
                          <strong>Passage Text (English):</strong>
                          <p className="mt-1 p-3 bg-slate-50 rounded whitespace-pre-wrap">
                            {submission.SubmissionData.passageText}
                          </p>
                        </div>

                        {submission.SubmissionData.originalTranslationText && (
                          <div>
                            <strong>Original Text:</strong>
                            <p className="mt-1 p-3 bg-slate-50 rounded whitespace-pre-wrap">
                              {submission.SubmissionData.originalTranslationText}
                            </p>
                          </div>
                        )}

                        {submission.SubmissionData.passageSummary && (
                          <div>
                            <strong>Summary:</strong>
                            <p className="mt-1">{submission.SubmissionData.passageSummary}</p>
                          </div>
                        )}

                        {submission.SubmissionData.digitisedURL && (
                          <p>
                            <strong>Digitised URL:</strong>{' '}
                            <a
                              href={submission.SubmissionData.digitisedURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:underline"
                            >
                              {submission.SubmissionData.digitisedURL}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Manuscript */}
                    {submission.SubmissionData.manuscriptId && (
                      <div>
                        <h3 className="font-bold text-lg mb-2">Manuscript</h3>
                        <p className="text-sm">Linked to manuscript ID: {submission.SubmissionData.manuscriptId}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {submission.SubmissionData.selectedTags?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-lg mb-2">Tags</h3>
                        <p className="text-sm">Tag IDs: {submission.SubmissionData.selectedTags.join(', ')}</p>
                      </div>
                    )}

                    {/* Review Notes */}
                    <div>
                      <label className="block font-bold text-lg mb-2">
                        Review Notes (Optional)
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        placeholder="Add any notes about this submission..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(submission.PendingID)}
                        disabled={processing}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-slate-400"
                      >
                        Approve & Publish
                      </button>

                      <button
                        onClick={() => handleReject(submission.PendingID)}
                        disabled={processing}
                        className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-slate-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
