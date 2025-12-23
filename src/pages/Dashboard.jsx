import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Data Dashboard
  const [availablePackages, setAvailablePackages] = useState([]); // Daftar Paket (Sumber Master)
  const [myPackages, setMyPackages] = useState([]); // Paket Aktif User
  const [myInvoices, setMyInvoices] = useState([]); // Invoice User

  // State khusus Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(null); // ID paket yang sedang diedit admin
  const [editData, setEditData] = useState({}); // Data sementara saat edit

  useEffect(() => {
    if (session?.user) {
        fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    const userId = session.user.id;

    try {
        // 1. Ambil Profil & Cek Role
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        setProfile(profileData);
        
        // Cek apakah role admin
        const userIsAdmin = profileData?.role === 'admin';
        setIsAdmin(userIsAdmin);

        // 2. Ambil Daftar Paket Tersedia (Master Data)
        const { data: packagesData } = await supabase
            .from('packages')
            .select('*')
            .order('price', { ascending: true });
        setAvailablePackages(packagesData || []);

        // 3. Jika Admin: Ambil SEMUA Invoice. Jika Siswa: Ambil punya sendiri.
        let invoiceQuery = supabase.from('invoices').select('*').order('created_at', { ascending: false });
        if (!userIsAdmin) {
            invoiceQuery = invoiceQuery.eq('user_id', userId);
        }
        const { data: invoiceData } = await invoiceQuery;
        setMyInvoices(invoiceData || []);

        // 4. Ambil Paket Aktif (Hanya untuk Siswa)
        if (!userIsAdmin) {
            const { data: userPkgData } = await supabase
                .from('user_packages')
                .select('*')
                .eq('user_id', userId);
            setMyPackages(userPkgData || []);
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
  };

  // --- FUNGSI UNTUK SISWA ---
  const handleBuyPackage = async (pkg) => {
    if (!confirm(`Apakah Anda yakin ingin memilih ${pkg.name}? Tagihan akan dibuat.`)) return;

    try {
        const { error } = await supabase.from('invoices').insert({
            user_id: session.user.id,
            package_name: pkg.name,
            amount: pkg.price,
            status: 'Belum Bayar'
        });

        if (error) throw error;
        alert('Berhasil memilih paket! Silakan cek tagihan Anda.');
        fetchData(); // Refresh data
    } catch (err) {
        alert('Gagal membuat pesanan: ' + err.message);
    }
  };

  // --- FUNGSI UNTUK ADMIN ---
  const startEdit = (pkg) => {
    setEditMode(pkg.id);
    setEditData(pkg);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditData({});
  };

  const handleAdminUpdate = async () => {
    try {
        const { error } = await supabase
            .from('packages')
            .update({
                name: editData.name,
                price: editData.price,
                session_info: editData.session_info,
                description: editData.description
            })
            .eq('id', editData.id);

        if (error) throw error;
        
        alert('Paket berhasil diperbarui!');
        setEditMode(null);
        fetchData(); // Refresh data
    } catch (err) {
        alert('Gagal update: ' + err.message);
    }
  };

  // Helper format rupiah
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (loading) return <div className="container section-padding">Loading dashboard...</div>;

  return (
    <div className="container section-padding">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
                <h1>Halo, {profile?.full_name || profile?.phone || "User"}</h1>
                <span style={{
                    background: isAdmin ? '#dc3545' : '#28a745', 
                    color: 'white', padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold'
                }}>
                    {isAdmin ? 'ADMINISTRATOR' : 'SISWA'}
                </span>
            </div>
            {isAdmin && <button onClick={fetchData} className="btn-secondary">Refresh Data</button>}
        </div>

        {/* --- AREA ADMIN: MANAJEMEN PAKET --- */}
        {isAdmin ? (
            <div style={{marginTop: '40px'}}>
                <h3>⚙️ Kelola Harga Paket</h3>
                <p>Sebagai admin, Anda bisa mengubah detail paket di bawah ini.</p>
                <div className="system-cards" style={{marginTop:'20px'}}>
                    {availablePackages.map(pkg => (
                        <div key={pkg.id} className="card" style={{textAlign:'left', border: editMode === pkg.id ? '2px solid #007bff' : '1px solid #eee'}}>
                            {editMode === pkg.id ? (
                                // Form Edit
                                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                                    <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Nama Paket" />
                                    <input type="number" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} placeholder="Harga" />
                                    <input type="text" value={editData.session_info} onChange={e => setEditData({...editData, session_info: e.target.value})} placeholder="Info Sesi" />
                                    <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Deskripsi" rows="3" />
                                    <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                                        <button onClick={handleAdminUpdate} style={{background:'green', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Simpan</button>
                                        <button onClick={cancelEdit} style={{background:'grey', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Batal</button>
                                    </div>
                                </div>
                            ) : (
                                // Tampilan Normal
                                <>
                                    <h4>{pkg.name}</h4>
                                    <h2 style={{color: '#007bff'}}>{formatRupiah(pkg.price)}</h2>
                                    <p style={{fontWeight:'bold', color:'#555'}}>{pkg.session_info}</p>
                                    <p style={{fontSize:'0.9rem', color:'#666'}}>{pkg.description}</p>
                                    <button onClick={() => startEdit(pkg)} style={{marginTop:'15px', width:'100%', background:'#ffc107', border:'none', padding:'8px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Edit Paket</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            /* --- AREA SISWA: PILIH PAKET --- */
            <div style={{marginTop: '40px'}}>
                <h3>📦 Pilih Paket Belajar</h3>
                <div className="system-cards" style={{marginTop:'20px'}}>
                    {availablePackages.map(pkg => (
                        <div key={pkg.id} className="card" style={{textAlign:'left', border: '1px solid #eee'}}>
                            <h4>{pkg.name}</h4>
                            <h2 style={{color: '#28a745'}}>{formatRupiah(pkg.price)}</h2>
                            <p style={{fontWeight:'bold', color:'#555'}}>{pkg.session_info}</p>
                            <p style={{fontSize:'0.9rem', color:'#666', minHeight:'50px'}}>{pkg.description}</p>
                            <button 
                                onClick={() => handleBuyPackage(pkg)} 
                                className="btn-primary" 
                                style={{marginTop:'15px', width:'100%'}}
                            >
                                Pilih Paket Ini
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- TABEL TAGIHAN / INVOICE (Untuk Admin & Siswa) --- */}
        <div style={{marginTop: '50px', borderTop:'2px dashed #eee', paddingTop:'30px'}}>
            <h3>{isAdmin ? '📑 Semua Transaksi Masuk' : '🧾 Riwayat Tagihan Anda'}</h3>
            
            {myInvoices.length === 0 ? (
                <p style={{color:'#888', fontStyle:'italic'}}>Belum ada data tagihan.</p>
            ) : (
                <table className="invoice-table" style={{width: '100%', borderCollapse: 'collapse', marginTop: '15px'}}>
                    <thead>
                        <tr style={{background: '#f8f9fa', textAlign:'left'}}>
                            <th style={{padding:'10px'}}>Tanggal</th>
                            <th style={{padding:'10px'}}>Paket</th>
                            <th style={{padding:'10px'}}>Total</th>
                            <th style={{padding:'10px'}}>Status</th>
                            {isAdmin && <th style={{padding:'10px'}}>User ID</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {myInvoices.map(inv => (
                            <tr key={inv.id} style={{borderBottom:'1px solid #eee'}}>
                                <td style={{padding:'10px'}}>{new Date(inv.created_at).toLocaleDateString()}</td>
                                <td style={{padding:'10px', fontWeight:'bold'}}>{inv.package_name}</td>
                                <td style={{padding:'10px'}}>{formatRupiah(inv.amount)}</td>
                                <td style={{padding:'10px'}}>
                                    <span style={{
                                        background: inv.status === 'Lunas' ? '#d4edda' : '#fff3cd',
                                        color: inv.status === 'Lunas' ? '#155724' : '#856404',
                                        padding: '4px 8px', borderRadius: '5px', fontSize:'0.85rem', fontWeight:'bold'
                                    }}>
                                        {inv.status}
                                    </span>
                                </td>
                                {isAdmin && <td style={{padding:'10px', fontSize:'0.8rem', color:'#888'}}>{inv.user_id}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
  );
}