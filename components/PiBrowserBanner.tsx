'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { isPiBrowser, openInPiBrowser, detectPlatform } from '@/lib/pi-browser-deeplink';

export function PiBrowserBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform>>('desktop');

  useEffect(() => {
    const plat = detectPlatform();
    setPlatform(plat);

    const dismissedBefore = localStorage.getItem('pi_browser_banner_dismissed');
    if (dismissedBefore) {
      setDismissed(true);
      return;
    }

    if (!isPiBrowser() && plat !== 'desktop') {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('pi_browser_banner_dismissed', 'true');
  };

  const handleOpen = () => {
    openInPiBrowser();
  };

  if (!visible || dismissed) return null;

  const bannerText =
    platform === 'android'
      ? 'For the best experience, open this app in Pi Browser'
      : platform === 'ios'
        ? 'Open in Pi Browser for full features & wallet access'
        : 'Download Pi Browser for the best experience';

  return (
    <div className="sticky top-0 z-[9998] w-full bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground">
      <div className="flex items-center justify-between px-4 py-2.5 gap-2">
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 text-sm font-medium hover:underline flex-1 text-left min-w-0"
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{bannerText}</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-primary-foreground/10 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
