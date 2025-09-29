export default function SimpleTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-600">🟡 BYPASSED TENANT ROUTING!</h1>
        <p className="text-gray-600 mt-4">This route bypasses tenant-specific logic</p>
        <p className="text-sm text-gray-500 mt-2">Route: /simple-test</p>
      </div>
    </div>
  );
}
