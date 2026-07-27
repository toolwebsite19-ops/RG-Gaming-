import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDocs, query, collection, where, updateDoc, increment, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, Comment, OperationType } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';
import { Download, Eye, Calendar, Tag, HardDrive, Hash, User, MessageSquare, Share2, Twitter, Facebook } from 'lucide-react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';

export default function SinglePost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: '', message: '' });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    // Inject Monetag popunder ad specifically for the download page area
    const monetagScript = document.createElement('script');
    monetagScript.dataset.zone = '11379850';
    monetagScript.src = 'https://al5sm.com/tag.min.js';
    document.body.appendChild(monetagScript);
    
    let unsubscribeComments: (() => void) | undefined;

    const fetchPost = async () => {
      try {
        const q = query(collection(db, 'posts'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const postDoc = querySnapshot.docs[0];
          const postData = { id: postDoc.id, ...postDoc.data() } as Post;
          setPost(postData);
          
          // Increment views
          await updateDoc(doc(db, 'posts', postDoc.id), {
            views: increment(1)
          });

          // Fetch comments
          const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postDoc.id));
          unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            
            // Sort comments on client side
            commentsData.sort((a, b) => {
              const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return dateB - dateA;
            });
            
            setComments(commentsData);
          }, (error) => {
            console.error("Error fetching comments:", error);
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    
    return () => {
      if (unsubscribeComments) {
        unsubscribeComments();
      }
      
      // Clean up Monetag script when leaving the page
      if (document.body.contains(monetagScript)) {
        document.body.removeChild(monetagScript);
      }
    };
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.name.trim() || !newComment.message.trim()) return;

    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId: post.id,
        name: newComment.name.trim(),
        message: newComment.message.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment({ name: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-display font-bold mb-4">Post Not Found</h1>
        <Link to="/" className="text-neon-green hover:underline">Return Home</Link>
      </div>
    );
  }

  const getKeywords = (title: string, category: string) => {
    const baseWords = title.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2);
    return [...new Set([...baseWords, category.toLowerCase(), "mod apk", "download", "free", "latest version", "android game", "gaming", "unlocked", "premium"])].join(", ");
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <SEO 
        title={post.title}
        description={post.content.substring(0, 160).replace(/[#*`]/g, '') + '...'}
        image={post.featuredImage}
        url={window.location.href}
        type="article"
        keywords={getKeywords(post.title, post.category)}
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": post.title,
          "operatingSystem": "ANDROID",
          "applicationCategory": "GameApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": post.content.substring(0, 300).replace(/[#*`]/g, ''),
          "image": post.featuredImage,
          "softwareVersion": post.version,
          "fileSize": post.size,
          "datePublished": post.createdAt?.toDate ? post.createdAt.toDate().toISOString() : new Date().toISOString()
        }}
      />
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0">
          <img 
            src={post.featuredImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallback = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block px-3 py-1 bg-neon-green text-black text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neon-green" />
                  {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM dd, yyyy') : 'Recently'}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neon-green" />
                  {post.views + 1} Views
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Top Content Ad Banner */}
            <div className="mb-8">
              <AdBanner className="min-h-[120px]" />
            </div>

            <div className="prose prose-invert prose-neon max-w-none mb-12">
              <div className="markdown-body text-zinc-300 leading-relaxed">
                <Markdown>{post.content}</Markdown>
              </div>
            </div>

            {/* Bottom Content Ad Banner */}
            <div className="mb-12">
              <AdBanner className="min-h-[120px]" />
            </div>

            {/* Comments Section */}
            <div className="border-t border-white/10 pt-12 mt-12">
              <h3 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-neon-green" />
                Comments ({comments.length})
              </h3>

              <form onSubmit={handleCommentSubmit} className="mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={newComment.name}
                    onChange={e => setNewComment({ ...newComment, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={4}
                    value={newComment.message}
                    onChange={e => setNewComment({ ...newComment, message: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors resize-none"
                    placeholder="What do you think about this game?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-6 py-3 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-colors disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-neon-green font-bold">
                          {comment.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{comment.name}</h4>
                          <span className="text-xs text-zinc-500">
                            {comment.createdAt?.toDate ? format(comment.createdAt.toDate(), 'MMM dd, yyyy HH:mm') : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-300">{comment.message}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              
              {/* Sidebar Ad Banner Top */}
              <AdBanner className="min-h-[250px]" />

              {/* Game Info Card */}
              <div className="bg-zinc-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-white/10 pb-4">Game Info</h3>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2"><Hash className="w-4 h-4" /> Version</span>
                    <span className="text-white font-medium">{post.version}</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2"><HardDrive className="w-4 h-4" /> Size</span>
                    <span className="text-white font-medium">{post.size}</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2"><Tag className="w-4 h-4" /> Category</span>
                    <span className="text-white font-medium">{post.category}</span>
                  </li>
                </ul>

                <a
                  href={post.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]"
                >
                  <Download className="w-5 h-5" />
                  Download Game
                </a>
                <p className="text-xs text-center text-zinc-500 mt-4">
                  By downloading, you agree to our terms of service.
                </p>
              </div>

              {/* Share Card */}
              <div className="bg-zinc-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-display font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-neon-green" />
                  Share Game
                </h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out ' + post.title)}`, '_blank')} 
                    className="flex-1 py-3 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 rounded-xl flex items-center justify-center transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} 
                    className="flex-1 py-3 bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20 rounded-xl flex items-center justify-center transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`, '_blank')} 
                    className="flex-1 py-3 bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 rounded-xl flex items-center justify-center transition-colors font-bold text-xl"
                    title="Share on Reddit"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </button>
                </div>
              </div>

              {/* Sidebar Ad Banner Bottom */}
              <AdBanner className="min-h-[250px]" />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
