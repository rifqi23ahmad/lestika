import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab, Modal, Button } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import {
  Calendar,
  UserCheck,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

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

const DEFAULT_TAB = "jadwal";

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

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "siswa");
    setStudents(data || []);
  };

  return (
    <div className="pb-5">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4 border-bottom-0"
      >
        {Object.entries(TAB_REGISTRY).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const Component = cfg.component;

          return (
            <Tab
              key={key}
              eventKey={key}
              title={
                <>
                  <Icon size={18} className="me-2" />
                  {cfg.label}
                </>
              }
            >
              <Component
                user={user}
                students={students}
                showModal={showModal}
              />
            </Tab>
          );
        })}
      </Tabs>

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
            onClick={() => setModalData({ ...modalData, show: false })}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
