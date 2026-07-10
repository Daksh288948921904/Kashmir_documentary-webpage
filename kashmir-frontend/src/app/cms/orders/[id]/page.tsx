'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../../_components/CmsShell';
import { cmsApi, getCmsToken } from '@/lib/api';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  items: { id: string; name: string; weight: string; price: number; qty: number }[];
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_OPTS = ['new', 'contacted', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!getCmsToken()) { router.replace('/cms'); return; }
    cmsApi(`/cms/orders/${id}`)
      .then(r => r.json())
      .then(data => {
        setOrder(data);
        setNotes(data.notes ?? '');
        setLoading(false);
      });
  }, [id, router]);

  async function updateStatus(status: string) {
    setSaving(true);
    const res = await cmsApi(`/cms/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setOrder(await res.json());
    setSaving(false);
  }

  async function saveNotes() {
    setSaving(true);
    const res = await cmsApi(`/cms/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) setOrder(await res.json());
    setSaving(false);
  }

  if (loading) return <CmsShell><p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>Loading…</p></CmsShell>;
  if (!order) return <CmsShell><p style={{ color: '#e05252', fontFamily: 'DM Sans, sans-serif' }}>Order not found.</p></CmsShell>;

  return (
    <CmsShell>
      <button
        onClick={() => router.push('/cms/orders')}
        style={{
          background: 'none', border: 'none', color: '#666',
          fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
          cursor: 'pointer', padding: 0, marginBottom: '20px', display: 'block',
        }}
      >
        ← Back to Orders
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span style={{ fontSize: '12px', color: '#777', fontFamily: 'DM Sans, sans-serif' }}>
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px' }}>
        <div style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', fontWeight: 400 }}>
            Customer
          </h3>
          <InfoRow label="Name" value={order.customer_name} />
          <InfoRow label="Email" value={order.customer_email} />
          <InfoRow label="Phone" value={order.customer_phone} />
          <InfoRow label="Address" value={order.delivery_address} />
        </div>

        <div style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', fontWeight: 400 }}>
            Status
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {STATUS_OPTS.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                disabled={saving || order.status === s}
                style={{
                  padding: '6px 14px', borderRadius: '5px',
                  fontFamily: 'Space Mono, monospace', fontSize: '9px',
                  letterSpacing: '0.1em', textTransform: 'capitalize', cursor: 'pointer',
                  border: order.status === s ? '1px solid #af6c1e' : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: order.status === s ? 'rgba(175,108,30,0.2)' : 'transparent',
                  color: order.status === s ? '#dba96a' : '#666',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
              Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes…"
              style={{
                width: '100%', padding: '8px 10px', boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', color: '#e8e4dc',
                fontFamily: 'DM Sans, sans-serif', fontSize: '12px', resize: 'vertical', outline: 'none',
              }}
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              style={{
                marginTop: '8px', padding: '6px 16px', background: 'none',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px',
                color: '#888', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save notes'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', maxWidth: '800px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 16px', fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', fontWeight: 400 }}>
          Items
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Product', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                <th key={h} style={{ padding: '6px 0', textAlign: 'left', fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 0' }}>
                  <div style={{ color: '#e8e4dc' }}>{item.name}</div>
                  {item.weight && <div style={{ color: '#666', fontSize: '11px' }}>{item.weight}</div>}
                </td>
                <td style={{ padding: '10px 0', color: '#888' }}>{item.qty}</td>
                <td style={{ padding: '10px 0', color: '#888' }}>₹{item.price.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px 0', color: '#dba96a', fontWeight: 500 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ padding: '12px 0 0', fontWeight: 600, color: '#e8e4dc', fontFamily: 'Space Mono, monospace', fontSize: '11px', letterSpacing: '0.1em' }}>TOTAL</td>
              <td style={{ padding: '12px 0 0', fontWeight: 700, color: '#dba96a', fontSize: '15px' }}>₹{Number(order.total).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CmsShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>
        {label}
      </span>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#ccc', marginTop: '2px' }}>
        {value}
      </div>
    </div>
  );
}
