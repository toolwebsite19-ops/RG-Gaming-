import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Menu, X, Youtube, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { userRole } = useAuth();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'Latest Posts', path: '/latest' },
    { name: 'About', path: '/about' },
  ];

  if (userRole === 'admin') {
    links.push({ name: 'Admin Dashboard', path: '/admin' });
  } else {
    links.push({ name: 'Admin Login', path: '/admin/login' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Gamepad2 className="w-8 h-8 text-neon-green group-hover:animate-pulse" />
            <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
              RG <span className="text-neon-green">Gaming</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-neon-green ${
                  location.pathname === link.path ? 'text-neon-green' : 'text-zinc-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-4 border-l border-white/10 pl-8">
              <a 
                href="https://youtube.com/@rggamingytt?si=EMxXLX7rLlR2Y7hH" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-400 hover:text-[#FF0000] transition-colors"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://t.me/RGGamingytt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-zinc-400 hover:text-[#0088cc] transition-colors"
                title="Telegram"
              >
                <Send className="w-5 h-5 ml-[-2px] mt-[2px]" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-neon-green focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-neon-green/10 text-neon-green'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-4 px-3 py-4 mt-2 border-t border-white/10">
                <a 
                  href="https://youtube.com/@rggamingytt?si=EMxXLX7rLlR2Y7hH" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#FF0000] hover:text-white transition-all"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a 
                  href="https://t.me/RGGamingytt" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#0088cc] hover:text-white transition-all"
                  title="Telegram"
                >
                  <Send className="w-5 h-5 ml-[-2px] mt-[2px]" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
