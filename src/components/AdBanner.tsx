import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  slotId?: string;
}

export default function AdBanner({ className = '', slotId = 'XXXXXXXXXX' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pushAd = () => {
      try {
        const insElement = adRef.current;
        
        // Only push if the element exists, hasn't been processed, and has a width > 0
        if (insElement && !insElement.getAttribute('data-adsbygoogle-status')) {
          if (insElement.offsetWidth > 0) {
            const adsbygoogle = (window as any).adsbygoogle || [];
            adsbygoogle.push({});
          } else {
            // If width is 0, try again in a bit (e.g., if it's in a flex container that's still rendering)
            timeoutId = setTimeout(pushAd, 200);
          }
        }
      } catch (e: any) {
        // Ignore common React-specific AdSense errors
        const errorMessage = e.message || String(e);
        if (!errorMessage.includes('already have ads') && !errorMessage.includes('availableWidth=0')) {
          console.error("AdSense error:", e);
        }
      }
    };

    // Initial delay to let the DOM settle and CSS to apply
    timeoutId = setTimeout(pushAd, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`w-full bg-zinc-900/30 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-2 relative overflow-hidden min-h-[100px] ${className}`}>
      <span className="text-[10px] text-zinc-600 uppercase tracking-widest absolute top-2 left-4">Advertisement</span>
      
      {/* 
        Google AdSense Ad Unit 
        Note: Auto Ads will automatically inject ads into your site, but having these 
        dedicated <ins> tags gives you designated "Ad Areas" for manual ad units if you want them.
      */}
      <ins
        ref={adRef}
        className="adsbygoogle mt-4"
        style={{ display: 'block', width: '100%', minWidth: '250px', minHeight: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your actual Publisher ID
        data-ad-slot={slotId} // Replace with your Ad Unit ID if using manual ads
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
