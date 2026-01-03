import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Package, Users, FileText, TrendingUp } from "lucide-react"; // [BARU] Tambah icon TrendingUp

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  invoiceCount,
}) {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body>
        <h5 className="fw-bold mb-4 text-primary">Admin Panel</h5>
        <div className="d-grid gap-2">
          <Button
            variant={activeTab === "paket" ? "primary" : "light"}
            className="text-start d-flex align-items-center"
            onClick={() => setActiveTab("paket")}
          >
            <Package size={18} className="me-2" /> Manajemen Paket
          </Button>
          <Button
            variant={activeTab === "guru" ? "primary" : "light"}
            className="text-start d-flex align-items-center"
            onClick={() => setActiveTab("guru")}
          >
            <Users size={18} className="me-2" /> User & Guru
          </Button>
          <Button
            variant={activeTab === "invoice" ? "primary" : "light"}
            className="text-start d-flex align-items-center justify-content-between"
            onClick={() => setActiveTab("invoice")}
          >
            <div className="d-flex align-items-center">
              <FileText size={18} className="me-2" /> Konfirmasi Bayar
            </div>
            {invoiceCount > 0 && (
              <Badge bg="danger" pill>
                {invoiceCount}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === "laporan" ? "primary" : "light"}
            className="text-start d-flex align-items-center"
            onClick={() => setActiveTab("laporan")}
          >
            <TrendingUp size={18} className="me-2" /> Laporan Pendapatan
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
