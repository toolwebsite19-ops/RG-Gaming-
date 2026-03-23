import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2 } from 'lucide-react';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500); // 2.5 seconds loading time

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center"
          >
            {/* Logo */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="mb-6 relative"
            >
              <div className="absolute inset-0 bg-neon-green blur-xl opacity-20 rounded-full"></div>
              <Gamepad2 className="w-20 h-20 text-neon-green relative z-10" />
            </motion.div>

            {/* Glowing Text */}
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-8">
              RG <span className="text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">Gaming</span>
            </h1>

            {/* Loading Bar */}
            <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.8)]"
              />
            </div>

            {/* Loading Text */}
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-neon-green font-mono text-sm tracking-widest uppercase"
            >
              Loading System...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
