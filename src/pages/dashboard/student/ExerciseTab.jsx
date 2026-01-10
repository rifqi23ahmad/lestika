import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, ProgressBar, Spinner, Alert } from "react-bootstrap";
import { BookOpen, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, PlayCircle, Award } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function ExerciseTab({ user }) {
  const [packages, setPackages] = useState([]);
  const [loadingPkg, setLoadingPkg] = useState(false);
  
  const [activeQuiz, setActiveQuiz] = useState(null); 
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
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

        if (data && data.length > 0) {
            setQuestions(data);
            setActiveQuiz(pkg);
        } else {
            alert("Paket ini belum memiliki soal.");
        }
    } catch (err) {
        console.error("Error fetch questions:", err);
        alert("Gagal memuat soal.");
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
      <div className="animate-fade-in">
        <div className="d-flex align-items-center mb-4">
           <div>
             <h5 className="fw-bold mb-1">Latihan Soal</h5>
             <p className="text-muted small mb-0">Asah kemampuanmu dengan mengerjakan paket soal.</p>
           </div>
        </div>
        
        {loadingPkg && <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>}
        
        {!loadingPkg && packages.length === 0 && (
            <Alert variant="info" className="border-0 shadow-sm rounded-3">
                <div className="d-flex gap-3 align-items-center">
                    <BookOpen size={24} />
                    <div>
                        <strong>Belum ada paket soal.</strong>
                        <div className="small">Silakan cek kembali nanti.</div>
                    </div>
                </div>
            </Alert>
        )}

        <Row className="g-3">
            {packages.map(pkg => (
            <Col md={6} lg={4} key={pkg.id}>
                <Card className="h-100 shadow-sm border-0 rounded-4 hover-top transition">
                <Card.Body className="p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between mb-3">
                        <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 rounded-pill">{pkg.subject}</Badge>
                        <Badge bg="light" text="dark" className="border">{pkg.level}</Badge>
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{pkg.title}</h5>
                    <p className="small text-muted mb-4 flex-grow-1">Oleh: {pkg.teacher?.full_name || "Guru"}</p>
                    
                    <Button 
                        variant="primary" 
                        className="w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" 
                        onClick={() => startQuiz(pkg)} 
                        disabled={loadingSoal}
                    >
                        {loadingSoal ? <Spinner size="sm"/> : <><PlayCircle size={18}/> Mulai Kerjakan</>}
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
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden animate-fade-in" style={{minHeight: '60vh'}}>
      <Card.Body className="p-0">
        
        {/* HEADER QUIZ */}
        <div className="bg-white p-4 border-bottom">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 className="fw-bold m-0">{activeQuiz.title}</h5>
                    {!showResult && <Badge bg="light" text="dark" className="mt-2 border">Soal {currentQIndex + 1} / {questions.length}</Badge>}
                </div>
                {showResult && (
                    <Button variant="outline-primary" size="sm" onClick={() => setActiveQuiz(null)} className="rounded-pill">
                        <RefreshCw size={14} className="me-1"/> Pilih Paket Lain
                    </Button>
                )}
            </div>
            {!showResult && <ProgressBar now={progress} style={{height: '8px'}} variant="primary" className="rounded-pill" />}
        </div>
        
        <div className="p-4">
            {/* --- MODE PENGERJAAN --- */}
            {!showResult ? (
            <>
                <div className="mb-4">
                    {currentQ.question_image_url && (
                        <div className="text-center mb-3 p-3 bg-light rounded-4">
                            <img src={currentQ.question_image_url} alt="Soal" className="img-fluid rounded shadow-sm" style={{maxHeight:'300px'}} />
                        </div>
                    )}
                    <h5 className="lh-base fw-medium text-dark" style={{whiteSpace: 'pre-wrap'}}>{currentQ.question_text}</h5>
                </div>

                <div className="d-grid gap-3 mb-5">
                {currentQ.options.map((opt, idx) => (
                    <div 
                        key={idx} 
                        className={`p-3 rounded-3 border cursor-pointer d-flex align-items-center gap-3 transition ${answers[currentQ.id] === idx ? 'bg-primary bg-opacity-10 border-primary ring-1 ring-primary' : 'bg-white hover-bg-light'}`}
                        style={{cursor: 'pointer'}}
                        onClick={() => handleAnswer(idx)}
                    >
                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${answers[currentQ.id] === idx ? 'bg-primary text-white' : 'bg-light text-secondary'}`} style={{width: '36px', height: '36px', minWidth:'36px'}}>
                            {String.fromCharCode(65+idx)}
                        </div>
                        <div className="flex-grow-1">{opt.text}</div>
                        {answers[currentQ.id] === idx && <CheckCircle size={20} className="text-primary"/>}
                    </div>
                ))}
                </div>

                <div className="d-flex justify-content-between mt-auto pt-3 border-top">
                <Button variant="light" className="px-4 rounded-pill" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(p => p - 1)}>
                    <ChevronLeft size={16} className="me-1"/> Sebelumnya
                </Button>
                
                {currentQIndex < questions.length - 1 ? (
                    <Button variant="primary" className="px-4 rounded-pill" onClick={() => setCurrentQIndex(p => p + 1)}>
                    Selanjutnya <ChevronRight size={16} className="ms-1"/>
                    </Button>
                ) : (
                    <Button variant="success" className="px-4 rounded-pill fw-bold" onClick={submitQuiz}>Selesai & Lihat Nilai</Button>
                )}
                </div>
            </>
            ) : (
            /* --- MODE HASIL --- */
            <div className="animate-fade-in">
                <div className="text-center py-5 bg-light rounded-4 mb-4 position-relative overflow-hidden">
                    <div className="position-absolute top-0 start-50 translate-middle-x mt-n4 opacity-25 text-primary">
                        <Award size={200} />
                    </div>
                    <div className="position-relative">
                        <h4 className="mb-2 text-muted">Skor Kamu</h4>
                        <h1 className={`display-1 fw-bold ${score >= 70 ? 'text-success' : 'text-danger'}`}>{score.toFixed(0)}</h1>
                        <Badge bg={score >= 70 ? "success" : "danger"} className="px-3 py-2 rounded-pill mt-2">
                            {score >= 70 ? "Lulus - Pertahankan!" : "Belum Lulus - Coba Lagi"}
                        </Badge>
                        <p className="text-muted mt-3 mb-0">Menjawab benar <strong>{Math.round((score/100)*questions.length)}</strong> dari {questions.length} soal</p>
                    </div>
                </div>
                
                <h5 className="mb-4 fw-bold d-flex align-items-center"><BookOpen size={20} className="me-2 text-primary"/> Pembahasan Soal</h5>
                <div className="d-flex flex-column gap-3">
                    {questions.map((q, i) => {
                    const myAnsIdx = answers[q.id];
                    const correctIdx = q.options.findIndex(o => o.is_correct);
                    const isCorrect = myAnsIdx === correctIdx;

                    return (
                        <Card key={q.id} className={`border-0 shadow-sm rounded-3 overflow-hidden border-start border-5 ${isCorrect ? 'border-success' : 'border-danger'}`}>
                        <Card.Body className="p-4">
                            <div className="d-flex gap-3">
                                <div className={`fw-bold fs-5 ${isCorrect ? 'text-success' : 'text-danger'}`}>{i+1}.</div>
                                <div className="flex-grow-1">
                                    <div className="fw-medium text-dark mb-2">{q.question_text}</div>
                                    {q.question_image_url && <img src={q.question_image_url} className="img-fluid rounded mb-3 border" style={{maxHeight:'150px'}} />}
                                    
                                    <div className="d-flex flex-column flex-md-row gap-3 mt-3 p-3 bg-light rounded-3">
                                        <div className={isCorrect ? "text-success fw-bold" : "text-danger fw-bold"}>
                                            <span className="text-muted fw-normal d-block small">Jawaban Kamu:</span> 
                                            {q.options[myAnsIdx]?.text || "Tidak dijawab"}
                                        </div>
                                        {!isCorrect && (
                                            <div className="text-success fw-bold border-start ps-md-3 border-secondary">
                                                <span className="text-muted fw-normal d-block small">Kunci Jawaban:</span>
                                                {q.options[correctIdx]?.text}
                                            </div>
                                        )}
                                    </div>

                                    {(q.explanation_text || q.explanation_image_url) && (
                                    <div className="mt-3 pt-3 border-top">
                                        <small className="fw-bold text-primary d-flex align-items-center mb-2"><BookOpen size={14} className="me-1"/> Penjelasan:</small>
                                        <div className="text-muted small">{q.explanation_text || "Tidak ada teks penjelasan."}</div>
                                        {q.explanation_image_url && <img src={q.explanation_image_url} className="img-fluid mt-2 border rounded" style={{maxHeight: '150px'}} />}
                                    </div>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                        </Card>
                    )
                    })}
                </div>
            </div>
            )}
        </div>
      </Card.Body>
    </Card>
  );
}