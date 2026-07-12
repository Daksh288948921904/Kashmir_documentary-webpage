'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../../_components/CmsShell';
import ProductForm from '../../_components/ProductForm';
import { cmsApi, getCmsToken } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getCmsToken()) router.replace('/cms');
  }, [router]);

  async function handleSubmit(form: Parameters<typeof ProductForm>[0]['initialData'] & { id: string; name: string; price: string; category: string; sort_order: string }) {
    const res = await cmsApi('/cms/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price as string),
        sort_order: parseInt(form.sort_order as string, 10),
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? 'Failed to create product');
    }
    router.push('/cms/products');
  }

  return (
    <CmsShell>
      <h1 style={{ margin: '0 0 24px', fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
        Add Product
      </h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" />
    </CmsShell>
  );
}
