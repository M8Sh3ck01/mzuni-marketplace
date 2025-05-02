"use client";

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { User } from "firebase/auth";
import Link from "next/link";
import { Search, Store, GraduationCap, TrendingUp } from "lucide-react";

export default function MarketplaceHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-[var(--primary)]" />
              <Link href="/" className="text-xl font-bold text-[var(--primary)]">
                Mzuni Marketplace
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
                  >
                    My Listings
                  </Link>
                  <button
                    onClick={() => auth.signOut()}
                    className="rounded-md px-4 py-2 text-sm font-medium text-[var(--primary)] ring-1 ring-[var(--primary)] hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-md px-4 py-2 text-sm font-medium text-[var(--primary)] ring-1 ring-[var(--primary)] hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Buy & Sell Student Businesses
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Mzuzu University's official marketplace for student entrepreneurs to trade their ventures
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 flex rounded-md shadow-sm">
              <div className="relative flex flex-grow items-stretch focus-within:z-10">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--primary)] sm:text-sm sm:leading-6"
                  placeholder="Search for businesses..."
                />
              </div>
              <button
                type="button"
                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-[var(--primary)] hover:bg-[var(--primary-hover)]"
              >
                Search
              </button>
            </div>

            <div className="mt-10 flex justify-center gap-x-6">
              {user ? (
                <Link
                  href="/dashboard/create"
                  className="rounded-md bg-[var(--primary)] px-6 py-3 text-lg font-medium text-white hover:bg-[var(--primary-hover)]"
                >
                  Sell Your Business
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="rounded-md bg-[var(--primary)] px-6 py-3 text-lg font-medium text-white hover:bg-[var(--primary-hover)]"
                >
                  Join Marketplace
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-center text-3xl font-bold text-[var(--foreground)]">
            Why Use Mzuni Marketplace?
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                name: "Student Verified",
                description: "All businesses are verified Mzuzu University student ventures",
                icon: <GraduationCap className="h-8 w-8 text-[var(--primary)]" />,
              },
              {
                name: "Easy Transactions",
                description: "Secure platform for smooth business transfers",
                icon: <TrendingUp className="h-8 w-8 text-[var(--primary)]" />,
              },
              {
                name: "Campus Focused",
                description: "Designed specifically for Mzuzu University community",
                icon: <Store className="h-8 w-8 text-[var(--primary)]" />,
              },
            ].map((feature) => (
              <div
                key={feature.name}
                className="rounded-lg bg-white p-6 shadow-md text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  {feature.name}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Listings Section */}
        <div className="py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Recent Listings
            </h2>
            <Link
              href="/listings"
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Sample listing cards - replace with real data */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-[var(--foreground)]">
                    Student Business {item}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Brief description of the business...
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-[var(--primary)]">MK{item * 50000}</span>
                    <Link
                      href={`/listings/${item}`}
                      className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <Store className="h-6 w-6 text-[var(--primary)]" />
                <span className="text-xl font-bold text-[var(--primary)]">
                  Mzuni Marketplace
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Connecting Mzuzu University entrepreneurs
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <Link href="/about" className="text-sm text-gray-600 hover:text-[var(--primary)]">
                About
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-[var(--primary)]">
                Contact
              </Link>
              <Link href="/faq" className="text-sm text-gray-600 hover:text-[var(--primary)]">
                FAQ
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mzuzu University Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}