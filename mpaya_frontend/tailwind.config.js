/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '380px',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        surface: '#FAFAF8',
        border:  '#EAEAE4',
        ink:     '#1A1A18',
        muted:   '#A8A89C',
        subtle:  '#52524A',
        orange:  '#F97316',
      },
    },
  },
  plugins: [],
}
