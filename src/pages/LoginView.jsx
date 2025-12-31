import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { User, Lock, Mail, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginView({ onNavigate }) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    name: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        // HARDCODE ROLE 'SISWA' SAAT REGISTER MANDIRI
        await register(formData.email, formData.password, formData.name, 'siswa');
        alert("Pendaftaran berhasil! Anda otomatis login.");
      }
      onNavigate('dashboard');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Gagal memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">{isLoginMode ? 'Portal Masuk' : 'Daftar Siswa Baru'}</h2>
            <p className="text-muted small">
              {isLoginMode ? 'Silakan login untuk melanjutkan' : 'Daftar untuk mulai belajar'}
            </p>
          </div>

          {errorMsg && <Alert variant="danger" className="text-center py-2 text-sm">{errorMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">Nama Lengkap</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><User size={18} className="text-muted"/></span>
                  <Form.Control name="name" type="text" placeholder="Nama Lengkap" className="border-start-0" required onChange={handleChange} />
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Email</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Mail size={18} className="text-muted"/></span>
                <Form.Control name="email" type="email" placeholder="email@contoh.com" className="border-start-0" required onChange={handleChange} />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted">Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Lock size={18} className="text-muted"/></span>
                <Form.Control name="password" type="password" placeholder="******" className="border-start-0" required minLength={6} onChange={handleChange} />
              </div>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center shadow-sm" disabled={loading}>
              {loading ? 'Memproses...' : (isLoginMode ? <><LogIn size={18} className="me-2" /> Masuk Portal</> : <><UserPlus size={18} className="me-2" /> Daftar Siswa</>)}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <small className="text-muted me-2">{isLoginMode ? "Belum punya akun?" : "Sudah punya akun?"}</small>
            <Button variant="link" className="p-0 fw-bold text-decoration-none" onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); }}>
              {isLoginMode ? "Daftar Siswa" : "Login di sini"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}