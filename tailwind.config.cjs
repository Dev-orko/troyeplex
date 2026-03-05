module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          black:   '#0a0a0a',
          dark:    '#141414',
          card:    '#1c1c1c',
          elevated:'#252525',
          border:  '#2a2a2a',
          red:     '#e50914',
          'red-hover': '#f40612',
          'red-dim':   'rgba(229,9,20,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(to bottom, transparent, #141414)',
        'hero-overlay':    'linear-gradient(to right, #0a0a0a 35%, transparent)',
      },
      boxShadow: {
        'cinema-card': '0 20px 60px rgba(0,0,0,0.8)',
        'cinema-glow': '0 0 40px rgba(229,9,20,0.3)',
      },
      animation: {
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'scale-in':   'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.92)' },
          'to':   { opacity: '1', transform: 'scale(1)' },
        },
      },
      screens: {
        'xs': '390px',
      },
    },
  },
  plugins: [],
}
