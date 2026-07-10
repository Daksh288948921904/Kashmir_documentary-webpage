'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

type ContentType = 'post' | 'story' | 'reel';

const LABEL: React.CSSProperties = { display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' };
const INPUT: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e8e4dc', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', boxSizing: 'border-box' };
const FIELD: React.CSSProperties = { marginBottom: '20px' };

export default function NewInstagramPostPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>('post');
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!getCmsToken()) { router.replace('/cms'); return null; }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await cmsApi('/cms/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, caption: caption || null, media_url: mediaUrl || null }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? 'Save failed');
      router.push('/cms/instagram');
    } catch (e) { setError(String(e)); setSaving(false); }
  }

  const typeBtn = (t: ContentType, label: string) => (
    <button
      type="button"
      onClick={() => setContentType(t)}
      style={{
        padding: '8px 20px', borderRadius: '20px', border: '1px solid', cursor: 'pointer',
        background: contentType === t ? 'rgba(175,108,30,0.2)' : 'none',
        borderColor: contentType === t ? '#af6c1e' : 'rgba(255,255,255,0.1)',
        color: contentType === t ? '#dba96a' : '#666',
        fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
      }}
    >{label}</button>
  );

  return (
    <CmsShell>
      <h1 style={{ margin: '0 0 28px', fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
        New Instagram Post
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        {/* Type */}
        <div style={FIELD}>
          <span style={LABEL}>Content Type</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {typeBtn('post', 'Post')}
            {typeBtn('story', 'Story')}
            {typeBtn('reel', 'Reel')}
          </div>
        </div>

        {/* Media upload */}
        <div style={FIELD}>
          <span style={LABEL}>Media {contentType === 'reel' ? '(Video)' : contentType === 'story' ? '(Image or Video)' : '(Image)'}</span>
          {uploadPreview && (
            <img src={uploadPreview} alt="preview" style={{ display: 'block', width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', marginBottom: '10px', background: '#0a0c0f' }} />
          )}
          {!uploadPreview && uploadName && (
            <div style={{ padding: '10px 14px', background: '#0a0c0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#888', fontSize: '13px', marginBottom: '10px' }}>
              ▶ {uploadName}
            </div>
          )}
          <label style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#999', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {uploading ? 'Uploading…' : mediaUrl ? 'Change Media' : 'Choose File'}
            <input type="file" accept={contentType === 'reel' ? 'video/*' : 'image/*,video/*'} onChange={handleFileChange} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        {/* Caption */}
        <div style={FIELD}>
          <label style={LABEL} htmlFor="caption">
            Caption <span style={{ color: '#444' }}>({caption.length}/2200)</span>
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={e => setCaption(e.target.value.slice(0, 2200))}
            rows={5}
            placeholder="Write your caption…"
            style={{ ...INPUT, resize: 'vertical', lineHeight: '1.5' }}
          />
        </div>

        {error && <p style={{ color: '#e05252', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 24px', backgroundColor: '#af6c1e', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/cms/instagram')}
            style={{ padding: '10px 24px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#666', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </CmsShell>
  );
}
