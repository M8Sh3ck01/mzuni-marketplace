"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-screen justify-center items-center bg-[var(--background)]">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px] text-center">
          <h2 className="text-2xl font-semibold mb-4">Check Your Email</h2>
          <p className="mb-6">We've sent password reset instructions to your email address.</p>
          <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen justify-center items-center bg-[var(--background)]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px]">
        <h2 className="text-center text-2xl font-semibold mb-6">Reset Password</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="block w-full p-3 border rounded-md border-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending Reset Link...
            </>
          ) : "Send Reset Link"}
        </button>

        <p className="text-center text-sm mt-4">
          Remember your password?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}