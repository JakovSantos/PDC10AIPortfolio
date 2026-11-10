import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'node:url'

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  root: here('.'),
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: here('./tailwind.config.js') }), autoprefixer()],
    },
  },
})
