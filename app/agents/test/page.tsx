'use client';

import { useAuth } from '@clerk/nextjs';

export default function TestPage() {
  const { isLoaded, userId } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Debug</h1>

      <div className="bg-slate-100 p-4 rounded mb-4">
        <p><strong>Clerk Loaded:</strong> {isLoaded ? '✓ Yes' : '✗ No'}</p>
        <p><strong>User ID:</strong> {userId ? userId : 'No user'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Environment Check:</h2>
        <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✓ Set' : '✗ Missing'}</p>
      </div>

      {isLoaded && !userId && (
        <div className="bg-yellow-100 p-4 rounded">
          <p>You are not signed in. Try visiting <a href="/agents/sign-up" className="text-blue-600 hover:underline">/agents/sign-up</a></p>
        </div>
      )}
    </div>
  );
}
