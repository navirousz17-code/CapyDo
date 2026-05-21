/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fefdf8',
          100: '#fdf9ed',
          200: '#faf2d3',
          300: '#f5e6aa',
          400: '#eed47a',
          500: '#e5c04f',
        },
        bark: {
          50: '#f7f0e8',
          100: '#edddc8',
          200: '#d9b98f',
          300: '#c4965a',
          400: '#a67640',
          500: '#7d5a30',
          600: '#5c4022',
          700: '#3d2a14',
        },
        moss: {
          50: '#f0f7ee',
          100: '#dceeda',
          200: '#b3d9ae',
          300: '#82bf7b',
          400: '#5aa352',
          500: '#3d7e37',
          600: '#2c5f28',
        },
        parchment: '#f5edd6',
        amber: {
          50: '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'leaf-fall': 'leafFall 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        leafFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(125, 90, 48, 0.1)',
        'bark': '0 4px 20px rgba(125, 90, 48, 0.25)',
        'glow': '0 0 30px rgba(229, 192, 79, 0.3)',
      },
    },
  },
  plugins: [],
};
