'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

type ContentType = 'post' | 'story' | 'reel';
interface PlatformStatus { status: string; id?: string; error?: string | null; published_at?: string; }
interface SocialPost {
  id: string; content_type: ContentType; caption: string | null; media_url: string | null;
  platforms: string[]; publish_status: Record<string, PlatformStatus>; overall_status: string;
}
interface SocialConfig { instagram: boolean; facebook: boolean; x: boolean; }

const LABEL: React.CSSProperties = { display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' };
const INPUT: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e8e4dc', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', boxSizing: 'border-box' };
const FIELD: React.CSSProperties = { marginBottom: '20px' };
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook',  label: 'Facebook'  },
  { key: 'x',         label: 'X (Twitter)' },
];

export default function EditSocialPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<SocialPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [config, setConfig] = useState<SocialConfig>({ instagram: false, facebook: false, x: false });
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<Record<string, PlatformStatus>>({});
  const [error, setSaveError] = useState('');

  useEffect(() => {
    if (!getCmsToken()) { router.replace('/cms'); return; }
    cmsApi('/cms/social/config').then(r => r.json()).then(setConfig);
    cmsApi(`/cms/social/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((p: SocialPost) => {
        setPost(p); setContentType(p.content_type); setCaption(p.caption ?? '');
        setMediaUrl(p.media_url ?? ''); setPlatforms(p.platforms ?? []);
        setPublishResult(p.publish_status ?? {});
        if (p.media_url && !p.media_url.match(/\.(mp4|mov|m4v)$/i)) setUploadPreview(p.media_url);
        else if (p.media_url) setUploadName(p.media_url.split('/').pop() ?? 'video');
        setLoading(false);
      })
      .catch(() => { setPost(null); setLoading(false); });
  }, [id, router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await cmsApi('/cms/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Upload failed');
      const { url } = await res.json();
      setMediaUrl(url); setUploadName(file.name);
      if (file.type.startsWith('image/')) setUploadPreview(url); else setUploadPreview('');
    } catch (e) { setSaveError(String(e)); }
    setUploading(false);
  }

  function togglePlatform(key: string) {
    setPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaveError('');
    try {
      const res = await cmsApi(`/cms/social/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, caption: caption || null, media_url: mediaUrl || null, platforms }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Save failed');
      router.push('/cms/social');
    } catch (e) { setSaveError(String(e)); setSaving(false); }
  }

  async function handlePublish() {
    setPublishing(true); setSaveError('');
    try {
      const res = await cmsApi(`/cms/social/${id}/publish`, { method: 'POST' });
      const b = await res.json();
      if (!res.ok) throw new Error(b.detail ?? 'Publish failed');
      setPublishResult(b.publish_status ?? {});
      setPost(prev => prev ? { ...prev, overall_status: b.results.failed.length && !b.results.published.length ? 'failed' : b.results.failed.length || b.results.skipped.length ? 'partial' : 'published', publish_status: b.publish_status } : prev);
    } catch (e) { setSaveError(String(e)); }
    setPublishing(false);
  }

  if (loading) return <CmsShell><p style={{ color: '#666' }}>Loading…</p></CmsShell>;
  if (!post) return <CmsShell><p style={{ color: '#e05252' }}>Post not found.</p></CmsShell>;

  const typeBtn = (t: ContentType, label: string) => (
    <button type="button" onClick={() => setContentType(t)} style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', background: contentType === t ? 'rgba(175,108,30,0.2)' : 'none', borderColor: contentType === t ? '#af6c1e' : 'rgba(255,255,255,0.1)', color: contentType === t ? '#dba96a' : '#666', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>{label}</button>
  );

  return (
    <CmsShell>
      <h1 style={{ margin: '0 0 28px', fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>Edit Post</h1>
      <form onSubmit={handleSave} style={{ maxWidth: '600px' }}>

        <div style={FIELD}>
          <span style={LABEL}>Publish to</span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PLATFORMS.map(({ key, label }) => {
              const configured = config[key as keyof SocialConfig];
              const selected = platforms.includes(key);
              const ps = publishResult[key];
              return (
                <button key={key} type="button" onClick={() => configured && togglePlatform(key)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid', cursor: configured ? 'pointer' : 'not-allowed', background: selected ? 'rgba(175,108,30,0.2)' : configured ? 'rgba(255,255,255,0.03)' : 'none', borderColor: selected ? '#af6c1e' : configured ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', color: selected ? '#dba96a' : configured ? '#888' : '#333', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', opacity: configured ? 1 : 0.4 }}>
                  {label}
                  {ps && <span style={{ display: 'block', fontSize: '10px', fontFamily: 'Space Mono, monospace', marginTop: '2px', color: ps.status === 'published' ? '#5ecb8a' : ps.status === 'failed' ? '#e05252' : '#888' }}>{ps.status}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div style={FIELD}>
          <span style={LABEL}>Content Type</span>
          <div style={{ display: 'flex', gap: '8px' }}>{typeBtn('post','Post')}{typeBtn('story','Story')}{typeBtn('reel','Reel')}</div>
        </div>

        <div style={FIELD}>
          <span style={LABEL}>Media</span>
          {uploadPreview && <img src={uploadPreview} alt="" style={{ display: 'block', width: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '8px', marginBottom: '10px', background: '#0a0c0f' }} />}
          {!uploadPreview && (mediaUrl || uploadName) && <div style={{ padding: '10px 14px', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#888', fontSize: '13px', marginBottom: '10px' }}>▶ {uploadName || mediaUrl.split('/').pop()}</div>}
          <label style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#999', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {uploading ? 'Uploading…' : mediaUrl ? 'Change Media' : 'Choose File'}
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        <div style={FIELD}>
          <label style={LABEL} htmlFor="caption">Caption <span style={{ color: '#444' }}>({caption.length}/2200)</span></label>
          <textarea id="caption" value={caption} onChange={e => setCaption(e.target.value.slice(0,2200))} rows={5} placeholder="Write your caption…" style={{ ...INPUT, resize: 'vertical', lineHeight: '1.5' }} />
        </div>

        {error && <p style={{ color: '#e05252', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', backgroundColor: '#af6c1e', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/cms/social')} style={{ padding: '10px 24px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#666', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: '16px' }}>Publish</div>

          {Object.keys(publishResult).length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(publishResult).map(([plat, ps]) => (
                <div key={plat} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '13px' }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: '#888', width: '80px', textTransform: 'uppercase' }}>{plat}</span>
                  <span style={{ color: ps.status === 'published' ? '#5ecb8a' : ps.status === 'failed' ? '#e05252' : '#888' }}>
                    {ps.status === 'published' ? `✓ Published${ps.id ? ` (${ps.id})` : ''}` : ps.status === 'failed' ? `✗ ${ps.error}` : ps.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {platforms.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px' }}>Select at least one platform above before publishing.</p>
          ) : (
            <button type="button" onClick={handlePublish} disabled={publishing} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#af6c1e,#d4901a)', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
              {publishing ? 'Publishing…' : post.overall_status === 'published' ? 'Republish' : 'Publish Now'}
            </button>
          )}
        </div>
      </form>
    </CmsShell>
  );
}
