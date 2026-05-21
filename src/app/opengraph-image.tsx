import { ImageResponse } from 'next/og';

export const alt = 'Haven Residences · Boutique vakantieverhuur op Curaçao';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #f5f0e7 0%, #ebe1cd 60%, #e7eada 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              backgroundColor: '#6f7f4f',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            HR
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: '#6f7f4f',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            marginTop: 56,
            display: 'flex',
          }}
        >
          Welkom bij
        </div>

        <div
          style={{
            fontSize: 104,
            fontWeight: 300,
            color: '#3a4128',
            marginTop: 8,
            lineHeight: 1.05,
            display: 'flex',
          }}
        >
          Haven Residences
        </div>

        <div
          style={{
            fontSize: 34,
            color: '#46502f',
            marginTop: 24,
            maxWidth: 900,
            display: 'flex',
          }}
        >
          Boutique vakantieverhuur op Curaçao
        </div>
      </div>
    ),
    size
  );
}
