import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { supabase } from "../../../lib/supabase";

export default function QuestionFormModal({
  show,
  onHide,
  packageId,
  editData,
  onSuccess,
  showToast,
}) {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [qForm, setQForm] = useState({
    text: "",
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
    explanation: "",
    imageFile: null,
  });

  useEffect(() => {
    if (show) {
      if (editData) {
        setQForm({
          text: editData.question_text,
          options: editData.options,
          explanation: editData.explanation_text || "",
          imageFile: null,
        });
      } else {
        setQForm({
          text: "",
          options: Array(4).fill({ text: "", is_correct: false }),
          explanation: "",
          imageFile: null,
        });
      }
    }
  }, [show, editData]);

  const handleSaveQuestion = async () => {
    const isEditing = !!editData;
    const hasMedia = qForm.imageFile || (isEditing && qForm.text);

    let finalText = qForm.text;
    if (!finalText && hasMedia) finalText = "Perhatikan gambar berikut!";
    else if (!finalText)
      return showToast("Gagal", "Teks soal wajib diisi.", "error");

    if (!qForm.options.some((o) => o.is_correct))
      return showToast("Gagal", "Pilih kunci jawaban.", "error");

    setLoadingSubmit(true);
    try {
      let qImgUrl = null;
      if (qForm.imageFile) {
        const fileExt = qForm.imageFile.name.split(".").pop();
        const fileName = `q_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const { error } = await supabase.storage
          .from("question-bank")
          .upload(fileName, qForm.imageFile, { upsert: true });
        if (error) throw error;

        const { data } = supabase.storage
          .from("question-bank")
          .getPublicUrl(fileName);
        qImgUrl = data.publicUrl;
      }

      const payload = {
        package_id: packageId,
        question_text: finalText,
        options: qForm.options,
        explanation_text: qForm.explanation,
      };
      if (qImgUrl) payload.question_image_url = qImgUrl;

      const { error } = isEditing
        ? await supabase.from("questions").update(payload).eq("id", editData.id)
        : await supabase.from("questions").insert(payload);

      if (error) throw error;

      showToast(
        "Sukses",
        `Soal ${isEditing ? "diperbarui" : "ditambahkan"}.`,
        "success"
      );
      onSuccess(); // Refresh parent list
      onHide();
    } catch (err) {
      showToast("Gagal", err.message, "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      backdrop="static"
      fullscreen="sm-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>{editData ? "Edit Soal" : "Tambah Soal"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6} className="border-end">
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Gambar Soal (Opsional)
              </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setQForm({ ...qForm, imageFile: e.target.files[0] })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Pertanyaan</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={qForm.text}
                onChange={(e) => setQForm({ ...qForm, text: e.target.value })}
                placeholder="Tulis soal..."
              />
            </Form.Group>

            <div className="bg-light p-3 rounded">
              {qForm.options.map((opt, idx) => (
                <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                  <Form.Check
                    type="radio"
                    name="correct_opt"
                    checked={opt.is_correct}
                    onChange={() => {
                      const newOpts = qForm.options.map((o, i) => ({
                        ...o,
                        is_correct: i === idx,
                      }));
                      setQForm({ ...qForm, options: newOpts });
                    }}
                  />
                  <Form.Control
                    type="text"
                    placeholder={`Opsi ${String.fromCharCode(65 + idx)}`}
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...qForm.options];
                      newOpts[idx] = { ...newOpts[idx], text: e.target.value };
                      setQForm({ ...qForm, options: newOpts });
                    }}
                  />
                </div>
              ))}
            </div>
          </Col>
          <Col md={6} className="mt-3 mt-md-0">
            <Form.Group className="mb-3">
              <Form.Label>Penjelasan</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={qForm.explanation}
                onChange={(e) =>
                  setQForm({ ...qForm, explanation: e.target.value })
                }
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveQuestion}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? <Spinner size="sm" /> : "Simpan"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
