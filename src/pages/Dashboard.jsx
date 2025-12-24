import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Edit, Save, Plus, X, User, ShoppingBag, FileText, Settings } from 'lucide-react';

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Data Bisnis
  const [myPackages, setMyPackages] = useState([]);
  const [myInvoices, setMyInvoices] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Data Landing Page (Admin)
  const [landingData, setLandingData] = useState({
     hero_title: '',
     hero_description: '',
     footer_text: ''
  });
  
  // State Program (Add/Edit)
  const [programsList, setProgramsList] = useState([]);
  const [newProgram, setNewProgram] = useState({ title: '', desc: '', img: '' });
  const [editingProgramIndex, setEditingProgramIndex] = useState(null);

  useEffect(() => {
    if (session?.user) fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    const userId = session.user.id;

    try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        setProfile(profileData);
        const userIsAdmin = profileData?.role === 'admin';
        setIsAdmin(userIsAdmin);

        // Load Paket (Semua Role Butuh Ini)
        const { data: pkgData } = await supabase.from('packages').select('*').order('price');
        setAvailablePackages(pkgData || []);

        if (userIsAdmin) {
            // Admin: Load Semua Invoice & Landing Settings
            const { data: invData } = await supabase.from('invoices').select('*').order('created_at', {ascending:false});
            setMyInvoices(invData || []);

            const { data: landing } = await supabase.from('landing_settings').select('*').single();
            if (landing) {
                setLandingData(landing);
                setProgramsList(landing.programs || []);
            }
        } else {
            // Siswa: Load Data Sendiri
            const { data: userPkg } = await supabase.from('user_packages').select('*').eq('user_id', userId);
            setMyPackages(userPkg || []);

            const { data: userInv } = await supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', {ascending:false});
            setMyInvoices(userInv || []);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIKA PROGRAM UNGGULAN ---
  const handleSaveProgram = (e) => {
      e.preventDefault();
      if(!newProgram.title || !newProgram.desc) return alert("Judul dan Deskripsi wajib diisi");
      
      let updatedList = [...programsList];
      if (editingProgramIndex !== null) {
          updatedList[editingProgramIndex] = newProgram;
          setEditingProgramIndex(null);
      } else {
          updatedList.push(newProgram);
      }
      setProgramsList(updatedList);
      setNewProgram({ title: '', desc: '', img: '' });
  };

  const handleStartEdit = (index) => {
      setNewProgram(programsList[index]);
      setEditingProgramIndex(index);
      // Scroll smooth ke form
      document.getElementById('programFormInput')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelEdit = () => {
      setNewProgram({ title: '', desc: '', img: '' });
      setEditingProgramIndex(null);
  };

  const handleDeleteProgram = (index) => {
      if(!confirm("Hapus program ini?")) return;
      const updatedList = programsList.filter((_, i) => i !== index);
      setProgramsList(updatedList);
      if (editingProgramIndex === index) handleCancelEdit();
  };

  // --- LOGIKA UPDATE DATABASE & BELI ---
  const handleUpdateLanding = async (e) => {
      e.preventDefault();
      try {
          const { error } = await supabase.from('landing_settings').update({
                hero_title: landingData.hero_title,
                hero_description: landingData.hero_description,
                footer_text: landingData.footer_text,
                programs: programsList 
            }).eq('id', 1);

          if (error) throw error;
          alert("Website Berhasil Diupdate!");
      } catch (err) {
          alert("Gagal: " + err.message);
      }
  };

  const handleBuyPackage = async (pkg) => {
    if (!confirm(`Pilih paket ${pkg.name}?`)) return;
    const { error } = await supabase.from('invoices').insert({
        user_id: session.user.id,
        package_name: pkg.name,
        amount: pkg.price,
        status: 'Belum Bayar'
    });
    if (!error) { alert('Tagihan dibuat!'); fetchData(); }
  };
  
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (loading) return <div className="container section-padding text-center">Loading...</div>;

  return (
    <div className="container section-padding">
        {/* HEADER DASHBOARD */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <div>
                <h1 style={{fontSize:'1.8rem', display:'flex', alignItems:'center', gap:'10px'}}>
                    <User size={28} className="text-primary"/> 
                    Halo, {profile?.full_name?.split(' ')[0] || "User"}
                </h1>
                <span style={{
                    background: isAdmin ? '#EF4444':'#10B981', color:'white', 
                    padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'bold', display:'inline-block', marginTop:'5px'
                }}>
                    {isAdmin ? 'ADMINISTRATOR' : 'SISWA ACTIVE'}
                </span>
            </div>
            <button onClick={fetchData} className="btn-secondary" style={{padding:'0 15px'}}>
               <span style={{fontSize:'1.2rem'}}>↻</span>
            </button>
        </div>

        {isAdmin ? (
            /* ================= ADMIN AREA ================= */
            <div>
                <form onSubmit={handleUpdateLanding}>
                    
                    {/* 1. EDITOR HEADER */}
                    <div className="card" style={{marginBottom:'30px'}}>
                        <h3 style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', color:'#4F46E5'}}>
                            <Settings size={20}/> Edit Header & Footer
                        </h3>
                        <div>
                            <label>Judul Utama</label>
                            <input type="text" value={landingData.hero_title} onChange={e => setLandingData({...landingData, hero_title: e.target.value})} />
                            
                            <label>Deskripsi</label>
                            <textarea rows="3" value={landingData.hero_description} onChange={e => setLandingData({...landingData, hero_description: e.target.value})} />
                            
                            <label>Teks Footer</label>
                            <input type="text" value={landingData.footer_text} onChange={e => setLandingData({...landingData, footer_text: e.target.value})} />
                        </div>
                    </div>

                    {/* 2. MANAJEMEN PROGRAM */}
                    <div className="card" style={{marginBottom:'30px'}}>
                        <h3 style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px', color:'#10B981'}}>
                            <FileText size={20}/> Program Unggulan
                        </h3>
                        
                        {/* FORM INPUT */}
                        <div id="programFormInput" style={{background:'#F8FAFC', padding:'20px', borderRadius:'12px', marginBottom:'20px', border:'1px dashed #CBD5E1'}}>
                            <h4 style={{marginBottom:'15px'}}>{editingProgramIndex !== null ? 'Edit Program' : 'Tambah Program Baru'}</h4>
                            
                            <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap:'15px'}}>
                                <input type="text" placeholder="Judul (Cth: Les Matematika)" value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} />
                                <input type="text" placeholder="URL Gambar (https://...)" value={newProgram.img} onChange={e => setNewProgram({...newProgram, img: e.target.value})} />
                            </div>
                            <textarea placeholder="Deskripsi singkat..." value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} rows="2"></textarea>
                            
                            {/* TOMBOL FORM (Responsive) */}
                            <div className="btn-group">
                                <button type="button" onClick={handleSaveProgram} className="btn-primary">
                                    {editingProgramIndex !== null ? <Save size={18}/> : <Plus size={18}/>}
                                    {editingProgramIndex !== null ? 'Simpan Perubahan' : 'Tambah'}
                                </button>
                                
                                {editingProgramIndex !== null && (
                                    <button type="button" onClick={handleCancelEdit} className="btn-danger">
                                        <X size={18}/> Batal
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* LIST PROGRAM */}
                        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                            {programsList.map((prog, idx) => (
                                <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', border:'1px solid #E2E8F0', padding:'15px', borderRadius:'12px'}}>
                                    <div style={{display:'flex', gap:'15px', alignItems:'center', flex:1}}>
                                        <img src={prog.img || "https://via.placeholder.com/50"} alt="img" style={{width:'48px', height:'48px', objectFit:'cover', borderRadius:'8px', background:'#eee'}} />
                                        <div>
                                            <div style={{fontWeight:'bold'}}>{prog.title}</div>
                                            <div style={{fontSize:'0.85em', color:'#666'}}>{prog.desc}</div>
                                        </div>
                                    </div>
                                    
                                    {/* TOMBOL EDIT/HAPUS (Group) */}
                                    <div className="btn-group" style={{marginTop:0, flexWrap:'nowrap'}}>
                                        <button type="button" onClick={() => handleStartEdit(idx)} className="btn-secondary" style={{padding:'0 10px'}}>
                                            <Edit size={18} />
                                        </button>
                                        <button type="button" onClick={() => handleDeleteProgram(idx)} className="btn-danger" style={{padding:'0 10px'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {programsList.length === 0 && <p className="text-center text-muted">Belum ada program.</p>}
                        </div>
                    </div>

                    {/* TOMBOL SIMPAN UTAMA */}
                    <div className="btn-group" style={{marginBottom:'50px'}}>
                         <button type="submit" className="btn-primary" style={{width:'100%', height:'56px', fontSize:'1.1rem'}}>
                            <Save size={24}/> SIMPAN SEMUA PERUBAHAN
                         </button>
                    </div>
                </form>

                <h3>Semua Transaksi</h3>
                <div className="table-responsive">
                    <table className="invoice-table">
                        <thead><tr><th>Date</th><th>User</th><th>Paket</th><th>Status</th></tr></thead>
                        <tbody>
                            {myInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td><small>{inv.user_id?.substring(0,8)}...</small></td>
                                    <td>{inv.package_name}</td>
                                    <td>
                                        <span style={{padding:'4px 8px', borderRadius:'4px', background: inv.status==='Lunas'?'#D1FAE5':'#FEF3C7', color: inv.status==='Lunas'?'#065F46':'#92400E', fontSize:'0.8rem', fontWeight:'bold'}}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            /* ================= SISWA AREA ================= */
            <div>
                <h3><ShoppingBag size={20} style={{marginRight:'8px'}}/> Paket Saya</h3>
                {myPackages.length === 0 ? <p className="text-muted">Tidak ada paket aktif.</p> : (
                    <div className="system-cards">
                        {myPackages.map(p => (
                            <div key={p.id} className="card">
                                <h4>{p.package_name}</h4>
                                <p>{p.session_info}</p>
                                <div className="btn-secondary" style={{width:'fit-content', fontSize:'0.8rem'}}>{p.status}</div>
                            </div>
                        ))}
                    </div>
                )}
                
                <h3 style={{marginTop:'40px'}}>Pilih Paket Baru</h3>
                <div className="system-cards">
                    {availablePackages.map(pkg => (
                        <div key={pkg.id} className="card">
                            <h4>{pkg.name}</h4>
                            <h2 style={{color:'#10B981', margin:'10px 0'}}>{formatRupiah(pkg.price)}</h2>
                            <p>{pkg.session_info}</p>
                            <div className="btn-group">
                                <button onClick={() => handleBuyPackage(pkg)} className="btn-primary" style={{width:'100%'}}>
                                    Pilih Paket
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                 <h3 style={{marginTop:'40px'}}>Riwayat Tagihan</h3>
                 <div className="table-responsive">
                    <table className="invoice-table">
                        <thead><tr><th>Date</th><th>Paket</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody>
                            {myInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td>{inv.package_name}</td>
                                    <td>{formatRupiah(inv.amount)}</td>
                                    <td>
                                        <span style={{padding:'4px 8px', borderRadius:'4px', background: inv.status==='Lunas'?'#D1FAE5':'#FEF3C7', color: inv.status==='Lunas'?'#065F46':'#92400E', fontSize:'0.8rem', fontWeight:'bold'}}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}
    </div>
  );
}