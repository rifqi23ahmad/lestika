import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { User, Lock, Mail, Eye, EyeOff, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupView() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ 
    email: '', password: '', confirmPassword: '',
    name: '', jenjang: 'SD', kelas: '', whatsapp: ''
  });
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Password dan Konfirmasi Password tidak sama!");
      }

      await register(formData.email, formData.password, formData.name, {
        jenjang: formData.jenjang,
        kelas: formData.kelas,
        whatsapp: formData.whatsapp
      });

      alert("Pendaftaran berhasil! Silakan login.");
      navigate('/login');

    } catch (error) {
      setErrorMsg(error.message || "Gagal mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Card className="shadow-lg border-0" style={{ maxWidth: '500px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Daftar Akun Siswa</h2>
            <p className="text-muted small">Lengkapi data diri untuk memulai</p>
          </div>

          {errorMsg && <Alert variant="danger" className="small">{errorMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white"><User size={18}/></InputGroup.Text>
                <Form.Control name="name" placeholder="Nama Lengkap" required onChange={handleChange} />
              </InputGroup>
            </Form.Group>

            <div className="row g-2 mb-3">
                <div className="col-6">
                    <Form.Select name="jenjang" onChange={handleChange} value={formData.jenjang}>
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA">SMA</option>
                    </Form.Select>
                </div>
                <div className="col-6">
                    <Form.Control name="kelas" placeholder="Kelas" required onChange={handleChange} />
                </div>
            </div>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white"><Phone size={18}/></InputGroup.Text>
                <Form.Control name="whatsapp" type="number" placeholder="No. WhatsApp" required onChange={handleChange} />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white"><Mail size={18}/></InputGroup.Text>
                <Form.Control name="email" type="email" placeholder="Email" required onChange={handleChange} />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white"><Lock size={18}/></InputGroup.Text>
                <Form.Control 
                    name="password" 
                    type={showPass ? "text" : "password"} 
                    placeholder="Password" 
                    required minLength={6} onChange={handleChange} 
                />
                <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text className="bg-white"><Lock size={18}/></InputGroup.Text>
                <Form.Control name="confirmPassword" type="password" placeholder="Ulangi Password" required onChange={handleChange} />
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Sudah punya akun? </span>
            <Button variant="link" className="p-0 fw-bold text-decoration-none" onClick={() => navigate('/login')}>
              Login disini
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}