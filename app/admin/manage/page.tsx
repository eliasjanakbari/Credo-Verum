import Link from 'next/link';

type EntityType = 'authors' | 'works' | 'manuscripts' | 'tags' | 'evidence';

export default function ManageData() {
  const entities = [
    {
      type: 'authors' as EntityType,
      title: 'Authors',
      description: 'View, edit, and delete authors',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-500',
    },
    {
      type: 'works' as EntityType,
      title: 'Works',
      description: 'View, edit, and delete works',
      color: 'bg-green-50 border-green-200 hover:border-green-500',
    },
    {
      type: 'manuscripts' as EntityType,
      title: 'Manuscripts',
      description: 'View, edit, and delete manuscripts',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-500',
    },
    {
      type: 'tags' as EntityType,
      title: 'Tags',
      description: 'View, edit, and delete tags',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-500',
    },
    {
      type: 'evidence' as EntityType,
      title: 'Evidence',
      description: 'View, edit, and delete evidence entries',
      color: 'bg-red-50 border-red-200 hover:border-red-500',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-sky-600 hover:text-sky-700">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold mb-8">Manage Data</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <Link
              key={entity.type}
              href={`/admin/manage/${entity.type}`}
              className={`block p-6 border-2 rounded-lg transition-all ${entity.color}`}
            >
              <h2 className="text-xl font-bold mb-2">{entity.title}</h2>
              <p className="text-slate-600">{entity.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
