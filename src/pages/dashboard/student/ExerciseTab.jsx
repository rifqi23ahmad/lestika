import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Badge,
  Row,
  Col,
  ProgressBar,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  PlayCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Award,
  Lock
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ExerciseTab({ user, isExpired }) {
  const [packages, setPackages] = useState([]);
  const [loadingPkg, setLoadingPkg] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const [loadingSoal, setLoadingSoal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- BLOKIR JIKA EXPIRED ---
  if (isExpired) {
    return (
      <div className="text-center py-5">
        <div className="bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
          <Lock size={48} className="text-danger" />
        </div>
        <h5 className="fw-bold text-dark">Latihan Soal Terkunci</h5>
        <p className="text-muted">
          Silakan perpanjang paket untuk mengakses bank soal dan latihan.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (user) fetchPackages();
  }, [user]);

  const fetchPackages = async () => {
    setLoadingPkg(true);
    try {
      const { data, error } = await supabase
        .from("question_packages")
        .select("*, teacher:profiles!teacher_id(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } finally {
      setLoadingPkg(false);
    }
  };

  const startQuiz = async (pkg) => {
    setLoadingSoal(true);
    try {
      setScore(0);
      setAnswers({});
      setShowResult(false);
      setCurrentQIndex(0);

      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("package_id", pkg.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Paket ini belum memiliki soal.");
        return;
      }

      setQuestions(data);
      setActiveQuiz(pkg);
    } finally {
      setLoadingSoal(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    const q = questions[currentQIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
  };

  const submitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let correctCount = 0;
      questions.forEach((q) => {
        const selectedIdx = answers[q.id];
        if (selectedIdx !== undefined && q.options?.[selectedIdx]?.is_correct) {
          correctCount++;
        }
      });

      const calculatedScore = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

      const { data, error } = await supabase
        .from("student_attempts")
        .insert({
          student_id: user.id,
          package_id: activeQuiz.id,
          score: calculatedScore,
          answers: answers,
        })
        .select("score")
        .single();

      if (error) throw error;

      setScore(data.score);
      setShowResult(true);
    } catch (err) {
      alert("Gagal menyimpan hasil latihan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeQuiz) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <h5 className="fw-bold mb-1">Latihan Soal</h5>
          <p className="text-muted small mb-0">Asah kemampuanmu dengan mengerjakan paket soal.</p>
        </div>

        {loadingPkg && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loadingPkg && packages.length === 0 && (
          <Alert variant="info">Belum ada paket soal tersedia.</Alert>
        )}

        <Row className="g-3">
          {packages.map((pkg) => (
            <Col md={6} lg={4} key={pkg.id}>
              <Card className="h-100 shadow-sm border-0 rounded-4">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between mb-3">
                    <Badge bg="primary" className="bg-opacity-10 text-primary">{pkg.subject}</Badge>
                    <Badge bg="light" text="dark" className="border">{pkg.level}</Badge>
                  </div>

                  <h5 className="fw-bold mb-2">{pkg.title}</h5>
                  <p className="small text-muted flex-grow-1">Oleh: {pkg.teacher?.full_name || "Guru"}</p>

                  <Button
                    variant="primary"
                    className="w-100 rounded-pill fw-bold"
                    onClick={() => startQuiz(pkg)}
                    disabled={loadingSoal}
                  >
                    {loadingSoal ? <Spinner size="sm" /> : <><PlayCircle size={18} /> Mulai Kerjakan</>}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const progress = questions.length > 0 ? ((currentQIndex + 1) / questions.length) * 100 : 0;

  return (
    <Card className="border-0 shadow-sm rounded-4 animate-fade-in">
      <Card.Body className="p-0">
        <div className="p-4 border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">{activeQuiz.title}</h5>
            {showResult && (
              <Button variant="outline-primary" size="sm" onClick={() => setActiveQuiz(null)}>
                <RefreshCw size={14} /> Pilih Paket Lain
              </Button>
            )}
          </div>
          {!showResult && <ProgressBar now={progress} style={{ height: "8px" }} className="rounded-pill" />}
        </div>

        <div className="p-4">
          {!showResult ? (
            <>
              <h5 className="mb-4">{currentQ.question_text}</h5>
              <div className="d-grid gap-3 mb-5">
                {currentQ.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded-3 ${answers[currentQ.id] === idx ? "bg-primary bg-opacity-10 border-primary" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleAnswer(idx)}
                  >
                    <strong>{String.fromCharCode(65 + idx)}.</strong> {opt.text}
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between">
                <Button variant="light" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex((p) => p - 1)}>
                  <ChevronLeft size={16} /> Sebelumnya
                </Button>
                {currentQIndex < questions.length - 1 ? (
                  <Button variant="primary" onClick={() => setCurrentQIndex((p) => p + 1)}>
                    Selanjutnya <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button variant="success" onClick={submitQuiz} disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : "Selesai & Lihat Nilai"}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-5 bg-light rounded-4">
              <Award size={96} className="text-primary mb-3" />
              <h4 className="mb-2">Skor Kamu</h4>
              <h1 className={`fw-bold ${score >= 70 ? "text-success" : "text-danger"}`}>{score.toFixed(0)}</h1>
              <Badge bg={score >= 70 ? "success" : "danger"} className="mt-2">
                {score >= 70 ? "Lulus - Pertahankan!" : "Belum Lulus - Coba Lagi"}
              </Badge>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}