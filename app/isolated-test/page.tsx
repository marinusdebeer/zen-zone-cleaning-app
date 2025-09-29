export default function IsolatedTestPage() {
  console.log('🟡 Isolated test page rendered successfully');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-yellow-600 mb-4">🟡 ISOLATED ROUTING SUCCESS!</h1>
        <p className="text-gray-700 mb-2">This route is completely outside tenant structure</p>
        <p className="text-sm text-gray-500 mb-4">Route: /isolated-test</p>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-green-700 font-semibold">✅ If you see this, Next.js routing works!</p>
          <p className="text-sm text-green-600 mt-1">Problem is in tenant/auth system</p>
        </div>
      </div>
    </div>
  );
}
