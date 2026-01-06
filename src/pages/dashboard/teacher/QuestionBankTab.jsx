import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Button, Form, Modal, Accordion, Spinner, Badge } from "react-bootstrap";
import { 
  Plus, Edit, Trash, Sparkles, Check, Edit3, 
  PenTool, Eye, ChevronLeft, ChevronRight, FileText, Scissors, 
  ZoomIn, ZoomOut, RefreshCw 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import ScreenAnnotation from "../../../components/common/ScreenAnnotation";

// --- SETUP REACT-PDF YANG LEBIH STABIL ---
import { Document, Page, pdfjs } from 'react-pdf';

// PENTING: Menggunakan worker versi minified standar untuk kompatibilitas Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- KOMPONEN PDF VIEWER (FIXED) ---
const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(null); // State untuk menangkap error

  // Observer agar lebar fit container
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width - 30); // Beri jarak padding
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(null);
  }

  function onDocumentLoadError(error) {
    console.error("PDF Load Error:", error);
    setLoadError(error.message);
  }

  const changePage = (offset) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  return (
    <div className="d-flex flex-column align-items-center w-100" ref={containerRef}>
      
      {/* TAMPILKAN ERROR JIKA ADA */}
      {loadError && (
        <div className="alert alert-danger w-100 text-center">
            <strong>Gagal memuat PDF:</strong> {loadError}
            <br/>
            <small>Pastikan file PDF tidak rusak. Coba refresh halaman.</small>
        </div>
      )}

      {/* TOOLBAR (Hanya muncul jika sukses load) */}
      {!loadError && numPages && (
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm mb-3 sticky-top border z-3">
            <Button variant="light" size="sm" disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="rounded-circle p-1 border" style={{width:32, height:32}}>
                <ChevronLeft size={16}/>
            </Button>
            <span className="small fw-bold text-nowrap mx-1" style={{minWidth: '60px', textAlign: 'center'}}>
                {pageNumber} / {numPages}
            </span>
            <Button variant="light" size="sm" disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="rounded-circle p-1 border" style={{width:32, height:32}}>
                <ChevronRight size={16}/>
            </Button>
            <div className="vr mx-2"></div>
            <Button variant="outline-secondary" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1" style={{width:32, height:32}}><ZoomOut size={14}/></Button>
            <span className="small text-muted fw-bold">{Math.round(scale * 100)}%</span>
            <Button variant="outline-secondary" size="sm" onClick={() => setScale(s => Math.min(3.0, s + 0.2))} className="p-1" style={{width:32, height:32}}><ZoomIn size={14}/></Button>
        </div>
      )}

      {/* CONTAINER PDF */}
      <div className="border shadow-sm bg-dark p-3 rounded w-100 overflow-auto d-flex justify-content-center" style={{ maxHeight: '75vh', minHeight: '300px' }}>
          <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError} // Tangkap Error
              loading={<div className="text-white p-5 text-center"><Spinner animation="border" size="sm"/> Memuat PDF...</div>}
              noData={<div className="text-white p-5">Tidak ada data PDF.</div>}
          >
              <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  width={containerWidth || 500} // Fallback width jika observer belum jalan
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  canvasBackground="white"
                  className="shadow-lg"
              />
          </Document>
      </div>
    </div>
  );
};

