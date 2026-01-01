import React from 'react';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
// [UBAH] Hapus 'BookOpen' dari import karena sudah diganti gambar
import { LayoutDashboard, LogOut, User, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top py-3">
      <Container>
        {/* LOGO */}
        <Navbar.Brand 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }} 
          className="d-flex align-items-center fw-bold text-primary fs-4"
        >
          {/* [UBAH] Ganti Icon dengan Image Logo */}
          <img 
            src="/logo.png" 
            alt="Logo MAPA" 
            width="32" 
            height="32" 
            className="me-2 object-fit-contain"
          />
          <span style={{ letterSpacing: '-1px' }}>MAPA</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2 gap-lg-4">
            <Nav.Link 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/'); }} 
              className="fw-medium text-dark px-3"
            >
              Beranda
            </Nav.Link>
            
            {/* MENU JADWAL (Hanya muncul jika login) */}
            {user && (
              <Nav.Link 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/jadwal'); }} 
                className="fw-medium text-dark px-3 d-flex align-items-center"
              >
                 Jadwal
              </Nav.Link>
            )}
            
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center border rounded-pill px-3 py-2 text-dark bg-light">
                   <User size={18} className="me-2 text-primary"/> 
                   <span className="fw-semibold small">Hi, {user.name}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0 mt-2">
                  <Dropdown.Item onClick={() => navigate('/dashboard')} className="d-flex align-items-center py-2">
                    <LayoutDashboard size={16} className="me-2 text-muted"/> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate('/invoice')} className="d-flex align-items-center py-2">
                    <FileText size={16} className="me-2 text-muted"/> Tagihan Saya
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center py-2 text-danger">
                    <LogOut size={16} className="me-2"/> Keluar
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2 mt-3 mt-lg-0">
                <Button 
                    variant="outline-primary" 
                    onClick={() => navigate('/signup')} 
                    className="px-4 py-2 fw-bold rounded-pill"
                >
                    Daftar
                </Button>
                <Button 
                    variant="primary" 
                    onClick={() => navigate('/login')} 
                    className="px-4 py-2 fw-bold rounded-pill shadow-sm"
                >
                    Masuk
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}