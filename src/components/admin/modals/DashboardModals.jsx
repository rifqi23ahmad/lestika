import React from "react";
import { Modal, Button } from "react-bootstrap";
import { HelpCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// Perhatikan "export const" di sini (JANGAN "export default")
export const ConfirmModal = ({ show, title, msg, variant, onCancel, onConfirm, loading }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Body className="p-4 text-center">
        <div
          className={`mx-auto mb-3 p-3 rounded-full w-fit bg-${variant}-100 text-${
            variant === "warning" ? "yellow" : variant
          }-600`}
        >
          <HelpCircle size={32} />
        </div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted mb-4">{msg}</p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "Memproses..." : "Ya, Lanjutkan"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Perhatikan "export const" di sini juga
export const InfoModal = ({ show, title, msg, type, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Body className="p-4 text-center">
        <div
          className={`mx-auto mb-3 p-3 rounded-full w-fit ${
            type === "error"
              ? "bg-red-100 text-red-600"
              : type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {type === "error" ? (
            <AlertTriangle size={32} />
          ) : type === "success" ? (
            <CheckCircle size={32} />
          ) : (
            <HelpCircle size={32} />
          )}
        </div>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="text-muted">{msg}</p>
        <Button variant="outline-dark" onClick={onClose} className="mt-3 px-4">
          Tutup
        </Button>
      </Modal.Body>
    </Modal>
  );
};