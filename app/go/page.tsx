'use client';

import { useEffect, useState } from 'react';
import { openInPiBrowser, detectPlatform } from '@/lib/pi-browser-deeplink';

export default function GoPage() {
  const [status, setStatus] = useState('Opening...');
  const platform = detectPlatform();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('to') || window.location.origin + '/';
    const decodedUrl = decodeURIComponent(targetUrl);

    if (platform === 'desktop') {
      window.location.href = decodedUrl;
      return;
    }

    setStatus('Opening in Pi Browser...');
    openInPiBrowser(decodedUrl);

    // Still here after 2s = Pi Browser didn't open, redirect to regular browser
    const fallbackTimer = setTimeout(() => {
      setStatus('Redirecting to regular browser...');
      window.location.href = decodedUrl;
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [platform]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium text-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">
          {platform === 'android'
            ? 'Opening in Pi Browser. If nothing happens, you\'ll be redirected automatically.'
            : platform === 'ios'
              ? 'Attempting to open Pi Browser...'
              : 'Navigating...'}
        </p>
      </div>
    </div>
  );
}
