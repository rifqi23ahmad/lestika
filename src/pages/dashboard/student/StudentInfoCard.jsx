import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { Clock, MessageSquare, Award } from "lucide-react";

export default function StudentInfoCard({ activeInvoice, onReviewClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <Card className="bg-success text-white shadow border-0 overflow-hidden mb-4">
      <Card.Body className="p-4 d-flex justify-content-between align-items-center">
        <div>
          <Badge bg="light" text="success" className="mb-2">Paket Aktif</Badge>
          <h2 className="fw-bold">{activeInvoice.package_name}</h2>
          <div className="d-flex align-items-center gap-2 mt-2">
            <Clock size={16} />
            <span className="small">
              Berlaku hingga: <strong>{activeInvoice.expiry_date ? formatDate(activeInvoice.expiry_date) : "Selamanya"}</strong>
            </span>
          </div>
          <Button 
            variant="outline-light" 
            size="sm" 
            className="mt-3 rounded-pill px-3" 
            onClick={onReviewClick}
          >
            <MessageSquare size={16} className="me-2" /> Beri Ulasan
          </Button>
        </div>
        <Award size={64} className="opacity-50 text-white" />
      </Card.Body>
    </Card>
  );
}