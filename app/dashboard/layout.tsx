'use client'; // Marking as client-side component to enable hooks like useRouter

import { Sidebar } from '../../components/dashboard/Sidebar';
import UserNav from '../../components/dashboard/UserNav';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation'; // Importing useRouter from 'next/navigation' for client-side routing

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to the login page if not authenticated
  if (!loading && !user) {
    router.push('/login');
    return null; // Return null while redirecting
  }

  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <UserNav user={user} />
        <main className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              {/* Optionally, you can add a loading spinner or message */}
              <p>Loading...</p>
            </div>
          ) : (
            children // Render children if data is loaded
          )}
        </main>
      </div>
    </div>
  );
}
