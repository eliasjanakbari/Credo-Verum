'use client';

import Link from 'next/link';

export default function AdminDashboard() {
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
      </div>
    </main>
  );
}
