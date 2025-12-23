import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.scss' // Memuat file SCSS utama

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)