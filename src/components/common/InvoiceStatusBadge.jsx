import React from "react";
import { Badge } from "react-bootstrap";
import { APP_CONFIG } from "../../config/constants"; // Pastikan path import benar

const InvoiceStatusBadge = ({ status }) => {
  if (status === APP_CONFIG.INVOICE.STATUS.PAID) {
    return <Badge bg="success" className="fw-normal px-2 py-1">LUNAS</Badge>;
  }
  if (status === APP_CONFIG.INVOICE.STATUS.WAITING) {
    return <Badge bg="warning" text="dark" className="fw-normal px-2 py-1">MENUNGGU VERIFIKASI</Badge>;
  }
  return <Badge bg="danger" className="fw-normal px-2 py-1">BELUM DIBAYAR</Badge>;
};

export default InvoiceStatusBadge;