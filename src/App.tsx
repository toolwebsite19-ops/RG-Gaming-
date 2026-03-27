/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import Ticker from './components/Ticker';

// Pages
import Home from './pages/Home';
import Blog from './pages/Blog';
import SinglePost from './pages/SinglePost';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreatePost from './pages/AdminCreatePost';
import AdminEditPost from './pages/AdminEditPost';

export default function App() {
  const [loading, setLoading] = useState(true);

  // Temporary migration script to fix posts missing createdAt or views
  useEffect(() => {
    const fixPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'posts'));
        snapshot.docs.forEach(async (document) => {
          const data = document.data();
          const updates: any = {};
          
          // Add default values for required fields if missing
          if (data.createdAt === undefined) updates.createdAt = serverTimestamp();
          if (data.views === undefined) updates.views = 0;
          if (data.title === undefined) updates.title = 'Untitled Post';
          if (data.slug === undefined) updates.slug = `untitled-post-${document.id}`;
          if (data.description === undefined) updates.description = 'No description provided.';
          if (data.content === undefined) updates.content = 'No content provided.';
          if (data.featuredImage === undefined) updates.featuredImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800';
          if (data.downloadLink === undefined) updates.downloadLink = 'https://example.com';
          if (data.version === undefined) updates.version = '1.0';
          if (data.size === undefined) updates.size = 'Unknown';
          if (data.category === undefined) updates.category = 'Action';

          if (Object.keys(updates).length > 0) {
            try {
              await updateDoc(doc(db, 'posts', document.id), updates);
              console.log(`Updated post ${document.id} with missing fields`);
            } catch (updateErr) {
              console.error(`Failed to update post ${document.id}:`, updateErr);
            }
          }
        });
      } catch (error) {
        console.error("Error fixing posts:", error);
      }
    };
    fixPosts();
  }, []);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          {loading && <Preloader onComplete={() => setLoading(false)} />}
          <Router>
            <div className={`min-h-screen bg-black text-white flex flex-col font-sans transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <Navbar />
              <Ticker />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/latest" element={<Blog />} />
                  <Route path="/categories" element={<Blog />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/post/:slug" element={<SinglePost />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/create" element={<AdminCreatePost />} />
                  <Route path="/admin/edit/:id" element={<AdminEditPost />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
