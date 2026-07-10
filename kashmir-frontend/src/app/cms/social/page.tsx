'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

type ContentType = 'post' | 'story' | 'reel';
type OverallStatus = 'draft' | 'published' | 'partial' | 'failed';

interface PlatformStatus { status: string; id?: string; error?: string | null; }
interface SocialPost {
  id: string;
  content_type: ContentType;
  caption: string | null;
  media_url: string | null;
  platforms: string[];
  publish_status: Record<string, PlatformStatus>;
  overall_status: OverallStatus;
  created_at: string;
}
interface SocialConfig { instagram: boolean; facebook: boolean; x: boolean; }

const PLATFORM_META: Record<string, { label: string; color: string; border: string; bg: string }> = {
  instagram: { label: 'IG',  color: '#c47fc4', border: '#7f2a7f', bg: 'rgba(127,42,127,0.15)' },
  facebook:  { label: 'FB',  color: '#7ba8e0', border: '#3a5a9a', bg: 'rgba(79,112,175,0.15)' },
  x:         { label: 'X',   color: '#aaa',    border: '#555',    bg: 'rgba(150,150,150,0.1)' },
};

const STATUS_COLORS: Record<OverallStatus, { color: string; border: string; bg: string }> = {
  draft:     { color: '#d4c040', border: '#8a7a20', bg: 'rgba(180,160,60,0.15)' },
  published: { color: '#5ecb8a', border: '#2a7f4f', bg: 'rgba(42,127,79,0.15)' },
  partial:   { color: '#dba96a', border: '#af6c1e', bg: 'rgba(175,108,30,0.15)' },
  failed:    { color: '#e05252', border: '#9a2020', bg: 'rgba(224,82,82,0.15)' },
};

