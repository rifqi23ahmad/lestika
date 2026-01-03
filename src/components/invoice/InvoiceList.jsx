import React from "react";
import { Card, Table, Button, Spinner, Badge, Row, Col } from "react-bootstrap";
import { FileText, Search, ChevronRight, Calendar, Package } from "lucide-react";
import { formatRupiah } from "../../utils/format";
import { APP_CONFIG } from "../../config/constants";

export default function InvoiceList({ history, onSelect, fetching, navigate }) {
  
  const getStatusBadge = (status) => {
    if (status === APP_CONFIG.INVOICE.STATUS.PAID) {
      return <Badge bg="success" className="fw-normal px-2 py-1">LUNAS</Badge>;
    }
    if (status === APP_CONFIG.INVOICE.STATUS.WAITING) {
      return <Badge bg="warning" text="dark" className="fw-normal px-2 py-1">MENUNGGU VERIFIKASI</Badge>;
    }
    return <Badge bg="danger" className="fw-normal px-2 py-1">BELUM DIBAYAR</Badge>;
  };

  return (
    <Card className="shadow-sm border-0 rounded-3">
      <Card.Header className="bg-white py-3 border-bottom">
        <h5 className="mb-0 fw-bold d-flex align-items-center text-dark">
          <FileText className="me-2 text-primary" size={20} />
          Riwayat Tagihan
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        {fetching ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Search size={48} className="mb-3 opacity-25" />
            <p>Belum ada riwayat transaksi.</p>
            <Button variant="primary" onClick={() => navigate("/#pricing")}>
              Lihat Paket Belajar
            </Button>
          </div>
        ) : (
          <>
            {/* --- TAMPILAN DESKTOP (Tabel) --- */}
            <div className="d-none d-md-block table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-4 py-3">No. Invoice</th>
                    <th>Layanan</th>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => onSelect(item)}
                    >
                      <td className="ps-4 fw-bold text-primary">#{item.invoice_no}</td>
                      <td>{item.package_name}</td>
                      <td className="text-muted small">
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="fw-bold text-dark">{formatRupiah(item.total_amount)}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="text-end pe-4">
                        <Button size="sm" variant="outline-secondary" className="rounded-pill px-3">
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* --- TAMPILAN MOBILE (Card List) --- */}
            {/* Hanya muncul di layar kecil (d-md-none) */}
            <div className="d-block d-md-none bg-light">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-3 mb-2 border-bottom"
                  onClick={() => onSelect(item)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Baris Atas: No Invoice & Status */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-primary">#{item.invoice_no}</span>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Baris Tengah: Paket Belajar */}
                  <div className="d-flex align-items-center text-dark mb-1">
                    <Package size={16} className="me-2 text-muted" />
                    <span className="fw-medium">{item.package_name}</span>
                  </div>

                  {/* Baris Tengah: Tanggal */}
                  <div className="d-flex align-items-center text-muted small mb-3">
                    <Calendar size={16} className="me-2 opacity-50" />
                    <span>
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Baris Bawah: Harga & Tombol Panah */}
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <div>
                      <span className="text-muted small d-block">Total Tagihan</span>
                      <span className="fw-bold text-dark fs-5">
                        {formatRupiah(item.total_amount)}
                      </span>
                    </div>
                    <Button variant="light" size="sm" className="rounded-circle p-2 border">
                      <ChevronRight size={18} className="text-secondary" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}