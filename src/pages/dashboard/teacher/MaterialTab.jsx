import React, { useState } from "react";
import { Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
import { Upload } from "lucide-react";
import { supabase } from "../../../lib/supabase"; 

export default function MaterialTab({ user, showModal }) {
  const [materialForm, setMaterialForm] = useState({ title: "", file: null, jenjang: "Umum" });
  const [uploading, setUploading] = useState(false);

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.file || !materialForm.title)
      return showModal("Validasi", "Judul dan File wajib diisi!", "error");
      
    setUploading(true);
    try {
      const fileExt = materialForm.file.name.split(".").pop();
      const sanitizedTitle = materialForm.title.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${Date.now()}_${sanitizedTitle}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("materials").upload(fileName, materialForm.file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("materials").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("materials").insert({
        title: materialForm.title,
        file_url: publicUrlData.publicUrl,
        teacher_id: user.id,
        jenjang: materialForm.jenjang,
      });
      if (dbError) throw dbError;

      showModal("Berhasil", "Materi berhasil diupload.", "success");
      setMaterialForm({ title: "", file: null, jenjang: "Umum" });
      document.getElementById("fileInput").value = null;
    } catch (err) {
      showModal("Gagal Upload", err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white fw-bold py-3">Form Upload Materi Belajar</Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleUploadMaterial}>
              <Form.Group className="mb-3">
                <Form.Label>Judul Materi</Form.Label>
                <Form.Control type="text" placeholder="Contoh: Modul Matematika" value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} required />
              </Form.Group>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Jenjang</Form.Label>
                  <Form.Select value={materialForm.jenjang} onChange={(e) => setMaterialForm({ ...materialForm, jenjang: e.target.value })}>
                    <option value="Umum">Umum</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label>File (PDF/DOCX)</Form.Label>
                  <Form.Control id="fileInput" type="file" onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })} required />
                </Col>
              </Row>
              <div className="d-grid mt-4">
                <Button type="submit" variant="primary" disabled={uploading}>
                  {uploading ? <Spinner size="sm" animation="border" /> : <><Upload size={18} className="me-2" /> Upload</>}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}