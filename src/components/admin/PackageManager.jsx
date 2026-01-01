import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; 
import { formatRupiah } from '../../utils/format';
// [UBAH] Import komponen UI tambahan
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle, CheckCircle, Trash2, Save, X } from 'lucide-react';

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

  // [BARU] State untuk Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalData, setInfoModalData] = useState({ title: '', message: '', type: 'success' }); // type: success | error

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

  // [BARU] Helper untuk menampilkan modal info
  const showInfo = (title, message, type = 'success') => {
    setInfoModalData({ title, message, type });
    setShowInfoModal(true);
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
        price: numericPrice, 
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

      // [UBAH] Ganti alert dengan Modal Sukses
      showInfo('Berhasil!', 'Data paket berhasil disimpan.', 'success');
      
      resetForm();
      fetchPackages(); 

    } catch (error) {
      // [UBAH] Ganti alert dengan Modal Error
      showInfo('Gagal!', `Terjadi kesalahan: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // [UBAH] Trigger modal konfirmasi hapus
  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // [UBAH] Eksekusi hapus setelah konfirmasi
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    
    setLoading(true);
    setShowDeleteModal(false); // Tutup modal dulu

    try {
        await supabase.from('packages').delete().eq('id', deleteTargetId);
        showInfo('Terhapus', 'Paket berhasil dihapus.', 'success');
        fetchPackages();
    } catch (error) {
        showInfo('Error', 'Gagal menghapus paket.', 'error');
    } finally {
        setLoading(false);
        setDeleteTargetId(null);
    }
  };

  const handleEditClick = (pkg) => {
    setFormData({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price, 
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
        <h3 className="font-semibold mb-4 text-gray-700 flex items-center">
            {isEditing ? <span className='text-indigo-600 flex items-center'><Save size={18} className='mr-2'/> Edit Paket</span> : 'Tambah Paket Baru'}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nama Paket</label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleChange} required 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Contoh: SD Eksklusif"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Harga (Angka)</label>
            <input 
              type="number" name="price" value={formData.price} onChange={handleChange} required 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none" placeholder="500000"
            />
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Preview: {formatRupiah(formData.price)}
            </p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Fitur (Pisahkan koma)</label>
            <input 
              type="text" name="features" value={formData.features} onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Fitur A, Fitur B, Fitur C"
            />
          </div>
          <div className="col-span-2 flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Processing...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Paket')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors">Batal</button>
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
                <td className="px-6 py-4 text-green-600 font-bold">
                  {formatRupiah(pkg.price)}
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  <button onClick={() => handleEditClick(pkg)} className="text-indigo-600 hover:text-indigo-800 mr-4 font-semibold">Edit</button>
                  {/* [UBAH] Panggil fungsi konfirmasi */}
                  <button onClick={() => confirmDelete(pkg.id)} className="text-red-600 hover:text-red-800 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* [BARU] MODAL DELETE CONFIRMATION */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-red-100 rounded-full w-fit text-red-600">
            <Trash2 size={32} />
          </div>
          <h4 className="fw-bold mb-2">Hapus Paket?</h4>
          <p className="text-muted mb-4">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus data ini?</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Ya, Hapus</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* [BARU] MODAL INFO (SUCCESS/ERROR) */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <div className={`mx-auto mb-3 p-3 rounded-full w-fit ${infoModalData.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {infoModalData.type === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          </div>
          <h4 className="fw-bold mb-2">{infoModalData.title}</h4>
          <p className="text-muted mb-4">{infoModalData.message}</p>
          <Button variant={infoModalData.type === 'success' ? 'success' : 'danger'} onClick={() => setShowInfoModal(false)} className="px-4">
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}