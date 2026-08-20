/* global module */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f7f7f5',
          100: '#eceae6',
          200: '#d8d2c8',
          300: '#bcb2a3',
          400: '#958674',
          500: '#6f5f50',
          600: '#56463a',
          700: '#403228',
          800: '#2d231c',
          900: '#1e1712',
        },
        clay: {
          50: '#fff3ec',
          100: '#ffe1d1',
          200: '#ffc29b',
          300: '#f99c64',
          400: '#ef7b3a',
          500: '#d75d1c',
          600: '#b84516',
          700: '#943411',
          800: '#74290d',
          900: '#5b200b',
        },
        forest: {
          50: '#edf7ef',
          100: '#d6ebd9',
          200: '#addeb4',
          300: '#7fc68a',
          400: '#4f9f61',
          500: '#337246',
          600: '#27593a',
          700: '#20472f',
          800: '#1c3926',
          900: '#172f1f',
        },
        sand: '#f4ebdf',
      },
      boxShadow: {
        glow: '0 24px 80px -32px rgba(55, 41, 28, 0.45)',
      },
      backgroundImage: {
        'jh-pattern':
          'radial-gradient(circle at 20% 20%, rgba(239, 123, 58, 0.25) 0, transparent 24%), radial-gradient(circle at 80% 0%, rgba(51, 114, 70, 0.22) 0, transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.8), rgba(244,235,223,0.95))',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Times New Roman', 'serif'],
        body: ['"Plus Jakarta Sans"', 'Trebuchet MS', 'Segoe UI', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Trebuchet MS', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
