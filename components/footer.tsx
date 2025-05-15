"use client";
import Link from 'next/link';
import { Home, PlusCircle, MessageCircle, User, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

const navItems = [
  { href: '/', label: 'Home', icon: Home, exact: true, key: 'home' },
  { href: '/', label: 'Search', icon: Search, isSearch: true, key: 'search' },
  { href: '/post', label: 'Post', icon: PlusCircle, key: 'post' },
  { href: '/messages', label: 'Chats', icon: MessageCircle, key: 'messages' },
  { href: '/profile', label: 'Profile', icon: User, key: 'profile' },
];

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
    // Add a small delay to ensure the page has loaded
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder="Search items..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.classList.add('animate-pulse');
        // Remove the animation after 2 seconds
        setTimeout(() => {
          searchInput.classList.remove('animate-pulse');
        }, 2000);
      }
    }, 100);
  };

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "fixed bottom-0 inset-x-0 z-50",
        "bg-[var(--background)]/80 backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--background)]/60",
        "border-t border-[var(--border)]",
        "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]",
        "pb-[env(safe-area-inset-bottom)]" // For iOS notch devices
      )}
    >
      <nav className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon, exact, isSearch, key }) => {
          const isActive = exact 
            ? pathname === href 
            : pathname.startsWith(href);
            
          return (
            <Link
              key={key}
              href={href}
              onClick={isSearch ? handleSearchClick : undefined}
              className={cn(
                "flex flex-col items-center flex-1 px-2 py-1.5 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50",
                isActive 
                  ? "text-[var(--primary)]" 
                  : "text-[var(--foreground)]/60 hover:text-[var(--primary)]/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "transition-transform duration-200",
                    isActive ? "scale-110" : "scale-100"
                  )}
                />
                <span className={cn(
                  "text-xs mt-0.5 font-medium transition-all duration-200",
                  isActive ? "scale-105 font-semibold" : "scale-100 font-medium"
                )}>
                  {label}
                </span>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--primary)]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.footer>
  );
}    