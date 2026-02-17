import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import { ThemeSync } from '@/components/theme/ThemeSync'
import { ComplaintsBootstrap } from '@/components/sync/ComplaintsBootstrap'
import { UmcSyncBootstrap } from '@/components/sync/UmcSyncBootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeSync />
      <ComplaintsBootstrap />
      <UmcSyncBootstrap />
      <App />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </StrictMode>,
)
