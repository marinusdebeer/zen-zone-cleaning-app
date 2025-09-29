export default function DirectTenantTestPage() {
  console.log('🟠 Direct tenant test page rendered successfully');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">🟠 DIRECT TENANT TEST SUCCESS!</h1>
        <p className="text-gray-700 mb-2">This route is outside the (app) route group</p>
        <p className="text-sm text-gray-500 mb-4">Route: /direct-tenant-test</p>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-700 font-semibold">If this works but /t/zenzone/test doesn't:</p>
          <p className="text-sm text-red-600 mt-1">Problem is in the (app) route group structure</p>
        </div>
      </div>
    </div>
  );
}
