'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House, LayoutDashboard, MessageSquare, Settings, Bell, BookText, User,
  BarChart2, Bookmark, Users, CreditCard, HelpCircle, LogOut, Menu, X
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/', icon: <House />, label: 'Home' },
    { href: '/dashboard', icon: <LayoutDashboard />, label: 'Overview' },
    { href: '/dashboard/listings', icon: <BookText />, label: 'Listings' },
    { href: '/dashboard/messages', icon: <MessageSquare />, label: 'Messages' },
    { href: '/dashboard/notifications', icon: <Bell />, label: 'Notifications' },
    { href: '/dashboard/profile', icon: <User />, label: 'Profile' },
    { href: '/dashboard/analytics', icon: <BarChart2 />, label: 'Analytics' },
    { href: '/dashboard/saved', icon: <Bookmark />, label: 'Saved' },
    { href: '/dashboard/followers', icon: <Users />, label: 'Followers' },
    { href: '/dashboard/payments', icon: <CreditCard />, label: 'Payments' },
    { href: '/dashboard/settings', icon: <Settings />, label: 'Settings' },
    { href: '/dashboard/help', icon: <HelpCircle />, label: 'Help Center' },
    { href: '/logout', icon: <LogOut />, label: 'Log Out' },
  ];

  return (
    <>
      {/* Hamburger menu button for mobile */}
      <button
        className="md:hidden p-4 fixed top-0 left-0 z-50"
        onClick={() => setOpen(true)}
        aria-label="Open Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close Sidebar"
        />
      )}

      {/* Sidebar panel */}
      <aside
  className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-lg p-4 z-50 transition-transform transform ${
    open ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0 md:static md:block`}>
        {/* Close button for mobile */}
        <div className="md:hidden flex justify-end">
          <button onClick={() => setOpen(false)} aria-label="Close Sidebar">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-1 mt-6 md:mt-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setOpen(false)} // close on click (mobile)
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
