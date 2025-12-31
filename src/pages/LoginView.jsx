import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginView({ onNavigate }) {
  const { login } = useAuth();
  const [role, setRole] = useState('siswa');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulasi delay login
    await login(formData.username, role);
    setLoading(false);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900">Login Portal</h2>
          <p className="text-gray-500 mt-2">Masuk ke akun Bimbel MAPA</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          {['siswa', 'guru', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition ${
                role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`Contoh: ${role}`}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="******"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-70"
          >
            {loading ? 'Memproses...' : `Masuk sebagai ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400 bg-yellow-50 p-2 rounded border border-yellow-100">
            <p>Demo Credentials: username bebas, password bebas.</p>
        </div>
      </div>
    </div>
  );
}