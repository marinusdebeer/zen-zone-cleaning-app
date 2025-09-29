export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
        <p className="text-gray-600 mb-4">Something went wrong during authentication.</p>
        <a 
          href="/auth/signin" 
          className="text-indigo-600 hover:text-indigo-500"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}

