import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MediaDetailsProvider } from './context/MediaDetailsContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { PlaybackProvider } from './context/PlaybackContext.tsx'
import { PreviewSettingsProvider } from './context/PreviewSettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlaybackProvider>
          <MediaDetailsProvider>
            <PreviewSettingsProvider>
              <App />
            </PreviewSettingsProvider>
          </MediaDetailsProvider>
        </PlaybackProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
