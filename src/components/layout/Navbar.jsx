import React, { useState, useEffect, useRef } from "react";
import { Navbar, Container, Nav, Button, Dropdown } from "react-bootstrap";
import {
  LayoutDashboard,
  LogOut,
  User,
  FileText,
  Home,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const navRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go = (path) => navigate(path);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderAvatar = () => {
    if (user?.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt="Profile"
          className="rounded-circle object-fit-cover"
          style={{ width: 36, height: 36 }}
        />
      );
    }

    const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
    return (
      <div
        className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
        style={{ width: 36, height: 36 }}
      >
        {initial}
      </div>
    );
  };

  return (
    <Navbar bg="white" className="sticky-top border-bottom shadow-sm py-3">
      <Container>
        <Navbar.Brand
          onClick={() => go("/")}
          className="d-flex align-items-center gap-2 fw-bold text-primary"
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="MAPA" width="32" height="32" />

          <span
            className={isMobile ? "fs-6" : "fs-4"}
            style={{ letterSpacing: "-0.5px" }}
          >
            MAPA
          </span>
        </Navbar.Brand>

        {/* RIGHT */}
        <Nav className="ms-auto align-items-center">
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                className="profile-toggle p-0 border-0 bg-transparent"
                style={{ cursor: "pointer" }}
              >
                {isMobile ? (
                  renderAvatar()
                ) : (
                  <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-2 bg-light">
                    {renderAvatar()}
                    <span className="fw-semibold small">
                      {user.name || "Akun"}
                    </span>
                  </div>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu className="border-0 shadow rounded-4 mt-2">
                <Dropdown.Item
                  onClick={() => go("/")}
                  className="d-flex align-items-center gap-2"
                >
                  <Home size={16} className="text-muted" /> Beranda
                </Dropdown.Item>

                <Dropdown.Item
                  onClick={() => go("/dashboard")}
                  className="d-flex align-items-center gap-2"
                >
                  <LayoutDashboard size={16} className="text-muted" /> Dashboard
                </Dropdown.Item>

                {user.role === "siswa" && (
                  <>
                    <Dropdown.Item
                      onClick={() => go("/student/dashboard?tab=jadwal")}
                      className="d-flex align-items-center gap-2"
                    >
                      <Calendar size={16} className="text-muted" />
                      Jadwal Saya
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() => go("/invoice")}
                      className="d-flex align-items-center gap-2"
                    >
                      <FileText size={16} className="text-muted" />
                      Tagihan Saya
                    </Dropdown.Item>
                  </>
                )}

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-2 text-danger"
                >
                  <LogOut size={16} /> Keluar
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                className="rounded-pill fw-bold px-4"
                onClick={() => go("/signup")}
              >
                Daftar
              </Button>
              <Button
                variant="primary"
                className="rounded-pill fw-bold px-4 shadow-sm"
                onClick={() => go("/login")}
              >
                Masuk
              </Button>
            </div>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
