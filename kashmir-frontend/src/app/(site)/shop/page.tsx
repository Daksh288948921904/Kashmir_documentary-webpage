'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SHOP_CATEGORIES } from '@/content/products';
import type { Product } from '@/content/products';
import { CONFIG } from '@/lib/config';

const API = `${CONFIG.api.baseUrl}${CONFIG.api.prefix}`;

type CartItem = Product & { qty: number };
type CheckoutForm = { name: string; email: string; phone: string; address: string };

export default function ShopPage() {
  const router = useRouter();
  const [filter, setFilter]           = useState('all');
  const [products, setProducts]       = useState<Product[]>([]);
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]       = useState(false);
  const [checkoutOpen, setCheckout]   = useState(false);
  const [ordered, setOrdered]         = useState(false);
  const [form, setForm]               = useState<CheckoutForm>({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then((data: (Omit<Product, 'desc' | 'img'> & { description: string; img_url: string })[]) => {
        setProducts(data.map(p => ({ ...p, desc: p.description, img: p.img_url })));
      })
      .catch(console.error);
  }, []);

  const filtered   = filter === 'all' ? products : products.filter((p: Product) => p.category === filter);
  const itemCount  = cart.reduce((s, i) => s + i.qty, 0);
  const total      = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const isFormValid = !!(
    form.name.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim().length >= 8 &&
    form.address.trim().length > 8
  );

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
          .filter(i => i.qty > 0)
    );
  }, []);

  const [orderError, setOrderError] = useState('');

  const placeOrder = async () => {
    if (!isFormValid) return;
    setOrderError('');
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        delivery_address: form.address,
        items: cart.map(i => ({ id: i.id, name: i.name, weight: i.weight, price: i.price, qty: i.qty })),
        total,
      }),
    });
    if (!res.ok) {
      setOrderError('Could not place order. Please try again.');
      return;
    }
    setCheckout(false);
    setOrdered(true);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px', backgroundColor: 'var(--color-deep-slate)', position: 'relative', zIndex: 1 }}>

      {/* ── Shop sub-header ─────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: '72px', zIndex: 50,
        backgroundColor: 'rgba(10,12,15,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 clamp(1rem, 4vw, 2.5rem)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '56px',
      }}>
        <button
          onClick={() => router.push('/')}
          data-cursor-hover
          style={{
            background: 'none', border: 'none', cursor: 'none',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--color-ash-text)',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-snow)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ash-text)')}
        >
          ← Back to the Film
        </button>

        <div style={{ textAlign: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-snow)', letterSpacing: '0.02em' }}>
            Kashmir Harvest
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-ash-text)', marginTop: '2px' }}>
            Direct from the Valley
          </div>
        </div>

        <button
          onClick={() => setCartOpen(true)}
          data-cursor-hover
          style={{
            position: 'relative', background: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', padding: '6px 14px',
            color: 'var(--color-snow)', cursor: 'none',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            transition: 'border-color 200ms, color 200ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-saffron-border)'; e.currentTarget.style.color = 'var(--color-saffron)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--color-snow)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <line x1="3" x2="21" y1="6" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Cart
          {itemCount > 0 && (
            <span style={{
              position: 'absolute', top: '-7px', right: '-7px',
              backgroundColor: 'var(--color-saffron)', color: '#000',
              fontSize: '9px', fontWeight: 700,
              width: '17px', height: '17px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(3.5rem, 8vw, 7rem) clamp(1rem, 4vw, 2.5rem)',
        maxWidth: '860px', margin: '0 auto', textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-4)' }}>
          Kashmir Harvest · Est. MMXXVI
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          color: 'var(--color-snow)', lineHeight: 1.15,
          marginBottom: 'var(--space-6)',
        }}>
          From the Valley,<br /><em>to your table.</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
          color: 'var(--color-snow-dim)', lineHeight: 1.85,
          maxWidth: '560px', margin: '0 auto var(--space-8)',
        }}>
          Saffron from Pampore. Walnuts from Kupwara. Gucchi from the Pir Panjal.
          Every product is sourced direct from small growers — no middlemen, no blending.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
          {['GI-certified saffron', 'Wild-foraged fungi', 'Heritage apples', 'Artisan teas', 'Raw honey'].map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              border: '1px solid rgba(212,160,23,0.28)',
              color: 'var(--color-saffron)',
              padding: '4px 10px', borderRadius: '4px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Category filter bar ─────────────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflowX: 'auto',
      }}>
        <div style={{
          display: 'flex', gap: 'var(--space-1)',
          padding: 'var(--space-3) clamp(1rem, 4vw, 2.5rem)',
          maxWidth: '1280px', margin: '0 auto',
        }}>
          {SHOP_CATEGORIES.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              data-cursor-hover
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '6px 14px', borderRadius: '4px',
                border: 'none', whiteSpace: 'nowrap', cursor: 'none',
                backgroundColor: filter === key ? 'var(--color-saffron)' : 'rgba(255,255,255,0.05)',
                color: filter === key ? '#000' : 'var(--color-ash-text)',
                transition: 'background-color 200ms, color 200ms',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product grid ────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: 'var(--space-12) clamp(1rem, 4vw, 2.5rem)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 'var(--space-5)',
        }}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onAdd={addToCart} />
          ))}
        </div>

        <div style={{
          marginTop: 'var(--space-16)', paddingTop: 'var(--space-8)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--color-ash-text)', lineHeight: 1.85,
            maxWidth: '580px', margin: '0 auto',
          }}>
            All produce is sourced directly from registered growers in Jammu &amp; Kashmir and Ladakh.
            GI-tagged products are certified by the Geographical Indications Registry, India.
            Delivery across India in 3–6 business days.
          </p>
        </div>
      </div>

      {/* ── Cart drawer ─────────────────────────────────────── */}
      <CartDrawer
        cart={cart} open={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        total={total}
        onCheckout={() => { setCartOpen(false); setCheckout(true); }}
      />

      {/* ── Checkout modal ──────────────────────────────────── */}
      {checkoutOpen && !ordered && (
        <CheckoutModal
          form={form} setForm={setForm}
          total={total} cart={cart}
          isFormValid={isFormValid}
          onClose={() => setCheckout(false)}
          onPlace={placeOrder}
          error={orderError}
        />
      )}

      {/* ── Order success ───────────────────────────────────── */}
      {ordered && (
        <OrderSuccess
          onClose={() => {
            setOrdered(false);
            setCart([]);
            setForm({ name: '', email: '', phone: '', address: '' });
            router.push('/');
          }}
        />
      )}
    </div>
  );
}

