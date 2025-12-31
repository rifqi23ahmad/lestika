import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Wajib import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'; 

// Import CSS custom (Pastikan file ini ADA di folder src)
import './index.css'; // <--- Jika file index.css tidak dibuat, HAPUS baris ini!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)