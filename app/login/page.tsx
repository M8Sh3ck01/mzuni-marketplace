'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-[var(--background)]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px]">
        <h2 className="text-center text-2xl font-semibold mb-6">Login</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
              required
              className="block w-full p-3 border rounded-md border-gray-300"
            />
          </div>

          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Password"
              required
              className="block w-full p-3 border rounded-md border-gray-300"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
              className="h-4 w-4 text-[var(--primary)]"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : "Login"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-70 flex justify-center items-center gap-2"
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm">
            <Link href="/reset-password" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Forgot your password?
            </Link>
          </p>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
