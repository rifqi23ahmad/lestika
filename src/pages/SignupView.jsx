import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Phone,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupView() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    jenjang: "SD",
    kelas: "",
    whatsapp: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const preventInvalidNumberInput = (e) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const preventNonLetters = (e) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key.startsWith("Arrow") ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (formData.name.trim().length < 3) {
        throw new Error("Nama minimal harus 3 karakter.");
      }
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(formData.name)) {
        throw new Error(
          "Nama harus huruf saja (tidak boleh ada angka atau simbol)."
        );
      }

      const numberRegex = /^\d+$/;
      if (!numberRegex.test(formData.kelas)) {
        throw new Error("Kelas harus berupa angka.");
      }

      if (!numberRegex.test(formData.whatsapp)) {
        throw new Error("Nomor WhatsApp hanya boleh berisi angka.");
      }
      if (formData.whatsapp.length < 10) {
        throw new Error("Nomor WhatsApp minimal 10 digit.");
      }

      const hasLetter = /[a-zA-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      if (!hasLetter || !hasNumber) {
        throw new Error("Password harus mengandung kombinasi huruf dan angka.");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Password dan Konfirmasi Password tidak sama!");
      }

      await register(formData.email, formData.password, formData.name, {
        jenjang: formData.jenjang,
        kelas: formData.kelas,
        whatsapp: formData.whatsapp,
      });

      setShowSuccessModal(true);
    } catch (error) {
      setErrorMsg(error.message || "Gagal mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/dashboard"); // Langsung masuk karena session sudah aktif
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <Card
        className="shadow-lg border-0"
        style={{ maxWidth: "500px", width: "100%", borderRadius: "15px" }}
      >
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Daftar Akun Siswa</h2>
            <p className="text-muted small">Lengkapi data diri untuk memulai</p>
          </div>

          {errorMsg && (
            <Alert variant="danger" className="small">
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* INPUT NAMA */}
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <User size={18} />
                </InputGroup.Text>
                <Form.Control
                  name="name"
                  placeholder="Nama Lengkap"
                  required
                  onChange={handleChange}
                  onKeyDown={preventNonLetters}
                />
              </InputGroup>
            </Form.Group>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <Form.Select
                  name="jenjang"
                  onChange={handleChange}
                  value={formData.jenjang}
                >
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </Form.Select>
              </div>
              {/* INPUT KELAS */}
              <div className="col-6">
                <InputGroup>
                  <InputGroup.Text className="bg-white px-2">
                    <GraduationCap size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    name="kelas"
                    type="number"
                    placeholder="Kelas"
                    required
                    onChange={handleChange}
                    onKeyDown={preventInvalidNumberInput}
                  />
                </InputGroup>
              </div>
            </div>

            {/* INPUT WHATSAPP */}
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <Phone size={18} />
                </InputGroup.Text>
                <Form.Control
                  name="whatsapp"
                  type="number"
                  placeholder="No. WhatsApp"
                  required
                  onChange={handleChange}
                  onKeyDown={preventInvalidNumberInput}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <Mail size={18} />
                </InputGroup.Text>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  onChange={handleChange}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password (Huruf & Angka)"
                  required
                  minLength={6}
                  onChange={handleChange}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <Lock size={18} />
                </InputGroup.Text>
                <Form.Control
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi Password"
                  required
                  onChange={handleChange}
                />
              </InputGroup>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Sudah punya akun? </span>
            <Button
              variant="link"
              className="p-0 fw-bold text-decoration-none"
              onClick={() => navigate("/login")}
            >
              Login disini
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* MODAL SUKSES */}
      <Modal
        show={showSuccessModal}
        onHide={handleCloseModal}
        centered
        backdrop="static"
      >
        <Modal.Body className="text-center p-4">
          <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-fit text-green-600">
            <CheckCircle size={40} />
          </div>
          <h4 className="fw-bold mb-2">Pendaftaran Berhasil!</h4>
          <p className="text-muted mb-4">
            Akun Anda telah aktif. Anda akan dialihkan ke Dashboard secara
            otomatis.
          </p>
          <Button
            variant="success"
            onClick={handleCloseModal}
            className="w-100"
          >
            Masuk ke Dashboard
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