/* ─── ProductCard ──────────────────────────────────────────────────────────── */

function ProductCard({ product: p, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const [added, setAdded]         = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleAdd = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      style={{
        backgroundColor: 'var(--color-deep-slate-mid)',
        border: 'var(--border-dim)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 300ms var(--ease-decisive), box-shadow 300ms var(--ease-settle), border-color 300ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
        e.currentTarget.style.borderColor = 'var(--color-saffron-border)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-ash-dim)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: p.hue + '1a' }}>
        {p.img && !imgFailed ? (
          <Image
            src={p.img}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
            style={{ objectFit: 'cover', filter: 'brightness(0.72) saturate(0.65)' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <ProductIconFallback category={p.category} hue={p.hue} />
        )}
        {p.badge && (
          <span style={{
            position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)',
            fontFamily: 'var(--font-mono)', fontSize: '8px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            color: 'var(--color-saffron)',
            padding: '3px 8px', borderRadius: '3px',
            border: '1px solid rgba(212,160,23,0.3)',
          }}>
            {p.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-ash-text)', marginBottom: 'var(--space-2)' }}>
          {p.region}
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.15rem', color: 'var(--color-snow)', lineHeight: 1.25, marginBottom: '4px' }}>
          {p.name}
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-3)' }}>
          {p.subtitle}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-snow-dim)', lineHeight: 1.7, flex: 1 }}>
          {p.desc}
        </p>

        {/* Price + Add */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ash-text)' }}>
              {p.weight}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-snow)', marginTop: '3px' }}>
              ₹{p.price.toLocaleString()}
            </div>
          </div>
          <button
            onClick={handleAdd}
            data-cursor-hover
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '8px 16px', borderRadius: '4px', cursor: 'none',
              border: added ? 'none' : '1px solid rgba(212,160,23,0.45)',
              backgroundColor: added ? 'var(--color-saffron)' : 'transparent',
              color: added ? '#000' : 'var(--color-saffron)',
              fontWeight: added ? 700 : 400,
              transition: 'all 200ms var(--ease-decisive)',
            }}
          >
            {added ? 'Added ✓' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductIconFallback({ category, hue }: { category: string; hue: string }) {
  const icons: Record<string, string> = {
    spice: '🌶️', nut: '🥜', fruit: '🍎', tea: '🍵',
    honey: '🍯', fungi: '🍄', herbs: '🌿',
  };
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2.8rem', backgroundColor: hue + '18',
    }}>
      {icons[category] ?? '🌿'}
    </div>
  );
}

/* ─── CartDrawer ───────────────────────────────────────────────────────────── */

