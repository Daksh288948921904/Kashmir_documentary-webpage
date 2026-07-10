'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CmsShell from '../_components/CmsShell';
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
  created_at: string;
}

const STATUS_OPTS = ['all', 'new', 'contacted', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  new:       { color: '#dba96a', bg: 'rgba(219,169,106,0.15)' },
  contacted: { color: '#6ab4db', bg: 'rgba(106,180,219,0.15)' },
  confirmed: { color: '#5ecb8a', bg: 'rgba(94,203,138,0.15)' },
  shipped:   { color: '#a87ce0', bg: 'rgba(168,124,224,0.15)' },
  delivered: { color: '#5ecb8a', bg: 'rgba(94,203,138,0.1)' },
  cancelled: { color: '#888',    bg: 'rgba(255,255,255,0.05)' },
};

export default function CmsOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCmsToken()) router.replace('/cms');
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (status !== 'all') params.set('status', status);
    const res = await cmsApi(`/cms/orders?${params}`);
    if (res.ok) {
      const json = await res.json();
      setOrders(json.orders ?? []);
      setTotal(json.total ?? 0);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <CmsShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'Playfair Display, serif', fontWeight: 400, color: '#e8e4dc' }}>
          Orders {total > 0 && <span style={{ fontSize: '0.85rem', color: '#666' }}>({total})</span>}
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {STATUS_OPTS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '5px 14px',
              border: '1px solid',
              borderRadius: '20px',
              fontSize: '11px',
              fontFamily: 'Space Mono, monospace',
              letterSpacing: '0.08em',
              textTransform: 'capitalize',
              cursor: 'pointer',
              borderColor: status === s ? '#af6c1e' : 'rgba(255,255,255,0.1)',
              backgroundColor: status === s ? 'rgba(175,108,30,0.15)' : 'transparent',
              color: status === s ? '#dba96a' : '#666',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>Loading…</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>No orders yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Date', 'Customer', 'Items', 'Total', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontFamily: 'Space Mono, monospace', fontSize: '9px',
                    letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const style = STATUS_STYLE[o.status] ?? { color: '#888', bg: 'rgba(255,255,255,0.05)' };
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px', color: '#777', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {formatDate(o.created_at)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ color: '#e8e4dc', fontWeight: 500 }}>{o.customer_name}</div>
                      <div style={{ color: '#666', fontSize: '11px' }}>{o.customer_phone}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#888' }}>
                      {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '12px', color: '#dba96a', fontWeight: 500 }}>
                      ₹{Number(o.total).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                        fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em',
                        color: style.color, backgroundColor: style.bg, textTransform: 'capitalize',
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => router.push(`/cms/orders/${o.id}`)}
                        style={{
                          padding: '4px 12px', background: 'none',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '5px', color: '#999',
                          fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CmsShell>
  );
}
