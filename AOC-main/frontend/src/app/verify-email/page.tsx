'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        // Auto redirect after 3 seconds
        setTimeout(() => router.push('/login'), 3000);
      } catch (err) {
        setStatus('error');
        if (err instanceof ApiError) {
          setError(err.errorMessage);
        } else {
          setError('Verification failed. The link may have expired.');
        }
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[420px] text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">⚔</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight">Attack on Code</span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="text-xl font-bold">Verifying your email...</h1>
              <p className="text-gray-500 text-sm">Please hold on for a moment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Email Verified!</h1>
              <p className="text-gray-500 text-sm">Your account is now fully active. Redirecting to login...</p>
              <Link href="/login" className="block text-red-600 font-semibold text-sm hover:underline">
                Go to login now →
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Verification Failed</h1>
              <p className="text-red-500 text-sm">{error}</p>
              <p className="text-gray-500 text-xs">The link may be invalid or expired. Try requesting a new verification email from your profile settings.</p>
              <Link href="/login" className="block text-gray-600 font-semibold text-sm hover:underline">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
