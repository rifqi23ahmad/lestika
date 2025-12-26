import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; // <-- Import Hook Baru
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard'; // Pastikan import ke folder Dashboard (index.jsx)

function App() {
  // Gunakan Hook, logic session sekarang tersembunyi di sini
  const { session, loading } = useAuth(); 

  if (loading) return null; // Atau tampilkan spinner loading

  return (
    <Router>
      {/* Kirim session ke Navbar jika dibutuhkan */}
      <Navbar session={session} /> 
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Redirect Logic */}
        <Route 
            path="/login" 
            element={!session ? <Auth /> : <Navigate to="/dashboard" />} 
        />
        <Route 
            path="/dashboard" 
            element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;