import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab, Modal, Button, Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  UserCheck,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowLeft
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

// Import Home & Tabs
import TeacherHome from "../../components/home/TeacherHome";
import ScheduleTab from "../dashboard/teacher/ScheduleTab";
import GradeTab from "../dashboard/teacher/GradeTab";
import MaterialTab from "../dashboard/teacher/MaterialTab";
import QuestionBankTab from "../dashboard/teacher/QuestionBankTab";

const TAB_REGISTRY = {
  jadwal: {
    icon: Calendar,
    label: "Kelola Jadwal",
    component: ScheduleTab,
  },
  nilai: {
    icon: UserCheck,
    label: "Input Nilai",
    component: GradeTab,
  },
  bank_soal: {
    icon: FileText,
    label: "Bank Soal",
    component: QuestionBankTab,
  },
  materi: {
    icon: Upload,
    label: "Upload Materi",
    component: MaterialTab,
  },
};

const DEFAULT_TAB = null;

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);

  const [modalData, setModalData] = useState({
    show: false,
    title: "",
    msg: "",
    type: "info",
  });

  const showModal = (title, msg, type = "info") => {
    setModalData({ show: true, title, msg, type });
  };

  const activeTab = useMemo(() => {
    const tabFromUrl = searchParams.get("tab");
    return TAB_REGISTRY[tabFromUrl] ? tabFromUrl : DEFAULT_TAB;
  }, [searchParams]);

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

  const goToHome = () => {
    setSearchParams({}); // Hapus parameter tab
  };

  useEffect(() => {
    if (activeTab) {
        // Fetch siswa hanya jika sedang membuka Tab yang butuh data siswa
        // Ini optimasi kecil agar halaman Home lebih cepat
        fetchStudents();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "siswa");
    setStudents(data || []);
  };

  // --- RENDER LOGIC ---

  // 1. Jika tidak ada tab aktif, tampilkan Halaman Utama
  if (!activeTab) {
    return <TeacherHome user={user} />;
  }

  // 2. Jika ada tab aktif, tampilkan Layout Tabs
  return (
    <Container className="py-4 pb-5">
      
      {/* Header Navigasi Kecil */}
      <div className="mb-4 d-flex align-items-center">
        <Button 
          variant="link" 
          className="text-decoration-none text-muted p-0 d-flex align-items-center fw-bold"
          onClick={goToHome}
        >
          <ArrowLeft size={18} className="me-2" />
          Kembali ke Dashboard Utama
        </Button>
      </div>

      <div className="bg-white rounded-4 shadow-sm border p-4 min-vh-100">
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabChange}
          className="mb-4 border-bottom custom-tabs"
          fill
        >
          {Object.entries(TAB_REGISTRY).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const Component = cfg.component;

            return (
              <Tab
                key={key}
                eventKey={key}
                title={
                  <div className="d-flex align-items-center justify-content-center gap-2 py-2">
                    <Icon size={18} />
                    <span className="fw-semibold">{cfg.label}</span>
                  </div>
                }
              >
                <div className="pt-3">
                  <Component
                    user={user}
                    students={students}
                    showModal={showModal}
                  />
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </div>

      <Modal
        show={modalData.show}
        onHide={() => setModalData({ ...modalData, show: false })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-circle ${
              modalData.type === "error"
                ? "bg-danger bg-opacity-10 text-danger"
                : "bg-success bg-opacity-10 text-success"
            }`}
            style={{ width: "fit-content" }}
          >
            {modalData.type === "error" ? (
              <AlertTriangle size={32} />
            ) : (
              <CheckCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{modalData.title}</h5>
          <p className="text-muted">{modalData.msg}</p>
          <Button
            variant={modalData.type === "error" ? "danger" : "success"}
            className="rounded-pill px-4"
            onClick={() => setModalData({ ...modalData, show: false })}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}