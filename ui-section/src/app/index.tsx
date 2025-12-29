import React from 'react'
import ReactDOMClient from 'react-dom/client'
import App from './App'

export function renderReactApp(): void {
	const __render_id__: number = Math.random()
	ReactDOMClient.createRoot(document.getElementById('app') as HTMLElement).render(<App __RenderProps__={{ __render_id__ }} />)
}

renderReactApp()
