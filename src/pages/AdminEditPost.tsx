import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Post, OperationType } from '../types';
import { handleFirestoreError } from '../utils/errorHandling';
import { useAuth } from '../contexts/AuthContext';
import { Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, FileText, Tag, HardDrive, Hash, UploadCloud } from 'lucide-react';

export default function AdminEditPost() {
  const { id } = useParams<{ id: string }>();
  const { userRole, userStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    featuredImage: '',
    downloadLink: '',
    version: '',
    size: '',
    category: ''
  });

  useEffect(() => {
    if (userRole !== 'admin' || userStatus !== 'approved') {
      navigate('/admin/login');
      return;
    }

    if (!id) return;

    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Post;
          setFormData({
            title: data.title,
            slug: data.slug,
            description: data.description,
            content: data.content,
            featuredImage: data.featuredImage,
            downloadLink: data.downloadLink,
            version: data.version,
            size: data.size,
            category: data.category
          });
        } else {
          setError('Post not found');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `posts/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, userRole, navigate]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'title' && !prev.slug) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (err) => {
        setError('Image upload failed: ' + err.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, featuredImage: downloadURL }));
        setUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError('');

    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, formData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
      handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate('/admin')}
            className="p-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl border border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">
              Edit <span className="text-neon-green">Post</span>
            </h1>
            <p className="text-zinc-400 mt-1">Update game details and links</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-8 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-xl font-display font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-neon-green" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Post Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  maxLength={150}
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  required
                  maxLength={150}
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Short Description</label>
              <textarea
                name="description"
                required
                maxLength={500}
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Main Content (Markdown)</label>
              <textarea
                name="content"
                required
                maxLength={100000}
                rows={12}
                value={formData.content}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors font-mono text-sm"
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-xl font-display font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-neon-green" />
              Media & Links
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Featured Image</label>
                <div className="space-y-3">
                  <label className="block w-full cursor-pointer bg-zinc-950 border border-white/10 border-dashed rounded-xl px-4 py-6 text-center hover:border-neon-green transition-colors">
                    <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                    <span className="text-sm text-zinc-400">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                  
                  {uploading && (
                    <div className="w-full bg-zinc-950 rounded-full h-2 border border-white/10 overflow-hidden">
                      <div className="bg-neon-green h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}

                  <input
                    type="url"
                    name="featuredImage"
                    required
                    value={formData.featuredImage}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                    placeholder="Or enter image URL directly..."
                  />

                  {formData.featuredImage && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                      <img 
                        src={formData.featuredImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'} 
                        alt="Preview" 
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
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Download Link</label>
                <input
                  type="url"
                  name="downloadLink"
                  required
                  value={formData.downloadLink}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-xl font-display font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-neon-green" />
              Game Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Version
                </label>
                <input
                  type="text"
                  name="version"
                  required
                  maxLength={50}
                  value={formData.version}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> File Size
                </label>
                <input
                  type="text"
                  name="size"
                  required
                  maxLength={50}
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Category
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-colors appearance-none"
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Action">Action</option>
                  <option value="RPG">RPG</option>
                  <option value="Racing">Racing</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Sports">Sports</option>
                  <option value="Puzzle">Puzzle</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-neon-green text-black font-bold rounded-xl hover:bg-neon-green/90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)] disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
