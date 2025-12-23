import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cek session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen perubahan login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null; // Tunggu cek session selesai

  return (
    <Router>
      <Navbar session={session} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Redirect ke Dashboard jika sudah login */}
        <Route 
            path="/login" 
            element={!session ? <Auth /> : <Navigate to="/dashboard" />} 
        />
        {/* Redirect ke Login jika belum login */}
        <Route 
            path="/dashboard" 
            element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App