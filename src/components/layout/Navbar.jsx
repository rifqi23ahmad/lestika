import React from 'react';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { BookOpen, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AppNavbar({ onNavigate }) {
  const { user, logout } = useAuth();

  const handleNav = (page) => {
    onNavigate(page);
  };

  const handleLogout = () => {
    logout();
    handleNav('home');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top py-3">
      <Container>
        {/* LOGO */}
        <Navbar.Brand 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
          className="d-flex align-items-center fw-bold text-primary fs-4"
        >
          <BookOpen className="me-2" size={32} /> 
          <span style={{ letterSpacing: '-1px' }}>MAPA</span>
        </Navbar.Brand>
        
        {/* Tombol Hamburger (Mobile) */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        
        {/* Menu Items */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2 gap-lg-4">
            <Nav.Link 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNav('home'); }} 
              className="fw-medium text-dark px-3"
            >
              Beranda
            </Nav.Link>
            
            {user ? (
              // Tampilan Sudah Login
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center border rounded-pill px-3 py-2 text-dark bg-light">
                   <User size={18} className="me-2 text-primary"/> 
                   <span className="fw-semibold small">Hi, {user.name}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0 mt-2">
                  <Dropdown.Item onClick={() => handleNav('dashboard')} className="d-flex align-items-center py-2">
                    <LayoutDashboard size={16} className="me-2 text-muted"/> Dashboard
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center py-2 text-danger">
                    <LogOut size={16} className="me-2"/> Keluar
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              // Tampilan Belum Login
              <Button 
                variant="primary" 
                onClick={() => handleNav('login')} 
                className="px-4 py-2 fw-bold rounded-pill shadow-sm"
              >
                Login Portal
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}