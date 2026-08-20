/* global module */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary text colour: deep forest-charcoal (NOT pure black)
        ink: {
          50:  '#F7F3EA', // primary page background — warm ivory paper
          100: '#EFE9D8', // subtle warm section alternate
          200: '#DDD3C0', // warm border
          300: '#BFB09A',
          400: '#8A7A65',
          500: '#6B5C4A', // muted secondary text (still readable)
          600: '#4F4033', // medium dark body text
          700: '#3A2F25', // strong body text
          800: '#2D231A',
          900: '#27342C', // PRIMARY TEXT: deep forest-charcoal
          950: '#161D19',
        },
        clay: {
          50:  '#FFF5EE',
          100: '#FFE5D4',
          200: '#FFC7A3',
          300: '#F89E69',
          400: '#E8732E',
          500: '#CF5615',
          600: '#AB3F0B',
          700: '#8C3108',
          800: '#6E2505',
          900: '#521B03',
        },
        forest: {
          50:  '#EDF5F0',
          100: '#D3E9DA',
          200: '#A8D3B6',
          300: '#72B68A',
          400: '#3F9260',
          500: '#297048',
          600: '#1F5537',
          700: '#174029',
          800: '#102E1D',
          900: '#0C2016', // deep forest green — primary CTA
          950: '#071410',
        },
        // Semantic pastel section backgrounds
        sage: {
          50:  '#F1F5EE', // very pale sage — section alternate
          100: '#E2EBD9',
          200: '#C5D7B5',
        },
        warmclay: {
          50:  '#F8F1EA', // very pale clay — section alternate
          100: '#EFE0CC',
        },
        // Aliases
        sand:   '#EFE9D8',
        ivory:  '#F7F3EA',
        cream:  '#FFFDF8',
        surface: {
          DEFAULT: '#FFFDF8',
          warm:    '#F5EFE2',
          subtle:  '#F1EDE4',
        },
      },
      boxShadow: {
        glow:        '0 24px 80px -32px rgba(39, 52, 44, 0.20)',
        card:        '0 8px 24px -12px rgba(39, 52, 44, 0.08)',
        'card-hover':'0 16px 32px -12px rgba(39, 52, 44, 0.12)',
        xs:          '0 1px 4px rgba(39, 52, 44, 0.06)',
      },
      backgroundImage: {
        'jh-pattern':
          'radial-gradient(circle at 20% 20%, rgba(171, 63, 11, 0.06) 0, transparent 24%), radial-gradient(circle at 80% 0%, rgba(41, 112, 72, 0.06) 0, transparent 28%), linear-gradient(135deg, #F7F3EA, #EFE9D8)',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Times New Roman', 'serif'],
        body:    ['"Plus Jakarta Sans"', 'Trebuchet MS', 'Segoe UI', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'Trebuchet MS', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
