import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MediaDetailsProvider } from './context/MediaDetailsContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { PlaybackProvider } from './context/PlaybackContext.tsx'
import { PreviewSettingsProvider } from './context/PreviewSettingsContext.tsx'
import { NavigationModeProvider } from './context/NavigationModeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlaybackProvider>
          <MediaDetailsProvider>
            <NavigationModeProvider>
              <PreviewSettingsProvider>
                <App />
              </PreviewSettingsProvider>
            </NavigationModeProvider>
          </MediaDetailsProvider>
        </PlaybackProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
