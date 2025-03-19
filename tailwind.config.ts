import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  // JIT mode is enabled by default in Tailwind v3
  // Safelist critical classes to ensure they're always included in the CSS bundle
  safelist: [
    // Banner component classes
    'object-cover',
    'object-center',
    'transition-all',
    'duration-500',
    'ease-in-out-circ',
    // Critical layout classes
    'h-full',
    'w-full',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			'black-main': '#020613',
  			'dark': '#121828',
  			'dark-grey': '#212938',
  			'high-grey': '#384151',
  			'mid-grey': '#4e5564',
  			'light-grey': '#6a7380',
  			'light-grey-low': '#9ca2ae',
  			'white-pure': '#ffffff',
  			'light-white': '#f3f4f6',
  			'light-grey-light': '#e6e7ea',
  			'light-mid-grey': '#d0d4db',
  			'light-high-grey': '#9ca2ae',
  			'light-hh-grey': '#6c7280',
  			'light-dark-grey': '#384151',
  			'dark-dark-grey': '#212938',
  			'accent-purple': '#6d36f1',
  			'accent-red': '#cb0921',
  			'accent-green': '#2eac44',
  			'accent-blue': '#2b79ef',
  			'accent-orange': '#9ca2ae',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add performance optimizations
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      // Add custom utilities for performance-critical animations
      addUtilities({
        '.ease-in-out-circ': {
          'transition-timing-function': 'cubic-bezier(0.85, 0, 0.15, 1)',
        },
        '.will-change-opacity': {
          'will-change': 'opacity',
        },
        '.will-change-transform': {
          'will-change': 'transform',
        },
        '.bg-size-200': {
          'background-size': '200% 200%',
        },
        '.bg-pos-0': {
          'background-position': '0% 0%',
        },
        '.bg-pos-100': {
          'background-position': '100% 100%',
        },
      });
    },
  ],
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config

export default config
