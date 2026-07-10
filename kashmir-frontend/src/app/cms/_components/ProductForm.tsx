'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cmsApi } from '@/lib/api';

const CATEGORIES = ['spice', 'nut', 'fruit', 'tea', 'honey', 'fungi', 'herbs'];

interface ProductData {
  id: string;
  name: string;
  subtitle: string;
  region: string;
  weight: string;
  price: string;
  category: string;
  badge: string;
  description: string;
  hue: string;
  img_url: string;
  active: boolean;
  sort_order: string;
}

interface Props {
  initialData?: Partial<ProductData>;
  onSubmit: (data: ProductData) => Promise<void>;
  submitLabel: string;
}

const EMPTY: ProductData = {
  id: '', name: '', subtitle: '', region: '', weight: '',
  price: '', category: 'spice', badge: '', description: '',
  hue: '#9a1f1a', img_url: '', active: true, sort_order: '0',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#e8e4dc',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Space Mono, monospace',
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#666',
  marginBottom: '6px',
};

export default function ProductForm({ initialData, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>({ ...EMPTY, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(field: keyof ProductData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await cmsApi('/cms/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const { url } = await res.json();
      set('img_url', url);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '640px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Product ID *</label>
          <input style={inputStyle} value={form.id} onChange={e => set('id', e.target.value)}
            placeholder="e.g. saffron-1g" required />
          <span style={{ fontSize: '10px', color: '#555' }}>Slug used as database key — no spaces</span>
        </div>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Pampore Saffron" required />
        </div>
        <div>
          <label style={labelStyle}>Subtitle</label>
          <input style={inputStyle} value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
            placeholder="Grade A · Mongra threads" />
        </div>
        <div>
          <label style={labelStyle}>Region</label>
          <input style={inputStyle} value={form.region} onChange={e => set('region', e.target.value)}
            placeholder="Pampore, South Kashmir" />
        </div>
        <div>
          <label style={labelStyle}>Weight / Size</label>
          <input style={inputStyle} value={form.weight} onChange={e => set('weight', e.target.value)}
            placeholder="1 g" />
        </div>
        <div>
          <label style={labelStyle}>Price (₹) *</label>
          <input style={inputStyle} type="number" min="0" value={form.price}
            onChange={e => set('price', e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Category *</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            required
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Badge</label>
          <input style={inputStyle} value={form.badge} onChange={e => set('badge', e.target.value)}
            placeholder="GI Tagged" />
        </div>
        <div>
          <label style={labelStyle}>Sort Order</label>
          <input style={inputStyle} type="number" value={form.sort_order}
            onChange={e => set('sort_order', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Hue (fallback colour)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="color" value={form.hue} onChange={e => set('hue', e.target.value)}
              style={{ width: 36, height: 36, padding: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, backgroundColor: 'transparent', cursor: 'pointer' }} />
            <input style={{ ...inputStyle, flex: 1 }} value={form.hue} onChange={e => set('hue', e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Rich description of the product origin, taste, and use…"
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Product Image</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div>
            {form.img_url ? (
              <img src={form.img_url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: '6px', backgroundColor: form.hue, opacity: 0.4, border: '1px solid rgba(255,255,255,0.08)' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <input style={inputStyle} value={form.img_url} onChange={e => set('img_url', e.target.value)}
              placeholder="https://… or upload below" />
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: '6px 14px', background: 'none',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '5px', color: '#999',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer',
                }}
              >
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
              <span style={{ fontSize: '11px', color: '#555' }}>JPG, PNG, WebP — max 5 MB</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id="active"
          checked={form.active}
          onChange={e => set('active', e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer' }}
        />
        <label htmlFor="active" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#aaa', cursor: 'pointer' }}>
          Active (visible in shop)
        </label>
      </div>

      {error && <p style={{ color: '#e05252', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '10px 24px',
            backgroundColor: saving ? 'rgba(175,108,30,0.5)' : '#af6c1e',
            border: 'none', borderRadius: '6px', color: '#fff',
            fontFamily: 'Space Mono, monospace', fontSize: '10px',
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push('/cms/products')}
          style={{
            padding: '10px 20px', background: 'none',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#777',
            fontFamily: 'DM Sans, sans-serif', fontSize: '13px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
