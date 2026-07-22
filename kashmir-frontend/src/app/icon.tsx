import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#06080A',
        }}
      >
        <span
          style={{
            color: '#C9901A',
            fontSize: 22,
            fontWeight: 800,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          K
        </span>
      </div>
    ),
    { width: 32, height: 32 },
  );
}
