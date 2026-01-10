import React, { useState, useEffect } from "react";
import { Spinner, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { packageService } from "../services/packageService";
import { invoiceService } from "../services/invoiceService";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import StatusModal from "../components/common/StatusModal";
import { APP_CONFIG } from "../config/constants";

// --- IMPORT KOMPONEN HOME ---
import StudentHome from "../components/home/StudentHome";
import PublicHome from "../components/home/PublicHome";
import TeacherHome from "../components/home/TeacherHome";
import AdminHome from "../components/home/AdminHome";

export default function HomeView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [packages, setPackages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [waitingInvoice, setWaitingInvoice] = useState(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [loadingTesti, setLoadingTesti] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- 1. Fetching Data ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    fetchPackages();
    fetchTestimonials();

    if (user) {
      // Guru & Admin tidak perlu cek invoice
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
        .select(
          `id, content, rating, created_at, student:profiles!student_id (full_name)`
        )
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error("Fetch Testimonials Error:", err);
    } finally {
      setLoadingTesti(false);
    }
  };

  const checkActiveSubscription = async () => {
    try {
      const history = await invoiceService.getHistory(user.id);

      const activeItem = history.find(
        (inv) =>
          inv.status === "PAID" ||
          inv.status === "paid" ||
          inv.status === APP_CONFIG?.INVOICE?.STATUS?.PAID
      );

      const waitingItem = history.find(
        (inv) =>
          inv.status === "WAITING" ||
          inv.status === "waiting" ||
          inv.status === APP_CONFIG?.INVOICE?.STATUS?.WAITING
      );

      if (activeItem) setActiveInvoice(activeItem);
      else if (waitingItem) setWaitingInvoice(waitingItem);
    } catch (error) {
      console.error("Subscription Check Error:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  // --- 2. Handlers ---
  const handlePackageClick = (pkg) => {
    if (activeInvoice) {
      navigate("/student/dashboard");
      return;
    }
    if (waitingInvoice) {
      navigate("/invoice");
      return;
    }

    if (user) {
      navigate("/register", { state: { pkg } });
    } else {
      setShowAuthModal(true);
    }
  };

  // --- 3. Render Controller ---

  // Loading
  if (loading || (user && checkingStatus)) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // 1️⃣ Guru
  if (user && user.role === "guru") {
    return <TeacherHome user={user} />;
  }

  // 2️⃣ Admin
  if (user && user.role === "admin") {
    return <AdminHome user={user} />;
  }

  // 3️⃣ Siswa aktif
  if (user && activeInvoice) {
    return <StudentHome user={user} activeInvoice={activeInvoice} />;
  }

  // 4️⃣ Siswa waiting
  if (user && waitingInvoice) {
    return (
      <Container
        className="d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="bg-warning bg-opacity-10 p-4 rounded-circle mb-4 text-warning">
          <Clock size={64} />
        </div>
        <h2 className="fw-bold mb-3">Pembayaran Sedang Diverifikasi</h2>
        <p className="text-muted lead mb-4" style={{ maxWidth: "600px" }}>
          Terima kasih! Kami telah menerima bukti pembayaranmu untuk paket{" "}
          <strong>{waitingInvoice.package_name}</strong>. Admin akan segera
          memverifikasi datamu (maks. 1x24 jam).
        </p>
        <div className="d-flex gap-3">
          <Button
            variant="outline-primary"
            onClick={() => navigate("/invoice")}
          >
            Lihat Detail Invoice
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              window.open(`https://wa.me/6288211058777`, "_blank")
            }
          >
            Hubungi Admin
          </Button>
        </div>
      </Container>
    );
  }

  // 5️⃣ Guest / Belum login
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
      />

      <StatusModal
        show={showAuthModal}
        onHide={() => {
          setShowAuthModal(false);
          navigate("/login");
        }}
        title="Akses Dibatasi"
        message="Silakan buat akun atau login terlebih dahulu untuk mendaftar paket ini."
        type="warning"
        actionLabel="Login Sekarang"
        onAction={() => {
          setShowAuthModal(false);
          navigate("/login");
        }}
      />
    </>
  );
}
