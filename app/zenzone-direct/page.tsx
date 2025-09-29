export default function ZenzoneDirectPage() {
  console.log('🟦 Direct zenzone page rendered successfully - no dynamic routing');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">🟦 DIRECT ZENZONE SUCCESS!</h1>
        <p className="text-gray-700 mb-2">This bypasses [slug] dynamic routing completely</p>
        <p className="text-sm text-gray-500 mb-4">Route: /zenzone-direct</p>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-green-700 font-semibold">✅ If this works but /t/zenzone/* doesn't:</p>
          <p className="text-sm text-green-600 mt-1">The [slug] layout is definitely the problem</p>
        </div>
        <div className="mt-4">
          <a href="/t/zenzone/minimal" className="text-blue-600 hover:underline">
            → Try /t/zenzone/minimal from here
          </a>
        </div>
      </div>
    </div>
  );
}
