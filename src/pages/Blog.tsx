import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, OperationType } from '../types';
import PostCard from '../components/PostCard';
import { handleFirestoreError } from '../utils/errorHandling';
import { Search, Filter, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    if (categoryFilter) {
      q = query(collection(db, 'posts'), where('category', '==', categoryFilter), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(postsData.map(p => p.category))).filter(Boolean);
      setCategories(uniqueCategories);

      // Client-side search filtering (since Firestore doesn't support full-text search natively)
      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        postsData = postsData.filter(p => 
          p.title.toLowerCase().includes(lowerQuery) || 
          p.description.toLowerCase().includes(lowerQuery)
        );
      }

      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, [searchQuery, categoryFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCategory = (cat: string) => {
    if (cat === categoryFilter) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight mb-4"
          >
            All <span className="text-neon-green">Games</span>
          </motion.h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Browse our complete collection of modded games, premium APKs, and gaming resources.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent transition-all"
              placeholder="Search games..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Filter className="w-5 h-5 text-zinc-500 mr-2 shrink-0" />
            <button
              onClick={() => handleCategory('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                !categoryFilter 
                  ? 'bg-neon-green text-black' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  categoryFilter === cat 
                    ? 'bg-neon-green text-black' 
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-zinc-900/50 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
            <Gamepad2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
