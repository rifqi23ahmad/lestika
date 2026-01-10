import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  MoreHorizontal
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";

// Import Modals
import QuestionFormModal from "../../../../components/teacher/modals/QuestionFormModal";
import AiGenerationModal from "../../../../components/teacher/modals/AiGenerationModal";

export default function QuestionDetailView({ activePackage, onBack, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (activePackage?.id) {
      fetchQuestions();
    }
  }, [activePackage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("package_id", activePackage.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error(err);
      showToast("Error", "Gagal memuat soal.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Hapus soal ini?")) return;
    try {
      const { error } = await supabase.from("questions").delete().eq("id", qId);
      if (error) throw error;
      fetchQuestions();
      showToast("Terhapus", "Soal berhasil dihapus.", "success");
    } catch (err) {
      showToast("Gagal", "Gagal menghapus soal.", "error");
    }
  };

  return (
    <div className="h-100 pb-5">
      {/* --- HEADER RESPONSIVE --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 border-bottom pb-4 gap-3">
        
        {/* Title Section */}
        <div className="d-flex align-items-start gap-3 w-100">
          <Button
            variant="light"
            className="rounded-circle p-2 border flex-shrink-0"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-grow-1">
            <h4 className="fw-bold m-0 lh-sm">{activePackage.title}</h4>
            <div className="d-flex flex-wrap gap-2 text-muted small mt-2 align-items-center">
              <Badge bg="info" className="text-dark bg-opacity-25 px-2 py-1">
                Kelas {activePackage.level}
              </Badge>
              <span className="d-none d-sm-inline">•</span>
              <span>{activePackage.subject}</span>
              <span className="d-none d-sm-inline">•</span>
              <Badge bg="light" className="text-dark border px-2 py-1">
                 {questions.length} Soal
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons (Full width on Mobile) */}
        <div className="d-flex gap-2 w-100 w-md-auto mt-2 mt-md-0">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center justify-content-center gap-2 rounded-pill flex-fill flex-md-grow-0 py-2"
            onClick={() => setShowAiModal(true)}
          >
            <Sparkles size={16} />
            <span>Generate AI</span>
          </Button>
          <Button
            variant="primary"
            className="d-flex align-items-center justify-content-center gap-2 rounded-pill flex-fill flex-md-grow-0 py-2"
            onClick={() => {
              setEditingQuestion(null);
              setShowQuestionModal(true);
            }}
          >
            <Plus size={18} />
            <span>Tambah</span>
          </Button>
        </div>
      </div>

      {/* --- LIST SOAL --- */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Memuat daftar soal...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed mx-2 mx-md-0">
          <FileText size={48} className="text-muted mb-3 opacity-50" />
          <h5 className="fw-bold">Belum ada soal</h5>
          <p className="text-muted px-3">
            Mulai dengan <strong>Generate AI</strong> atau tambah soal secara manual.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Body className="p-0">
                <div className="p-3 p-md-4">
                  <div className="d-flex gap-3">
                    {/* Nomor Soal (Desktop Only) */}
                    <div className="d-none d-md-block flex-shrink-0">
                        <span className="fw-bold text-muted bg-light px-2 py-1 rounded">{idx + 1}</span>
                    </div>

                    <div className="flex-grow-1 w-100">
                      {/* Teks Soal */}
                      <div className="d-flex gap-2 mb-3">
                         {/* Nomor Soal (Mobile Only) */}
                         <span className="d-md-none fw-bold text-muted flex-shrink-0 mt-1">{idx + 1}.</span>
                         <p className="fw-bold mb-0 text-dark lh-base">{q.question_text}</p>
                      </div>

                      {/* Gambar Soal (Jika Ada) */}
                      {q.question_image_url && (
                        <div className="mb-3">
                           <img
                            src={q.question_image_url}
                            alt="Soal"
                            className="img-fluid rounded border bg-light"
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                          />
                        </div>
                      )}
                      
                      {/* Opsi Jawaban */}
                      <div className="d-grid gap-2 mt-3">
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            className={`d-flex align-items-start gap-3 small border rounded-3 p-2 px-3 ${
                              opt.is_correct 
                                ? "bg-success bg-opacity-10 border-success" 
                                : "bg-white border-light-subtle"
                            }`}
                          >
                            <span
                              className={`badge rounded-pill flex-shrink-0 mt-1 ${
                                opt.is_correct ? "bg-success" : "bg-secondary bg-opacity-25 text-dark"
                              }`}
                              style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <div className="flex-grow-1">
                                <span className={`${opt.is_correct ? "fw-bold text-success" : "text-dark"}`}>
                                    {opt.text}
                                </span>
                            </div>
                            {opt.is_correct && (
                                <CheckCircle size={16} className="text-success mt-1 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar (Mobile Friendly) */}
                <div className="bg-light border-top px-3 py-2 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                        <Button
                          variant="white"
                          size="sm"
                          className="text-primary border hover:bg-white d-flex align-items-center gap-1 shadow-sm"
                          onClick={() => {
                            setEditingQuestion(q);
                            setShowQuestionModal(true);
                          }}
                        >
                          <Edit size={14} /> 
                          <span className="fw-semibold">Edit</span>
                        </Button>
                        <Button
                          variant="white"
                          size="sm"
                          className="text-danger border hover:bg-white d-flex align-items-center gap-1 shadow-sm"
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          <Trash2 size={14} />
                          <span className="fw-semibold">Hapus</span>
                        </Button>
                    </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* --- MODALS --- */}
      <QuestionFormModal
        show={showQuestionModal}
        onHide={() => setShowQuestionModal(false)}
        packageId={activePackage.id}
        editData={editingQuestion}
        onSuccess={fetchQuestions}
        showToast={showToast}
      />

      <AiGenerationModal
        show={showAiModal}
        onHide={() => setShowAiModal(false)}
        packageId={activePackage.id}
        packageLevel={activePackage.level}
        onSuccess={fetchQuestions}
        showToast={showToast}
      />
    </div>
  );
}