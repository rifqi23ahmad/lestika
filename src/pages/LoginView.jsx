import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { User, Lock, Mail, LogIn, UserPlus, Eye, EyeOff, Phone, Book } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginView({ onNavigate }) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // State Form
  const [formData, setFormData] = useState({ 
    email: '', password: '', confirmPassword: '',
    name: '', jenjang: 'SD', kelas: '', whatsapp: ''
  });
  
  // State UI
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        // Validasi Register
        if (formData.password !== formData.confirmPassword) {
            throw new Error("Password dan Konfirmasi Password tidak sama!");
        }
        await register(formData.email, formData.password, formData.name, {
            jenjang: formData.jenjang,
            kelas: formData.kelas,
            whatsapp: formData.whatsapp
        });
        alert("Pendaftaran berhasil! Silakan login.");
        setIsLoginMode(true); // Balik ke mode login
        setLoading(false); // Stop loading biar user bisa login manual
        return; 
      }
      onNavigate('dashboard');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Gagal memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Card className="shadow-lg border-0" style={{ maxWidth: '500px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">{isLoginMode ? 'Portal Masuk' : 'Daftar Akun Siswa'}</h2>
            <p className="text-muted small">
              {isLoginMode ? 'Masuk untuk mengakses materi' : 'Lengkapi data diri Anda'}
            </p>
          </div>

          {errorMsg && <Alert variant="danger" className="text-center py-2 small">{errorMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* --- FORM REGISTER TAMBAHAN --- */}
            {!isLoginMode && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Nama Lengkap</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white"><User size={18}/></InputGroup.Text>
                    <Form.Control name="name" type="text" placeholder="Nama Siswa" required onChange={handleChange} />
                  </InputGroup>
                </Form.Group>

                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <Form.Label className="small fw-bold text-muted">Jenjang</Form.Label>
                        <Form.Select name="jenjang" onChange={handleChange}>
                            <option value="SD">SD</option>
                            <option value="SMP">SMP</option>
                            <option value="SMA">SMA</option>
                        </Form.Select>
                    </div>
                    <div className="col-6">
                        <Form.Label className="small fw-bold text-muted">Kelas</Form.Label>
                        <Form.Control name="kelas" placeholder="Cth: 12 IPA" required onChange={handleChange} />
                    </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">WhatsApp</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white"><Phone size={18}/></InputGroup.Text>
                    <Form.Control name="whatsapp" type="number" placeholder="0812..." required onChange={handleChange} />
                  </InputGroup>
                </Form.Group>
              </>
            )}

            {/* --- EMAIL & PASSWORD (UMUM) --- */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Email</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white"><Mail size={18}/></InputGroup.Text>
                <Form.Control name="email" type="email" placeholder="email@contoh.com" required onChange={handleChange} />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Password</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white"><Lock size={18}/></InputGroup.Text>
                <Form.Control 
                    name="password" 
                    type={showPass ? "text" : "password"} 
                    placeholder="Minimal 6 karakter" 
                    required minLength={6} onChange={handleChange} 
                />
                <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </Button>
              </InputGroup>
            </Form.Group>

            {!isLoginMode && (
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted">Ulangi Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white"><Lock size={18}/></InputGroup.Text>
                    <Form.Control 
                        name="confirmPassword" 
                        type={showConfirmPass ? "text" : "password"} 
                        placeholder="Konfirmasi password" 
                        required minLength={6} onChange={handleChange} 
                    />
                    <Button variant="outline-secondary" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                        {showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </Button>
                  </InputGroup>
                </Form.Group>
            )}

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm mt-2" disabled={loading}>
              {loading ? 'Memproses...' : (isLoginMode ? 'Masuk Portal' : 'Daftar Sekarang')}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <small className="text-muted me-2">{isLoginMode ? "Belum punya akun?" : "Sudah punya akun?"}</small>
            <Button variant="link" className="p-0 fw-bold text-decoration-none" onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); }}>
              {isLoginMode ? "Daftar Akun Baru" : "Login di sini"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}