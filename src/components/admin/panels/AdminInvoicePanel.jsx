import React, { useState, useEffect, useRef } from "react";
import { Card, Table, Button, Badge, Spinner } from "react-bootstrap";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../../../lib/supabase";
import { invoiceService } from "../../../services/invoiceService";
import InvoicePaper from "../../invoice/InvoicePaper";

export default function AdminInvoicePanel({
  showInfo,
  showConfirm,
  onInvoiceUpdate,
}) {
  const [invoices, setInvoices] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [tempInvoice, setTempInvoice] = useState(null);
  const pdfPrintRef = useRef();

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

  const generatePdfBase64 = async (invoiceData) => {
    return new Promise(async (resolve, reject) => {
      try {
        setTempInvoice(invoiceData);

        setTimeout(async () => {
          const element = pdfPrintRef.current;
          if (!element)
            return reject("Element PDF tidak ditemukan/gagal render");

          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 1000, 
          });

          const imgWidth = 210; 
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const pdf = new jsPDF("p", "mm", "a4");
          const imgData = canvas.toDataURL("image/jpeg", 0.7);

          pdf.addImage(
            imgData,
            "JPEG",
            0,
            0,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );

          const pdfOutput = pdf.output("datauristring");
          const base64String = pdfOutput.split(",")[1];

          setTempInvoice(null);
          resolve(base64String);
        }, 500); 
      } catch (err) {
        setTempInvoice(null);
        reject(err);
      }
    });
  };

  const handleConfirmPayment = (invoice) => {
    showConfirm(
      "Terima Pembayaran",
      "Sistem akan mengaktifkan paket, membuat PDF invoice, dan mengirim email.",
      "success",
      async () => {
        try {
          setLoadingId(invoice.id);

          const invoiceForPdf = {
            ...invoice,
            status: "paid",
            payment_date: new Date().toISOString(),
          };

          const pdfBase64 = await generatePdfBase64(invoiceForPdf);

          await invoiceService.confirmPayment(invoice.id, pdfBase64);

          await loadInvoices();

          showInfo(
            "Sukses",
            "Pembayaran dikonfirmasi & Invoice (LUNAS) terkirim.",
            "success"
          );
        } catch (error) {
          console.error(error);
          showInfo("Gagal", error.message || "Terjadi kesalahan.", "danger");
        } finally {
          setLoadingId(null);
          setTempInvoice(null);
        }
      }
    );
  };

  const handleRejectPayment = (id) => {
    showConfirm(
      "Tolak Pembayaran",
      "Status akan kembali ke Unpaid dan bukti dihapus.",
      "danger",
      async () => {
        try {
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
        } catch (error) {
          showInfo("Error", "Gagal menolak pembayaran.", "danger");
        }
      }
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
        {tempInvoice && (
          <InvoicePaper ref={pdfPrintRef} invoice={tempInvoice} />
        )}
      </div>

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
                        onClick={() => handleConfirmPayment(inv)}
                        title="Terima"
                        disabled={loadingId === inv.id}
                      >
                        {loadingId === inv.id ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleRejectPayment(inv.id)}
                        title="Tolak"
                        disabled={loadingId === inv.id}
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
