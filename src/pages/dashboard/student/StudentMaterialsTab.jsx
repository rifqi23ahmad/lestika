import React from "react";
import { Card, Row, Col, Button, Badge } from "react-bootstrap";
import { BookOpen, Download, FileText, Video } from "lucide-react";

export default function StudentMaterialsTab() {
  // Data dummy (nanti bisa diganti fetch API real)
  const materials = [
    { id: 1, title: "Modul Aljabar Dasar", type: "pdf", size: "2.4 MB", subject: "Matematika" },
    { id: 2, title: "Latihan Soal Trigonometri", type: "doc", size: "1.1 MB", subject: "Matematika" },
    { id: 3, title: "Rekaman Kelas: Fungsi Kuadrat", type: "video", size: "Link", subject: "Matematika" },
  ];

  return (
    <div>
      <div className="mb-4">
        <h5 className="fw-bold mb-1">Materi Pembelajaran</h5>
        <p className="text-muted small">Unduh modul dan pelajari kembali materi kelas.</p>
      </div>

      <Row className="g-3">
        {materials.map((m) => (
          <Col md={6} lg={4} key={m.id}>
            <Card className="h-100 border-0 shadow-sm rounded-4 hover-card bg-white">
              <Card.Body className="p-3 d-flex align-items-center">
                <div className={`p-3 rounded-3 me-3 ${m.type === 'video' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                   {m.type === 'video' ? <Video size={24} /> : <FileText size={24} />}
                </div>
                <div className="flex-grow-1">
                   <Badge bg="light" className="text-secondary mb-1 fw-normal border">{m.subject}</Badge>
                   <h6 className="fw-bold mb-1 text-truncate" style={{maxWidth: '200px'}}>{m.title}</h6>
                   <small className="text-muted">{m.size}</small>
                </div>
                <Button variant="light" size="sm" className="rounded-circle p-2 border">
                   <Download size={16} className="text-dark"/>
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}