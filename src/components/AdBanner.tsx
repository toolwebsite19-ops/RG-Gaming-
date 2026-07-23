import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slotId?: string; // Kept for backwards compatibility if passed
}

export default function AdBanner({ className = '' }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Prevent duplicate injections on re-renders
    if (containerRef.current.querySelector('script')) return;

    // Inject Monetag ad script into this specific container
    const s = document.createElement('script');
    s.dataset.zone = '11379874';
    s.src = 'https://nap5k.com/tag.min.js';
    s.async = true;
    
    containerRef.current.appendChild(s);

    return () => {
      // Cleanup script when component unmounts
      if (containerRef.current && containerRef.current.contains(s)) {
        containerRef.current.removeChild(s);
      }
    };
  }, []);

  return (
    <div className={`w-full bg-zinc-900/30 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-2 relative overflow-hidden min-h-[100px] ${className}`}>
      <span className="text-[10px] text-zinc-600 uppercase tracking-widest absolute top-2 left-4">Advertisement</span>
      
      {/* Monetag Ad Unit Container */}
      <div ref={containerRef} className="w-full flex justify-center items-center mt-4 min-h-[90px] overflow-hidden">
        {/* The Monetag script will load the ad inside this div */}
      </div>
    </div>
  );
}
