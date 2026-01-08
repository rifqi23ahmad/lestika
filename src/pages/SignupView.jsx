import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import {
  User,
  Mail,
  Lock,
  BookOpen,
  Phone,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/common/FormInput";
import { supabase } from "../lib/supabase";

export default function SignupView() {
  const { register, verifySignupOtp, sendLoginOtp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("register");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    jenjang: "SMA",
    kelas: "10",
    whatsapp: "",
    otpCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "fullName") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    if (name === "kelas") {
      const onlyNums = value.replace(/\D/g, "");

      if (onlyNums === "") {
        cleanValue = "";
      } else {
        if (parseInt(onlyNums) > 12) return;
        cleanValue = onlyNums;
      }
    }

    if (name === "whatsapp") {
      const onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length > 12) return;
      cleanValue = onlyNums;
    }

    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handleResendOtp = async () => {
    if (loading || countdown > 0) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await sendLoginOtp(formData.email);
      setSuccessMsg("Kode baru telah dikirim! Cek inbox/spam.");
      setCountdown(60);
    } catch (error) {
      setErrorMsg("Gagal mengirim ulang kode: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "register") {
        if (!formData.fullName.trim()) {
          throw new Error("Nama lengkap wajib diisi.");
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;
        if (!passwordRegex.test(formData.password)) {
          throw new Error(
            "Password harus mengandung kombinasi huruf dan angka."
          );
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error("Password konfirmasi tidak cocok!");
        }

        if (formData.whatsapp.length < 10) {
          throw new Error("Nomor WhatsApp minimal 10 digit.");
        }

        const { data: isRegistered, error: rpcError } = await supabase.rpc(
          "check_email_exists",
          { email_input: formData.email }
        );

        if (rpcError) console.error("RPC Error:", rpcError);

        if (isRegistered) {
          setErrorMsg("Email sudah terdaftar! Mengalihkan ke halaman login...");
          setIsRedirecting(true);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        await register(formData.email, formData.password, formData.fullName, {
          jenjang: formData.jenjang,
          kelas: formData.kelas,
          whatsapp: formData.whatsapp,
        });

        setMode("otp");
        setSuccessMsg("Kode verifikasi dikirim ke email Anda.");
        setCountdown(60);
      } else {
        await verifySignupOtp(formData.email, formData.otpCode);
        navigate("/");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      let msg = error.message;

      if (msg === "EMAIL_EXISTS" || msg.includes("already registered")) {
        setErrorMsg("Email sudah terdaftar! Mengalihkan ke halaman login...");
        setIsRedirecting(true);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (msg.includes("SETTING_ERROR")) {
        setErrorMsg("Konfigurasi server salah. Harap hubungi admin.");
        return;
      }

      setErrorMsg(msg || "Gagal memproses data.");
    } finally {
      if (!isRedirecting) setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <Card
        className="shadow-lg border-0"
        style={{ maxWidth: "600px", width: "100%", borderRadius: "15px" }}
      >
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">
              {mode === "register" ? "Daftar Akun Baru" : "Verifikasi Email"}
            </h2>
            <p className="text-muted small">
              {mode === "register"
                ? "Bergabunglah untuk mulai belajar"
                : `Masukkan kode OTP yang dikirim ke ${formData.email}`}
            </p>
          </div>

          {errorMsg && (
            <Alert variant="danger" className="small">
              {errorMsg}
            </Alert>
          )}
          {successMsg && (
            <Alert variant="success" className="small">
              {successMsg}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {mode === "register" ? (
              <>
                <FormInput
                  icon={User}
                  name="fullName"
                  placeholder="Nama Lengkap"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <Row>
                  <Col md={6}>
                    <FormInput
                      icon={Mail}
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <FormInput
                      icon={Phone}
                      name="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      placeholder="No WhatsApp"
                      required
                      value={formData.whatsapp}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <BookOpen size={18} className="text-muted" />
                        </span>
                        <Form.Select
                          name="jenjang"
                          value={formData.jenjang}
                          onChange={handleChange}
                          className="border-start-0 shadow-none bg-light"
                          style={{ height: "45px" }}
                        >
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <FormInput
                      icon={BookOpen}
                      name="kelas"
                      type="text"
                      inputMode="numeric"
                      placeholder="Kelas (Maks 12)"
                      required
                      value={formData.kelas}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <FormInput
                      icon={Lock}
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <FormInput
                      icon={Lock}
                      name="confirmPassword"
                      type="password"
                      placeholder="Konfirmasi"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="mb-4"
                    />
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <FormInput
                  icon={KeyRound}
                  name="otpCode"
                  type="text"
                  placeholder="Kode OTP"
                  required
                  value={formData.otpCode}
                  onChange={handleChange}
                  className="mb-3 text-center fw-bold fs-5"
                  autoFocus
                  maxLength={8}
                />

                <div className="text-end mb-4">
                  <Button
                    variant="link"
                    className="text-muted small text-decoration-none p-0"
                    onClick={handleResendOtp}
                    disabled={loading || countdown > 0}
                    style={{
                      cursor:
                        loading || countdown > 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    {countdown > 0
                      ? `Kirim ulang kode (${countdown}s)`
                      : "Kirim ulang kode"}
                  </Button>
                </div>
              </>
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-bold shadow-sm mb-3"
              disabled={loading || isRedirecting}
            >
              {isRedirecting
                ? "Mengalihkan..."
                : loading
                ? "Memproses..."
                : mode === "register"
                ? "Daftar Sekarang"
                : "Verifikasi & Masuk"}
            </Button>

            {mode === "otp" && (
              <Button
                variant="link"
                className="text-decoration-none w-100 text-muted small"
                onClick={() => {
                  setMode("register");
                  setSuccessMsg("");
                  setErrorMsg("");
                }}
                disabled={loading}
              >
                <ArrowLeft size={14} className="me-1" /> Edit Data
              </Button>
            )}
          </Form>

          {mode === "register" && (
            <div className="text-center mt-3 pt-3 border-top">
              <span className="text-muted small">Sudah punya akun? </span>
              <Button
                variant="link"
                className="p-0 fw-bold text-decoration-none"
                onClick={() => navigate("/login")}
              >
                Masuk disini
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
