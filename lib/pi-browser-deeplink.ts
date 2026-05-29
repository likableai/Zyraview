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

  if (platform === 'ios') {
    const schemes = ['minepi://', 'pi://'];
    for (const scheme of schemes) {
      try {
        window.location.href = scheme;
        break;
      } catch {
        continue;
      }
    }
    // Fallback on iOS after delay
    setTimeout(() => {
      if (document.hidden === false) {
        window.location.href = 'https://minepi.com';
      }
    }, 2500);
    return { attempted: true, platform: 'ios' };
  }

  if (platform === 'android') {
    // Android Intent URL with fallback - most reliable for Android
    const intentUrl =
      `intent://open#Intent;scheme=minepi;package=com.blockchainvault;S.browser_fallback_url=${encodedUrl};end`;
    window.location.href = intentUrl;
    return { attempted: true, platform: 'android' };
  }

  // Desktop: no Pi Browser exists, navigate normally in current browser
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
      // Already inside Pi Browser, just navigate normally
      if (targetUrl) {
        window.location.href = targetUrl;
      }
      return;
    }

    const url = targetUrl || getCurrentUrl();
    const encodedUrl = encodeURIComponent(url);

    if (platform === 'ios') {
      const schemes = ['minepi://', 'pi://'];
      let opened = false;

      for (const scheme of schemes) {
        try {
          window.location.href = scheme;
          opened = true;
          break;
        } catch {
          continue;
        }
      }

      const fallbackTimer = setTimeout(() => {
        if (opened && document.hidden === false && document.visibilityState === 'visible') {
          window.open('https://minepi.com', '_blank');
        }
      }, 2500);

      if (opened) {
        window.addEventListener(
          'pagehide',
          () => clearTimeout(fallbackTimer),
          { once: true }
        );
      }
    } else if (platform === 'android') {
      const intentUrl =
        `intent://open#Intent;scheme=minepi;package=com.blockchainvault;S.browser_fallback_url=${encodedUrl};end`;
      window.location.href = intentUrl;
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
