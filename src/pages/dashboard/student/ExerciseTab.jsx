import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, ProgressBar, Spinner, Alert } from "react-bootstrap";
import { BookOpen, CheckCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ExerciseTab({ user }) {
  const [packages, setPackages] = useState([]);
  const [loadingPkg, setLoadingPkg] = useState(false);
  
  const [activeQuiz, setActiveQuiz] = useState(null); // Paket yang sedang dikerjakan
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { question_id: option_index }
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loadingSoal, setLoadingSoal] = useState(false);

  useEffect(() => {
    if(user) fetchPackages();
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
    } catch (err) {
        console.error("Error fetch packages:", err);
    } finally {
        setLoadingPkg(false);
    }
  };

  const startQuiz = async (pkg) => {
    setLoadingSoal(true);
    try {
        // Reset state
        setScore(0);
        setAnswers({});
        setShowResult(false);
        setCurrentQIndex(0);

        // Fetch Soal
        // PENTING: Pastikan kolom 'created_at' ada di tabel 'questions'
        const { data, error } = await supabase
            .from("questions")
            .select("*")
            .eq("package_id", pkg.id)
            .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
            setQuestions(data);
            setActiveQuiz(pkg);
        } else {
            alert("Paket ini belum memiliki soal.");
        }
    } catch (err) {
        console.error("Error fetch questions:", err);
        alert("Gagal memuat soal. Cek console browser untuk detail error.");
    } finally {
        setLoadingSoal(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    const currentQ = questions[currentQIndex];
    setAnswers({ ...answers, [currentQ.id]: optionIndex });
  };

  const submitQuiz = async () => {
    let correctCount = 0;
    questions.forEach(q => {
      const selectedIdx = answers[q.id];
      if (selectedIdx !== undefined && q.options[selectedIdx].is_correct) {
        correctCount++;
      }
    });
    
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    setShowResult(true);

    // Simpan history
    await supabase.from("student_attempts").insert({
      student_id: user.id,
      package_id: activeQuiz.id,
      score: finalScore,
      answers: answers
    });
  };

  // --- VIEW: LIST PAKET ---
  if (!activeQuiz) {
    return (
      <div className="py-2">
        <h5 className="mb-4 fw-bold">Pilih Paket Latihan</h5>
        {loadingPkg && <div className="text-center"><Spinner animation="border" /></div>}
        
        {!loadingPkg && packages.length === 0 && (
            <Alert variant="info">Belum ada paket soal yang tersedia dari guru.</Alert>
        )}

        <Row>
            {packages.map(pkg => (
            <Col md={6} lg={4} key={pkg.id} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                        <Badge bg="primary">{pkg.level}</Badge>
                        <Badge bg="light" text="dark">{pkg.subject}</Badge>
                    </div>
                    <h5 className="mt-2 fw-bold text-dark">{pkg.title}</h5>
                    <p className="small text-muted mb-4">Guru: {pkg.teacher?.full_name}</p>
                    <Button variant="outline-primary" className="w-100 rounded-pill" onClick={() => startQuiz(pkg)} disabled={loadingSoal}>
                        {loadingSoal ? "Memuat..." : "Mulai Kerjakan"}
                    </Button>
                </Card.Body>
                </Card>
            </Col>
            ))}
        </Row>
      </div>
    );
  }

  // --- VIEW: QUIZ & RESULT ---
  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex + 1) / questions.length) * 100;

  return (
    <Card className="border-0 shadow-sm" style={{minHeight: '60vh'}}>
      <Card.Body className="p-4">
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h5 className="fw-bold m-0">{activeQuiz.title}</h5>
                {!showResult && <small className="text-muted">Soal {currentQIndex + 1} dari {questions.length}</small>}
            </div>
            {showResult && (
                <Button variant="outline-secondary" size="sm" onClick={() => setActiveQuiz(null)}>
                    <RefreshCw size={14} className="me-1"/> Pilih Paket Lain
                </Button>
            )}
        </div>
        
        {!showResult && <ProgressBar now={progress} className="mb-4" style={{height: '6px'}} variant="success" />}

        {/* --- MODE PENGERJAAN --- */}
        {!showResult ? (
          <>
            <div className="mb-4">
                {currentQ.question_image_url && (
                    <div className="text-center mb-3 p-3 bg-light rounded">
                        <img src={currentQ.question_image_url} alt="Soal" className="img-fluid rounded" style={{maxHeight:'300px'}} />
                    </div>
                )}
                <h5 className="lh-base" style={{whiteSpace: 'pre-wrap'}}>{currentQ.question_text}</h5>
            </div>

            <div className="d-grid gap-3 mb-5">
              {currentQ.options.map((opt, idx) => (
                <div 
                    key={idx} 
                    className={`p-3 rounded border cursor-pointer d-flex align-items-center gap-3 ${answers[currentQ.id] === idx ? 'bg-primary bg-opacity-10 border-primary' : 'bg-white hover-bg-light'}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => handleAnswer(idx)}
                >
                    <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${answers[currentQ.id] === idx ? 'bg-primary text-white' : 'bg-light text-secondary'}`} style={{width: '32px', height: '32px'}}>
                        {String.fromCharCode(65+idx)}
                    </div>
                    <div className="flex-grow-1">{opt.text}</div>
                    {answers[currentQ.id] === idx && <CheckCircle size={20} className="text-primary"/>}
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-auto">
              <Button variant="outline-secondary" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(p => p - 1)}>
                <ChevronLeft size={16} className="me-1"/> Sebelumnya
              </Button>
              
              {currentQIndex < questions.length - 1 ? (
                <Button variant="primary" onClick={() => setCurrentQIndex(p => p + 1)}>
                   Selanjutnya <ChevronRight size={16} className="ms-1"/>
                </Button>
              ) : (
                <Button variant="success" onClick={submitQuiz}>Selesai & Lihat Nilai</Button>
              )}
            </div>
          </>
        ) : (
          /* --- MODE HASIL --- */
          <div className="animate-fade-in">
            <div className="text-center py-4 bg-light rounded mb-4">
                <h3 className="mb-1">Nilai Kamu</h3>
                <div className={`display-1 fw-bold ${score >= 70 ? 'text-success' : 'text-danger'}`}>{score.toFixed(0)}</div>
                <p className="text-muted">Benar {Math.round((score/100)*questions.length)} dari {questions.length} soal</p>
            </div>
            
            <h5 className="mb-3 fw-bold border-bottom pb-2">Pembahasan</h5>
            <div style={{maxHeight: '600px', overflowY: 'auto'}}>
                {questions.map((q, i) => {
                  const myAnsIdx = answers[q.id];
                  const correctIdx = q.options.findIndex(o => o.is_correct);
                  const isCorrect = myAnsIdx === correctIdx;

                  return (
                    <Card key={q.id} className={`mb-3 border-start border-4 ${isCorrect ? 'border-success' : 'border-danger'}`}>
                      <Card.Body>
                        <strong className="text-muted">{i+1}. {q.question_text}</strong>
                        {q.question_image_url && <img src={q.question_image_url} className="img-fluid d-block mt-2 mb-2" style={{maxHeight:'100px'}} />}
                        
                        <div className="mt-2 small">
                            <span className={isCorrect ? "text-success fw-bold" : "text-danger fw-bold"}>Jawaban Kamu: {q.options[myAnsIdx]?.text || "-"}</span>
                            {!isCorrect && <span className="text-success fw-bold ms-3">Kunci: {q.options[correctIdx]?.text}</span>}
                        </div>

                        {(q.explanation_text || q.explanation_image_url) && (
                          <div className="bg-light p-2 rounded mt-2 border">
                            <small className="fw-bold d-block text-primary"><BookOpen size={14}/> Pembahasan:</small>
                            {q.explanation_text}
                            {q.explanation_image_url && <img src={q.explanation_image_url} className="img-fluid mt-2 border rounded" />}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}