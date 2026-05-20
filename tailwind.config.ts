import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f0',
          100: '#e7eada',
          200: '#cfd6b9',
          300: '#b3bd92',
          400: '#94a06d',
          500: '#788450',
          600: '#6f7f4f',
          700: '#566239',
          800: '#46502f',
          900: '#3a4128',
        },
        cream: {
          50: '#fcfaf6',
          100: '#f5f0e7',
          200: '#ebe1cd',
          300: '#dbc8a5',
        },
        forest: {
          DEFAULT: '#4a5a30',
          dark: '#3a4128',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.18em',
      },
    },
  },
  plugins: [],
};

export default config;
