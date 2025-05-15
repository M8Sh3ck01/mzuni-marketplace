"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PageLoader from "@/components/ui/PageLoader";

export default function SignUp() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await sendEmailVerification(userCredential.user);
      setSuccess(true);
      setTimeout(() => router.push("/profile/setup"), 3000);
    } catch (error: any) {
      let errorMessage = "Sign up failed. Please try again.";
      switch (error.code) {
        case "auth/email-already-in-use": errorMessage = "Email already in use"; break;
        case "auth/invalid-email": errorMessage = "Invalid email"; break;
        case "auth/weak-password": errorMessage = "Weak password"; break;
        case "auth/too-many-requests": errorMessage = "Too many attempts"; break;
      }
      setErrors({ firebase: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return <PageLoader text="Preparing signup form..." />;
  }

  if (success) return (
    <div className="flex h-screen justify-center items-center bg-[var(--background)]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-4">Verify Your Email</h2>
        <p className="mb-6">We've sent a verification link to your email address.</p>
        <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-hover)] underline">
          Return to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen justify-center items-center bg-[var(--background)]">
      <form onSubmit={handleSignUp} className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-[400px]">
        <h2 className="text-center text-2xl font-semibold mb-6">Create Account</h2>
        
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
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            defaultValue={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="block w-full p-3 border rounded-md border-gray-300"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="mb-6">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            defaultValue={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="block w-full p-3 border rounded-md border-gray-300"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : "Sign Up"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
