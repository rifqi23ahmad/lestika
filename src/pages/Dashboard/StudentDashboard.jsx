// src/pages/Dashboard/StudentDashboard.jsx
import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabaseClient';

export default function StudentDashboard({ user }) {
  const { packages } = useDashboardData();

  const handleBuy = async (pkg) => {
    if (!confirm(`Beli paket ${pkg.name}?`)) return;
    
    const { error } = await supabase.from('invoices').insert({
        user_id: user.id, 
        package_name: pkg.name, 
        amount: pkg.price, 
        status: 'Belum Bayar'
    });
    
    if (!error) alert('Tagihan berhasil dibuat!');
    else alert('Gagal membuat tagihan.');
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pilih Paket Belajar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="border p-4 rounded shadow bg-white">
            <h3 className="font-bold text-lg">{pkg.name}</h3>
            <p className="text-green-600 font-bold">Rp {pkg.price.toLocaleString()}</p>
            <p className="text-gray-600 text-sm mb-4">{pkg.session_info}</p>
            <button 
                onClick={() => handleBuy(pkg)}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
                Pilih Paket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}