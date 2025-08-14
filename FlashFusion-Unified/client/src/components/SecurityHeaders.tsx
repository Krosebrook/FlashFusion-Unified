import React, { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    const setHttpEquivTag = (httpEquiv: string, content: string) => {
      let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = httpEquiv;
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Secure Content Security Policy (removed unsafe-inline and unsafe-eval)
    setHttpEquivTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' https://dswosmoivswodjgqrwqr.supabase.co; " +
      "style-src 'self' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://dswosmoivswodjgqrwqr.supabase.co wss://dswosmoivswodjgqrwqr.supabase.co https://api.openai.com https://cloud.runware.ai https://api.anthropic.com; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "object-src 'none'; " +
      "upgrade-insecure-requests; " +
      "block-all-mixed-content;"
    );

    // Additional security headers
    setHttpEquivTag('X-Content-Type-Options', 'nosniff');
    setHttpEquivTag('X-Frame-Options', 'DENY');
    setHttpEquivTag('X-XSS-Protection', '1; mode=block');
    setHttpEquivTag('Referrer-Policy', 'strict-origin-when-cross-origin');
    setHttpEquivTag('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Cleanup function
    return () => {
      // Optional: Remove headers if component unmounts
    };
  }, []);

  return null;
};

export default SecurityHeaders;