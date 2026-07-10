'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../../_components/CmsShell';
import ProductForm from '../../_components/ProductForm';
import { cmsApi, getCmsToken } from '@/lib/api';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCmsToken()) { router.replace('/cms'); return; }
    cmsApi(`/cms/products/${encodeURIComponent(id)}`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((p: Record<string, unknown>) => {
        setProduct(p);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [id, router]);

  async function handleSubmit(form: Parameters<typeof ProductForm>[0]['initialData'] & { id: string; name: string; price: string; category: string; sort_order: string }) {
    const res = await cmsApi(`/cms/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price as string),
        sort_order: parseInt(form.sort_order as string, 10),
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? 'Failed to update product');
    }
    router.push('/cms/products');
  }

  if (loading) {
    return <CmsShell><p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>Loading…</p></CmsShell>;
  }

  if (!product) {
    return <CmsShell><p style={{ color: '#e05252', fontFamily: 'DM Sans, sans-serif' }}>Product not found.</p></CmsShell>;
  }

  const initialData = {
    ...product,
    price: String(product.price),
    sort_order: String(product.sort_order ?? 0),
    badge: (product.badge as string | null) ?? '',
  } as Parameters<typeof ProductForm>[0]['initialData'];

  return (
    <CmsShell>
      <h1 style={{ margin: '0 0 24px', fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
        Edit Product
      </h1>
      <ProductForm initialData={initialData} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </CmsShell>
  );
}
