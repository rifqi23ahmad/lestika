import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { invoiceService } from '../services/invoiceService';

export default function RegisterView({ selectedPackage, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', jenjang: 'SD', kelas: '', whatsapp: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic dipindahkan ke Service
      const newInvoice = await invoiceService.create(formData, selectedPackage);
      onSuccess(newInvoice);
    } catch (error) {
      alert("Terjadi kesalahan saat pendaftaran.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 py-6 px-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Formulir Pendaftaran</h2>
            <p className="text-blue-100 text-sm mt-1">Lengkapi data untuk bergabung</p>
          </div>
          <FileText className="w-10 h-10 text-white opacity-80" />
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center">
             <div>
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Paket Dipilih</p>
               <h3 className="font-bold text-gray-900 text-lg">{selectedPackage?.title}</h3>
             </div>
             <p className="font-bold text-blue-600">{selectedPackage?.price_display || selectedPackage?.price}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap Siswa</label>
              <input type="text" name="name" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenjang</label>
              <select name="jenjang" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
              <input type="text" name="kelas" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
              <input type="number" name="whatsapp" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0812..." required />
            </div>
          </div>

          <div className="border-t pt-6 flex justify-between items-center">
            <button type="button" onClick={onCancel} className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100">Batal</button>
            <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Proses Pendaftaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}