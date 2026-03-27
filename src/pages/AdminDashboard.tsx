import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Post, User, OperationType } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, LogOut, Eye, FileText, Activity, Users, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole, userStatus, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/admin/login');
      return;
    }

    if (userStatus === 'pending' || userStatus === 'rejected') {
      return; // Stay on the page but show pending/rejected message
    }

    const q = query(collection(db, 'posts'));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      // Sort by createdAt descending
      postsData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });

      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    let unsubscribeUsers = () => {};
    if (currentUser?.email === 'gyantid830@gmail.com') {
      const usersQ = query(collection(db, 'users'));
      unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setPendingAdmins(usersData.filter(u => u.role === 'admin' && u.status === 'pending'));
      }, (error) => {
        console.error("Error fetching admin requests:", error);
      });
    }

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, [userRole, userStatus, currentUser, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
      }
    }
  };

  const handleAdminAction = async (uid: string, action: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: action });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (userRole === 'admin' && userStatus === 'pending') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900/80 p-8 rounded-3xl border border-white/10 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Approval Pending</h2>
          <p className="text-zinc-400 mb-8">
            Your admin account has been created and is waiting for approval from the main owner. You will be able to access the dashboard once approved.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (userRole === 'admin' && userStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900/80 p-8 rounded-3xl border border-red-500/30 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-zinc-400 mb-8">
            Your request for admin access has been rejected by the owner. You cannot access the dashboard.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const totalViews = posts.reduce((acc, post) => acc + (post.views || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-tight">
              Admin <span className="text-neon-green">Dashboard</span>
            </h1>
            <p className="text-zinc-400 mt-2">Manage your gaming blog content</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/create"
              className="px-6 py-3 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Post
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 border border-white/10 transition-all flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Admin Requests Section (Only for Owner) */}
        {currentUser?.email === 'gyantid830@gmail.com' && pendingAdmins.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-green" />
              Pending Admin Requests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAdmins.map(admin => (
                <div key={admin.uid} className="bg-zinc-900/80 p-4 rounded-xl border border-yellow-500/30 flex flex-col gap-4">
                  <div>
                    <p className="text-white font-medium">{admin.email}</p>
                    <p className="text-xs text-zinc-500 mt-1">Requested Admin Access</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdminAction(admin.uid, 'approved')}
                      className="flex-1 py-2 bg-neon-green/10 text-neon-green hover:bg-neon-green/20 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleAdminAction(admin.uid, 'rejected')}
                      className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Posts</p>
              <p className="text-4xl font-display font-bold text-white">{posts.length}</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Views</p>
              <p className="text-4xl font-display font-bold text-white">{totalViews}</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Avg Views/Post</p>
              <p className="text-4xl font-display font-bold text-white">
                {posts.length ? Math.round(totalViews / posts.length) : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-white/5 text-zinc-400 text-sm uppercase tracking-wider">
                  <th className="p-6 font-medium">Post</th>
                  <th className="p-6 font-medium">Category</th>
                  <th className="p-6 font-medium">Views</th>
                  <th className="p-6 font-medium">Date</th>
                  <th className="p-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={post.featuredImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'} 
                          alt={post.title} 
                          className="w-16 h-12 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                        <div>
                          <p className="text-white font-medium line-clamp-1">{post.title}</p>
                          <p className="text-zinc-500 text-sm line-clamp-1">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-6 text-zinc-300">{post.views || 0}</td>
                    <td className="p-6 text-zinc-400 text-sm">
                      {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/post/${post.slug}`}
                          target="_blank"
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                          title="View Post"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/admin/edit/${post.id}`}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                          title="Edit Post"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete Post"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500">
                      No posts found. Create your first post!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
