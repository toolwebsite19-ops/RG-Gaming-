import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5 hover:border-neon-green/30 transition-all duration-300"
    >
      <Link to={`/post/${post.slug}`} className="block h-full">
        <div className="relative aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img
            src={post.featuredImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'}
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neon-green text-black rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-display font-bold text-white mb-2 line-clamp-2 group-hover:text-neon-green transition-colors">
            {post.title}
          </h3>
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views || 0}
              </span>
            </div>
            <span className="flex items-center gap-1 text-neon-green font-medium">
              <Download className="w-4 h-4" />
              {post.size}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
