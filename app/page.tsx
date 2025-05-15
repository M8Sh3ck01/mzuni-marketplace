'use client'

import { useAuthContext } from "@/components/layout/AuthLayout";
import { Search as SearchIcon, Plus as PlusIcon, Menu, LogOut, Filter, X, User, Settings, HelpCircle, Bell, Sun, Moon, Store } from "lucide-react";
import ListingsPage from "@/components/listing/listings";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/Icon';
import PageLoader from "@/components/ui/PageLoader";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { user, loading, logout } = useAuthContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  const subtitles = [
    "Buy and sell within the Mzuzu University community",
    "Connect with fellow students and staff",
    "Find great deals on campus",
    "Sell your items safely and easily",
    "Join our trusted marketplace network"
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // The search will be handled by the ListingsPage component
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      href: '/profile',
    },
    {
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      href: '/help',
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      className: 'text-red-500 hover:text-red-600',
    },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  if (loading) {
    return <PageLoader text="Loading your marketplace..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-4 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center"
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Store className="w-6 h-6 text-[var(--primary)]" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)]">
                Mzuni Marketplace
              </h1>
              <motion.p 
                key={currentSubtitleIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ 
                  x: [100, 0, 0, 100],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: 0,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.1, 0.9, 1]
                }}
                className="text-base md:text-lg text-[var(--foreground-muted)] mt-2 font-medium"
              >
                {subtitles[currentSubtitleIndex]}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Navigation Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]/20 transition-all duration-300 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors"
              >
                <Icon icon={Menu} size={20} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Menu Items */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <div className="py-1">
                        {menuItems.map((item, index) => (
                          item.href ? (
                            <Link
                              key={index}
                              href={item.href}
                              className={`flex items-center px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors ${item.className || ''}`}
                              onClick={() => setShowMenu(false)}
                            >
                              <Icon icon={item.icon} size={18} className="mr-3" />
                              {item.label}
                            </Link>
                          ) : (
                            <button
                              key={index}
                              onClick={() => {
                                item.onClick?.();
                                setShowMenu(false);
                              }}
                              className={`w-full flex items-center px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors ${item.className || ''}`}
                            >
                              <Icon icon={item.icon} size={18} className="mr-3" />
                              {item.label}
                            </button>
                          )
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Icon icon={SearchIcon} size={18} className="text-[var(--foreground)]/40" />
                </div>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--accent)]/50 pl-10 pr-10 py-3 rounded-xl text-base border-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <Icon icon={X} size={18} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]/60" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors"
              >
                <Icon icon={Filter} size={20} />
              </button>
              <Link 
                href="/post" 
                className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[var(--primary-hover)] transition-colors"
              >
                <Icon icon={PlusIcon} size={16} />
                <span>Sell</span>
              </Link>
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="moon"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon icon={Moon} size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon icon={Sun} size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Section */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showFilters ? 'auto' : 0,
            opacity: showFilters ? 1 : 0
          }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--accent)]/30 rounded-xl mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)]"
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Clothing & Fashion">Clothing & Fashion</option>
                <option value="Food">Food</option>
                <option value="Furniture">Furniture</option>
                <option value="Stationery">Stationery</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                <option value="Event Planning">Event Planning</option>
                <option value="Transportation">Transportation</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Beauty & Wellness">Beauty & Wellness</option>
                <option value="Tech Support">Tech Support</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Listings Grid */}
        <ListingsPage 
          searchQuery={searchQuery} 
          category={selectedCategory}
          key={`${searchQuery}-${selectedCategory}`} // Force re-render when either filter changes
        />
      </main>
    </div>
  );
}