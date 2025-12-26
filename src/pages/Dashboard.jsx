import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Edit, Save, Plus, X, User, ShoppingBag, ShoppingCart, UploadCloud, FileText } from 'lucide-react';

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Data Bisnis
  const [myPackages, setMyPackages] = useState([]);
  const [myInvoices, setMyInvoices] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);

  // Data Landing Page (Admin)
  const [landingData, setLandingData] = useState({
     hero_title: '', hero_description: '', footer_text: ''
  });
  const [programsList, setProgramsList] = useState([]);

  // --- STATE FORM PAKET ---
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState({ 
      name: '', price: '', session_info: '', description: '', image_url: '' 
  });
  const [imageFile, setImageFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(''); 

  // --- STATE FORM PROGRAM (UPDATE) ---
  const [newProgram, setNewProgram] = useState({ title: '', desc: '', img: '' });
  const [editingProgramIndex, setEditingProgramIndex] = useState(null);
  const [programImageFile, setProgramImageFile] = useState(null); // File untuk program
  const [programPreviewUrl, setProgramPreviewUrl] = useState(''); // Preview program

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

        const { data: pkgData } = await supabase.from('packages').select('*').order('price');
        setAvailablePackages(pkgData || []);

        if (userIsAdmin) {
            const { data: invData } = await supabase.from('invoices').select('*').order('created_at', {ascending:false});
            setMyInvoices(invData || []);
            const { data: landing } = await supabase.from('landing_settings').select('*').single();
            if (landing) {
                setLandingData(landing);
                setProgramsList(landing.programs || []);
            }
        } else {
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

  // --- HELPER: FILE HANDLER PAKET ---
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  // --- HELPER: FILE HANDLER PROGRAM (BARU) ---
  const handleProgramFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setProgramImageFile(file);
          setProgramPreviewUrl(URL.createObjectURL(file));
      }
  };

  // ==========================================
  // 1. FITUR PAKET (ADMIN)
  // ==========================================
  const handleEditPackage = (pkg) => {
      setPackageForm(pkg);
      setPreviewUrl(pkg.image_url);
      setImageFile(null);
      setEditingPackageId(pkg.id);
      setShowPackageForm(true);
      document.getElementById('packageFormArea')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeletePackage = async (id) => {
      if(!confirm("Hapus paket ini?")) return;
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if(!error) { alert("Terhapus!"); fetchData(); }
  };

  const handleSavePackage = async (e) => {
      e.preventDefault();
      setUploading(true);

      try {
          let finalImageUrl = packageForm.image_url;

          if (imageFile) {
              const fileExt = imageFile.name.split('.').pop();
              const fileName = `paket-${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage.from('images').upload(`packages/${fileName}`, imageFile);
              if (uploadError) throw new Error(uploadError.message);
              const { data } = supabase.storage.from('images').getPublicUrl(`packages/${fileName}`);
              finalImageUrl = data.publicUrl;
          }

          const dataToSave = { ...packageForm, image_url: finalImageUrl };

          if(editingPackageId) {
              const { error } = await supabase.from('packages').update(dataToSave).eq('id', editingPackageId);
              if(error) throw error;
          } else {
              const { error } = await supabase.from('packages').insert(dataToSave);
              if(error) throw error;
          }
          
          alert("Paket Berhasil Disimpan!");
          setShowPackageForm(false);
          setPackageForm({ name: '', price: '', session_info: '', description: '', image_url: '' });
          setImageFile(null); setPreviewUrl(''); setEditingPackageId(null);
          fetchData();

      } catch (err) { alert("Gagal: " + err.message); } 
      finally { setUploading(false); }
  };

  // ==========================================
  // 2. FITUR PROGRAM & LANDING (ADMIN)
  // ==========================================
  
  // A. Start Edit Program
  const handleStartEditProgram = (index) => {
      setNewProgram(programsList[index]);
      setProgramPreviewUrl(programsList[index].img); // Load gambar lama
      setProgramImageFile(null); // Reset file baru
      setEditingProgramIndex(index);
      document.getElementById('programFormInput')?.scrollIntoView({ behavior: 'smooth' });
  };

  // B. Cancel Edit Program
  const handleCancelEditProgram = () => {
      setNewProgram({ title: '', desc: '', img: '' });
      setProgramImageFile(null);
      setProgramPreviewUrl('');
      setEditingProgramIndex(null);
  };

  // C. Save Program (Upload + Update List Local)
  const handleSaveProgram = async (e) => {
      e.preventDefault();
      if(!newProgram.title) return alert("Isi judul program!");
      
      setUploading(true);
      try {
          let finalImgUrl = newProgram.img;

          // Upload Gambar Jika Ada File Baru
          if (programImageFile) {
              const fileExt = programImageFile.name.split('.').pop();
              const fileName = `prog-${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage.from('images').upload(`programs/${fileName}`, programImageFile);
              if (uploadError) throw new Error(uploadError.message);
              
              const { data } = supabase.storage.from('images').getPublicUrl(`programs/${fileName}`);
              finalImgUrl = data.publicUrl;
          }

          // Update Data Local
          const updatedProgramData = { ...newProgram, img: finalImgUrl };
          let list = [...programsList];
          
          if (editingProgramIndex !== null) {
              list[editingProgramIndex] = updatedProgramData;
          } else {
              list.push(updatedProgramData);
          }
          
          setProgramsList(list);
          
          // Reset Form
          setNewProgram({ title: '', desc: '', img: '' });
          setProgramImageFile(null);
          setProgramPreviewUrl('');
          setEditingProgramIndex(null);
          
      } catch (err) {
          alert("Gagal upload gambar: " + err.message);
      } finally {
          setUploading(false);
      }
  };

  // D. Delete Program
  const handleDeleteProgram = (index) => {
      if(!confirm("Hapus program ini?")) return;
      const list = programsList.filter((_, i) => i !== index);
      setProgramsList(list);
      if (editingProgramIndex === index) handleCancelEditProgram();
  };
  
  // E. Final Save to Database
  const handleUpdateLanding = async (e) => {
      e.preventDefault();
      const { error } = await supabase.from('landing_settings').update({
          ...landingData, programs: programsList 
      }).eq('id', 1);
      if(!error) alert("Website Berhasil Diupdate!");
      else alert("Gagal update DB");
  };

  // ==========================================
  // 3. FITUR BELI PAKET (SISWA)
  // ==========================================
  const handleBuyPackage = async (pkg) => {
    if (!confirm(`Pilih paket ${pkg.name}?`)) return;
    const { error } = await supabase.from('invoices').insert({
        user_id: session.user.id, package_name: pkg.name, amount: pkg.price, status: 'Belum Bayar'
    });
    if (!error) { alert('Tagihan dibuat!'); fetchData(); }
  };
  
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  if (loading) return <div className="container section-padding text-center">Loading...</div>;

  return (
    <div className="container section-padding">
        {/* HEADER */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <div>
                <h1 style={{fontSize:'1.5rem', display:'flex', alignItems:'center', gap:'10px'}}>
                    Halo, {profile?.full_name?.split(' ')[0] || "User"}
                </h1>
                <span style={{
                    background: isAdmin ? '#EF4444':'#10B981', color:'white', 
                    padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'bold'
                }}>
                    {isAdmin ? 'ADMINISTRATOR' : 'SISWA'}
                </span>
            </div>
            <button onClick={fetchData} className="btn-secondary" style={{width:'40px', height:'40px', padding:0, borderRadius:'50%'}}>↻</button>
        </div>

        {isAdmin ? (
            /* ================= ADMIN AREA ================= */
            <div>
                {/* 1. KELOLA PAKET */}
                <h3 style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'8px'}}>
                    <ShoppingBag size={20}/> Kelola Paket Harga
                </h3>
                
                {!showPackageForm && (
                    <button onClick={() => { setShowPackageForm(true); setEditingPackageId(null); setPackageForm({ name: '', price: '', session_info: '', description: '', image_url: '' }); setPreviewUrl(''); setImageFile(null); }} className="btn-primary" style={{marginBottom:'20px', width:'100%'}}>
                        <Plus size={20}/> Tambah Paket Baru
                    </button>
                )}

                {/* FORM INPUT PAKET */}
                {showPackageForm && (
                    <div id="packageFormArea" className="mobile-modal">
                        <h4 style={{marginBottom:'15px'}}>{editingPackageId ? 'Edit Paket' : 'Buat Paket Baru'}</h4>
                        <form onSubmit={handleSavePackage}>
                            <label>Nama Paket</label>
                            <input type="text" required value={packageForm.name} onChange={e=>setPackageForm({...packageForm, name:e.target.value})} />
                            
                            <label>Harga</label>
                            <input type="number" required value={packageForm.price} onChange={e=>setPackageForm({...packageForm, price:e.target.value})} />
                            
                            <label>Foto Paket</label>
                            <div style={{border:'2px dashed #ddd', padding:'20px', textAlign:'center', borderRadius:'12px', marginBottom:'15px', position:'relative', background:'#f9f9f9'}}>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer'}} />
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" style={{maxHeight:'150px', borderRadius:'8px'}} />
                                ) : (
                                    <div style={{color:'#888'}}><UploadCloud size={24}/><p style={{fontSize:'0.8rem'}}>Upload Gambar</p></div>
                                )}
                            </div>

                            <div style={{display:'flex', gap:'10px'}}>
                                <div style={{flex:1}}>
                                    <label>Info Sesi</label>
                                    <input type="text" placeholder="8 Sesi/Bulan" value={packageForm.session_info} onChange={e=>setPackageForm({...packageForm, session_info:e.target.value})} />
                                </div>
                            </div>
                            <label>Deskripsi</label>
                            <textarea rows="2" value={packageForm.description} onChange={e=>setPackageForm({...packageForm, description:e.target.value})} />

                            <div className="btn-group">
                                <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? '...' : 'Simpan'}</button>
                                <button type="button" onClick={()=>setShowPackageForm(false)} className="btn-danger" disabled={uploading}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* LIST PAKET */}
                <div className="system-cards">
                    {availablePackages.map(pkg => (
                        <div key={pkg.id} className="card" style={{padding:'0 0 20px 0', overflow:'hidden'}}>
                            <img src={pkg.image_url || "https://via.placeholder.com/300x200?text=No+Image"} className="card-img-top" alt={pkg.name} />
                            <div style={{padding:'0 20px'}}>
                                <h4>{pkg.name}</h4>
                                <div className="price-tag">{formatRupiah(pkg.price)}</div>
                                <p style={{fontSize:'0.9rem', color:'#666'}}>{pkg.session_info}</p>
                                <div className="btn-group" style={{marginTop:'15px'}}>
                                    <button onClick={() => handleEditPackage(pkg)} className="btn-secondary" style={{flex:1}}><Edit size={16}/></button>
                                    <button onClick={() => handleDeletePackage(pkg.id)} className="btn-danger" style={{width:'auto'}}><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <hr style={{margin:'40px 0', border:'1px dashed #ddd'}}/>

                {/* 2. CMS WEBSITE (PROGRAM UNGGULAN & HEADER) */}
                <h3 style={{marginBottom:'15px', display:'flex', alignItems:'center', gap:'8px'}}>
                    <FileText size={20}/> Edit Website & Program
                </h3>
                
                <div className="card">
                     <label>Judul Website</label>
                     <input value={landingData.hero_title} onChange={e=>setLandingData({...landingData, hero_title:e.target.value})} />
                     <label>Deskripsi</label>
                     <textarea rows="2" value={landingData.hero_description} onChange={e=>setLandingData({...landingData, hero_description:e.target.value})} />
                     
                     {/* INPUT PROGRAM UNGGULAN (BARU DENGAN UPLOAD) */}
                     <div id="programFormInput" style={{background:'#F8FAFC', padding:'20px', borderRadius:'12px', margin:'20px 0', border:'1px dashed #CBD5E1'}}>
                        <h4 style={{marginBottom:'15px'}}>{editingProgramIndex !== null ? 'Edit Program' : 'Tambah Program Unggulan'}</h4>
                        
                        <label>Judul Program</label>
                        <input type="text" value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})} />
                        
                        <label>Foto Program</label>
                        <div style={{border:'2px dashed #ddd', padding:'15px', textAlign:'center', borderRadius:'12px', marginBottom:'15px', position:'relative', background:'white'}}>
                            <input type="file" accept="image/*" onChange={handleProgramFileChange} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer'}} />
                            {programPreviewUrl ? (
                                <img src={programPreviewUrl} alt="Preview" style={{maxHeight:'150px', borderRadius:'8px'}} />
                            ) : (
                                <div style={{color:'#888'}}><UploadCloud size={24}/><p style={{fontSize:'0.8rem'}}>Upload Foto Program</p></div>
                            )}
                        </div>

                        <label>Deskripsi Singkat</label>
                        <textarea value={newProgram.desc} onChange={e => setNewProgram({...newProgram, desc: e.target.value})} rows="2"></textarea>
                        
                        <div className="btn-group">
                            <button type="button" onClick={handleSaveProgram} className="btn-secondary" disabled={uploading}>
                                {uploading ? 'Uploading...' : (editingProgramIndex !== null ? 'Update List Program' : 'Tambah ke List')}
                            </button>
                            {editingProgramIndex !== null && (
                                <button type="button" onClick={handleCancelEditProgram} className="btn-danger">Batal</button>
                            )}
                        </div>
                     </div>

                     {/* LIST PROGRAM */}
                     <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px'}}>
                        {programsList.map((prog, idx) => (
                            <div key={idx} style={{display:'flex', gap:'15px', alignItems:'center', background:'#fff', border:'1px solid #eee', padding:'10px', borderRadius:'8px'}}>
                                <img src={prog.img || "https://via.placeholder.com/50"} style={{width:'50px', height:'50px', borderRadius:'6px', objectFit:'cover'}} />
                                <div style={{flex:1}}>
                                    <div style={{fontWeight:'bold'}}>{prog.title}</div>
                                    <div style={{fontSize:'0.8em', color:'#666'}}>{prog.desc}</div>
                                </div>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button onClick={() => handleStartEditProgram(idx)} style={{background:'none', border:'none', cursor:'pointer', color:'#F59E0B'}}><Edit size={18}/></button>
                                    <button onClick={() => handleDeleteProgram(idx)} style={{background:'none', border:'none', cursor:'pointer', color:'#EF4444'}}><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                     </div>

                     {/* TOMBOL FINAL SAVE */}
                     <div className="btn-group">
                         <button onClick={handleUpdateLanding} className="btn-primary" style={{width:'100%', padding:'15px'}}>SIMPAN PERUBAHAN WEBSITE</button>
                     </div>
                </div>

                <h3 style={{marginTop:'40px'}}>Transaksi Masuk</h3>
                <div className="table-responsive">
                    <table className="invoice-table">
                        <thead><tr><th>User</th><th>Paket</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody>
                            {myInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td><small>{inv.user_id?.substring(0,6)}...</small></td>
                                    <td>{inv.package_name}</td>
                                    <td>{formatRupiah(inv.amount)}</td>
                                    <td><span style={{padding:'4px', background: inv.status==='Lunas'?'#D1FAE5':'#FEF3C7'}}>{inv.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            /* ================= SISWA AREA ================= */
            <div>
                <h3><ShoppingBag size={20}/> Paket Saya</h3>
                {myPackages.length === 0 ? <p className="text-muted">Belum ada paket.</p> : (
                    <div className="system-cards">
                        {myPackages.map(p => (
                            <div key={p.id} className="card">
                                <h4>{p.package_name}</h4>
                                <p>{p.session_info}</p>
                                <div className="btn-secondary" style={{width:'fit-content'}}>{p.status}</div>
                            </div>
                        ))}
                    </div>
                )}
                
                <h3 style={{marginTop:'40px', marginBottom:'20px'}}>Pilih Paket Belajar</h3>
                <div className="system-cards">
                    {availablePackages.map(pkg => (
                        <div key={pkg.id} className="card" style={{padding:'0 0 20px 0', overflow:'hidden'}}>
                            <img src={pkg.image_url || "https://via.placeholder.com/300x200?text=Paket+Belajar"} style={{width:'100%', height:'180px', objectFit:'cover'}} alt={pkg.name} />
                            
                            <div style={{padding:'20px'}}>
                                <h4>{pkg.name}</h4>
                                <div className="price-tag" style={{color:'#059669'}}>{formatRupiah(pkg.price)}</div>
                                <p style={{fontWeight:'500'}}>{pkg.session_info}</p>
                                <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'15px'}}>{pkg.description}</p>
                                
                                <button onClick={() => handleBuyPackage(pkg)} className="btn-primary" style={{width:'100%'}}>
                                    Pilih Paket Ini
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                 <h3 style={{marginTop:'40px'}}>Riwayat Tagihan</h3>
                 <div className="table-responsive">
                    <table className="invoice-table">
                        <thead><tr><th>Tanggal</th><th>Paket</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody>
                            {myInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td>{inv.package_name}</td>
                                    <td>{formatRupiah(inv.amount)}</td>
                                    <td><span style={{padding:'4px 8px', borderRadius:'4px', background: inv.status==='Lunas'?'#D1FAE5':'#FEF3C7', fontSize:'0.8rem', fontWeight:'bold'}}>{inv.status}</span></td>
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