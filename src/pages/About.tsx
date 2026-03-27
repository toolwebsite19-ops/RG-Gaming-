import React from 'react';
import { Gamepad2, Youtube, Shield, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="min-h-screen bg-black py-20">
      <SEO 
        title="About Us"
        description="Learn more about RG Gaming, your trusted source for the best modded games, premium APKs, and gaming content."
        url={window.location.href}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-zinc-900 rounded-3xl border border-neon-green/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(57,255,20,0.15)]"
          >
            <Gamepad2 className="w-12 h-12 text-neon-green" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tight mb-6"
          >
            About <span className="text-neon-green">RG Gaming</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Your trusted source for the best modded games, premium APKs, and gaming content.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6 text-zinc-300 leading-relaxed"
          >
            <p>
              Welcome to RG Gaming, the ultimate destination for mobile gamers. We started as a small YouTube channel dedicated to sharing the best gaming mods and tutorials. Today, we've grown into a comprehensive platform where gamers can find exactly what they're looking for.
            </p>
            <p>
              Our mission is simple: provide safe, working, and high-quality game modifications that enhance your gaming experience. We test every single APK before publishing to ensure it's free from malware and works exactly as described.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5"
          >
            <h3 className="text-2xl font-display font-bold text-white mb-6">Join Our Community</h3>
            <p className="text-zinc-400 mb-8">
              Subscribe to our YouTube channel for daily gameplay videos, installation tutorials, and exclusive mod releases.
            </p>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <Youtube className="w-6 h-6" />
              Subscribe to RG Gaming
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 text-center"
          >
            <Shield className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">100% Safe</h4>
            <p className="text-zinc-400 text-sm">Every file is scanned and verified before we share it with our community.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 text-center"
          >
            <Zap className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Fast Updates</h4>
            <p className="text-zinc-400 text-sm">We update our mods as soon as a new version of the game is released.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 text-center"
          >
            <Users className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Active Community</h4>
            <p className="text-zinc-400 text-sm">Join thousands of other gamers who trust RG Gaming for their mods.</p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
