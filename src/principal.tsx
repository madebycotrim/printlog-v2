import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RoteadorPrincipal } from './roteador.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RoteadorPrincipal />
    </StrictMode>
)
