import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import { UIProvider } from './context/UIContext.tsx'
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    // Add this inside your main component's render function
    <Toaster position="top-right" />
  </React.StrictMode>,
)
