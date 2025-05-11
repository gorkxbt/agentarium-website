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
        'agent-black': '#121212',
        'agent-green': '#00FF41',  // Bright Matrix-like green
        'agent-green-dark': '#00802A',
        'agent-green-light': '#7AFFA1',
        'agent-gray': '#2D2D2D',
        'agent-blue': '#0DD3FF', // Accent color for some UI elements
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