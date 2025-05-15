'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusSquare, MessageCircle, User } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Post', href: '/post', icon: PlusSquare },
  { label: 'Chats', href: '/chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around items-center p-2 z-50">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center text-sm ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
