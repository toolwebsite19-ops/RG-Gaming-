import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, OperationType } from '../types';
import PostCard from '../components/PostCard';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';
import { handleFirestoreError } from '../utils/errorHandling';
import { Gamepad2, Youtube, ArrowRight, Search, Zap } from 'lucide-react';

export default function Home() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      // Sort by createdAt for latest posts
      const latest = [...postsData].sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      }).slice(0, 6);
      
      // Sort by views for popular posts
      const popular = [...postsData].sort((a, b) => {
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        return viewsB - viewsA;
      }).slice(0, 3);

      setLatestPosts(latest);
      setPopularPosts(popular);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <SEO 
        title="Download Latest Mod Games & APKs" 
        description="Your ultimate destination for premium unlocked games, tutorials, and gaming news. Download and play your favorite games today."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "RG Gaming",
          "url": window.location.origin,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/latest?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/gaming/1920/1080?blur=10')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black to-black" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-neon-green/30 text-neon-green text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>New Mod APKs Available Daily</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-black text-white tracking-tight mb-6 uppercase"
          >
            <span className="glitch-effect inline-block" data-text="RG">RG</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-500 drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">Gaming</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
          >
            Download Latest Mod Games & APKs. Your ultimate destination for premium unlocked games, tutorials, and gaming news.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.0, type: "spring", stiffness: 200 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/latest"
                className="w-full px-8 py-4 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]"
              >
                <Gamepad2 className="w-5 h-5" />
                Explore Games
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2, type: "spring", stiffness: 200 }}
              className="w-full sm:w-auto"
            >
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <Youtube className="w-5 h-5 text-red-500" />
                Subscribe on YouTube
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent transition-all shadow-xl"
            placeholder="Search for games, mods, or APKs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                window.location.href = `/latest?search=${encodeURIComponent(searchQuery)}`;
              }
            }}
          />
        </div>
      </section>

      {/* Top Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <AdBanner className="min-h-[150px]" />
      </div>

      {/* Popular Games Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-neon-green" />
              Trending Now
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-zinc-900/50 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : popularPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-10">No trending posts yet.</p>
          )}
        </div>
      </section>

      {/* Middle Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <AdBanner className="min-h-[150px]" />
      </div>

      {/* Latest Games Section */}
      <section className="py-20 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-neon-green" />
              Latest Uploads
            </h2>
            <Link to="/latest" className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-neon-green transition-colors font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-zinc-900/50 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-10">No posts available.</p>
          )}
          
          <div className="mt-12 text-center sm:hidden">
            <Link to="/latest" className="inline-flex items-center gap-2 text-neon-green font-medium">
              View All Games <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
