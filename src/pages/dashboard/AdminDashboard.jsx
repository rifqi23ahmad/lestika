import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { packageService } from '../../services/packageService';

export default function AdminDashboard() {
  const [packages, setPackages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPkg, setCurrentPkg] = useState({ title: '', price: '', features: '' });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packageService.getAll();
      setPackages(data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formattedFeatures = typeof currentPkg.features === 'string' 
      ? currentPkg.features.split(',').map(f => f.trim()) 
      : currentPkg.features;
    
    const payload = { 
      ...currentPkg, 
      features: formattedFeatures,
      // Pastikan price adalah number
      price: Number(currentPkg.price),
      price_display: currentPkg.price_display || `Rp ${Number(currentPkg.price).toLocaleString('id-ID')}`
    };

    try {
      if (currentPkg.id) {
        await packageService.update(currentPkg.id, payload);
      } else {
        await packageService.create(payload);
      }
      setIsEditing(false);
      loadPackages(); // Reload data
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    if(confirm('Yakin ingin menghapus?')) {
      await packageService.delete(id);
      loadPackages();
    }
  };

  const openEdit = (pkg) => {
    setCurrentPkg({ 
      ...pkg, 
      features: Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features,
      price: pkg.price // Untuk input form, ambil raw number
    });
    setIsEditing(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Stats */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Statistik</h3>
          <div className="p-3 bg-blue-50 rounded-lg flex justify-between">
             <span className="text-gray-600">Total Paket</span>
             <span className="font-bold text-blue-700">{packages.length}</span>
          </div>
        </div>
      </div>

      {/* Main CMS */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold">Manajemen Paket (CMS)</h2>
            <button onClick={() => { setCurrentPkg({title:'', price:'', features:''}); setIsEditing(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center text-sm hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Tambah
            </button>
          </div>

          {isEditing && (
            <div className="p-6 bg-blue-50 border-b">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input required value={currentPkg.title} onChange={e => setCurrentPkg({...currentPkg, title: e.target.value})} className="p-2 border rounded w-full" placeholder="Nama Paket" />
                  <input required type="number" value={currentPkg.price} onChange={e => setCurrentPkg({...currentPkg, price: e.target.value})} className="p-2 border rounded w-full" placeholder="Harga (Angka)" />
                </div>
                <textarea required value={currentPkg.features} onChange={e => setCurrentPkg({...currentPkg, features: e.target.value})} className="w-full p-2 border rounded" placeholder="Fitur (pisahkan koma)" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 rounded">Batal</button>
                  <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded flex items-center"><Save className="w-4 h-4 mr-1"/> Simpan</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 uppercase text-gray-500">
                <tr><th className="px-6 py-3">Paket</th><th className="px-6 py-3">Harga</th><th className="px-6 py-3 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{pkg.title}</td>
                    <td className="px-6 py-4 text-blue-600">{pkg.price_display || pkg.price}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(pkg)} className="text-yellow-600 bg-yellow-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(pkg.id)} className="text-red-600 bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}