/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'agent-green': '#1DB954',
        'agent-green-muted': '#149042',
        'agent-green-dark': '#0A6E31',
        'agent-blue': '#0D9DFF',
        'agent-blue-dark': '#0B72B8',
        'agent-black': '#121212',
        'agent-gray': '#282828',
        'agent-dark-gray': '#1E1E1E',
        'agent-light-gray': '#3D3D3D',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Orbitron', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px rgba(0, 255, 65, 0.3)' },
          '100%': { textShadow: '0 0 20px rgba(0, 255, 65, 0.7), 0 0 30px rgba(0, 255, 65, 0.5)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 