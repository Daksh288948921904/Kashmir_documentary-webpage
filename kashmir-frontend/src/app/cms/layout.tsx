import type { Metadata } from 'next';
import CmsGuard from './_components/CmsGuard';

export const metadata: Metadata = {
  title: 'Kashmir Harvest — CMS',
  robots: 'noindex,nofollow',
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Override the film site's cursor:none and scroll lock */}
      <style>{`
        html, body { cursor: auto !important; overflow: auto !important; }
        * { cursor: auto !important; }
        button, a, select, input, textarea, [role="button"] { cursor: pointer !important; }
        input[type="color"] { cursor: pointer !important; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0d0f12',
        color: '#e8e4dc',
        fontFamily: 'DM Sans, system-ui, sans-serif',
      }}>
        <CmsGuard>{children}</CmsGuard>
      </div>
    </>
  );
}
