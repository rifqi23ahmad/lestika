import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function AiGenerationModal({
  show,
  onHide,
  packageId,
  packageLevel,
  onSuccess,
  showToast,
}) {
  const [aiTopic, setAiTopic] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAI = async () => {
    if (!aiTopic) return alert("Mohon isi topik terlebih dahulu");
    if (!packageId) return alert("Paket tidak valid!");

    setIsGeneratingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-questions",
        {
          body: {
            topic: aiTopic,
            jenjang: packageLevel || "Umum",
            kelas: "Umum",
          },
        }
      );

      if (error) throw error;

      const newQuestions = data.data.map((q) => ({
        package_id: packageId,
        question_text: q.question,
        options: q.options.map((opt, idx) => ({
          text: opt,
          is_correct: opt === q.correct_answer,
        })),
        explanation_text: q.explanation,
      }));

      const { error: insertError } = await supabase
        .from("questions")
        .insert(newQuestions);

      if (insertError) throw insertError;

      showToast("Sukses", "Berhasil membuat soal otomatis!", "success");
      onSuccess(); // Callback to refresh questions
      setAiTopic("");
      onHide();
    } catch (err) {
      console.error(err);
      showToast("Gagal", "Gagal generate soal: " + err.message, "error");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Generate Soal Otomatis
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Topik atau Materi Soal</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Contoh: Trigonometri dasar, Hukum Newton..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <Form.Text className="text-muted">
            AI akan membuatkan soal pilihan ganda beserta kunci jawaban
            berdasarkan topik ini.
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleGenerateAI}
          disabled={isGeneratingAi}
        >
          {isGeneratingAi ? (
            <>
              <Loader2 className="animate-spin me-2" size={16} />
              Sedang Membuat...
            </>
          ) : (
            "Generate Sekarang"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
