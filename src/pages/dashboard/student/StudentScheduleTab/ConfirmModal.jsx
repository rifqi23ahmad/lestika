import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { HelpCircle } from "lucide-react";

export default function ConfirmModal({
  show,
  slot,
  loading,
  onConfirm,
  onCancel,
  getDayName,
  formatTime,
}) {
  if (!slot) return null;

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Body className="text-center p-4">
        <div className="mx-auto mb-3 p-3 bg-primary bg-opacity-10 rounded-circle d-inline-flex text-primary">
          <HelpCircle size={32} />
        </div>
        <h5 className="fw-bold mb-3">Konfirmasi Jadwal</h5>
        <p className="text-muted mb-4">
          Ambil kelas <strong>{slot.subject}</strong>
          <br />
          {getDayName(slot.start_time)},{" "}
          {formatTime(slot.start_time)}
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Button variant="outline-secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : "Ya, Ambil"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
