import React, { useState, useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Tab,
  Alert,
  Button,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  Calendar,
  PenTool,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import StudentInfoCard from "./student/StudentInfoCard";
import StudentScheduleTab from "./student/StudentScheduleTab/StudentScheduleTab";
import StudentMaterialsTab from "./student/StudentMaterialsTab";
import StudentGradesTab from "./student/StudentGradesTab";
import ExerciseTab from "./student/ExerciseTab";

/* =========================
   TYPE-SAFE TAB REGISTRY
========================= */
const TAB_REGISTRY = {
  jadwal: {
    label: "Pilih Jadwal",
    icon: Calendar,
    component: StudentScheduleTab,
  },
  latihan: {
    label: "Latihan Soal",
    icon: PenTool,
    component: ExerciseTab,
  },
  materi: {
    label: "Materi",
    icon: BookOpen,
    component: StudentMaterialsTab,
  },
  nilai: {
    label: "Nilai",
    icon: TrendingUp,
    component: StudentGradesTab,
  },
};

const DEFAULT_TAB = "jadwal";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [infoModal, setInfoModal] = useState({
    show: false,
    title: "",
    msg: "",
    type: "success",
  });

  const showModal = (title, msg, type = "success") =>
    setInfoModal({ show: true, title, msg, type });

  /* =========================
     ACTIVE TAB FROM URL
  ========================= */
  const activeTab = useMemo(() => {
    const t = searchParams.get("tab");
    return TAB_REGISTRY[t] ? t : DEFAULT_TAB;
  }, [searchParams]);

  const handleTabChange = (key) => {
    setSearchParams({ tab: key });
  };

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

        if (
          data?.status === "paid" &&
          data.expiry_date &&
          new Date() > new Date(data.expiry_date)
        ) {
          setIsExpired(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  /* =========================
     GUARDS (UNCHANGED)
  ========================= */
  if (loading) return <div className="p-4 text-center">Memuat dashboard…</div>;

  if (!activeInvoice)
    return (
      <Alert variant="warning" className="p-4">
        Paket Belum Aktif.
      </Alert>
    );

  if (isExpired)
    return (
      <Alert variant="danger" className="text-center p-5">
        <h3>Masa Aktif Berakhir</h3>
      </Alert>
    );

  if (activeInvoice.status !== "paid")
    return (
      <Alert variant="info" className="text-center p-5">
        Status: {activeInvoice.status}
      </Alert>
    );

  return (
    <Row className="g-4">
      <Col xs={12}>
        <StudentInfoCard
          user={user}
          activeInvoice={activeInvoice}
          onReviewClick={() => setReviewModal(true)}
        />
      </Col>

      <Col xs={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabChange}
              className="mb-4"
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
                      <>
                        <Icon size={18} className="me-2" />
                        {cfg.label}
                      </>
                    }
                  >
                    <Component user={user} showModal={showModal} />
                  </Tab>
                );
              })}
            </Tabs>
          </Card.Body>
        </Card>
      </Col>

      {/* === MODALS TIDAK DIUBAH === */}
      <Modal show={reviewModal} onHide={() => setReviewModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Beri Ulasan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={32}
                fill={s <= reviewForm.rating ? "orange" : "none"}
                color={s <= reviewForm.rating ? "orange" : "#ccc"}
                onClick={() => setReviewForm({ ...reviewForm, rating: s })}
              />
            ))}
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            value={reviewForm.content}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, content: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setReviewModal(false)}>Batal</Button>
          <Button
            onClick={async () => {
              setSubmittingReview(true);
              await supabase.from("testimonials").insert({
                student_id: user.id,
                rating: reviewForm.rating,
                content: reviewForm.content,
              });
              setSubmittingReview(false);
              setReviewModal(false);
            }}
          >
            {submittingReview ? <Spinner size="sm" /> : "Kirim"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={infoModal.show}
        onHide={() => setInfoModal({ ...infoModal, show: false })}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div
            className={`mx-auto mb-3 p-3 rounded-circle ${
              infoModal.type === "error"
                ? "bg-danger bg-opacity-10 text-danger"
                : "bg-success bg-opacity-10 text-success"
            }`}
          >
            {infoModal.type === "error" ? (
              <AlertTriangle size={32} />
            ) : (
              <CheckCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold">{infoModal.title}</h5>
          <p className="text-muted">{infoModal.msg}</p>
          <Button
            variant={infoModal.type === "error" ? "danger" : "success"}
            className="w-100 rounded-pill"
            onClick={() => setInfoModal({ ...infoModal, show: false })}
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Row>
  );
}
