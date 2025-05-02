"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    firebase?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        throw { code: "auth/email-not-verified" };
      }
      router.push("/dashboard");
    } catch (error: unknown) {
      let errorMessage = "Login failed. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found": case "auth/invalid-email":
            errorMessage = "No account with this email"; break;
          case "auth/wrong-password": errorMessage = "Incorrect password"; break;
          case "auth/too-many-requests": errorMessage = "Too many attempts"; break;
          case "auth/email-not-verified": errorMessage = "Verify email first"; break;
          case "auth/user-disabled": errorMessage = "Account disabled"; break;
        }
      }
      setErrors({ firebase: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return (
    <div className="flex h-screen justify-center items-center bg-[var(--background)]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px]">
        {/* Skeleton loader */}
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen justify-center items-center bg-[var(--background)]">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px]">
        <h2 className="text-center text-2xl font-semibold mb-6">Login</h2>
        
        {errors.firebase && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {errors.firebase}
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            defaultValue={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="block w-full p-3 border rounded-md border-gray-300"
            autoComplete="username"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-6 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            defaultValue={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="block w-full p-3 border rounded-md border-gray-300 pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center text-sm">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Sign up here
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/forgot-password" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Forgot Password?
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}