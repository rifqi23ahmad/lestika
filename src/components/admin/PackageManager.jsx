import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; 
import { formatRupiah } from '../../utils/format';

export default function PackageManager() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: null, 
    title: '',        
    price: 0, 
    features: '',     
    color: 'bg-blue-500'
  });
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setPackages(data);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const numericPrice = parseInt(formData.price) || 0;
      
      const featuresArray = formData.features
        ? formData.features.split(',').map(item => item.trim()).filter(i => i)
        : [];

      const payload = {
        title: formData.title,
        price: numericPrice, // KUNCI: Hanya simpan angka
        features: featuresArray,
        color: formData.color
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('packages')
          .update(payload)
          .eq('id', formData.id);
      } else {
        result = await supabase
          .from('packages')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      alert('Berhasil disimpan!');
      resetForm();
      fetchPackages(); 

    } catch (error) {
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus paket ini?')) return;
    setLoading(true);
    await supabase.from('packages').delete().eq('id', id);
    fetchPackages();
    setLoading(false);
  };

  const handleEditClick = (pkg) => {
    setFormData({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price, // Load angka mentah
      features: Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features,
      color: pkg.color || 'bg-blue-500'
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: null, title: '', price: 0, features: '', color: 'bg-blue-500' });
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Paket (Admin)</h2>

      {/* FORM SECTION */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 border border-gray-100">
        <h3 className="font-semibold mb-4 text-gray-700">{isEditing ? 'Edit Paket' : 'Tambah Paket'}</h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nama Paket</label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleChange} required 
              className="w-full p-2 border rounded" placeholder="Contoh: SD Eksklusif"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Harga (Angka)</label>
            <input 
              type="number" name="price" value={formData.price} onChange={handleChange} required 
              className="w-full p-2 border rounded" placeholder="500000"
            />
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Preview: {formatRupiah(formData.price)}
            </p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Fitur (Pisahkan koma)</label>
            <input 
              type="text" name="features" value={formData.features} onChange={handleChange}
              className="w-full p-2 border rounded" placeholder="Fitur A, Fitur B, Fitur C"
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Processing...' : (isEditing ? 'Simpan' : 'Tambah')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded">Batal</button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="px-6 py-4 font-bold text-gray-800">{pkg.title}</td>
                
                {/* FORMATTER DI SINI */}
                <td className="px-6 py-4 text-green-600 font-bold">
                  {formatRupiah(pkg.price)}
                </td>

                <td className="px-6 py-4 text-right font-medium">
                  <button onClick={() => handleEditClick(pkg)} className="text-indigo-600 hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(pkg.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}