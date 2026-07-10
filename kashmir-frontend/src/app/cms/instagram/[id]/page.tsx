'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

type ContentType = 'post' | 'story' | 'reel';

interface IgPost {
  id: string;
  content_type: ContentType;
  caption: string | null;
  media_url: string | null;
  status: 'draft' | 'published' | 'failed';
  ig_media_id: string | null;
  ig_error: string | null;
  published_at: string | null;
}

const LABEL: React.CSSProperties = { display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' };
const INPUT: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e8e4dc', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', boxSizing: 'border-box' };
const FIELD: React.CSSProperties = { marginBottom: '20px' };

export default function EditInstagramPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<IgPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [igConfigured, setIgConfigured] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!getCmsToken()) { router.replace('/cms'); return; }
    fetch('/api/cms/instagram/config').then(r => r.json()).then(d => setIgConfigured(d.configured));
    cmsApi(`/cms/instagram/${id}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then((p: IgPost) => {
        setPost(p);
        setContentType(p.content_type);
        setCaption(p.caption ?? '');
        setMediaUrl(p.media_url ?? '');
        if (p.media_url && !p.media_url.match(/\.(mp4|mov|m4v)$/i)) setUploadPreview(p.media_url);
        else if (p.media_url) setUploadName(p.media_url.split('/').pop() ?? 'video');
        setLoading(false);
      })
      .catch(() => { setPost(null); setLoading(false); });
  }, [id, router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await cmsApi('/cms/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Upload failed');
      const { url } = await res.json();
      setMediaUrl(url);
      setUploadName(file.name);
      if (file.type.startsWith('image/')) setUploadPreview(url);
      else setUploadPreview('');
    } catch (e) { setError(String(e)); }
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaveError('');
    try {
      const res = await cmsApi(`/cms/instagram/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, caption: caption || null, media_url: mediaUrl || null }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Save failed');
      router.push('/cms/instagram');
    } catch (e) { setSaveError(String(e)); setSaving(false); }
  }

  async function handlePublish() {
    setPublishing(true); setSaveError('');
    try {
      const res = await cmsApi(`/cms/instagram/${id}/publish`, { method: 'POST' });
      const b = await res.json();
      if (!res.ok) throw new Error(b.detail ?? 'Publish failed');
      setPost(prev => prev ? { ...prev, status: 'published', ig_media_id: b.ig_media_id } : prev);
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
      <h1 style={{ margin: '0 0 28px', fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
        Edit Post
      </h1>

      <form onSubmit={handleSave} style={{ maxWidth: '600px' }}>
        {/* Type */}
        <div style={FIELD}>
          <span style={LABEL}>Content Type</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {typeBtn('post', 'Post')}{typeBtn('story', 'Story')}{typeBtn('reel', 'Reel')}
          </div>
        </div>

        {/* Media */}
        <div style={FIELD}>
          <span style={LABEL}>Media</span>
          {uploadPreview && (
            <img src={uploadPreview} alt="preview" style={{ display: 'block', width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', marginBottom: '10px', background: '#0a0c0f' }} />
          )}
          {!uploadPreview && (mediaUrl || uploadName) && (
            <div style={{ padding: '10px 14px', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#888', fontSize: '13px', marginBottom: '10px' }}>
              ▶ {uploadName || mediaUrl.split('/').pop()}
            </div>
          )}
          <label style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#999', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {uploading ? 'Uploading…' : mediaUrl ? 'Change Media' : 'Choose File'}
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        {/* Caption */}
        <div style={FIELD}>
          <label style={LABEL} htmlFor="caption">Caption <span style={{ color: '#444' }}>({caption.length}/2200)</span></label>
          <textarea id="caption" value={caption} onChange={e => setCaption(e.target.value.slice(0, 2200))} rows={5} placeholder="Write your caption…" style={{ ...INPUT, resize: 'vertical', lineHeight: '1.5' }} />
        </div>

        {error && <p style={{ color: '#e05252', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button type="submit" disabled={saving} style={{ padding: '10px 24px', backgroundColor: '#af6c1e', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/cms/instagram')} style={{ padding: '10px 24px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#666', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>

        {/* Publish section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
            Publish to Instagram
          </div>

          {post.status === 'published' ? (
            <div style={{ padding: '12px 16px', background: 'rgba(42,127,79,0.1)', border: '1px solid rgba(42,127,79,0.3)', borderRadius: '8px', color: '#5ecb8a', fontSize: '13px' }}>
              ✓ Published — Instagram ID: <code style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px' }}>{post.ig_media_id}</code>
            </div>
          ) : !igConfigured ? (
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '13px', color: '#555' }}>
              Instagram API not configured. Set <code>INSTAGRAM_ACCESS_TOKEN</code> and <code>INSTAGRAM_BUSINESS_ACCOUNT_ID</code> in <code>kashmir-backend/app/.env</code>, then restart the server.
              <button type="button" disabled style={{ display: 'block', marginTop: '12px', padding: '8px 20px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#444', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'not-allowed' }}>
                Publish to Instagram
              </button>
            </div>
          ) : !mediaUrl ? (
            <p style={{ color: '#666', fontSize: '13px' }}>Upload media before publishing.</p>
          ) : (
            <>
              {post.status === 'failed' && post.ig_error && (
                <div style={{ padding: '10px 14px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)', borderRadius: '6px', color: '#e05252', fontSize: '12px', marginBottom: '12px', fontFamily: 'Space Mono, monospace' }}>
                  Last error: {post.ig_error}
                </div>
              )}
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#af6c1e,#d4901a)', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                {publishing ? 'Publishing…' : post.status === 'failed' ? 'Retry Publish' : 'Publish to Instagram'}
              </button>
            </>
          )}

          {saveError && <p style={{ color: '#e05252', fontSize: '13px', marginTop: '10px' }}>{saveError}</p>}
        </div>
      </form>
    </CmsShell>
  );
}
