import type { Metadata } from 'next';
import CmsGuard from './_components/CmsGuard';

export const metadata: Metadata = {
  title: 'Kashmir Harvest — CMS',
  robots: 'noindex,nofollow',
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Restore default cursors within the CMS subtree only.
          Scoped to [data-cms-root] so these rules never affect html/body
          and cannot re-introduce the overflow:auto scroll-container bug. */}
      <style>{`
        [data-cms-root], [data-cms-root] * { cursor: auto !important; }
        [data-cms-root] button,
        [data-cms-root] a,
        [data-cms-root] select,
        [data-cms-root] input,
        [data-cms-root] textarea,
        [data-cms-root] [role="button"],
        [data-cms-root] input[type="color"] { cursor: pointer !important; }
      `}</style>
      <div
        data-cms-root
        style={{
          minHeight: '100vh',
          backgroundColor: '#0d0f12',
          color: '#e8e4dc',
          fontFamily: 'DM Sans, system-ui, sans-serif',
        }}
      >
        <CmsGuard>{children}</CmsGuard>
      </div>
    </>
  );
}
