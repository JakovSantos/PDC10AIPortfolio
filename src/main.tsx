import { createRoot } from 'react-dom/client'
import App from './App'
import { installFrames } from './lib/frames'
import { preloadSprites } from './components/Avatar'
import './index.css'

installFrames()
preloadSprites()

createRoot(document.getElementById('root')!).render(<App />)