const BASE_BTN: React.CSSProperties = { padding: '4px 12px', background: 'none', borderRadius: '5px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer' };
const pill = (active: boolean): React.CSSProperties => ({ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', border: '1px solid', background: active ? 'rgba(175,108,30,0.2)' : 'none', borderColor: active ? '#af6c1e' : 'rgba(255,255,255,0.1)', color: active ? '#dba96a' : '#666' });

export default function CmsSocialPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [config, setConfig] = useState<SocialConfig>({ instagram: false, facebook: false, x: false });
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (!getCmsToken()) { router.replace('/cms'); return; }
    cmsApi('/cms/social/config').then(r => r.json()).then(setConfig);
  }, [router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const p = new URLSearchParams();
      if (typeFilter !== 'all') p.set('content_type', typeFilter);
      if (statusFilter !== 'all') p.set('overall_status', statusFilter);
      const res = await cmsApi(`/cms/social?${p}`);
      if (res.ok) { const d = await res.json(); setPosts(d.posts); setTotal(d.total); }
      else { const b = await res.json().catch(() => ({})); setError(`${res.status}: ${b.detail ?? 'error'}`); }
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }, [typeFilter, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return;
    await cmsApi(`/cms/social/${id}`, { method: 'DELETE' });
    fetchPosts();
  }

  async function handlePublish(post: SocialPost) {
    setPublishing(post.id);
    const res = await cmsApi(`/cms/social/${post.id}/publish`, { method: 'POST' });
    if (!res.ok) { const b = await res.json().catch(() => ({})); alert(`Publish error: ${b.detail ?? 'unknown'}`); }
    await fetchPosts();
    setPublishing(null);
  }

  const anyConfigured = config.instagram || config.facebook || config.x;

  return (
    <CmsShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>Social Media</h1>
        <button onClick={() => router.push('/cms/social/new')} style={{ padding: '8px 18px', backgroundColor: '#af6c1e', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
          + New Post
        </button>
      </div>

      {/* Platform config status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['instagram', 'facebook', 'x'] as const).map(p => {
          const m = PLATFORM_META[p];
          const ok = config[p];
          return (
            <div key={p} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', border: `1px solid ${ok ? m.border : 'rgba(255,255,255,0.08)'}`, background: ok ? m.bg : 'none', color: ok ? m.color : '#444', fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>
              {m.label} {ok ? '✓' : '✗'}
            </div>
          );
        })}
        {!anyConfigured && <span style={{ fontSize: '12px', color: '#555', alignSelf: 'center', marginLeft: '4px' }}>No platforms configured — add API keys to .env to enable publishing</span>}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {['all','post','story','reel'].map(t => <button key={t} style={pill(typeFilter === t)} onClick={() => setTypeFilter(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        <span style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {['all','draft','published','partial','failed'].map(s => <button key={s} style={pill(statusFilter === s)} onClick={() => setStatusFilter(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
      </div>

      {loading ? <p style={{ color: '#666' }}>Loading…</p>
      : error ? <p style={{ color: '#e05252', fontSize: '13px' }}>{error}</p>
      : posts.length === 0 ? <p style={{ color: '#555' }}>No posts yet.</p>
      : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Media','Type','Caption','Platforms','Status','Date',''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map(p => {
                const sc = STATUS_COLORS[p.overall_status];
                const canPublish = p.platforms.length > 0 && p.overall_status !== 'published';
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px' }}>
                      {p.media_url
                        ? p.media_url.match(/\.(mp4|mov|m4v)$/i)
                          ? <div style={{ width: 48, height: 48, borderRadius: '4px', background: '#1a1d20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>▶</div>
                          : <img src={p.media_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '4px' }} />
                        : <div style={{ width: 48, height: 48, borderRadius: '4px', background: '#1a1d20' }} />
                      }
                    </td>
                    <td style={{ padding: '12px', color: '#888', textTransform: 'capitalize' }}>{p.content_type}</td>
                    <td style={{ padding: '12px', color: '#aaa', maxWidth: '200px' }}>{p.caption ? p.caption.slice(0,55)+(p.caption.length>55?'…':'') : <span style={{ color: '#444' }}>—</span>}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.platforms.map(plat => {
                          const m = PLATFORM_META[plat];
                          const ps = p.publish_status?.[plat];
                          const pOk = ps?.status === 'published';
                          return <span key={plat} title={ps?.error ?? ps?.status ?? ''} style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', border: `1px solid ${pOk ? m.border : 'rgba(255,255,255,0.1)'}`, background: pOk ? m.bg : 'none', color: pOk ? m.color : '#555', fontFamily: 'Space Mono, monospace' }}>{m.label}</span>;
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontFamily: 'Space Mono, monospace', letterSpacing: '0.06em' }}>{p.overall_status}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#555', fontSize: '11px', whiteSpace: 'nowrap' }}>{new Date(p.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => router.push(`/cms/social/${p.id}`)} style={{ ...BASE_BTN, border: '1px solid rgba(255,255,255,0.12)', color: '#999' }}>Edit</button>
                        <button onClick={() => handleDelete(p.id)} style={{ ...BASE_BTN, border: '1px solid rgba(224,82,82,0.3)', color: '#e05252' }}>Delete</button>
                        <button
                          onClick={() => canPublish && handlePublish(p)}
                          disabled={!canPublish || publishing === p.id}
                          style={{ ...BASE_BTN, border: `1px solid ${p.overall_status==='published'?'#2a7f4f':canPublish?'#af6c1e':'rgba(255,255,255,0.08)'}`, color: p.overall_status==='published'?'#5ecb8a':canPublish?'#dba96a':'#444', cursor: canPublish?'pointer':'not-allowed', opacity: canPublish?1:0.5 }}
                        >
                          {publishing===p.id?'…':p.overall_status==='published'?'✓ Done':'Publish'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {total > posts.length && <p style={{ color: '#555', fontSize: '12px', marginTop: '12px', fontFamily: 'Space Mono, monospace' }}>Showing {posts.length} of {total}</p>}
        </div>
      )}
    </CmsShell>
  );
}
