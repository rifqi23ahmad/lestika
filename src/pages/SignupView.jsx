import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import {
  User,
  Lock,
  Mail,
  Phone,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/common/FormInput";
import StatusModal from "../components/common/StatusModal";
import AuthLayout from "../components/layout/AuthLayout";

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
        throw new Error("Nama harus huruf saja (tidak boleh angka/simbol).");
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

  const footerContent = (
    <>
      <span className="text-muted small">Sudah punya akun? </span>
      <Button
        variant="link"
        className="p-0 fw-bold text-decoration-none"
        onClick={() => navigate("/login")}
      >
        Login disini
      </Button>
    </>
  );

  return (
    <AuthLayout
      title="Daftar Akun Siswa"
      subtitle="Lengkapi data diri untuk memulai"
      maxWidth="500px"
      footer={footerContent}
    >
      {errorMsg && (
        <Alert variant="danger" className="small">
          {errorMsg}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <FormInput
          icon={User}
          name="name"
          placeholder="Nama Lengkap"
          required
          onChange={handleChange}
          onKeyDown={preventNonLetters}
        />

        <div className="row g-2 mb-3">
          <div className="col-6">
            <Form.Select
              name="jenjang"
              onChange={handleChange}
              value={formData.jenjang}
              style={{ height: "100%" }} 
              className="form-control"
            >
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
            </Form.Select>
          </div>
          <div className="col-6">
            <FormInput
              icon={GraduationCap}
              name="kelas"
              type="number"
              placeholder="Kelas"
              required
              onChange={handleChange}
              onKeyDown={preventInvalidNumberInput}
              className="mb-0"
            />
          </div>
        </div>

        <FormInput
          icon={Phone}
          name="whatsapp"
          type="number"
          placeholder="No. WhatsApp"
          required
          onChange={handleChange}
          onKeyDown={preventInvalidNumberInput}
        />

        <FormInput
          icon={Mail}
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />

        <FormInput
          icon={Lock}
          name="password"
          type="password"
          placeholder="Password (Huruf & Angka)"
          required
          minLength={6}
          onChange={handleChange}
        />

        <FormInput
          icon={Lock}
          name="confirmPassword"
          type="password"
          placeholder="Ulangi Password"
          required
          onChange={handleChange}
          className="mb-4"
        />

        <Button
          variant="primary"
          type="submit"
          className="w-100 py-2 fw-bold shadow-sm"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </Button>
      </Form>

      <StatusModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        type="success"
        title="Pendaftaran Berhasil!"
        message="Akun Anda telah aktif. Anda akan dialihkan ke Dashboard secara otomatis."
        actionLabel="Masuk ke Dashboard"
        onAction={() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }}
      />
    </AuthLayout>
  );
}