/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			'card-foreground': 'var(--color-card-foreground)',
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			'popover-foreground': 'var(--color-popover-foreground)',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-foreground': 'var(--color-primary-foreground)',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			'secondary-foreground': 'var(--color-secondary-foreground)',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			'muted-foreground': 'var(--color-muted-foreground)',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			'accent-foreground': 'var(--color-accent-foreground)',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			sidebar: 'var(--color-sidebar)',
  			'sidebar-foreground': 'var(--color-sidebar-foreground)',
  			'sidebar-primary': 'var(--color-sidebar-primary)',
  			'sidebar-primary-foreground': 'var(--color-sidebar-primary-foreground)',
  			'sidebar-accent': 'var(--color-sidebar-accent)',
  			'sidebar-accent-foreground': 'var(--color-sidebar-accent-foreground)',
  			'sidebar-border': 'var(--color-sidebar-border)',
  			'sidebar-ring': 'var(--color-sidebar-ring)',
  			'chart-1': 'var(--color-chart-1)',
  			'chart-2': 'var(--color-chart-2)',
  			'chart-3': 'var(--color-chart-3)',
  			'chart-4': 'var(--color-chart-4)',
  			'chart-5': 'var(--color-chart-5)',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			'3xl': 'var(--radius-3xl)',
  			'4xl': 'var(--radius-4xl)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}
