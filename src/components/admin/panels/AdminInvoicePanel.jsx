import React, { useState, useEffect } from "react";
import { Card, Table, Button, Badge } from "react-bootstrap";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { supabase } from "../../../lib/supabase"; // Adjust path

export default function AdminInvoicePanel({
  showInfo,
  showConfirm,
  onInvoiceUpdate,
}) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    setInvoices(data || []);
    if (onInvoiceUpdate) onInvoiceUpdate(data || []);
  };

  const handleConfirmPayment = (id) => {
    showConfirm(
      "Terima Pembayaran",
      "Pastikan bukti valid. Paket akan otomatis aktif selama 30 hari.",
      "success",
      async () => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 30);

        const { data: dataPaid, error: errPaid } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            expiry_date: endDate.toISOString(),
          })
          .eq("id", id)
          .select();

        if (errPaid) throw errPaid;
        if (!dataPaid || dataPaid.length === 0)
          throw new Error("Gagal update (Cek RLS Policy Supabase).");

        loadInvoices();
        showInfo(
          "Pembayaran Diterima",
          "Paket siswa telah diaktifkan selama 30 hari.",
          "success"
        );
      }
    );
  };

  const handleRejectPayment = (id) => {
    showConfirm(
      "Tolak Pembayaran",
      "Status akan kembali ke Unpaid dan bukti dihapus.",
      "danger",
      async () => {
        const { error: errReject } = await supabase
          .from("invoices")
          .update({ status: "unpaid", payment_proof_url: null })
          .eq("id", id)
          .select();

        if (errReject) throw errReject;

        loadInvoices();
        showInfo(
          "Pembayaran Ditolak",
          "Bukti dihapus & status kembali ke Unpaid.",
          "info"
        );
      }
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 fw-bold">Konfirmasi Pembayaran</h5>
      </Card.Header>
      <div className="table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead className="bg-light text-secondary small text-uppercase">
            <tr>
              <th>Tanggal</th>
              <th>Siswa</th>
              <th>Paket</th>
              <th>Total</th>
              <th>Bukti</th>
              <th>Status</th>
              <th className="text-end">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  Belum ada data tagihan.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="small text-muted">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div className="fw-bold">{inv.student_name}</div>
                  <div className="small text-muted">{inv.student_whatsapp}</div>
                </td>
                <td>{inv.package_name}</td>
                <td className="fw-bold text-primary">
                  Rp {inv.total_amount?.toLocaleString("id-ID")}
                </td>
                <td>
                  {inv.payment_proof_url ? (
                    <a
                      href={inv.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-info d-inline-flex align-items-center"
                    >
                      <Eye size={12} className="me-1" /> Lihat
                    </a>
                  ) : (
                    <span className="text-muted small">-</span>
                  )}
                </td>
                <td>
                  {inv.status === "paid" && <Badge bg="success">LUNAS</Badge>}
                  {inv.status === "waiting_confirmation" && (
                    <Badge bg="warning" text="dark">
                      MENUNGGU
                    </Badge>
                  )}
                  {inv.status === "unpaid" && (
                    <Badge bg="danger">BELUM BAYAR</Badge>
                  )}
                </td>
                <td className="text-end">
                  {inv.status === "waiting_confirmation" && (
                    <div className="d-flex justify-content-end gap-1">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleConfirmPayment(inv.id)}
                        title="Terima"
                      >
                        <CheckCircle size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleRejectPayment(inv.id)}
                        title="Tolak"
                      >
                        <XCircle size={16} />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}