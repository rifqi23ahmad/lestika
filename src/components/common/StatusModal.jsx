import React from "react";
import { Modal, Button } from "react-bootstrap";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export default function StatusModal({ 
  show, 
  onHide, 
  type = "success", 
  title, 
  message, 
  actionLabel = "Tutup", 
  onAction 
}) {
  const getConfig = () => {
    switch (type) {
      case "success":
        return { color: "green", Icon: CheckCircle, bg: "bg-green-100", text: "text-green-600", btn: "success" };
      case "error":
        return { color: "red", Icon: XCircle, bg: "bg-red-100", text: "text-red-600", btn: "danger" };
      case "warning":
        return { color: "yellow", Icon: AlertTriangle, bg: "bg-yellow-100", text: "text-yellow-600", btn: "warning" };
      default: // info
        return { color: "blue", Icon: Info, bg: "bg-blue-100", text: "text-blue-600", btn: "primary" };
    }
  };

  const { Icon, bg, text, btn } = getConfig();

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Body className="text-center p-5">
        <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${bg} ${text}`}>
          <Icon size={48} />
        </div>
        <h3 className="fw-bold mb-3">{title}</h3>
        <p className="text-muted mb-4">{message}</p>
        <Button
          variant={btn}
          size="lg"
          className="w-100 rounded-pill"
          onClick={onAction || onHide}
        >
          {actionLabel}
        </Button>
      </Modal.Body>
    </Modal>
  );
}