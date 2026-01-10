import React, { useState, useEffect } from "react";
import { Spinner, Container, Button, Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, ShoppingBag, ArrowRight, Calendar } from "lucide-react";
import { packageService } from "../services/packageService";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import StatusModal from "../components/common/StatusModal";

// --- IMPORT KOMPONEN HOME ---
import StudentHome from "../components/home/StudentHome";
import PublicHome from "../components/home/PublicHome";
import TeacherHome from "../components/home/TeacherHome";
import AdminHome from "../components/home/AdminHome";

export default function HomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode beli (jika user klik "Beli Paket Lagi" dari dashboard)
  const isBuyMode = searchParams.get("action") === "buy";

  const [packages, setPackages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  // State untuk status langganan
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [waitingInvoice, setWaitingInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingTesti, setLoadingTesti] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  
  // MODAL STATES
  const [statusModal, setStatusModal] = useState({
    show: false, title: "", msg: "", type: "info"
  });

  const [purchaseModal, setPurchaseModal] = useState({
    show: false,
    pkg: null
  });
  const [processingOrder, setProcessingOrder] = useState(false);

  // --- 1. Fetching Data ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    fetchPackages();
    fetchTestimonials();

    if (user) {
      if (user.role === "guru" || user.role === "admin") {
        setCheckingStatus(false);
      } else {
        checkActiveSubscription();
      }
    } else {
      setCheckingStatus(false);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [user]);

  const fetchPackages = async () => {
    try {
      const data = await packageService.getAll();
      setPackages(data || []);
    } catch (error) {
      console.error("Fetch Packages Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select(`id, content, rating, created_at, student:profiles!student_id (full_name)`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error) setTestimonials(data || []);
    } finally {
      setLoadingTesti(false);
    }
  };

  const checkActiveSubscription = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (invoices?.length > 0) {
        // Cek Waiting / Unpaid
        const waiting = invoices.find(inv => 
            inv.status === 'waiting_confirmation' || 
            inv.status === 'waiting' ||
            inv.status === 'unpaid'
        );
        if (waiting) setWaitingInvoice(waiting);

        // Cek Active
        const active = invoices.find(inv => 
            inv.status === 'paid' && 
            new Date(inv.expiry_date) > new Date()
        );
        if (active) setActiveInvoice(active);
      }
    } catch (error) {
      console.error("Subscription Check Error:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // --- 2. Logic Klik Paket (Membuka Modal) ---
  const handlePackageClick = (pkg) => {
    if (user) {
        // Cek Blocker
        if (waitingInvoice) {
            if (waitingInvoice.status === 'unpaid') {
                navigate("/invoice", { state: { invoice: waitingInvoice } });
                return;
            }
            setStatusModal({
                show: true,
                title: "Tagihan Belum Lunas",
                msg: `Anda masih memiliki transaksi aktif untuk paket "${waitingInvoice.package_name}". Harap selesaikan terlebih dahulu.`,
                type: "warning",
            });
            return;
        }

        if (activeInvoice && !isBuyMode) {
            navigate("/student/dashboard");
            return;
        }

        // BUKA MODAL KONFIRMASI
        setPurchaseModal({ show: true, pkg });

    } else {
      // Belum Login
      navigate("/register", { state: { pkg } });
    }
  };

  // --- 3. Proses Pembelian (Bayar Sekarang / Nanti) ---
  const handleConfirmPurchase = async (payNow) => {
    if (!purchaseModal.pkg) return;
    setProcessingOrder(true);

    try {
        // Ambil Profil
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError) throw new Error("Gagal memuat data profil.");

        const pkg = purchaseModal.pkg;
        const adminFee = 0; 
        const totalAmount = Number(pkg.price) + adminFee;

        // Payload
        const payload = {
            invoice_no: `INV-${Date.now()}`,
            user_id: user.id,
            email: user.email,
            
            student_name: profile.full_name || user.user_metadata?.full_name || user.email,
            student_jenjang: profile.jenjang || "Umum", 
            student_kelas: profile.kelas || "-",        
            student_whatsapp: profile.phone || profile.whatsapp || "-",
            
            package_id: pkg.id,
            package_name: pkg.title,
            package_price: pkg.price,
            
            admin_fee: adminFee,
            total_amount: totalAmount, 
            
            status: "unpaid", // Status awal unpaid
            created_at: new Date()
        };

        const { data, error } = await supabase
            .from("invoices")
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        
        setPurchaseModal({ show: false, pkg: null });

        if (payNow) {
            // BAYAR SEKARANG -> Ke Halaman Invoice (Upload)
            navigate("/invoice", { state: { invoice: data } });
        } else {
            // BAYAR NANTI -> Ke Dashboard
            // Optional: Tampilkan notifikasi kecil/modal sukses dulu
            navigate("/student/dashboard");
        }
        
    } catch (error) {
        console.error("Order Error:", error);
        setStatusModal({
            show: true,
            title: "Gagal",
            msg: "Gagal memproses pesanan: " + (error.message || "Kesalahan sistem"),
            type: "error"
        });
    } finally {
        setProcessingOrder(false);
    }
  };

  // --- 4. Render Controller ---

  if (loading || (user && checkingStatus)) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Role Guru & Admin
  if (user && user.role === "guru") return <TeacherHome user={user} />;
  if (user && user.role === "admin") return <AdminHome user={user} />;

  // Siswa: Menunggu Verifikasi
  if (user && waitingInvoice && waitingInvoice.status !== 'unpaid' && !isBuyMode) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: "80vh" }}>
        {/* ... (Kode Tampilan Waiting sama seperti sebelumnya) ... */}
        <div className="bg-warning bg-opacity-10 p-4 rounded-circle mb-4 text-warning">
          <Clock size={64} />
        </div>
        <h2 className="fw-bold mb-3">Menunggu Verifikasi Admin</h2>
        <p className="text-muted lead mb-4" style={{ maxWidth: "600px" }}>
          Pembelian paket <strong>{waitingInvoice.package_name}</strong> Anda sedang diproses.
        </p>
        <Button variant="primary" size="lg" className="rounded-pill px-5" onClick={() => navigate("/invoice")}>
          Cek Status
        </Button>
      </Container>
    );
  }

  // Siswa Aktif
  if (user && activeInvoice && !isBuyMode) {
    return <StudentHome user={user} activeInvoice={activeInvoice} />;
  }

  // PUBLIC HOME
  return (
    <>
      <PublicHome
        packages={packages}
        loading={loading}
        testimonials={testimonials}
        loadingTesti={loadingTesti}
        user={user}
        isMobile={isMobile}
        handlePackageClick={handlePackageClick}
        waitingInvoice={waitingInvoice}
      />

      {/* --- MODAL KONFIRMASI PEMBELIAN (BARU) --- */}
      <Modal 
        show={purchaseModal.show} 
        onHide={() => !processingOrder && setPurchaseModal({ show: false, pkg: null })}
        centered
        backdrop="static" // Agar tidak ketutup tidak sengaja saat loading
      >
        <Modal.Header closeButton={!processingOrder} className="border-0 pb-0">
          <Modal.Title className="fw-bold">Konfirmasi Pembelian</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {purchaseModal.pkg && (
            <div className="text-center">
               <div className="bg-primary bg-opacity-10 p-3 rounded-4 mb-3 d-inline-block">
                  <ShoppingBag size={40} className="text-primary" />
               </div>
               <h5 className="fw-bold text-dark">{purchaseModal.pkg.title}</h5>
               <h3 className="fw-bold text-primary mb-3">{purchaseModal.pkg.price_display}</h3>
               <p className="text-muted small">
                 Anda akan membuat tagihan untuk paket ini. Silakan pilih metode pembayaran.
               </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex flex-column flex-md-row gap-2 justify-content-center pb-4">
            {/* TOMBOL BAYAR NANTI */}
            <Button 
                variant="outline-secondary" 
                className="rounded-pill px-4 fw-bold w-100"
                onClick={() => handleConfirmPurchase(false)}
                disabled={processingOrder}
            >
                {processingOrder ? <Spinner size="sm" /> : <><Calendar size={18} className="me-2 mb-1"/> Bayar Nanti</>}
            </Button>
            
            {/* TOMBOL BAYAR SEKARANG */}
            <Button 
                variant="primary" 
                className="rounded-pill px-4 fw-bold w-100"
                onClick={() => handleConfirmPurchase(true)}
                disabled={processingOrder}
            >
                {processingOrder ? <Spinner size="sm" /> : <><ArrowRight size={18} className="me-2 mb-1"/> Bayar Sekarang</>}
            </Button>
        </Modal.Footer>
      </Modal>

      <StatusModal
        show={statusModal.show}
        onHide={() => setStatusModal({ ...statusModal, show: false })}
        title={statusModal.title}
        message={statusModal.msg}
        type={statusModal.type}
      />
    </>
  );
}