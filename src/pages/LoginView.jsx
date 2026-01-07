import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/common/FormInput";

export default function LoginView() {
  const { login, sendLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("password");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otpCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isUnverified, setIsUnverified] = useState(false);

  const handleChange = (e) => {
    setIsUnverified(false);
    setErrorMsg("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUnverifiedResend = async () => {
    setLoading(true);
    try {
      await sendLoginOtp(formData.email);
      setLoginMode("otp-verify");
      setSuccessMsg(
        "Kode verifikasi baru telah dikirim! Cek inbox/spam email Anda."
      );
      setErrorMsg("");
      setIsUnverified(false);
    } catch (error) {
      let msg = error.message;
      if (msg === "USER_NOT_FOUND") msg = "Akun tidak ditemukan.";
      setErrorMsg("Gagal mengirim OTP: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setIsUnverified(false);

    try {
      if (loginMode === "password") {
        await login(formData.email, formData.password);
        navigate("/");
      } else if (loginMode === "otp-request") {
        await sendLoginOtp(formData.email);
        setLoginMode("otp-verify");
        setSuccessMsg(
          "Kode OTP telah dikirim ke email Anda. Silakan cek inbox/spam."
        );
      } else if (loginMode === "otp-verify") {
        await verifyLoginOtp(formData.email, formData.otpCode);
        navigate("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
      let msg = error.message;

      if (msg === "UNVERIFIED_ACCOUNT" || msg.includes("Email not confirmed")) {
        setIsUnverified(true);
        msg =
          "Email belum diverifikasi. Klik tombol di bawah untuk verifikasi.";
      } else if (msg === "USER_NOT_FOUND") {
        msg =
          "Email belum terdaftar. Silakan daftar akun baru terlebih dahulu.";
      } else if (msg.includes("Invalid login credentials")) {
        msg = "Email atau password salah.";
      } else if (msg.includes("Token has expired")) {
        msg = "Kode OTP kadaluarsa. Silakan kirim ulang.";
      }

      setErrorMsg(msg || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsUnverified(false);
    setFormData({ ...formData, password: "", otpCode: "" });
    setLoginMode(loginMode === "password" ? "otp-request" : "password");
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <Card
        className="shadow-lg border-0"
        style={{ maxWidth: "450px", width: "100%", borderRadius: "15px" }}
      >
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Portal Masuk</h2>
            <p className="text-muted small">
              {loginMode === "password"
                ? "Silakan masuk dengan kata sandi"
                : loginMode === "otp-verify"
                ? "Masukkan kode verifikasi"
                : "Masuk tanpa kata sandi (OTP)"}
            </p>
          </div>

          {errorMsg && (
            <Alert variant="danger" className="small">
              {errorMsg}
              {isUnverified && (
                <div className="mt-2 border-top pt-2 border-danger-subtle">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-100"
                    onClick={handleUnverifiedResend}
                    disabled={loading}
                  >
                    {loading ? "Mengirim..." : "Kirim Kode Verifikasi OTP"}
                  </Button>
                </div>
              )}
            </Alert>
          )}

          {successMsg && (
            <Alert variant="success" className="small">
              {successMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <FormInput
              icon={Mail}
              name="email"
              type="email"
              placeholder="Email Anda"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loginMode === "otp-verify"}
              className="mb-3"
            />

            {loginMode === "password" && (
              <FormInput
                icon={Lock}
                name="password"
                type="password"
                placeholder="Kata Sandi"
                required
                value={formData.password}
                onChange={handleChange}
                className="mb-4"
              />
            )}
            {loginMode === "otp-verify" && (
              <FormInput
                icon={KeyRound}
                name="otpCode"
                type="text"
                placeholder="Kode OTP"
                required
                value={formData.otpCode}
                onChange={handleChange}
                className="mb-4 text-center fw-bold fs-5"
                autoFocus
                autoComplete="off"
                maxLength={8}
              />
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold shadow-sm mb-3"
              disabled={loading}
            >
              {loading
                ? "Memproses..."
                : loginMode === "password"
                ? "Masuk Sekarang"
                : loginMode === "otp-request"
                ? "Kirim Kode OTP"
                : "Verifikasi & Masuk"}
            </Button>

            {loginMode === "otp-verify" && (
              <Button
                variant="link"
                className="text-decoration-none w-100 text-muted small p-0 mb-3"
                onClick={() => {
                  setLoginMode("otp-request");
                  setSuccessMsg("");
                  setErrorMsg("");
                }}
                disabled={loading}
              >
                <ArrowLeft size={14} className="me-1" /> Kirim Ulang / Ganti
                Email
              </Button>
            )}
          </Form>

          {loginMode !== "otp-verify" && (
            <div className="text-center pt-2 border-top mt-3">
              <div className="d-grid gap-2 mb-3 mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={toggleMode}
                  className="border-0 bg-light text-dark"
                >
                  {loginMode === "password"
                    ? "Lupa password? Masuk dengan OTP"
                    : "Kembali masuk dengan Password"}
                </Button>
              </div>
            </div>
          )}
          <div className="text-center">
            <span className="text-muted small">Belum punya akun? </span>
            <Button
              variant="link"
              className="p-0 fw-bold text-decoration-none"
              onClick={() => navigate("/signup")}
            >
              Daftar disini
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
