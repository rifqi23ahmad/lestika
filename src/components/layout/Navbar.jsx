import React, { useState, useEffect, useRef } from "react";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import { LayoutDashboard, LogOut, User, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);

  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navRef]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setExpanded(false); 
  };

  const handleNavClick = (path) => {
    navigate(path);
    setExpanded(false);
  };

  return (
    <Navbar
      ref={navRef} 
      expanded={expanded} 
      bg="white"
      expand="lg"
      className="shadow-sm sticky-top py-3"
    >
      <Container>
        <Navbar.Brand
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("/");
          }}
          className="d-flex align-items-center fw-bold text-primary fs-4"
        >
          <img
            src="/logo.png"
            alt="Logo MAPA"
            width="32"
            height="32"
            className="me-2 object-fit-contain"
          />
          <span style={{ letterSpacing: "-1px" }}>MAPA</span>
        </Navbar.Brand>

        <Navbar.Toggle
          onClick={() => setExpanded(expanded ? false : "expanded")}
          aria-controls="basic-navbar-nav"
          className="border-0 shadow-none"
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2 gap-lg-4">
            <Nav.Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("/");
              }}
              className="fw-medium text-dark px-3"
            >
              Beranda
            </Nav.Link>

            {user && user.role === "siswa" && (
              <Nav.Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("/jadwal");
                }}
                className="fw-medium text-dark px-3 d-flex align-items-center"
              >
                Jadwal
              </Nav.Link>
            )}

            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-basic"
                  className="d-flex align-items-center border rounded-pill px-3 py-2 text-dark bg-light"
                >
                  <User size={18} className="me-2 text-primary" />
                  <span className="fw-semibold small">Hi, {user.name}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0 mt-2">
                  <Dropdown.Item
                    onClick={() => handleNavClick("/dashboard")}
                    className="d-flex align-items-center py-2"
                  >
                    <LayoutDashboard size={16} className="me-2 text-muted" />{" "}
                    Dashboard
                  </Dropdown.Item>

                  {user.role === "siswa" && (
                    <Dropdown.Item
                      onClick={() => handleNavClick("/invoice")}
                      className="d-flex align-items-center py-2"
                    >
                      <FileText size={16} className="me-2 text-muted" /> Tagihan
                      Saya
                    </Dropdown.Item>
                  )}

                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={handleLogout}
                    className="d-flex align-items-center py-2 text-danger"
                  >
                    <LogOut size={16} className="me-2" /> Keluar
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2 mt-3 mt-lg-0">
                <Button
                  variant="outline-primary"
                  onClick={() => handleNavClick("/signup")}
                  className="px-4 py-2 fw-bold rounded-pill"
                >
                  Daftar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleNavClick("/login")}
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
