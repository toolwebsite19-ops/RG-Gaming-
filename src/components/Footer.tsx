import React from 'react';
import { Gamepad2, Youtube, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-8 h-8 text-neon-green" />
              <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
                RG <span className="text-neon-green">Gaming</span>
              </span>
            </div>
            <p className="text-zinc-400 text-sm">
              Your ultimate source for the latest mod games, APKs, and gaming news. Download and play your favorite games today.
            </p>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="/" className="hover:text-neon-green transition-colors">Home</a></li>
              <li><a href="/categories" className="hover:text-neon-green transition-colors">Categories</a></li>
              <li><a href="/latest" className="hover:text-neon-green transition-colors">Latest Posts</a></li>
              <li><a href="/about" className="hover:text-neon-green transition-colors">About Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://youtube.com/@rggamingytt?si=EMxXLX7rLlR2Y7hH" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-[#FF0000] hover:text-white transition-all" title="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://t.me/RGGamingytt" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-[#0088cc] hover:text-white transition-all" title="Telegram">
                <Send className="w-5 h-5 ml-[-2px] mt-[2px]" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} RG Gaming. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
