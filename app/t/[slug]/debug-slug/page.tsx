interface DebugSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DebugSlugPage({ params }: DebugSlugPageProps) {
  const { slug } = await params;
  console.log('🟢 DebugSlugPage: Slug parameter received:', slug);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-600 mb-4">🟢 DYNAMIC SLUG TEST!</h1>
        <p className="text-gray-700 mb-2">Dynamic slug parameter test</p>
        <p className="text-sm text-gray-500 mb-4">Route: /t/{slug}/debug-slug</p>
        <div className="bg-yellow-50 p-4 rounded">
          <p className="text-yellow-700 font-semibold">Slug received: <code>{slug}</code></p>
          <p className="text-sm text-yellow-600 mt-1">If you see this, [slug] routing works without layout!</p>
        </div>
      </div>
    </div>
  );
}
