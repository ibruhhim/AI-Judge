/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors using CSS variables
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)',
        },
        // Brand colors
        orange: {
          DEFAULT: 'var(--color-orange)',
          light: 'var(--color-orange-light)',
          dark: 'var(--color-orange-dark)',
        },
        green: {
          DEFAULT: 'var(--color-green)',
          light: 'var(--color-green-light)',
          dark: 'var(--color-green-dark)',
        },
        // Button colors
        button: {
          text: 'var(--color-button-text)',
          bg: 'var(--color-button-bg)',
          'bg-hover': 'var(--color-button-bg-hover)',
          'secondary-text': 'var(--color-button-secondary-text)',
          'secondary-bg': 'var(--color-button-secondary-bg)',
          'secondary-bg-hover': 'var(--color-button-secondary-bg-hover)',
        },
        // Overlay colors
        overlay: {
          DEFAULT: 'var(--color-overlay)',
          dark: 'var(--color-overlay-dark)',
        },
        // Danger/Error colors
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          bg: 'var(--color-danger-bg)',
        },
        // Semantic colors
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg: 'var(--color-error-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
        },
        // Text colors with gray aliases
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
          'gray-300': 'var(--text-gray-300)',
          'gray-400': 'var(--text-gray-400)',
          'gray-500': 'var(--text-gray-500)',
        },
        // Background colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          'light-gray': 'var(--bg-light-gray)',
          'gray-600': 'var(--bg-gray-600)',
          'gray-700': 'var(--bg-gray-700)',
          'gray-800': 'var(--bg-gray-800)',
          'gray-900': 'var(--bg-gray-900)',
        },
        // Border colors
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          accent: 'var(--border-accent)',
        },
      },
      backgroundColor: {
        glass: 'var(--glass-bg)',
        'glass-dark': 'var(--glass-bg-dark)',
      },
      borderColor: {
        glass: 'var(--glass-border)',
        'glass-light': 'var(--glass-border-light)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'glow-orange': 'var(--glow-orange)',
        'glow-green': 'var(--glow-green)',
        'glow-orange-strong': 'var(--glow-orange-strong)',
        'glow-green-strong': 'var(--glow-green-strong)',
        'button-glow': 'var(--shadow-glow-orange)',
      },
      textShadow: {
        'glow-orange': 'var(--glow-text-orange)',
        'glow-green': 'var(--glow-text-green)',
      },
      dropShadow: {
        'glow-orange': '0 0 10px rgba(255, 107, 53, 0.6), 0 0 20px rgba(255, 107, 53, 0.4)',
        'glow-green': '0 0 10px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.4)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
        slower: 'var(--transition-slower)',
      },
      transitionTimingFunction: {
        'ease-in-out': 'var(--ease-in-out)',
        'ease-out': 'var(--ease-out)',
        'ease-in': 'var(--ease-in)',
        'ease-smooth': 'var(--ease-smooth)',
      },
      animation: {
        'fade-in': 'fadeIn var(--transition-slow) var(--ease-out)',
        'fade-out': 'fadeOut var(--transition-fast) var(--ease-in)',
        'slide-in-up': 'slideInUp var(--transition-slow) var(--ease-out)',
        'slide-in-down': 'slideInDown var(--transition-slow) var(--ease-out)',
        'slide-in-left': 'slideInLeft var(--transition-slow) var(--ease-out)',
        'slide-in-right': 'slideInRight var(--transition-slow) var(--ease-out)',
        'scale-in': 'scaleIn var(--transition-base) var(--ease-out)',
        'scale-out': 'scaleOut var(--transition-fast) var(--ease-in)',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
