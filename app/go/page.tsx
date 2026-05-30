'use client';

import { useEffect } from 'react';

export default function GoPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('to') || window.location.origin + '/';
    window.location.href = decodeURIComponent(targetUrl);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium text-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
