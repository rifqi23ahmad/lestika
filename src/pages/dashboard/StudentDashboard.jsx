import React, { useState, useEffect, useMemo } from "react";
import { Spinner, Container, Button, Modal } from "react-bootstrap";
import {
  Calendar,
  PenTool,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  FileText,
  Lock,
  // Trophy, <--- HAPUS INI
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import DashboardLayout from "../../components/layout/DashboardLayout";

import StudentInfoCard from "./student/StudentInfoCard";
import StudentScheduleTab from "./student/StudentScheduleTab/StudentScheduleTab";
import StudentMaterialsTab from "./student/StudentMaterialsTab";
import StudentGradesTab from "./student/StudentGradesTab";
import ExerciseTab from "./student/ExerciseTab";
// import StudentLeaderboardTab from "./student/StudentLeaderboardTab"; <--- HAPUS INI

const TAB_REGISTRY = {
  jadwal: {
    label: "Jadwal Belajar",
    icon: Calendar,
    component: StudentScheduleTab,
  },
  latihan: { label: "Latihan Soal", icon: PenTool, component: ExerciseTab },
  materi: {
    label: "Materi & Modul",
    icon: BookOpen,
    component: StudentMaterialsTab,
  },
  nilai: {
    label: "Riwayat Nilai",
    icon: TrendingUp,
    component: StudentGradesTab,
  },
  // leaderboard: { ... } <--- HAPUS BAGIAN INI
};

const DEFAULT_TAB = "jadwal";

// ... (Sisa kode ke bawah biarkan tetap sama seperti file asli)

const RestrictedView = ({ status, navigate, activeInvoice }) => {
    // ... (kode RestrictedView tetap sama)
    const getConfig = () => {
        if (status === "unpaid")
          return {
            icon: FileText,
            color: "warning",
            title: "Belum Bayar",
            msg: "Selesaikan pembayaran.",
            btnText: "Bayar",
            action: () =>
              navigate("/invoice", { state: { invoice: activeInvoice } }),
          };
        if (status === "expired")
          return {
            icon: AlertTriangle,
            color: "danger",
            title: "Expired",
            msg: "Paket habis.",
            btnText: "Perpanjang",
            action: () => navigate("/"),
          };
        return {
          icon: Lock,
          color: "secondary",
          title: "Terkunci",
          msg: "Pilih paket dulu.",
          btnText: "Pilih Paket",
          action: () => navigate("/"),
        };
      };
      const config = getConfig();
      const Icon = config.icon;
      return (
        <div className="text-center py-5">
          <div
            className={`bg-${config.color} bg-opacity-10 p-4 rounded-circle d-inline-block mb-3`}
          >
            <Icon size={48} className={`text-${config.color}`} />
          </div>
          <h4 className="fw-bold mb-2">{config.title}</h4>
          <p className="text-muted mb-4">{config.msg}</p>
          <Button
            variant={config.color}
            className="rounded-pill px-4"
            onClick={config.action}
          >
            {config.btnText}
          </Button>
        </div>
      );
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("none");

  const [infoModal, setInfoModal] = useState({
    show: false,
    title: "",
    msg: "",
    type: "success",
  });
  const showModal = (title, msg, type = "success") =>
    setInfoModal({ show: true, title, msg, type });

  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return TAB_REGISTRY[t] ? t : DEFAULT_TAB;
  }, [searchParams]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        setActiveInvoice(data);
        if (!data) setStatus("none");
        else if (data.status === "unpaid") setStatus("unpaid");
        else if (
          data.status === "waiting_confirmation" ||
          data.status === "waiting"
        )
          setStatus("waiting");
        else if (data.status === "paid") {
          const isExp =
            data.expiry_date && new Date() > new Date(data.expiry_date);
          setStatus(isExp ? "expired" : "active");
        } else setStatus("none");
      } catch (e) {
        console.log(e);
        setStatus("none");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return {
          color: "primary",
          label: `Paket: ${activeInvoice?.package_name}`,
        };
      case "expired":
        return { color: "danger", label: "Paket Berakhir" };
      case "unpaid":
        return { color: "warning", label: "Menunggu Pembayaran" };
      case "waiting":
        return { color: "info", label: "Verifikasi Admin" };
      default:
        return { color: "secondary", label: "Belum Berlangganan" };
    }
  };
  const badgeConfig = getStatusBadge();
  const ActiveComponent = TAB_REGISTRY[activeTab]?.component || (() => null);

  if (loading)
    return (
      <Container className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );

  return (
    <DashboardLayout
      title="Kembali ke Menu Utama"
      onBack={() => navigate("/")}
      activeTab={activeTab}
      onTabChange={(k) => setSearchParams({ tab: k })}
      tabsConfig={TAB_REGISTRY}
      headerRightContent={
        <span
          className={`badge bg-${badgeConfig.color} bg-opacity-10 text-${badgeConfig.color} px-3 py-2 rounded-pill border border-${badgeConfig.color} border-opacity-25`}
        >
          {badgeConfig.label}
        </span>
      }
      topContent={
        <StudentInfoCard
          user={user}
          activeInvoice={activeInvoice}
          status={status}
        />
      }
    >
      {status === "active" ? (
        <ActiveComponent
          user={user}
          showModal={showModal}
          status={status}
          isExpired={false}
        />
      ) : (
        <RestrictedView
          status={status}
          navigate={navigate}
          activeInvoice={activeInvoice}
        />
      )}

      <Modal
        show={infoModal.show}
        onHide={() => setInfoModal({ ...infoModal, show: false })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <h5 className="fw-bold">{infoModal.title}</h5>
          <p>{infoModal.msg}</p>
          <Button onClick={() => setInfoModal({ ...infoModal, show: false })}>
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </DashboardLayout>
  );
}