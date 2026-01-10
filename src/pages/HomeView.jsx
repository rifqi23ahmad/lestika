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
  
  // State Profile (untuk Nama Siswa)
  const [profile, setProfile] = useState(null);

  // State untuk status langganan
  const [lastPaidInvoice, setLastPaidInvoice] = useState(null); // Ganti nama biar lebih jelas
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
        // Fetch Profile & Subscription secara paralel
        Promise.all([fetchProfile(), checkSubscriptionStatus()]).finally(() => {
            setCheckingStatus(false);
        });
      }
    } else {
      setCheckingStatus(false);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [user]);

  const fetchProfile = async () => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (!error && data) {
            setProfile(data);
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
    }
  };

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

  // --- LOGIC UTAMA MENENTUKAN STATUS ---
  const checkSubscriptionStatus = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // Urutkan dari yg terbaru

      if (error) throw error;

      if (invoices?.length > 0) {
        // 1. Cek apakah ada yang statusnya Waiting / Unpaid
        const waiting = invoices.find(inv => 
            inv.status === 'waiting_confirmation' || 
            inv.status === 'waiting' ||
            inv.status === 'unpaid'
        );
        if (waiting) setWaitingInvoice(waiting);

        // 2. Ambil invoice PAID yang paling terakhir (terlepas dari tanggal expiry)
        // Ini penting agar kita tahu user statusnya "Active" atau "Expired"
        const lastPaid = invoices.find(inv => inv.status === 'paid');
        
        if (lastPaid) {
             setLastPaidInvoice(lastPaid);
        }
      }
    } catch (error) {
      console.error("Subscription Check Error:", error);
    }
  };

  // --- 2. Logic Klik Paket (Membuka Modal) ---
  const handlePackageClick = (pkg) => {
    if (user) {
        // Cek Blocker: Ada tagihan belum lunas
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

        // Cek Blocker: Masih punya paket aktif (bukan expired)
        if (lastPaidInvoice) {
             const isExpired = new Date(lastPaidInvoice.expiry_date) < new Date();
             if (!isExpired && !isBuyMode) {
                setStatusModal({
                    show: true,
                    title: "Paket Aktif",
                    msg: `Anda masih memiliki paket aktif "${lastPaidInvoice.package_name}".`,
                    type: "info",
                });
                return;
             }
        }

        // BUKA MODAL KONFIRMASI
        setPurchaseModal({ show: true, pkg });

    } else {
      // Belum Login
      navigate("/register", { state: { pkg } });
    }
  };

  // --- 3. Proses Pembelian ---
  const handleConfirmPurchase = async (payNow) => {
    if (!purchaseModal.pkg) return;
    setProcessingOrder(true);

    try {
        let currentProfile = profile;
        if (!currentProfile) {
            const { data: fetchedProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            currentProfile = fetchedProfile;
        }

        const pkg = purchaseModal.pkg;
        const adminFee = 0; 
        const totalAmount = Number(pkg.price) + adminFee;

        const payload = {
            invoice_no: `INV-${Date.now()}`,
            user_id: user.id,
            email: user.email,
            
            student_name: currentProfile?.full_name || user.user_metadata?.full_name || user.email,
            student_jenjang: currentProfile?.jenjang || "Umum", 
            student_kelas: currentProfile?.kelas || "-",        
            student_whatsapp: currentProfile?.phone || currentProfile?.whatsapp || "-",
            
            package_id: pkg.id,
            package_name: pkg.title,
            package_price: pkg.price,
            
            admin_fee: adminFee,
            total_amount: totalAmount, 
            
            status: "unpaid",
            created_at: new Date()
        };

        const { data, error } = await supabase
            .from("invoices")
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        
        setPurchaseModal({ show: false, pkg: null });

        // Update local state
        setWaitingInvoice(data);
        // Jangan reset lastPaidInvoice dulu, karena logic UI akan memprioritaskan waitingInvoice

        if (payNow) {
            navigate("/invoice", { state: { invoice: data } });
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

  // --- LOGIC PENENTUAN STATUS UNTUK UI ---
  // Urutan prioritas:
  // 1. Waiting / Unpaid -> Tampilkan status tagihan
  // 2. Paid -> Cek tanggalnya (Active vs Expired)
  // 3. Tidak ada invoice -> None

  let studentStatus = 'none';
  let displayInvoice = null;

  if (user) {
    if (waitingInvoice) {
      displayInvoice = waitingInvoice;
      studentStatus = waitingInvoice.status === 'unpaid' ? 'unpaid' : 'waiting';
    } else if (lastPaidInvoice) {
      displayInvoice = lastPaidInvoice;
      // CEK EXPIRED DATE DI SINI
      const today = new Date();
      const expiryDate = new Date(lastPaidInvoice.expiry_date);
      
      const isExpired = expiryDate < today;
      studentStatus = isExpired ? 'expired' : 'active';
    } else {
      studentStatus = 'none';
    }
  }

  // Role Guru & Admin
  if (user && user.role === "guru") return <TeacherHome user={user} />;
  if (user && user.role === "admin") return <AdminHome user={user} />;

  // --- TAMPILAN SISWA ---
  if (user) {
    return (
      <>
        <StudentHome 
          user={user} 
          profile={profile}
          status={studentStatus} 
          invoice={displayInvoice}
          packages={packages}          
          handlePackageClick={handlePackageClick} 
        />

        <Modal 
          show={purchaseModal.show} 
          onHide={() => !processingOrder && setPurchaseModal({ show: false, pkg: null })}
          centered
          backdrop="static"
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
              <Button 
                  variant="outline-secondary" 
                  className="rounded-pill px-4 fw-bold w-100"
                  onClick={() => handleConfirmPurchase(false)}
                  disabled={processingOrder}
              >
                  {processingOrder ? <Spinner size="sm" /> : <><Calendar size={18} className="me-2 mb-1"/> Bayar Nanti</>}
              </Button>
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

  // PUBLIC HOME (Belum Login)
  return (
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
  );
}