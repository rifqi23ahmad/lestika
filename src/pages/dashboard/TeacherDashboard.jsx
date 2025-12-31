import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, ProgressBar } from 'react-bootstrap';
import { Calendar, Upload, FileText, UserCheck, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [gradeData, setGradeData] = useState({ subject: '', score: '', feedback: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  // 1. Fetch Daftar Siswa untuk Input Nilai
  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'siswa');
    setStudents(data || []);
  };

  // 2. Fungsi Upload PDF
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Pilih file PDF dulu");

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage.from('materials').upload(fileName, file);
      
      if (error) throw error;

      // Simpan referensi ke tabel materials (opsional, tapi disarankan)
      const publicUrl = supabase.storage.from('materials').getPublicUrl(fileName).data.publicUrl;
      const { error: dbError } = await supabase.from('materials').insert({
        title: file.name,
        file_url: publicUrl,
        jenjang: 'Umum' // Bisa dibuat dinamis
      });

      if(dbError) console.warn("Gagal simpan ke DB, tapi file terupload");
      
      alert("Materi berhasil diupload!");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Gagal upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. Fungsi Simpan Nilai
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if(!selectedStudent) return alert("Pilih siswa");

    try {
      const { error } = await supabase.from('grades').insert({
        student_id: selectedStudent,
        teacher_id: user.id,
        subject: gradeData.subject,
        score: gradeData.score,
        feedback: gradeData.feedback
      });

      if(error) throw error;
      alert("Nilai berhasil disimpan!");
      setGradeData({ subject: '', score: '', feedback: '' });
    } catch (err) {
      alert("Gagal simpan nilai");
    }
  };

  return (
    <Row className="g-4">
      {/* --- KARTU UPLOAD MATERI --- */}
      <Col md={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white fw-bold py-3 d-flex align-items-center">
            <Upload size={20} className="me-2 text-primary" /> Upload Materi Soal (PDF)
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpload}>
              <Form.Group className="mb-3">
                <Form.Label>Pilih File PDF</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={uploading || !file} className="w-100">
                {uploading ? 'Mengupload...' : 'Upload Materi'}
              </Button>
            </Form>
            
            <div className="mt-4 pt-3 border-top">
              <small className="text-muted">Materi yang diupload akan muncul di Dashboard Siswa.</small>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* --- KARTU INPUT NILAI --- */}
      <Col md={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white fw-bold py-3 d-flex align-items-center">
            <UserCheck size={20} className="me-2 text-success" /> Input Nilai & Feedback
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSaveGrade}>
              <Form.Group className="mb-3">
                <Form.Label>Pilih Siswa</Form.Label>
                <Form.Select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col xs={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mata Pelajaran</Form.Label>
                    <Form.Control placeholder="Misal: Matematika Bab 1" value={gradeData.subject} onChange={e => setGradeData({...gradeData, subject: e.target.value})} required />
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nilai</Form.Label>
                    <Form.Control type="number" placeholder="0-100" value={gradeData.score} onChange={e => setGradeData({...gradeData, score: e.target.value})} required />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Feedback / Catatan</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Berikan semangat atau catatan perbaikan..." value={gradeData.feedback} onChange={e => setGradeData({...gradeData, feedback: e.target.value})} />
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 d-flex align-items-center justify-content-center">
                <Save size={18} className="me-2"/> Simpan Nilai
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}