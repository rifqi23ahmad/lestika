import React, { useEffect, useMemo, useState } from "react";
import { Spinner, Modal, Button } from "react-bootstrap"; // Import Button/Modal jika perlu utk internal
import { useSearchParams } from "react-router-dom";
import { Calendar, UserCheck, Upload, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import TeacherHome from "../../components/home/TeacherHome";
import ScheduleTab from "../dashboard/teacher/ScheduleTab";
import GradeTab from "../dashboard/teacher/GradeTab";
import MaterialTab from "../dashboard/teacher/MaterialTab";
import QuestionBankTab from "../dashboard/teacher/QuestionBankTab";

const TAB_REGISTRY = {
  jadwal: { icon: Calendar, label: "Kelola Jadwal", component: ScheduleTab },
  nilai: { icon: UserCheck, label: "Input Nilai", component: GradeTab },
  bank_soal: { icon: FileText, label: "Bank Soal", component: QuestionBankTab },
  materi: { icon: Upload, label: "Upload Materi", component: MaterialTab },
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [modalData, setModalData] = useState({ show: false, title: "", msg: "", type: "info" });
  const showModal = (title, msg, type = "info") => setModalData({ show: true, title, msg, type });

  const activeTab = useMemo(() => {
    const tabFromUrl = searchParams.get("tab");
    return TAB_REGISTRY[tabFromUrl] ? tabFromUrl : null;
  }, [searchParams]);

  useEffect(() => {
    if (activeTab) fetchStudents();
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    const { data } = await supabase.from("profiles").select("id, full_name, email").eq("role", "siswa");
    setStudents(data || []);
    setLoadingStudents(false);
  };

  if (!activeTab) return <TeacherHome user={user} />;

  const ActiveComponent = TAB_REGISTRY[activeTab].component;

  return (
    <DashboardLayout
      title="Kembali ke Dashboard Utama"
      onBack={() => setSearchParams({})}
      activeTab={activeTab}
      onTabChange={(k) => setSearchParams({ tab: k })}
      tabsConfig={TAB_REGISTRY}
    >
       {/* CHILD CONTENT */}
       {loadingStudents ? (
          <div className="d-flex justify-content-center align-items-center py-5">
             <Spinner animation="border" variant="primary" size="sm" />
             <span className="ms-2 text-muted small">Memuat data siswa...</span>
          </div>
       ) : (
          <ActiveComponent
            user={user}
            students={students}
            showModal={showModal}
          />
       )}

      {/* Helper Modal */}
      <Modal show={modalData.show} onHide={() => setModalData({ ...modalData, show: false })} centered>
         <Modal.Body className="text-center p-4">
             <div className={`mx-auto mb-3 p-3 rounded-circle ${modalData.type === "error" ? "bg-danger bg-opacity-10 text-danger" : "bg-success bg-opacity-10 text-success"}`} style={{ width: "fit-content" }}>
                {modalData.type === "error" ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
             </div>
             <h5 className="fw-bold mb-2">{modalData.title}</h5>
             <p className="text-muted">{modalData.msg}</p>
             <Button variant={modalData.type === "error" ? "danger" : "success"} className="rounded-pill px-4" onClick={() => setModalData({ ...modalData, show: false })}>Tutup</Button>
         </Modal.Body>
      </Modal>

    </DashboardLayout>
  );
}