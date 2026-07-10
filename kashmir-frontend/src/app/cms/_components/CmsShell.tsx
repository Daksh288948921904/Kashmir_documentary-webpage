'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { clearCmsToken } from '@/lib/api';

const NAV = [
  { label: 'Products',  href: '/cms/products'  },
  { label: 'Orders',    href: '/cms/orders'    },
  { label: 'Social',    href: '/cms/social'    },
];

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    setLoggingOut(true);
    clearCmsToken();
    router.push('/cms');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '200px',
        flexShrink: 0,
        backgroundColor: '#0a0c0f',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#e8e4dc' }}>
            Kashmir Harvest
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', marginTop: '3px' }}>
            CMS
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {NAV.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '9px 20px',
                  textAlign: 'left',
                  background: active ? 'rgba(175,108,30,0.15)' : 'none',
                  border: 'none',
                  borderLeft: active ? '2px solid #af6c1e' : '2px solid transparent',
                  color: active ? '#dba96a' : '#888',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'color 150ms',
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '0 20px' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%',
              padding: '8px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '5px',
              color: '#666',
              fontFamily: 'Space Mono, monospace',
              fontSize: '9px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
