/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { yellow: 'theme(colors.brand-yellow)' },
        ink: 'theme(colors.ink)',
        gray: {
          50: 'theme(colors.gray-50)',
          100: 'theme(colors.gray-100)',
          300: 'theme(colors.gray-300)',
        },
        sky: { 500: 'theme(colors.sky-500)' },
        rose: { 500: 'theme(colors.rose-500)' },
        emerald: { 500: 'theme(colors.emerald-500)' },
      },
      spacing: {
        xs: 'theme(spacing.xs)',
        sm: 'theme(spacing.sm)',
        md: 'theme(spacing.md)',
        lg: 'theme(spacing.lg)',
        xl: 'theme(spacing.xl)',
      },
      fontFamily: {
        sans: 'theme(fontFamily.sans)',
        mono: 'theme(fontFamily.mono)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};