/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

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

  return (
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
  );
}
