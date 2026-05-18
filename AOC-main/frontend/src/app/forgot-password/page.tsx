'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errorMessage);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">⚔</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight">Attack on Code</span>
          </Link>
          <h1 className="text-2xl font-extrabold mt-6 tracking-tight">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-4 text-center">
            <p className="font-semibold mb-1">Check your email</p>
            <p className="text-xs text-green-600">
              If an account exists for that email, we&apos;ve sent a password reset link.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-xs font-semibold text-green-700 hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                {...register('email', {
                  required: 'Required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                placeholder="aryan@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-red-600 font-semibold hover:underline">
                ← Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
