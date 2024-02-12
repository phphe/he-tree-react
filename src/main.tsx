// don't use reset css
// import '@unocss/reset/tailwind.css'
// import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
