'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

type ContentType = 'post' | 'story' | 'reel';
type Status = 'draft' | 'published' | 'failed';

interface IgPost {
  id: string;
  content_type: ContentType;
  caption: string | null;
  media_url: string | null;
  status: Status;
  ig_media_id: string | null;
  ig_error: string | null;
  published_at: string | null;
  created_at: string;
}

const TYPE_COLORS: Record<ContentType, { bg: string; color: string; border: string }> = {
  post:  { bg: 'rgba(79,112,175,0.15)', color: '#7ba8e0', border: '#3a5a9a' },
  story: { bg: 'rgba(175,108,30,0.15)', color: '#dba96a', border: '#af6c1e' },
  reel:  { bg: 'rgba(127,42,127,0.15)', color: '#c47fc4', border: '#7f2a7f' },
};

const STATUS_COLORS: Record<Status, { bg: string; color: string; border: string }> = {
  draft:     { bg: 'rgba(180,160,60,0.15)',  color: '#d4c040', border: '#8a7a20' },
  published: { bg: 'rgba(42,127,79,0.15)',   color: '#5ecb8a', border: '#2a7f4f' },
  failed:    { bg: 'rgba(224,82,82,0.15)',   color: '#e05252', border: '#9a2020' },
};

const BASE_BTN: React.CSSProperties = {
  padding: '4px 12px', background: 'none',
  borderRadius: '5px', fontFamily: 'DM Sans, sans-serif',
  fontSize: '12px', cursor: 'pointer',
};

export default function CmsInstagramPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<IgPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [igConfigured, setIgConfigured] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (!getCmsToken()) { router.replace('/cms'); return; }
    fetch('/api/cms/instagram/config').then(r => r.json()).then(d => setIgConfigured(d.configured));
  }, [router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('content_type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await cmsApi(`/cms/instagram?${params}`);
      if (res.ok) {
        const d = await res.json();
        setPosts(d.posts); setTotal(d.total);
      } else {
        const b = await res.json().catch(() => ({}));
        setError(`API error ${res.status}: ${b.detail ?? 'unknown'}`);
      }
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }, [typeFilter, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return;
    await cmsApi(`/cms/instagram/${id}`, { method: 'DELETE' });
    fetchPosts();
  }

  async function handlePublish(post: IgPost) {
    setPublishing(post.id);
    try {
      const res = await cmsApi(`/cms/instagram/${post.id}/publish`, { method: 'POST' });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        alert(`Publish failed: ${b.detail ?? 'unknown error'}`);
      }
      fetchPosts();
    } finally { setPublishing(null); }
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', border: '1px solid',
    background: active ? 'rgba(175,108,30,0.2)' : 'none',
    borderColor: active ? '#af6c1e' : 'rgba(255,255,255,0.1)',
    color: active ? '#dba96a' : '#666',
  });

  return (
    <CmsShell>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
          Instagram
        </h1>
        <button
          onClick={() => router.push('/cms/instagram/new')}
          style={{ padding: '8px 18px', backgroundColor: '#af6c1e', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          + New Post
        </button>
      </div>

      {!igConfigured && (
        <div style={{ background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#e05252' }}>
          Instagram API not configured — publishing is disabled. Set <code>INSTAGRAM_ACCESS_TOKEN</code> and <code>INSTAGRAM_BUSINESS_ACCOUNT_ID</code> in your <code>.env</code>.
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {['all','post','story','reel'].map(t => (
          <button key={t} style={pillStyle(typeFilter === t)} onClick={() => setTypeFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {['all','draft','published','failed'].map(s => (
          <button key={s} style={pillStyle(statusFilter === s)} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>Loading…</p>
      ) : error ? (
        <p style={{ color: '#e05252', fontSize: '13px' }}>{error}</p>
      ) : posts.length === 0 ? (
        <p style={{ color: '#555', fontFamily: 'DM Sans, sans-serif' }}>No posts yet. Create your first one above.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Media', 'Type', 'Caption', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map(p => {
                  const tc = TYPE_COLORS[p.content_type];
                  const sc = STATUS_COLORS[p.status];
                  const canPublish = igConfigured && !!p.media_url && p.status !== 'published';
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px' }}>
                        {p.media_url ? (
                          p.media_url.match(/\.(mp4|mov|m4v)$/i)
                            ? <div style={{ width: 48, height: 48, borderRadius: '4px', background: '#1a1d20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>▶</div>
                            : <img src={p.media_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: '4px', background: '#1a1d20' }} />
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>
                          {p.content_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#aaa', maxWidth: '240px' }}>
                        {p.caption ? p.caption.slice(0, 60) + (p.caption.length > 60 ? '…' : '') : <span style={{ color: '#444' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#555', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => router.push(`/cms/instagram/${p.id}`)} style={{ ...BASE_BTN, border: '1px solid rgba(255,255,255,0.12)', color: '#999' }}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} style={{ ...BASE_BTN, border: '1px solid rgba(224,82,82,0.3)', color: '#e05252' }}>Delete</button>
                          <button
                            onClick={() => canPublish && handlePublish(p)}
                            disabled={!canPublish || publishing === p.id}
                            title={!igConfigured ? 'Instagram API not configured' : !p.media_url ? 'Upload media first' : p.status === 'published' ? 'Already published' : 'Publish to Instagram'}
                            style={{
                              ...BASE_BTN,
                              border: `1px solid ${p.status === 'published' ? '#2a7f4f' : canPublish ? '#af6c1e' : 'rgba(255,255,255,0.08)'}`,
                              color: p.status === 'published' ? '#5ecb8a' : canPublish ? '#dba96a' : '#444',
                              cursor: canPublish ? 'pointer' : 'not-allowed',
                              opacity: canPublish ? 1 : 0.5,
                            }}
                          >
                            {publishing === p.id ? '…' : p.status === 'published' ? '✓ Published' : 'Publish'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > posts.length && (
            <p style={{ color: '#555', fontSize: '12px', marginTop: '12px', fontFamily: 'Space Mono, monospace' }}>
              Showing {posts.length} of {total}
            </p>
          )}
        </>
      )}
    </CmsShell>
  );
}
