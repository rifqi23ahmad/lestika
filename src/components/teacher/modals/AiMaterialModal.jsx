import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { Sparkles, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

export default function AiMaterialModal({ show, onHide, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input");
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    jenjang: "SMP",
    kelas: "7",
    amount: 10,
    includeAnswerKey: true,
  });

  // --- FUNGSI CLEAN TEXT YANG LEBIH CERDAS ---
  const cleanText = (text) => {
    if (!text) return "";
    let cleaned = text;

    // 1. Hapus wrapper LaTeX ($...$)
    cleaned = cleaned.replace(/\$([^\$]+)\$/g, "$1");

    // 2. Ganti simbol-simbol Matematika umum SEBELUM menghapus backslash
    cleaned = cleaned
      // Akar (sqrt)
      .replace(/\\sqrt\{([^}]+)\}/g, "√$1")      // \sqrt{5} -> √5
      .replace(/\\sqrt\s+(\d+)/g, "√$1")         // \sqrt 5 -> √5
      .replace(/sqrt\(([^)]+)\)/g, "√$1")        // sqrt(5) -> √5
      .replace(/sqrt\s+(\d+)/g, "√$1")           // sqrt 5  -> √5
      
      // Derajat
      .replace(/\\circ/g, "°")
      .replace(/\^\{\\circ\}/g, "°")             // ^{/circ} -> °
      .replace(/\^o/g, "°")

      // Pecahan (frac)
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2") // \frac{1}{2} -> 1/2
      
      // Perkalian & Lainnya
      .replace(/\\times/g, " x ")
      .replace(/\\cdot/g, " . ")
      .replace(/\\pm/g, "±")
      .replace(/\\approx/g, "≈")
      .replace(/\\leq/g, "≤")
      .replace(/\\geq/g, "≥")
      .replace(/\\pi/g, "π")
      
      // Pangkat sederhana (x^2 -> x²)
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³");

    // 3. Bersihkan sisa-sisa simbol LaTeX yang tidak tertangkap
    cleaned = cleaned
        .replace(/[\{\}\\]/g, "") // Hapus kurung kurawal & backslash sisa
        .replace(/\s+/g, " ")     // Hapus spasi ganda
        .trim();

    return cleaned;
  };

  const getClassOptions = (jenjang) => {
    if (jenjang === "SD") return [1, 2, 3, 4, 5, 6];
    if (jenjang === "SMP") return [7, 8, 9];
    if (jenjang === "SMA") return [10, 11, 12];
    return [];
  };

  const generatePDF = async (questions) => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;

    // --- 1. Load Logo ---
    try {
      const logoImg = new Image();
      logoImg.src = "/logo.png"; 
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; 
      });
      doc.addImage(logoImg, "PNG", margin, 10, 20, 20);
    } catch (e) {
      console.warn("Gagal load logo", e);
    }

    // --- 2. Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("BIMBEL MAPA", 40, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Latihan Soal & Pembahasan", 40, 27);
    
    // --- 3. Metadata ---
    doc.setFontSize(10);
    const labelX = margin;        
    const valueX = margin + 35;   

    doc.text("Mata Pelajaran", labelX, 40);
    doc.text(`: ${cleanText(formData.subject)}`, valueX, 40);
    doc.text("Kelas / Jenjang", labelX, 45);
    doc.text(`: ${formData.kelas} / ${formData.jenjang}`, valueX, 45);
    doc.text("Topik", labelX, 50);
    doc.text(`: ${cleanText(formData.topic)}`, valueX, 50);
    
    doc.setLineWidth(0.5);
    doc.line(margin, 55, pageWidth - margin, 55);

    // --- 4. Render Soal ---
    let yPos = 65;
    
    questions.forEach((q, index) => {
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        const questionTitle = `${index + 1}. ${cleanText(q.question)}`;
        const splitTitle = doc.splitTextToSize(questionTitle, maxLineWidth);
        doc.text(splitTitle, margin, yPos);
        yPos += (splitTitle.length * 5) + 3;

        // Render Placeholder Gambar (Image Hint)
        if (q.image_hint && q.image_hint.length > 5) {
            if (yPos + 50 > 270) { 
                doc.addPage();
                yPos = 20;
            }

            doc.setDrawColor(150); 
            doc.setLineWidth(0.5);
            doc.rect(margin + 5, yPos, 80, 40); 
            
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(100);
            
            const hintText = cleanText(q.image_hint);
            const splitHint = doc.splitTextToSize(`Ilustrasi: ${hintText}`, 75);
            doc.text(splitHint, margin + 8, yPos + 10);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(0);
            
            yPos += 45; 
        }

        // Render Opsi
        doc.setFont("helvetica", "normal");
        q.options.forEach((opt, idx) => {
            const optLetter = String.fromCharCode(65 + idx); 
            const optText = `${optLetter}. ${cleanText(opt)}`;
            const splitOpt = doc.splitTextToSize(optText, maxLineWidth - 5);
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(splitOpt, margin + 5, yPos);
            yPos += (splitOpt.length * 5) + 2;
        });

        yPos += 6; 
    });

    // --- 5. Kunci Jawaban ---
    if (formData.includeAnswerKey) {
        doc.addPage();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("KUNCI JAWABAN & PEMBAHASAN", margin, 20);
        doc.line(margin, 25, pageWidth - margin, 25);
        
        yPos = 35;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        questions.forEach((q, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont("helvetica", "bold");
            doc.text(`${index + 1}. Jawaban: ${cleanText(q.correct_answer)}`, margin, yPos);
            yPos += 6;

            if (q.explanation) {
                doc.setFont("helvetica", "italic");
                const explanation = `Pembahasan: ${cleanText(q.explanation)}`;
                const splitExp = doc.splitTextToSize(explanation, maxLineWidth);
                doc.text(splitExp, margin, yPos);
                yPos += (splitExp.length * 5) + 6;
            } else {
                yPos += 4;
            }
        });
    }

    return doc.output("blob");
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!formData.topic || !formData.subject) return;

    setLoading(true);
    setStep("processing");
    setError(null);

    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "generate-questions",
        {
          body: {
            topic: formData.topic,
            jenjang: formData.jenjang,
            kelas: `Kelas ${formData.kelas}`,
            amount: formData.amount 
          },
        }
      );

      if (aiError) throw aiError;
      const questions = aiData.data;

      if (!questions || questions.length === 0) {
        throw new Error("AI tidak mengembalikan soal. Coba topik lain.");
      }

      setStep("uploading");
      const pdfBlob = await generatePDF(questions);
      
      const fileName = `ai_gen_${Date.now()}.pdf`;
      const filePath = `uploads/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, pdfBlob, {
            contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("materials").insert([
        {
          teacher_id: user.id,
          title: `Latihan Soal: ${formData.topic}`,
          description: `Soal digenerate otomatis oleh AI. Topik: ${formData.topic}${!formData.includeAnswerKey ? ' (Tanpa Kunci Jawaban)' : ''}`,
          jenjang: formData.jenjang,
          kelas: formData.kelas,
          subject: formData.subject,
          file_url: publicUrlData.publicUrl,
          created_at: new Date()
        }
      ]);

      if (dbError) throw dbError;

      onSuccess(); 
      handleClose();

    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memproses.");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFormData({
        topic: "",
        subject: "",
        jenjang: "SMP",
        kelas: "7",
        amount: 10,
        includeAnswerKey: true,
    });
    setStep("input");
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Generate Materi PDF dengan AI
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleProcess}>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          {step === "input" ? (
            <div className="row g-3">
              <div className="col-12">
                 <Alert variant="info" className="d-flex align-items-center gap-2 small mb-0">
                    <Sparkles size={16}/>
                    AI akan membuatkan soal pilihan ganda lengkap dengan <b>kotak ilustrasi</b> (untuk soal geometri).
                 </Alert>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="fw-medium">Topik Materi</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Sudut Pusat, Luas Lingkaran..."
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-medium">Mata Pelajaran</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Matematika"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                 <Form.Group>
                    <Form.Label className="fw-medium">Jumlah Soal</Form.Label>
                    <Form.Select
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                    >
                        <option value="5">5 Soal</option>
                        <option value="10">10 Soal</option>
                        <option value="15">15 Soal</option>
                        <option value="20">20 Soal</option>
                    </Form.Select>
                 </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-medium">Jenjang</Form.Label>
                  <Form.Select
                    value={formData.jenjang}
                    onChange={(e) => setFormData({...formData, jenjang: e.target.value, kelas: getClassOptions(e.target.value)[0]})}
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-medium">Kelas</Form.Label>
                  <Form.Select
                    value={formData.kelas}
                    onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                  >
                    {getClassOptions(formData.jenjang).map(k => (
                        <option key={k} value={k}>Kelas {k}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-12 mt-4">
                  <div className="bg-light p-3 rounded-3 border">
                    <Form.Check 
                        type="switch"
                        id="include-answer-switch"
                        label={
                            <div>
                                <span className="fw-bold">Sertakan Kunci Jawaban & Pembahasan</span>
                                <div className="text-muted small fw-normal">
                                    Jika dimatikan, PDF hanya akan berisi soal (cocok untuk ujian/PR siswa).
                                </div>
                            </div>
                        }
                        checked={formData.includeAnswerKey}
                        onChange={(e) => setFormData({...formData, includeAnswerKey: e.target.checked})}
                    />
                  </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h5 className="fw-bold animate-pulse">
                    {step === "processing" ? "Sedang Menganalisis Topik..." : "Menyusun PDF..."}
                </h5>
                <p className="text-muted small">
                  Sedang menyiapkan soal dan layout, serta merapikan format teks.
                </p>
                <div className="mt-3">
                  <Loader2 className="animate-spin text-muted" size={24} />
                </div>
            </div>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          {step === "input" && (
            <Button type="submit" variant="primary" disabled={loading}>
              <Sparkles size={18} className="me-2" />
              Generate PDF
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}