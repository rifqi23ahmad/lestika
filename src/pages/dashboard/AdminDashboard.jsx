import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Form, InputGroup, Badge, Alert } from 'react-bootstrap';
import { Plus, Edit, Trash2, Save, Users, Package } from 'lucide-react';
import { packageService } from '../../services/packageService';
import { supabase } from '../../lib/supabase'; // Pastikan import ini ada

export default function AdminDashboard() {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]); // State untuk list user
  const [activeTab, setActiveTab] = useState('paket'); // paket | guru
  
  // State manajemen Paket (sama seperti sebelumnya)
  const [isEditing, setIsEditing] = useState(false);
  const [currentPkg, setCurrentPkg] = useState({ title: '', price: '', features: '' });

  useEffect(() => {
    loadPackages();
    if (activeTab === 'guru') loadUsers();
  }, [activeTab]);

  // --- LOGIC PAKET (SAMA SEPERTI SEBELUMNYA) ---
  const loadPackages = async () => {
    try {
      const data = await packageService.getAll();
      setPackages(data);
    } catch (err) { console.error(err); }
  };
  const handleSavePkg = async (e) => {
    e.preventDefault();
    const formattedFeatures = typeof currentPkg.features === 'string' ? currentPkg.features.split(',').map(f => f.trim()) : currentPkg.features;
    const payload = { ...currentPkg, features: formattedFeatures, price: Number(currentPkg.price), price_display: currentPkg.price_display || `Rp ${Number(currentPkg.price).toLocaleString('id-ID')}` };
    try {
      if (currentPkg.id) await packageService.update(currentPkg.id, payload);
      else await packageService.create(payload);
      setIsEditing(false); loadPackages();
    } catch (err) { alert("Gagal menyimpan data"); }
  };
  const handleDeletePkg = async (id) => { if(confirm('Hapus paket?')) { await packageService.delete(id); loadPackages(); }};

  // --- LOGIC MANAJEMEN USER (GURU) ---
  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const handlePromoteToTeacher = async (userId) => {
    if(!confirm("Ubah user ini menjadi Guru?")) return;
    const { error } = await supabase.from('profiles').update({ role: 'guru' }).eq('id', userId);
    if(error) alert("Gagal update role");
    else loadUsers();
  };

  const handleDemoteToStudent = async (userId) => {
    if(!confirm("Kembalikan user ini menjadi Siswa?")) return;
    const { error } = await supabase.from('profiles').update({ role: 'siswa' }).eq('id', userId);
    if(error) alert("Gagal update role");
    else loadUsers();
  };

  return (
    <Row className="g-4">
      {/* Sidebar / Tabs */}
      <Col lg={3}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body>
            <h5 className="fw-bold mb-4">Menu Admin</h5>
            <div className="d-grid gap-2">
              <Button variant={activeTab === 'paket' ? 'primary' : 'light'} className="text-start" onClick={() => setActiveTab('paket')}>
                <Package size={18} className="me-2"/> Manajemen Paket
              </Button>
              <Button variant={activeTab === 'guru' ? 'primary' : 'light'} className="text-start" onClick={() => setActiveTab('guru')}>
                <Users size={18} className="me-2"/> Manajemen User & Guru
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Main Content */}
      <Col lg={9}>
        {activeTab === 'paket' ? (
          // --- TAMPILAN PAKET (SAMA SEPERTI SEBELUMNYA) ---
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Daftar Paket Belajar</h5>
              <Button size="sm" onClick={() => { setCurrentPkg({title:'', price:'', features:''}); setIsEditing(true); }}><Plus size={16} /> Tambah</Button>
            </Card.Header>
            {isEditing && (
              <Card.Body className="bg-light border-bottom">
                <Form onSubmit={handleSavePkg}>
                   {/* Form input fields sama seperti sebelumnya */}
                   <div className="d-flex gap-2 mb-2">
                      <Form.Control placeholder="Nama Paket" value={currentPkg.title} onChange={e => setCurrentPkg({...currentPkg, title: e.target.value})} required />
                      <Form.Control placeholder="Harga" type="number" value={currentPkg.price} onChange={e => setCurrentPkg({...currentPkg, price: e.target.value})} required />
                   </div>
                   <Form.Control as="textarea" placeholder="Fitur (koma)" value={currentPkg.features} onChange={e => setCurrentPkg({...currentPkg, features: e.target.value})} className="mb-2" />
                   <Button type="submit" size="sm">Simpan</Button>
                </Form>
              </Card.Body>
            )}
            <Table responsive hover className="mb-0">
              <thead><tr><th>Paket</th><th>Harga</th><th className="text-end">Aksi</th></tr></thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td>{pkg.title}</td>
                    <td>{pkg.price_display}</td>
                    <td className="text-end">
                      <Button variant="link" className="text-danger p-0" onClick={() => handleDeletePkg(pkg.id)}><Trash2 size={16}/></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        ) : (
          // --- TAMPILAN MANAJEMEN GURU ---
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0 fw-bold">Manajemen User (Guru & Siswa)</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="small">
                <strong>Cara Menambah Guru:</strong> Minta calon guru mendaftar sebagai "Siswa" di halaman depan, lalu cari namanya di sini dan klik tombol <strong>"Jadikan Guru"</strong>.
              </Alert>
              <Table responsive hover className="align-middle">
                <thead className="bg-light">
                  <tr><th>Nama</th><th>Email</th><th>Role Saat Ini</th><th className="text-end">Aksi</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="fw-medium">{u.full_name || '-'}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'danger' : u.role === 'guru' ? 'success' : 'secondary'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {u.role === 'siswa' && (
                          <Button size="sm" variant="outline-success" onClick={() => handlePromoteToTeacher(u.id)}>Jadikan Guru</Button>
                        )}
                        {u.role === 'guru' && (
                          <Button size="sm" variant="outline-warning" onClick={() => handleDemoteToStudent(u.id)}>Jadikan Siswa</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
}