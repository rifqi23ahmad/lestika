import React, { useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { PenTool, Download, MonitorPlay } from "lucide-react";
import ScreenAnnotation from "../../../components/common/ScreenAnnotation";

export default function WhiteboardTab({ showModal }) {
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);

  const handleSaveWhiteboard = (blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `whiteboard_session_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsWhiteboardActive(false);
    showModal(
      "Tersimpan",
      "Gambar whiteboard berhasil diunduh ke perangkat Anda.",
      "success"
    );
  };

  return (
    <Container className="py-4">
      <Card className="text-center shadow-sm border-0 py-5">
        <Card.Body>
          <div className="mb-4 text-primary opacity-75">
            <MonitorPlay size={64} />
          </div>
          <h2 className="fw-bold mb-3">Whiteboard Mengajar Digital</h2>
          <p
            className="text-muted mb-4"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            Gunakan fitur ini untuk menjelaskan materi secara visual saat kelas
            berlangsung, atau untuk membuat coretan penjelasan cepat.
            <br />
            Anda dapat mengunduh hasil coretan setelah selesai.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="rounded-pill px-5 py-3 fw-bold shadow hover-scale"
            onClick={() => setIsWhiteboardActive(true)}
          >
            <PenTool size={20} className="me-2" /> Mulai Whiteboard
          </Button>

          <div className="mt-4 text-muted small">
            <small>Tips: Gunakan Stylus Pen / Wacom untuk hasil terbaik.</small>
          </div>
        </Card.Body>
      </Card>

      <ScreenAnnotation
        isActive={isWhiteboardActive}
        onClose={() => setIsWhiteboardActive(false)}
        onSave={handleSaveWhiteboard}
      />
    </Container>
  );
}
