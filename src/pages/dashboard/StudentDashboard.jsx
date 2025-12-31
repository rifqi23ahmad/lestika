import React from 'react';
import { Row, Col, Card, ProgressBar, Badge, ListGroup } from 'react-bootstrap';
import { Award, BookOpen, Clock, Calendar } from 'lucide-react';

const mockSchedules = [
  { id: 1, day: "Senin", time: "14:00 - 16:00", subject: "Matematika", teacher: "Pak Budi", room: "Ruang A" },
  { id: 2, day: "Rabu", time: "14:00 - 16:00", subject: "Bahasa Inggris", teacher: "Ms. Sarah", room: "Ruang B" },
  { id: 3, day: "Jumat", time: "15:30 - 17:30", subject: "Fisika", teacher: "Bu Ratna", room: "Lab 1" },
];

export default function StudentDashboard() {
  return (
    <Row className="g-4">
      {/* Kartu Status Utama */}
      <Col xs={12}>
        <Card className="bg-primary text-white shadow border-0 overflow-hidden">
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="warning" text="dark" className="mb-2">Paket Aktif</Badge>
              <h2 className="fw-bold">Reguler SMA - Kelas 12</h2>
              <p className="mb-0 opacity-75"><Calendar size={16} className="me-1"/> Berlaku hingga 31 Des 2024</p>
            </div>
            <Award size={64} className="opacity-50 text-white" />
          </Card.Body>
          <div className="bg-dark bg-opacity-25 p-3">
             <div className="d-flex justify-content-between text-sm mb-1">
               <span>Kehadiran Bulan Ini</span>
               <span className="fw-bold">85%</span>
             </div>
             <ProgressBar variant="warning" now={85} style={{ height: '8px' }} />
          </div>
        </Card>
      </Col>

      {/* Jadwal */}
      <Col md={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white fw-bold py-3">Jadwal Pelajaran</Card.Header>
          <ListGroup variant="flush">
            {mockSchedules.map(sch => (
              <ListGroup.Item key={sch.id} className="d-flex align-items-center py-3">
                <div className="bg-light p-2 rounded text-center me-3" style={{minWidth: '70px'}}>
                  <div className="small fw-bold text-muted text-uppercase">{sch.day}</div>
                  <div className="fw-bold text-primary">{sch.time.split(' - ')[0]}</div>
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{sch.subject}</h6>
                  <small className="text-muted">Pengajar: {sch.teacher} • {sch.room}</small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      </Col>

      {/* Materi */}
      <Col md={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white fw-bold py-3">Materi Terbaru</Card.Header>
          <ListGroup variant="flush">
            {[1, 2, 3].map(i => (
              <ListGroup.Item key={i} action className="d-flex align-items-center py-3 border-0">
                <div className="p-2 rounded bg-danger bg-opacity-10 text-danger me-3">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="fw-medium">Latihan Soal Trigonometri.pdf</div>
                  <small className="text-muted">Diunggah 2 jam lalu</small>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
}