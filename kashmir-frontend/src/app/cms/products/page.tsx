'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  subtitle: string;
  region: string;
  weight: string;
  price: number;
  category: string;
  badge: string | null;
  description: string;
  hue: string;
  img_url: string;
  active: boolean;
  sort_order: number;
}

export default function CmsProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!getCmsToken()) router.replace('/cms');
  }, [router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await cmsApi('/cms/products');
      if (res.ok) {
        setProducts(await res.json());
      } else {
        const body = await res.json().catch(() => ({}));
        setFetchError(`API error ${res.status}: ${body.detail ?? 'unknown'}`);
      }
    } catch (e) {
      setFetchError(String(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function toggleActive(product: Product) {
    await cmsApi(`/cms/products/${encodeURIComponent(product.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !product.active }),
    });
    fetchProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    await cmsApi(`/cms/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    fetchProducts();
    setDeleting(null);
  }

  return (
    <CmsShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
          Products
        </h1>
        <button
          onClick={() => router.push('/cms/products/new')}
          style={{
            padding: '8px 18px',
            backgroundColor: '#af6c1e',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontFamily: 'Space Mono, monospace',
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>Loading…</p>
      ) : fetchError ? (
        <p style={{ color: '#e05252', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>{fetchError}</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>No products yet. Add your first product above.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Product', 'Category', 'Weight', 'Price', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontFamily: 'Space Mono, monospace', fontSize: '9px',
                    letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.img_url ? (
                        <img src={p.img_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '4px', backgroundColor: p.hue, flexShrink: 0, opacity: 0.7 }} />
                      )}
                      <div>
                        <div style={{ color: '#e8e4dc', fontWeight: 500 }}>{p.name}</div>
                        {p.subtitle && <div style={{ color: '#666', fontSize: '11px' }}>{p.subtitle}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: '#888', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '12px', color: '#888' }}>{p.weight}</td>
                  <td style={{ padding: '12px', color: '#dba96a', fontWeight: 500 }}>₹{p.price.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => toggleActive(p)}
                      style={{
                        padding: '3px 10px',
                        border: '1px solid',
                        borderRadius: '12px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        background: p.active ? 'rgba(42,127,79,0.15)' : 'rgba(255,255,255,0.04)',
                        borderColor: p.active ? '#2a7f4f' : 'rgba(255,255,255,0.12)',
                        color: p.active ? '#5ecb8a' : '#666',
                        fontFamily: 'Space Mono, monospace',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {p.active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => router.push(`/cms/products/${encodeURIComponent(p.id)}`)}
                        style={{
                          padding: '4px 12px', background: 'none',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '5px', color: '#999',
                          fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        disabled={deleting === p.id}
                        style={{
                          padding: '4px 12px', background: 'none',
                          border: '1px solid rgba(224,82,82,0.3)',
                          borderRadius: '5px', color: '#e05252',
                          fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        {deleting === p.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CmsShell>
  );
}
