import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await login(formData.email, formData.password);
      // Login Sukses -> Ke Dashboard/Home
      navigate('/'); 
    } catch (error) {
      setErrorMsg(error.message || "Email atau password salah.");
    } finally {
      // Pastikan loading mati meskipun error
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%', borderRadius: '15px' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Portal Masuk</h2>
            <p className="text-muted small">Silakan masuk untuk melanjutkan</p>
          </div>

          {errorMsg && <Alert variant="danger" className="small">{errorMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white"><Mail size={18}/></InputGroup.Text>
                <Form.Control 
                    name="email" 
                    type="email" 
                    placeholder="Email" 
                    required 
                    onChange={handleChange} 
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text className="bg-white"><Lock size={18}/></InputGroup.Text>
                <Form.Control 
                    name="password" 
                    type={showPass ? "text" : "password"} 
                    placeholder="Password" 
                    required 
                    onChange={handleChange} 
                />
                <Button variant="outline-secondary" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Belum punya akun? </span>
            <Button variant="link" className="p-0 fw-bold text-decoration-none" onClick={() => navigate('/signup')}>
              Daftar disini
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}