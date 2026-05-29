'use client';

export function detectPlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'desktop';
}

export function isPiBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Pi && typeof (window as any).Pi.authenticate === 'function';
}

export function getCurrentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

export function openInPiBrowser(targetUrl?: string): { attempted: boolean; platform: string } {
  const platform = detectPlatform();
  const url = targetUrl || getCurrentUrl();
  const encodedUrl = encodeURIComponent(url);

  if (platform === 'ios' || platform === 'android') {
    // Try common Pi Browser custom URL schemes
    const schemeUrls = [
      `minepi://open?url=${encodedUrl}`,
      `pi://open?url=${encodedUrl}`,
      `pi-browser://open?url=${encodedUrl}`,
      `minepi://`,
      `pi://`,
    ];

    let tried = false;
    for (const schemeUrl of schemeUrls) {
      if (tried) break;
      try {
        window.location.href = schemeUrl;
        tried = true;
      } catch {
        continue;
      }
    }

    // Fallback: if Pi Browser didn't open, navigate in current browser
    setTimeout(() => {
      if (!document.hidden) {
        window.location.href = url;
      }
    }, 1500);

    return { attempted: true, platform };
  }

  // Desktop: just open in current browser
  window.location.href = url;
  return { attempted: true, platform: 'desktop' };
}

export function useSmartDeepLink(): {
  openLink: (targetUrl?: string) => void;
  isPiBrowserAvailable: boolean;
  platform: ReturnType<typeof detectPlatform>;
} {
  const piAvailable = isPiBrowser();
  const platform = detectPlatform();

  const openLink = (targetUrl?: string) => {
    if (piAvailable) {
      if (targetUrl) {
        window.location.href = targetUrl;
      }
      return;
    }

    const url = targetUrl || getCurrentUrl();
    const encodedUrl = encodeURIComponent(url);

    if (platform === 'ios' || platform === 'android') {
      const schemeUrls = [
        `minepi://open?url=${encodedUrl}`,
        `pi://open?url=${encodedUrl}`,
        `pi-browser://open?url=${encodedUrl}`,
        `minepi://`,
        `pi://`,
      ];

      let tried = false;
      for (const schemeUrl of schemeUrls) {
        if (tried) break;
        try {
          window.location.href = schemeUrl;
          tried = true;
        } catch {
          continue;
        }
      }

      setTimeout(() => {
        if (!document.hidden) {
          window.location.href = url;
        }
      }, 1500);
    } else {
      window.location.href = url;
    }
  };

  return {
    openLink,
    isPiBrowserAvailable: piAvailable,
    platform,
  };
}
