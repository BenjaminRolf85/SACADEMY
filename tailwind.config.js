/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sebastian Bunde Brand Colors
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#67809a',
          600: '#52687a',
          700: '#344968', // Main brand navy #344968
          800: '#2d3748',
          900: '#1a202c',
        },
        secondary: {
          50: '#faf8f3',
          100: '#f4f0e6',
          200: '#e8dcc7',
          300: '#dcc8a8',
          400: '#d0b489',
          500: '#c4a06a', // Main brand gold #c1a679
          600: '#b8956b',
          700: '#9c7a56',
          800: '#7d6144',
          900: '#5e4833',
        },
        accent: {
          50: '#f7f9fc',
          100: '#eef2f9',
          200: '#dde5f2',
          300: '#cbd8eb',
          400: '#bacbe4',
          500: '#a9bedd',
          600: '#98b1d6',
          700: '#8ba4cf', // Accent blue
          800: '#7e97c8',
          900: '#718ac1',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #344968 0%, #52687a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c1a679 0%, #d0b489 100%)',
        'geometric-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23344968' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(52, 73, 104, 0.1), 0 2px 4px -1px rgba(52, 73, 104, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(52, 73, 104, 0.1), 0 4px 6px -2px rgba(52, 73, 104, 0.05)',
        'gold': '0 4px 6px -1px rgba(193, 166, 121, 0.1), 0 2px 4px -1px rgba(193, 166, 121, 0.06)',
      }
    },
  },
  plugins: [],
}