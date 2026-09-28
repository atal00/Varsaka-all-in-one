'use client';

import React, { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';

export const LogoutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent',
        border: '1px solid var(--border-light)',
        color: isLoggingOut ? 'var(--text-muted)' : 'var(--text-secondary)',
        padding: '0.4rem 0.8rem',
        borderRadius: 'var(--radius-md)',
        cursor: isLoggingOut ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        opacity: isLoggingOut ? 0.7 : 1
      }}
      onMouseOver={(e) => {
        if (!isLoggingOut) {
          e.currentTarget.style.background = '#fee2e2';
          e.currentTarget.style.color = '#ef4444';
          e.currentTarget.style.borderColor = '#fca5a5';
        }
      }}
      onMouseOut={(e) => {
        if (!isLoggingOut) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-light)';
        }
      }}
    >
      {isLoggingOut ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};

export default LogoutButton;
