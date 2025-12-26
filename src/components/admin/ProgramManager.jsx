// src/components/admin/PackageManager.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function PackageManager({ currentPackages, onUpdate }) {
  const [form, setForm] = useState({ name: '', price: '', session_info: '' });
  const [isEditing, setIsEditing] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isEditing) {
        await supabase.from('packages').update(form).eq('id', isEditing);
    } else {
        await supabase.from('packages').insert(form);
    }
    setForm({ name: '', price: '', session_info: '' });
    setIsEditing(null);
    onUpdate(); // Refresh data di parent
  };

  const handleDelete = async (id) => {
    if(confirm('Hapus?')) {
        await supabase.from('packages').delete().eq('id', id);
        onUpdate();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-bold mb-4">Kelola Paket Harga</h3>
      
      {/* Form Sederhana */}
      <form onSubmit={handleSave} className="flex gap-2 mb-6 flex-wrap">
        <input 
            placeholder="Nama Paket" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="border p-2 rounded" required
        />
        <input 
            type="number" 
            placeholder="Harga" 
            value={form.price} 
            onChange={e => setForm({...form, price: e.target.value})} 
            className="border p-2 rounded" required
        />
        <input 
            placeholder="Info Sesi" 
            value={form.session_info} 
            onChange={e => setForm({...form, session_info: e.target.value})} 
            className="border p-2 rounded" 
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
            {isEditing ? 'Update' : 'Tambah'}
        </button>
      </form>

      {/* List Paket */}
      <ul className="space-y-2">
        {currentPackages.map(pkg => (
            <li key={pkg.id} className="flex justify-between items-center border-b pb-2">
                <span>{pkg.name} - Rp {pkg.price.toLocaleString()}</span>
                <div className="flex gap-2">
                    <button onClick={() => { setForm(pkg); setIsEditing(pkg.id); }} className="text-yellow-600 text-sm">Edit</button>
                    <button onClick={() => handleDelete(pkg.id)} className="text-red-600 text-sm">Hapus</button>
                </div>
            </li>
        ))}
      </ul>
    </div>
  );
}