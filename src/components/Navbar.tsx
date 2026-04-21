import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User, LogOut, Utensils, Heart, Home, Search, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  const isAdmin = user?.email === 'chapterztheorator@gmail.com';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/?q=${encodeURIComponent(globalSearch)}`);
      setIsSearchOpen(false);
      setGlobalSearch('');
    }
  };

  return (
    <>
      <nav className="bg-dark-surface/90 backdrop-blur-md border-b border-border-dark py-5 px-10 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-deep-green rounded-lg flex items-center justify-center font-bold text-xl italic text-black shadow-lg shadow-deep-green/20 group-hover:rotate-6 transition-transform">
              G
            </div>
            <span className="text-2xl font-bold tracking-tight text-white italic">
              Green <span className="text-gold">Onion <span className="inline-block" style={{ filter: 'hue-rotate(100deg) saturate(2)' }}>🧅</span></span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className={`text-xs font-bold uppercase tracking-[0.2em] transition-all ${location.pathname === '/' ? 'text-terracotta border-b-2 border-terracotta pb-1' : 'text-gray-400 hover:text-white'}`}>
              Explore
            </Link>
            <Link to="/saved" className={`text-xs font-bold uppercase tracking-[0.2em] transition-all ${location.pathname === '/saved' || location.pathname === '/dashboard' ? 'text-terracotta border-b-2 border-terracotta pb-1' : 'text-gray-400 hover:text-white'}`}>
              My Kitchen
            </Link>
            <Link to="/premium" className={`text-xs font-bold uppercase tracking-[0.2em] transition-all ${location.pathname === '/premium' ? 'text-terracotta border-b-2 border-terracotta pb-1' : 'text-gray-400 hover:text-white'}`}>
              Master Suite
            </Link>
            {isAdmin && (
              <Link to="/admin" className={`text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${location.pathname === '/admin' ? 'text-gold border-b-2 border-gold pb-1' : 'text-gold/60 hover:text-gold'}`}>
                <ShieldAlert size={14} />
                Vault
              </Link>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Welcome back,</p>
                  <p className="text-sm font-semibold text-white leading-none">Chef {user.displayName?.split(' ')[0]}</p>
                </div>
                <Link to="/dashboard" className="w-10 h-10 rounded-full bg-deep-green border border-gold/30 flex items-center justify-center text-gold font-bold overflow-hidden shadow-inner">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.displayName?.[0]
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-terracotta transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-terracotta text-black px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-terracotta/20 transition-all active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-xl flex items-center justify-center px-6"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors p-4"
            >
              <X size={32} />
            </button>

            <div className="max-w-4xl w-full">
              <p className="text-gold font-bold text-xs uppercase tracking-[0.4em] text-center mb-10">Global Search</p>
              <form onSubmit={handleSearch} className="relative">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="What recipe are you seeking?"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-border-dark py-8 px-4 text-4xl md:text-6xl font-serif italic text-white placeholder:text-gray-800 focus:border-gold transition-all"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gold group">
                  <ArrowRight className="group-hover:translate-x-2 transition-transform" size={48} />
                </button>
              </form>
              <div className="mt-12 flex flex-wrap justify-center gap-4 text-gray-500 text-xs uppercase font-bold tracking-widest">
                <span>Trending:</span>
                <button onClick={() => navigate('/?q=Jollof')} className="hover:text-gold transition-colors">Jollof</button>
                <button onClick={() => navigate('/?q=Egusi')} className="hover:text-gold transition-colors">Egusi</button>
                <button onClick={() => navigate('/?q=Yam')} className="hover:text-gold transition-colors">Yam</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper icon not imported but used
function ArrowRight({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className} 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}
