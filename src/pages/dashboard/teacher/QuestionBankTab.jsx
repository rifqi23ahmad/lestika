import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Accordion,
  Spinner,
} from "react-bootstrap";
import { Plus, Edit, Trash, Eye, FileText, Sparkles } from "lucide-react";
import { supabase } from "../../../lib/supabase";

import PdfViewer from "../../../components/common/PdfViewer";
import AiGenerationModal from "../../../components/teacher/modals/AiGenerationModal";
import QuestionFormModal from "../../../components/teacher/modals/QuestionFormModal";

export default function QuestionBankTab({ user, showModal }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPkgModal, setShowPkgModal] = useState(false);
  const [activePackage, setActivePackage] = useState(null);
  const [pkgForm, setPkgForm] = useState({
    title: "",
    level: "SD",
    subject: "Matematika",
  });

  const [questions, setQuestions] = useState([]);
  const [showQModal, setShowQModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const [aiTargetPackage, setAiTargetPackage] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (user) fetchPackages();
  }, [user]);

  const fetchPackages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("question_packages")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    setPackages(data || []);
    setLoading(false);
  };

  const fetchQuestions = async (pkgId) => {
    if (!pkgId) return;
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("package_id", pkgId)
      .order("created_at", { ascending: true });

    setQuestions(data || []);
  };

  const isPdf = (url) => url?.toLowerCase().includes(".pdf");

  const handleCreatePackage = async () => {
    if (!pkgForm.title)
      return showModal("Gagal", "Judul wajib diisi.", "error");

    const { error } = await supabase
      .from("question_packages")
      .insert({ teacher_id: user.id, ...pkgForm });

    if (!error) {
      setShowPkgModal(false);
      fetchPackages();
      showModal("Sukses", "Paket berhasil dibuat.", "success");
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (
      !window.confirm("Hapus Paket ini? Semua soal di dalamnya akan terhapus.")
    )
      return;

    const { error } = await supabase
      .from("question_packages")
      .delete()
      .eq("id", pkgId);

    if (!error) {
      if (activePackage?.id === pkgId) {
        setActivePackage(null);
        setQuestions([]);
      }
      fetchPackages();
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Hapus soal ini?")) return;

    const { error } = await supabase.from("questions").delete().eq("id", id);

    if (!error && activePackage?.id) {
      fetchQuestions(activePackage.id);
      setShowPreviewModal(false);
    }
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setShowQModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setShowQModal(true);
  };

  const openAiModal = () => {
    if (!activePackage?.id) return;
    setAiTargetPackage(activePackage); // 🔒 snapshot
    setShowAiModal(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded">
        <div>
          <h5 className="fw-bold m-0 text-primary">Bank Soal & Latihan</h5>
          {activePackage && (
            <small className="text-muted">
              Paket: <strong>{activePackage.title}</strong> (
              {activePackage.level})
            </small>
          )}
        </div>
        <Button size="sm" onClick={() => setShowPkgModal(true)}>
          <Plus size={16} /> Paket Baru
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {packages.map((pkg) => (
            <Col md={12} key={pkg.id} className="mb-3">
              <Card
                className={
                  activePackage?.id === pkg.id
                    ? "border-start border-5 border-primary shadow-sm"
                    : "shadow-sm"
                }
              >
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold m-0">{pkg.title}</h6>
                    <small className="text-muted">
                      {pkg.level} • {pkg.subject}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant={
                        activePackage?.id === pkg.id
                          ? "primary"
                          : "outline-primary"
                      }
                      onClick={() => {
                        setActivePackage(pkg);
                        fetchQuestions(pkg.id);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </Card.Body>

                {activePackage?.id === pkg.id && (
                  <Card.Footer className="bg-light">
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Soal ({questions.length})</strong>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={openAiModal}
                        >
                          <Sparkles size={16} /> Generate AI
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={openAddModal}
                        >
                          <Plus size={14} /> Tambah Manual
                        </Button>
                      </div>
                    </div>

                    {questions.map((q, idx) => (
                      <Accordion key={q.id} className="mb-2">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            #{idx + 1} — {q.question_text}
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="d-flex justify-content-end gap-2 mb-2">
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => {
                                  setPreviewQuestion(q);
                                  setShowPreviewModal(true);
                                }}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() => openEditModal(q)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteQuestion(q.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    ))}
                  </Card.Footer>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <AiGenerationModal
        show={showAiModal}
        onHide={() => setShowAiModal(false)}
        packageId={aiTargetPackage?.id}
        packageLevel={aiTargetPackage?.level}
        onSuccess={() => {
          if (aiTargetPackage?.id) fetchQuestions(aiTargetPackage.id);
        }}
        showToast={showModal}
      />

      <QuestionFormModal
        show={showQModal}
        onHide={() => setShowQModal(false)}
        packageId={activePackage?.id}
        editData={editingQuestion}
        onSuccess={() => activePackage?.id && fetchQuestions(activePackage.id)}
        showToast={showModal}
      />

      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        fullscreen
      >
        <Modal.Body>
          {previewQuestion && (
            <>
              <h5>{previewQuestion.question_text}</h5>
              {previewQuestion.options?.map((o, i) => (
                <div
                  key={i}
                  className={o.is_correct ? "text-success fw-bold" : ""}
                >
                  {String.fromCharCode(65 + i)}. {o.text}
                </div>
              ))}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