export default function QuestionBankTab({ user, showModal }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [activePackage, setActivePackage] = useState(null);
  const [pkgForm, setPkgForm] = useState({ title: "", level: "SD", subject: "Matematika" });

  const [questions, setQuestions] = useState([]);
  const [showQModal, setShowQModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [showAnnotationMode, setShowAnnotationMode] = useState(false);

  const [qForm, setQForm] = useState({
    text: "",
    options: [{ text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }],
    explanation: "",
    imageFile: null, explanationBlob: null 
  });
  // State untuk menyimpan URL PDF lokal
  const [masterPdfUrl, setMasterPdfUrl] = useState(null);

  useEffect(() => { if (user) fetchPackages(); }, [user]);

  const fetchPackages = async () => {
    setLoading(true);
    const { data } = await supabase.from("question_packages").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
    if (data) setPackages(data);
    setLoading(false);
  };
  const fetchQuestions = async (pkgId) => {
    const { data } = await supabase.from("questions").select("*").eq("package_id", pkgId).order('created_at', { ascending: true });
    setQuestions(data || []);
  };
  const isPdf = (url) => url?.toLowerCase().includes('.pdf') || url?.type === 'application/pdf';

  const handleCreatePackage = async () => {
    if (!pkgForm.title) return showModal("Gagal", "Judul wajib diisi.", "error");
    const { error } = await supabase.from("question_packages").insert({ teacher_id: user.id, ...pkgForm });
    if (!error) { showModal("Sukses", "Paket berhasil dibuat.", "success"); setShowPkgModal(false); fetchPackages(); }
  };
  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm("Hapus Paket ini?")) return;
    const { error } = await supabase.from("question_packages").delete().eq("id", pkgId);
    if (!error) { 
        if (activePackage?.id === pkgId) { setActivePackage(null); setQuestions([]); }
        fetchPackages(); 
    }
  };

  const resetForm = () => {
    setQForm({ text: "", options: [{ text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }], explanation: "", imageFile: null, explanationBlob: null });
    setIsEditing(false); setEditingId(null); setMasterPdfUrl(null);
  };
  const openAddModal = () => { resetForm(); setShowQModal(true); };
  const openEditModal = (q) => {
    setQForm({ text: q.question_text, options: q.options, explanation: q.explanation_text || "", imageFile: null, explanationBlob: null });
    setIsEditing(true); setEditingId(q.id); setShowQModal(true); setShowPreviewModal(false); 
  };
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Hapus soal ini?")) return;
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (!error) { fetchQuestions(activePackage.id); setShowPreviewModal(false); }
  };

  const handleSaveQuestion = async () => {
    const hasMedia = qForm.imageFile || qForm.explanationBlob || (isEditing && qForm.text); 
    let finalText = qForm.text;
    if (!finalText && hasMedia) finalText = "Perhatikan gambar berikut!"; 
    else if (!finalText) return showModal("Gagal", "Teks soal wajib diisi.", "error");
    if (!qForm.options.some(o => o.is_correct)) return showModal("Gagal", "Pilih kunci jawaban.", "error");

    setLoadingSubmit(true);
    try {
      let qImgUrl = null; let explImgUrl = null;
      if (qForm.imageFile) {
        const fileExt = qForm.imageFile.name.split('.').pop();
        const fileName = `q_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from('question-bank').upload(fileName, qForm.imageFile, { upsert: true });
        if (error) throw error;
        qImgUrl = supabase.storage.from('question-bank').getPublicUrl(fileName).data.publicUrl;
      }
      if (qForm.explanationBlob && !qForm.imageFile && !isEditing) {
          const fileName = `q_crop_${Date.now()}.png`;
          const { error } = await supabase.storage.from('question-bank').upload(fileName, qForm.explanationBlob, { contentType: 'image/png', upsert: true });
          if (error) throw error;
          qImgUrl = supabase.storage.from('question-bank').getPublicUrl(fileName).data.publicUrl;
      } else if (qForm.explanationBlob) {
        const fileName = `expl_${Date.now()}_${user.id}.png`;
        const { error } = await supabase.storage.from('question-bank').upload(fileName, qForm.explanationBlob, { contentType: 'image/png', upsert: true });
        if (error) throw error;
        explImgUrl = supabase.storage.from('question-bank').getPublicUrl(fileName).data.publicUrl;
      }
      const payload = { package_id: activePackage.id, question_text: finalText, options: qForm.options, explanation_text: qForm.explanation };
      if (qImgUrl) payload.question_image_url = qImgUrl;
      if (explImgUrl) payload.explanation_image_url = explImgUrl;

      const { error } = isEditing ? await supabase.from("questions").update(payload).eq("id", editingId) : await supabase.from("questions").insert(payload);
      if (error) throw error;
      showModal("Sukses", `Soal ${isEditing ? 'diperbarui' : 'ditambahkan'}.`, "success");
      setShowQModal(false); resetForm(); fetchQuestions(activePackage.id);
    } catch (err) { showModal("Gagal", err.message, "error"); } finally { setLoadingSubmit(false); }
  };

  const handleOpenPreview = (q) => { setPreviewQuestion(q); setShowPreviewModal(true); };
  const handleGlobalWhiteboard = () => { setPreviewQuestion(null); setShowAnnotationMode(true); };
  
  // FIX: Handle Upload Master PDF
  const handleUploadMasterPdf = (e) => {
      const file = e.target.files[0];
      if(file && file.type === 'application/pdf') {
          // Buat URL lokal untuk PDF tersebut
          const url = URL.createObjectURL(file);
          setMasterPdfUrl(url); 
          // Set previewQuestion dengan flag isRawPdf
          setPreviewQuestion({ question_image_url: url, isRawPdf: true }); 
          setShowPreviewModal(true); 
      } else { 
          showModal("Salah Format", "Harap upload file PDF.", "error"); 
      }
  };

  const handleAnnotationSave = async (blob) => {
    if (previewQuestion?.isRawPdf) {
        setQForm({ ...qForm, explanationBlob: blob, text: "Perhatikan gambar berikut!" }); 
        setShowAnnotationMode(false); setShowPreviewModal(false); setShowQModal(true); 
        showModal("Soal Terpotong", "Potongan gambar diambil.", "success");
    } else if (previewQuestion && !previewQuestion.isRawPdf && showPreviewModal) {
       const fileName = `expl_annotated_${Date.now()}.png`;
       const { error } = await supabase.storage.from('question-bank').upload(fileName, blob, { contentType: 'image/png', upsert: true });
       if (!error) {
           const publicUrl = supabase.storage.from('question-bank').getPublicUrl(fileName).data.publicUrl;
           await supabase.from("questions").update({ explanation_image_url: publicUrl }).eq("id", previewQuestion.id);
           setShowAnnotationMode(false); showModal("Berhasil", "Coretan disimpan.", "success");
           fetchQuestions(activePackage.id); setPreviewQuestion({...previewQuestion, explanation_image_url: publicUrl});
       }
    } else if (showQModal) {
        setQForm({ ...qForm, explanationBlob: blob }); setShowAnnotationMode(false);
    } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a"); link.href = url; link.download = `whiteboard.png`;
        link.click(); setShowAnnotationMode(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded gap-2">
        <div>
            <h5 className="fw-bold m-0 text-primary">Bank Soal & Latihan</h5>
            {activePackage && <small className="text-muted">Paket: <strong>{activePackage.title}</strong></small>}
        </div>
        <div className="d-flex gap-2">
            <Button variant="outline-dark" className="d-flex align-items-center gap-2" size="sm" onClick={handleGlobalWhiteboard}>
                <PenTool size={16} /> <span className="d-none d-sm-inline">Whiteboard</span>
            </Button>
            <Button onClick={() => setShowPkgModal(true)} className="d-flex align-items-center gap-2" size="sm">
                <Plus size={16} /> <span className="d-none d-sm-inline">Paket Baru</span>
            </Button>
        </div>
      </div>

      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        <Row>
          {packages.map(pkg => (
            <Col md={12} key={pkg.id} className="mb-3">
              <Card className={`border-0 shadow-sm ${activePackage?.id === pkg.id ? 'border-start border-5 border-primary' : ''}`}>
                <Card.Body className="d-flex justify-content-between align-items-center p-3">
                  <div className="text-truncate pe-2">
                    <h6 className="fw-bold m-0 text-truncate">{pkg.title}</h6>
                    <small className="text-muted">{pkg.level} • {pkg.subject}</small>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    <Button variant={activePackage?.id === pkg.id ? "primary" : "outline-primary"} size="sm" onClick={() => { setActivePackage(pkg); fetchQuestions(pkg.id); }}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeletePackage(pkg.id)}><Trash size={16} /></Button>
                  </div>
                </Card.Body>
                
                {activePackage?.id === pkg.id && (
                  <Card.Footer className="bg-light border-0 p-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                      <strong>Soal ({questions.length})</strong>
                      <div className="d-flex gap-2">
                          <div className="position-relative">
                              <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-1">
                                  <Scissors size={14} /> <span className="d-none d-sm-inline">Potong PDF</span>
                              </Button>
                              <input type="file" accept="application/pdf" className="position-absolute top-0 start-0 w-100 h-100 opacity-0" onChange={handleUploadMasterPdf} />
                          </div>
                          <Button variant="success" size="sm" onClick={openAddModal}><Plus size={14} /> Manual</Button>
                      </div>
                    </div>
                    {questions.map((q, idx) => (
                        <Accordion key={q.id} className="mb-2 shadow-sm">
                            <Accordion.Item eventKey="0">
                            <Accordion.Header><span className="fw-bold me-2">#{idx + 1}</span> <span className="text-truncate">{q.question_text}</span></Accordion.Header>
                            <Accordion.Body>
                                <div className="d-flex justify-content-end gap-2 mb-3 border-bottom pb-2">
                                    <Button size="sm" variant="outline-info" onClick={() => handleOpenPreview(q)}><Eye size={16}/></Button>
                                    <Button size="sm" variant="outline-warning" onClick={() => openEditModal(q)}><Edit size={16}/></Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => handleDeleteQuestion(q.id)}><Trash size={16}/></Button>
                                </div>
                                {q.question_image_url && (
                                  <div className="mb-2">
                                    {isPdf(q.question_image_url) ? (
                                        <div className="p-2 border rounded bg-white text-center">
                                            <FileText className="text-danger mb-1" size={24}/>
                                            <small className="d-block text-muted">Dokumen PDF</small>
                                        </div>
                                    ) : (
                                        <img src={q.question_image_url} className="img-fluid border rounded" style={{maxHeight: '150px'}} />
                                    )}
                                  </div>
                                )}
                                <p className="mb-2">{q.question_text}</p>
                                <ul className="list-unstyled mb-0 small text-muted">
                                    {q.options?.map((opt, i) => <li key={i} className={opt.is_correct?"text-success fw-bold":""}>{String.fromCharCode(65+i)}. {opt.text}</li>)}
                                </ul>
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

      <ScreenAnnotation isActive={showAnnotationMode} onClose={() => setShowAnnotationMode(false)} onSave={handleAnnotationSave} />

      {/* PREVIEW MODAL */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} fullscreen style={{ zIndex: 1050 }}>
        <Modal.Header closeButton className="bg-light py-2">
            <Modal.Title className="h6 m-0 d-flex align-items-center gap-2">
                {previewQuestion?.isRawPdf ? <><Scissors size={18}/> Potong Soal</> : <><Eye size={18}/> Preview</>}
            </Modal.Title>
            <div className="ms-auto me-2">
                 <Button size="sm" variant="primary" onClick={() => setShowAnnotationMode(true)}>
                    <PenTool size={16} className="me-1"/> 
                    {previewQuestion?.isRawPdf ? "Mulai Potong" : "Coret"}
                 </Button>
            </div>
        </Modal.Header>
        <Modal.Body className="bg-dark bg-opacity-10 d-flex justify-content-center overflow-auto p-2 p-md-4">
            {previewQuestion && (
                <div style={{ width: '100%', maxWidth: '800px' }}>
                    {previewQuestion.isRawPdf && (
                        <div className="alert alert-info py-2 small mb-3">
                            <strong>Langkah:</strong> 1. Atur Zoom & Posisi agar soal terlihat jelas. <br/>2. Klik tombol <b>"Mulai Potong"</b> di atas. <br/>3. Klik <b>Simpan</b> (Disket) di bawah.
                        </div>
                    )}
                    <div className="bg-white p-3 p-md-4 shadow rounded">
                        {previewQuestion.question_image_url && (
                            <div className="text-center mb-3">
                                <PdfViewer url={previewQuestion.question_image_url} />
                            </div>
                        )}
                        {!previewQuestion.isRawPdf && (
                            <>
                                <h5 className="mb-3">{previewQuestion.question_text}</h5>
                                <div className="d-grid gap-2">
                                    {previewQuestion.options?.map((opt, idx) => (
                                        <div key={idx} className={`p-2 border rounded ${opt.is_correct?'bg-success bg-opacity-10 border-success':''}`}>
                                            <strong>{String.fromCharCode(65+idx)}.</strong> {opt.text}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </Modal.Body>
      </Modal>

      <Modal show={showPkgModal} onHide={() => setShowPkgModal(false)} centered>
        <Modal.Body>
          <Form.Group className="mb-2"><Form.Label>Judul</Form.Label><Form.Control type="text" onChange={e => setPkgForm({...pkgForm, title: e.target.value})} /></Form.Group>
          <Form.Group className="mb-2"><Form.Label>Jenjang</Form.Label><Form.Select onChange={e => setPkgForm({...pkgForm, level: e.target.value})}><option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option></Form.Select></Form.Group>
          <Form.Group className="mb-2"><Form.Label>Mapel</Form.Label><Form.Control type="text" value={pkgForm.subject} onChange={e => setPkgForm({...pkgForm, subject: e.target.value})} /></Form.Group>
        </Modal.Body>
        <Modal.Footer><Button onClick={handleCreatePackage}>Simpan</Button></Modal.Footer>
      </Modal>

      <Modal show={showQModal} onHide={() => setShowQModal(false)} size="xl" backdrop="static" fullscreen="sm-down">
        <Modal.Header closeButton><Modal.Title>{isEditing ? "Edit Soal" : "Tambah Soal"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6} className="border-end">
                {qForm.explanationBlob && !qForm.imageFile && !isEditing && (
                    <div className="mb-3 border border-success p-2 rounded bg-success bg-opacity-10 text-center">
                        <span className="badge bg-success mb-2">Hasil Potong</span>
                        <img src={URL.createObjectURL(qForm.explanationBlob)} className="img-fluid rounded shadow-sm d-block mx-auto" style={{maxHeight:'150px'}}/>
                    </div>
                )}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Pertanyaan</Form.Label>
                    <Form.Control as="textarea" rows={3} value={qForm.text} onChange={e => setQForm({...qForm, text: e.target.value})} placeholder="Tulis soal..." />
                </Form.Group>
                
                <div className="bg-light p-3 rounded">
                    {qForm.options.map((opt, idx) => (
                        <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                        <Form.Check type="radio" name="correct_opt" checked={opt.is_correct} onChange={() => {
                            const newOpts = qForm.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                            setQForm({...qForm, options: newOpts});
                        }}/>
                        <Form.Control type="text" placeholder={`Opsi ${String.fromCharCode(65+idx)}`} value={opt.text} onChange={e => {
                            const newOpts = [...qForm.options];
                            newOpts[idx].text = e.target.value;
                            setQForm({...qForm, options: newOpts});
                        }} />
                        </div>
                    ))}
                </div>
            </Col>
            <Col md={6} className="mt-3 mt-md-0">
                 <Form.Group className="mb-3"><Form.Label>Penjelasan</Form.Label><Form.Control as="textarea" rows={3} value={qForm.explanation} onChange={e => setQForm({...qForm, explanation: e.target.value})} /></Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSaveQuestion} disabled={loadingSubmit}>{loadingSubmit ? <Spinner size="sm"/> : "Simpan"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}