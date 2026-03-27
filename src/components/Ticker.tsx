import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, OperationType } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';
import { Flame, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ticker() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      // Sort by createdAt for latest posts
      const latest = [...postsData].sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      }).slice(0, 5);
      
      // Sort by views for trending posts
      const trending = [...postsData].sort((a, b) => {
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        return viewsB - viewsA;
      }).slice(0, 5);

      setLatestPosts(latest);
      setTrendingPosts(trending);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (latestPosts.length === 0 && trendingPosts.length === 0) {
    return null;
  }

  // Combine and interleave items
  const tickerItems = [];
  const maxLen = Math.max(latestPosts.length, trendingPosts.length);
  for (let i = 0; i < maxLen; i++) {
    if (latestPosts[i]) {
      tickerItems.push({ type: 'latest', post: latestPosts[i] });
    }
    if (trendingPosts[i]) {
      tickerItems.push({ type: 'trending', post: trendingPosts[i] });
    }
  }

  return (
    <div className="bg-neon-green text-black overflow-hidden border-b border-black/20 shadow-[0_0_15px_rgba(57,255,20,0.3)] relative z-40">
      <div className="marquee-track py-2 flex items-center">
        {/* Duplicate the items to create a seamless loop */}
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
          <div key={`${item.post.id}-${index}`} className="flex items-center whitespace-nowrap px-8 font-bold text-sm uppercase tracking-wider">
            {item.type === 'latest' ? (
              <span className="flex items-center gap-2 text-black/80">
                <Zap className="w-4 h-4" /> Latest:
              </span>
            ) : (
              <span className="flex items-center gap-2 text-black/80">
                <Flame className="w-4 h-4" /> Trending:
              </span>
            )}
            <Link to={`/post/${item.post.slug}`} className="ml-2 hover:underline decoration-black/50">
              {item.post.title} {item.post.version ? `v${item.post.version}` : ''}
            </Link>
            <span className="mx-8 text-black/30">///</span>
          </div>
        ))}
      </div>
    </div>
  );
}
