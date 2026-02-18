import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RoteadorPrincipal } from './roteador.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RoteadorPrincipal />
    </StrictMode>,
)
