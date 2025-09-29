export default function TenantDebugPage() {
  console.log('🟣 Static tenant debug page rendered successfully');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">🟣 STATIC TENANT ROUTE SUCCESS!</h1>
        <p className="text-gray-700 mb-2">This is a static route under /t/ path</p>
        <p className="text-sm text-gray-500 mb-4">Route: /t/debug</p>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-blue-700 font-semibold">If this works but /t/zenzone/* doesn't:</p>
          <p className="text-sm text-blue-600 mt-1">Problem is with dynamic [slug] routing</p>
        </div>
      </div>
    </div>
  );
}