function CartDrawer({ cart, open, onClose, onUpdateQty, total, onCheckout }: {
  cart: CartItem[]; open: boolean; onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  total: number; onCheckout: () => void;
}) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
          }}
        />
      )}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '380px', maxWidth: '95vw',
        backgroundColor: 'rgba(12,15,20,0.98)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 201,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 360ms var(--ease-decisive)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Head */}
        <div style={{
          padding: 'var(--space-5) var(--space-6)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.3rem', color: 'var(--color-snow)' }}>
            Your Cart
          </h2>
          <button
            onClick={onClose} data-cursor-hover
            style={{ background: 'none', border: 'none', color: 'var(--color-ash-text)', fontSize: '1.5rem', cursor: 'none', lineHeight: 1, padding: '4px' }}
          >
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-10)', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow-dim)', fontSize: '1.05rem' }}>Your cart is empty.</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-ash-text)', marginTop: 'var(--space-3)' }}>
              Add products from the harvest below.
            </p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-6)' }}>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-4) 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-snow)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ash-text)', marginTop: '3px' }}>
                      {item.weight}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={() => onUpdateQty(item.id, -1)} data-cursor-hover style={{ width: '26px', height: '26px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'none', color: 'var(--color-snow)', cursor: 'none', fontSize: '14px' }}>−</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-snow)', minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, +1)} data-cursor-hover style={{ width: '26px', height: '26px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'none', color: 'var(--color-snow)', cursor: 'none', fontSize: '14px' }}>+</button>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)', fontSize: '0.95rem', minWidth: '62px', textAlign: 'right' }}>
                    ₹{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-snow-dim)' }}>Subtotal</span>
                <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)', fontSize: '1.15rem' }}>₹{total.toLocaleString()}</strong>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-ash-text)', marginBottom: 'var(--space-4)' }}>
                Shipping calculated at checkout · Free above ₹999
              </p>
              <button
                onClick={onCheckout} data-cursor-hover
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Proceed to Order →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ─── CheckoutModal ────────────────────────────────────────────────────────── */

function CheckoutModal({ form, setForm, total, cart, isFormValid, onClose, onPlace, error }: {
  form: CheckoutForm;
  setForm: React.Dispatch<React.SetStateAction<CheckoutForm>>;
  total: number; cart: CartItem[];
  isFormValid: boolean;
  onClose: () => void; onPlace: () => void;
  error?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (key: keyof CheckoutForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', padding: '10px 14px',
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
    color: 'var(--color-snow)', outline: 'none',
    transition: 'border-color 200ms',
    boxSizing: 'border-box',
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        backgroundColor: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div style={{
        backgroundColor: 'rgba(12,15,20,0.98)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
        padding: 'clamp(1.5rem,4vw,2.5rem)',
        width: '100%', maxWidth: '700px',
        maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose} data-cursor-hover
          style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-5)', background: 'none', border: 'none', color: 'var(--color-ash-text)', fontSize: '1.5rem', cursor: 'none', lineHeight: 1 }}
        >
          ×
        </button>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-2)' }}>
          Kashmir Harvest · Order
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--color-snow)', marginBottom: 'var(--space-6)' }}>
          Delivery details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <input style={inputStyle} placeholder="Full name" value={form.name} onChange={set('name')} />
            <input style={inputStyle} placeholder="Email address" type="email" value={form.email} onChange={set('email')} />
            <input style={inputStyle} placeholder="Phone number" type="tel" value={form.phone} onChange={set('phone')} />
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              placeholder="Delivery address (with PIN code)"
              value={form.address} onChange={set('address')} rows={3}
            />
          </div>

          {/* Order summary */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: '8px', padding: 'var(--space-4)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-saffron)', marginBottom: 'var(--space-4)' }}>
              Order Summary
            </p>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-snow-dim)' }}>
                  {item.name} × {item.qty}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-snow)', whiteSpace: 'nowrap' }}>
                  ₹{(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-snow)' }}>Total</span>
              <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)', fontSize: '1.1rem' }}>₹{total.toLocaleString()}</strong>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-ash-text)', marginTop: 'var(--space-3)', lineHeight: 1.65 }}>
              Free shipping above ₹999 · 3–6 business days · Cash on delivery available
            </p>
          </div>
        </div>

        <button
          onClick={onPlace} disabled={!isFormValid} data-cursor-hover
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-6)', opacity: isFormValid ? 1 : 0.38 }}
        >
          Place Order →
        </button>
        {error && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: '#e05252', textAlign: 'center', marginTop: 'var(--space-3)' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── OrderSuccess ─────────────────────────────────────────────────────────── */

function OrderSuccess({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      backgroundColor: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        backgroundColor: 'rgba(12,15,20,0.98)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-md)',
        padding: 'clamp(2.5rem,6vw,4rem) clamp(1.5rem,4vw,3rem)',
        maxWidth: '460px', width: '100%', textAlign: 'center',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          border: '1.5px solid var(--color-saffron)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          color: 'var(--color-saffron)', fontSize: '1.3rem',
        }}>
          ✓
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.6rem,3vw,2.1rem)', color: 'var(--color-snow)', marginBottom: 'var(--space-4)' }}>
          Order placed
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-snow-dim)', lineHeight: 1.75, marginBottom: 'var(--space-3)' }}>
          Thank you — your order from Kashmir is confirmed. You will receive an email with tracking details within 24 hours.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-ash-text)', marginBottom: 'var(--space-8)' }}>
          Delivery in 3–6 business days. For queries, contact harvest@kashmir-untoldechoes.in
        </p>
        <button
          onClick={onClose} data-cursor-hover
          className="btn btn-primary"
          style={{ margin: '0 auto' }}
        >
          Back to the Film
        </button>
      </div>
    </div>
  );
}
