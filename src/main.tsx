import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MediaDetailsProvider } from './context/MediaDetailsContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { PlaybackProvider } from './context/PlaybackContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlaybackProvider>
          <MediaDetailsProvider>
            <App />
          </MediaDetailsProvider>
        </PlaybackProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
