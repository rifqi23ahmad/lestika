import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert, Modal, InputGroup } from "react-bootstrap";
import { Mail, Lock, LogIn, KeyRound, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/common/FormInput";
import { supabase } from "../lib/supabase"; // Import Supabase langsung untuk RPC & OTP

export default function LoginView() {
  const { login, updateUserPassword } = useAuth();
  const navigate = useNavigate();

  // --- STATE LOGIN BIASA ---
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- STATE LUPA PASSWORD (RESET FLOW) ---
  const [showForgot, setShowForgot] = useState(false);
  
  // Data Form Reset
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Status Flow
  const [step, setStep] = useState(1); // 1: Input Email, 2: Input OTP & Password
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Kunci untuk enable field password
  
  // Loading & Error States untuk Modal
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState({ type: "", text: "" });

  // Timer Cooldown OTP
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- HANDLER LOGIN UTAMA ---
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await login(formData.email, formData.password);
      navigate("/"); 
    } catch (error) {
      console.error(error);
      setErrorMsg("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC RESET PASSWORD ---

  // 1. Cek Email & Kirim OTP
  const handleSendOtp = async () => {
    if (!resetEmail) {
        setResetMsg({ type: "danger", text: "Email harus diisi." });
        return;
    }

    setResetLoading(true);
    setResetMsg({ type: "", text: "" });

    try {
        // A. Cek apakah email terdaftar (Menggunakan RPC yang sudah ada)
        const { data: isRegistered, error: rpcError } = await supabase
            .rpc('check_email_exists', { email_input: resetEmail });

        if (rpcError) throw rpcError;

        // B. Logic: Jika TIDAK terdaftar -> Error
        if (!isRegistered) {
            throw new Error("Email belum terdaftar di sistem kami.");
        }

        // C. Jika Terdaftar -> Kirim OTP
        const { error: otpError } = await supabase.auth.signInWithOtp({
            email: resetEmail,
        });

        if (otpError) throw otpError;

        setOtpSent(true);
        setStep(2); // Pindah ke tampilan input OTP
        setTimer(60); // Cooldown 60 detik
        setResetMsg({ type: "success", text: "Kode OTP telah dikirim ke email Anda." });

    } catch (error) {
        setResetMsg({ type: "danger", text: error.message });
    } finally {
        setResetLoading(false);
    }
  };

  // 2. Verifikasi OTP
  const handleVerifyOtp = async () => {
    if (!resetOtp) return;
    setResetLoading(true);
    setResetMsg({ type: "", text: "" });

    try {
        // Verifikasi OTP (Tipe: Magiclink/Signup/Recovery - 'email' biasanya mencakup magiclink/otp login)
        const { data, error } = await supabase.auth.verifyOtp({
            email: resetEmail,
            token: resetOtp,
            type: 'email' // Menggunakan tipe 'email' untuk login via OTP
        });

        if (error) throw new Error("Kode OTP salah atau kadaluarsa.");
        if (!data.session) throw new Error("Gagal membuat sesi.");

        // Jika Sukses
        setIsVerified(true); // ENABLE FIELD PASSWORD
        setResetMsg({ type: "success", text: "Verifikasi berhasil! Silakan buat password baru." });

    } catch (error) {
        setResetMsg({ type: "danger", text: error.message });
    } finally {
        setResetLoading(false);
    }
  };

  // 3. Simpan Password Baru
  const handleSaveNewPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
        setResetMsg({ type: "danger", text: "Password tidak boleh kosong." });
        return;
    }

    if (newPassword !== confirmNewPassword) {
        setResetMsg({ type: "danger", text: "Konfirmasi password tidak cocok." });
        return;
    }

    // Validasi Regex Password (Opsional tapi disarankan)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
        setResetMsg({ type: "danger", text: "Password harus kombinasi huruf dan angka." });
        return;
    }

    setResetLoading(true);
    try {
        // Update user yang sedang login (karena verifyOtp tadi sudah membuat sesi login)
        await updateUserPassword(newPassword);
        
        setResetMsg({ type: "success", text: "Password berhasil diubah! Mengalihkan..." });
        
        // Tutup modal dan redirect setelah sukses
        setTimeout(() => {
            setShowForgot(false);
            navigate("/"); // Sudah login otomatis, langsung ke dashboard
        }, 2000);

    } catch (error) {
        setResetMsg({ type: "danger", text: "Gagal menyimpan password: " + error.message });
    } finally {
        setResetLoading(false);
    }
  };

  // Reset State saat modal ditutup
  const handleCloseModal = () => {
    setShowForgot(false);
    setStep(1);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setOtpSent(false);
    setIsVerified(false);
    setResetMsg({ type: "", text: "" });
  };

  return (
    <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "calc(100vh - 80px)" }}>
      <Card className="shadow-lg border-0" style={{ maxWidth: "450px", width: "100%", borderRadius: "15px" }}>
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
              <LogIn size={32} className="text-primary" />
            </div>
            <h2 className="fw-bold text-primary">Selamat Datang</h2>
            <p className="text-muted small">Masuk untuk melanjutkan belajar</p>
          </div>

          {errorMsg && <Alert variant="danger" className="small text-center">{errorMsg}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormInput icon={Mail} name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} autoFocus />
            <FormInput icon={Lock} name="password" type="password" placeholder="Password" required value={formData.password} onChange={handleChange} />
            
            <div className="d-flex justify-content-end mb-3">
              <Button variant="link" className="text-decoration-none small text-muted p-0" onClick={() => setShowForgot(true)}>
                Lupa Password?
              </Button>
            </div>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm mb-3" disabled={loading}>
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">Belum punya akun? </span>
            <Link to="/signup" className="fw-bold text-decoration-none">Daftar disini</Link>
          </div>
        </Card.Body>
      </Card>

      {/* --- MODAL RESET PASSWORD (CUSTOM FLOW) --- */}
      <Modal show={showForgot} onHide={handleCloseModal} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-4 px-4">
          
          {/* Pesan Status */}
          {resetMsg.text && (
            <Alert variant={resetMsg.type} className="small py-2 mb-3">
              {resetMsg.text}
            </Alert>
          )}

          {/* STEP 1: INPUT EMAIL */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">Email Terdaftar</Form.Label>
            <InputGroup>
                <InputGroup.Text className="bg-light"><Mail size={18}/></InputGroup.Text>
                <Form.Control 
                    type="email" 
                    placeholder="Masukkan email anda"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={otpSent || isVerified} // Disable jika OTP sudah dikirim atau verified
                />
                {!otpSent && !isVerified && (
                    <Button variant="primary" onClick={handleSendOtp} disabled={resetLoading}>
                        {resetLoading ? "Cek..." : "Kirim OTP"}
                    </Button>
                )}
            </InputGroup>
            {otpSent && !isVerified && (
                <div className="text-end mt-1">
                     <small className="text-muted">
                        {timer > 0 ? `Kirim ulang dalam ${timer}s` : <span role="button" className="text-primary fw-bold" onClick={handleSendOtp}>Kirim Ulang Kode</span>}
                     </small>
                </div>
            )}
          </Form.Group>

          {/* STEP 2: INPUT OTP & VERIFIKASI */}
          {step >= 2 && (
             <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">Kode Verifikasi (OTP)</Form.Label>
                <InputGroup>
                    <InputGroup.Text className="bg-light"><KeyRound size={18}/></InputGroup.Text>
                    <Form.Control 
                        type="text" 
                        placeholder="Kode 6 digit"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        maxLength={6}
                        disabled={isVerified} // Disable jika sudah verified
                    />
                    {isVerified ? (
                        <Button variant="success" disabled><CheckCircle size={18}/></Button>
                    ) : (
                        <Button variant="warning" className="text-white fw-bold" onClick={handleVerifyOtp} disabled={resetLoading || !resetOtp}>
                            {resetLoading ? "..." : "Verifikasi"}
                        </Button>
                    )}
                </InputGroup>
             </Form.Group>
          )}

          {/* STEP 3: PASSWORD BARU (Hanya Enable jika Verified) */}
          <div className={`transition-all ${step >= 2 ? "d-block" : "d-none"}`}>
            <hr className="my-3"/>
            <p className="small text-muted mb-2">Buat Password Baru:</p>
            
            <FormInput 
                icon={Lock} 
                type="password" 
                placeholder="Password Baru" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!isVerified} // DISABLED SAMPAI VERIFIED
                className="mb-2"
            />
            
            <FormInput 
                icon={Lock} 
                type="password" 
                placeholder="Konfirmasi Password" 
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={!isVerified} // DISABLED SAMPAI VERIFIED
                className="mb-3"
            />

            <Button 
                variant="primary" 
                className="w-100 fw-bold" 
                disabled={!isVerified || resetLoading} // TOMBOL MATI SAMPAI VERIFIED
                onClick={handleSaveNewPassword}
            >
                {resetLoading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </div>

        </Modal.Body>
      </Modal>
    </Container>
  );
}