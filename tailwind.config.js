/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg:      'var(--bg)',
        bg2:     'var(--bg2)',
        fg:      'var(--fg)',
        fg2:     'var(--fg2)',
        accent:  'var(--accent)',
        accent2: 'var(--accent2)',
        surface: 'var(--surface)',
      },
    },
  },
  plugins: [],
};
