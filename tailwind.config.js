/** @type {import('tailwindcss').Config} */
export default {
  content: { relative: true, files: ['./index.html', './src/**/*.{ts,tsx}'] },
  theme: {
    extend: {
      colors: {
        // warm 16-bit palette matched to the avatar sprites
        ink: '#3a2717',
        inksoft: '#6b4f3a',
        cream: '#fff6e0',
        parchment: '#f8e6bd',
        paper: '#fdf3d8',
        wood: '#b8763a',
        wooddark: '#7a4a22',
        woodlight: '#e3a660',
        lanyard: '#d6453d',
        lanyarddark: '#a8302a',
        polo: '#a9c8ee',
        sky: '#8fd3ff',
        mint: '#d7edb4',
        lilac: '#e6dcf5',
        peach: '#ffd9b3',
        butter: '#ffe9a0',
        grass: '#7cc04b',
        grassdark: '#4f8f3a',
        gold: '#f2b632',
        slate: '#2d2b3d',
      },
      fontFamily: {
        pixel: ['"Jersey 10"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
