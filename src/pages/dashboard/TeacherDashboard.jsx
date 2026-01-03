import React, { useState, useEffect } from "react";
import { Tabs, Tab, Modal, Button } from "react-bootstrap";
import { Calendar, UserCheck, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";


import ScheduleTab from "../dashboard/teacher/ScheduleTab";
import GradeTab from "../dashboard/teacher/GradeTab";
import MaterialTab from "../dashboard/teacher/MaterialTab";

export default function TeacherDashboard() {
  const { user } = useAuth();
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
      <Tabs defaultActiveKey="jadwal" className="mb-4 border-bottom-0">
        <Tab eventKey="jadwal" title={<><Calendar size={18} className="me-2" />Kelola Jadwal Rutin</>}>
          <ScheduleTab user={user} students={students} showModal={showModal} />
        </Tab>

        <Tab eventKey="nilai" title={<><UserCheck size={18} className="me-2" />Input Nilai</>}>
          <GradeTab user={user} students={students} showModal={showModal} />
        </Tab>

        <Tab eventKey="materi" title={<><Upload size={18} className="me-2" />Upload Materi</>}>
          <MaterialTab user={user} showModal={showModal} />
        </Tab>
      </Tabs>

      {/* Global Notification Modal */}
      <Modal show={modalData.show} onHide={() => setModalData({ ...modalData, show: false })} centered>
        <Modal.Body className="text-center p-4">
          <div className={`mx-auto mb-3 p-3 rounded-full w-fit ${modalData.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {modalData.type === "error" ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
          </div>
          <h5 className="fw-bold mb-2">{modalData.title}</h5>
          <p className="text-muted">{modalData.msg}</p>
          <Button variant={modalData.type === "error" ? "danger" : "success"} onClick={() => setModalData({ ...modalData, show: false })}>
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}