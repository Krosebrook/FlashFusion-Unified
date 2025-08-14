import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { SecurityService } from '@/services/SecurityService';

interface SecurityContextType {
  isSecure: boolean;
  sessionTimeout: number;
  setSessionTimeout: (timeout: number) => void;
  enforceSessionTimeout: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30); // 30 minutes default
  const { user } = useAuth();

  // Monitor session activity
  useEffect(() => {
    let lastActivity = Date.now();
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      lastActivity = Date.now();
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        const inactiveMinutes = Math.floor((Date.now() - lastActivity) / 60000);
        if (inactiveMinutes >= sessionTimeout && user) {
          await enforceSessionTimeout();
        }
      }, sessionTimeout * 60000);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimeout));

    resetTimeout();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimeout));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionTimeout, user]);

  // Enhanced security monitoring
  useEffect(() => {
    if (!user) return; // Only monitor authenticated users

    const handleSecurityViolation = async (violationType: string) => {
      setIsSecure(false);

      // Log security incident to database
      try {
        await supabase.rpc('log_security_event', {
          p_event_data: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            type: violationType
          },
          p_severity: 'warning'
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }

      // Log activity
      SecurityService.logActivity('security_violation', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        type: violationType
      });
    };

    // More sophisticated security monitoring
    let securityChecks = {
      suspiciousActivity: 0,
      lastCheck: Date.now()
    };

    const securityInterval = setInterval(() => {
      const now = Date.now();
      
      // Check for unusual activity patterns
      if (now - securityChecks.lastCheck > 5000) { // 5 second intervals
        securityChecks.lastCheck = now;
        
        // Monitor for rapid-fire requests or suspicious patterns
        const currentTime = Date.now();
        if (securityChecks.suspiciousActivity > 10) {
          handleSecurityViolation('suspicious_activity_pattern');
          securityChecks.suspiciousActivity = 0;
        }
      }
    }, 5000);

    // Monitor page visibility changes (potential security concern)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        SecurityService.logActivity('page_hidden', { timestamp: new Date().toISOString() });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(securityInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const enforceSessionTimeout = async () => {
    // Log security event to database
    try {
      await supabase.rpc('log_security_event', {
        p_event_data: {
          timestamp: new Date().toISOString(),
          type: 'session_timeout'
        },
        p_severity: 'info'
      });
    } catch (error) {
      console.error('Failed to log session timeout:', error);
    }

    // Sign out user
    await supabase.auth.signOut();
    
    // Redirect to login
    window.location.href = '/login?reason=session_timeout';
  };

  const value = {
    isSecure,
    sessionTimeout,
    setSessionTimeout,
    enforceSessionTimeout
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};