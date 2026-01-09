import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/common/FormInput";

export default function UpdatePasswordView() {
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;
      if (!passwordRegex.test(passwords.password)) {
        throw new Error("Password harus mengandung kombinasi huruf dan angka.");
      }

      if (passwords.password !== passwords.confirmPassword) {
        throw new Error("Password konfirmasi tidak cocok.");
      }

      await updateUserPassword(passwords.password);

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container
        className="d-flex align-items-center justify-content-center py-5"
        style={{ minHeight: "80vh" }}
      >
        <Card
          className="shadow text-center p-5 border-0"
          style={{ maxWidth: "500px", borderRadius: "15px" }}
        >
          <div className="mb-3 text-success">
            <CheckCircle size={64} />
          </div>
          <h3 className="fw-bold mb-3">Password Berhasil Diubah!</h3>
          <p className="text-muted">
            Password Anda telah diperbarui dan semua sesi login lainnya telah
            dikeluarkan untuk keamanan.
          </p>
          <p className="text-muted small">Mengalihkan ke halaman login...</p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Masuk Sekarang
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <Card
        className="shadow-lg border-0"
        style={{ maxWidth: "450px", width: "100%", borderRadius: "15px" }}
      >
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">Buat Password Baru</h3>
            <p className="text-muted small">
              Masukkan password baru yang aman.
            </p>
          </div>

          {errorMsg && (
            <Alert variant="danger" className="small">
              {errorMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <FormInput
              icon={Lock}
              name="password"
              type="password"
              placeholder="Password Baru (Huruf & Angka)"
              required
              value={passwords.password}
              onChange={handleChange}
            />
            <FormInput
              icon={Lock}
              name="confirmPassword"
              type="password"
              placeholder="Konfirmasi Password Baru"
              required
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="mb-4"
            />

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? "Menyimpan Password..." : "Simpan Password Baru"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
