'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCmsToken } from '@/lib/api';
import { CONFIG } from '@/lib/config';

const API = `${CONFIG.api.baseUrl}${CONFIG.api.prefix}`;

export default function CmsLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const { token } = await res.json();
      setCmsToken(token);
      router.push('/cms/products');
    } else {
      setError('Invalid password. Try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d0f12',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        padding: '40px',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.4rem',
            color: '#e8e4dc',
            letterSpacing: '0.02em',
          }}>
            Kashmir Harvest
          </div>
          <div style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#888',
            marginTop: '4px',
          }}>
            Content Management
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontFamily: 'Space Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#e8e4dc',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              color: '#e05252',
              marginBottom: '12px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: loading ? 'rgba(175,108,30,0.5)' : '#af6c1e',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontFamily: 'Space Mono, monospace',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
