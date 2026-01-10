import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { Download, Upload, ArrowLeft, Mail } from "lucide-react"; // Tambah Icon Mail
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { APP_CONFIG } from "../config/constants";
import { invoiceService } from "../services/invoiceService";
import { useAuth } from "../context/AuthContext";
import InvoicePaper from "../components/invoice/InvoicePaper";
import InvoicePreviewWrapper from "../components/invoice/InvoicePreviewWrapper";
import InvoiceList from "../components/invoice/InvoiceList";
import StatusModal from "../components/common/StatusModal";

export default function InvoiceView() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const printRef = useRef();

  const [viewMode, setViewMode] = useState(location.state?.invoice ? "detail" : "list");
  const [invoice, setInvoice] = useState(location.state?.invoice || null);
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(false);
  
  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false); // State baru untuk loading email

  const [statusModal, setStatusModal] = useState({ show: false, title: "", message: "", type: "success" });

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setFetching(true);
    try {
      const data = await invoiceService.getHistory(user.id);
      setHistory(data || []);
      if (invoice) {
        const updated = data.find((i) => i.id === invoice.id);
        if (updated) setInvoice(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const showStatus = (title, message, type = "success") => {
    setStatusModal({ show: true, title, message, type });
  };

  const handleStatusModalClose = () => {
    setStatusModal({ ...statusModal, show: false });
    if (statusModal.title === "Upload Berhasil") {
       navigate("/"); 
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoadingUpload(true);
    try {
      const updatedInvoice = await invoiceService.processPaymentConfirmation(invoice.id, user.id, file);
      setInvoice(updatedInvoice);
      await fetchHistory(); 
      showStatus("Upload Berhasil", "Bukti pembayaran telah dikirim.", "success");
      setFile(null);
    } catch (error) {
      showStatus("Upload Gagal", error.message, "error");
    } finally {
      setLoadingUpload(false);
    }
  };

  // --- LOGIC GENERATE PDF & BASE64 ---
  const generatePdfBase64 = async () => {
    const element = printRef.current;
    if (!element) return null;

    // Clone element untuk dimanipulasi (hide button upload saat generate PDF)
    const clone = element.cloneNode(true);
    
    // Styling clone agar hasil capture rapi
    Object.assign(clone.style, {
      transform: "none",     
      position: "absolute",
      top: "-10000px",       
      left: "-10000px",
      width: "800px",        
      height: "auto",
      margin: "0",
      padding: "48px",
      backgroundColor: "#ffffff" // Pastikan background putih
    });

    // Hilangkan elemen yang tidak perlu di PDF (misal form upload)
    const uploadForm = clone.querySelector('.upload-section'); 
    if(uploadForm) uploadForm.style.display = 'none';

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,              
        useCORS: true, // Penting untuk gambar/logo
        logging: false,
        windowWidth: 1000      
      });

      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/jpeg", 0.8); // Compress sedikit biar ringan

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      
      // DISINI KUNCINYA: Return sebagai Base64 String (Data URI)
      const base64String = pdf.output('datauristring');
      return base64String;

    } catch (error) {
      console.error("Generate PDF Error:", error);
      throw error;
    } finally {
      document.body.removeChild(clone);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const element = printRef.current;
      if (!element) return;
      
      // Reuse logic manual untuk download karena outputnya save()
      const clone = element.cloneNode(true);
      Object.assign(clone.style, { transform: "none", position: "absolute", top: "-10000px", left: "-10000px", width: "800px", height: "auto", margin: "0", padding: "48px" });
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, windowWidth: 1000 });
      document.body.removeChild(clone);
      
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/jpeg", 0.7); 
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      pdf.save(`Invoice-${invoice?.invoice_no || 'MAPA'}.pdf`);

    } catch (error) {
      showStatus("Gagal Download", "Terjadi kesalahan sistem.", "error");
    } finally {
      setDownloading(false);
    }
  };

  // --- FUNGSI KIRIM EMAIL DENGAN BASE64 ---
  const handleSendEmail = async () => {
    if(!invoice) return;
    setSendingEmail(true);

    try {
        // 1. Generate PDF dalam bentuk Base64
        const pdfBase64 = await generatePdfBase64();
        
        if (!pdfBase64) throw new Error("Gagal membuat PDF");

        // 2. Kirim ke Backend (Service)
        // Kita kirim invoice ID dan String Base64 PDF-nya
        await invoiceService.sendInvoiceEmail({
            invoiceId: invoice.id,
            email: user.email,
            pdfBase64: pdfBase64 
        });

        showStatus("Email Terkirim", "Invoice berhasil dikirim ke email Anda.", "success");

    } catch (error) {
        console.error(error);
        showStatus("Gagal Kirim Email", "Gagal mengirim email: " + error.message, "error");
    } finally {
        setSendingEmail(false);
    }
  };

  const renderUploadForm = () => {
    if (!invoice || invoice.status !== APP_CONFIG.INVOICE.STATUS.UNPAID) return null;
    // Tambahkan class 'upload-section' agar bisa di-hide saat generate PDF
    return (
      <div className="mt-5 p-4 border border-dashed rounded bg-blue-50 upload-section" style={{ backgroundColor: "#f8f9fa" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
          <Upload size={18} className="me-2" /> Upload Bukti Pembayaran
        </h6>
        <Form onSubmit={handleUpload}>
          <Row className="g-2 align-items-center">
            <Col xs={12} md>
              <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} required className="shadow-none" />
              <Form.Text className="text-muted">Format: JPG, PNG, PDF (Max 2MB)</Form.Text>
            </Col>
            <Col xs={12} md="auto">
              <Button type="submit" variant="primary" disabled={loadingUpload} className="w-100 fw-bold">
                {loadingUpload ? <Spinner size="sm" animation="border" /> : "Kirim Bukti"}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  };

  return (
    <Container className="py-4 py-md-5 bg-light" fluid style={{ minHeight: "100vh" }}>
      <Container style={{ maxWidth: "1000px" }}>
        
        {viewMode === "list" ? (
          <InvoiceList 
            history={history} 
            fetching={fetching} 
            navigate={navigate}
            onSelect={(item) => { setInvoice(item); setViewMode("detail"); }} 
          />
        ) : (
          <>
            <div className="mb-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <Button variant="link" className="text-decoration-none p-0 d-flex align-items-center text-muted fw-medium" onClick={() => { setViewMode("list"); fetchHistory(); }}>
                <ArrowLeft size={18} className="me-2" /> Kembali ke Riwayat
              </Button>
              
              {invoice && (
                <div className="d-flex gap-2 w-100 w-md-auto">
                    {/* TOMBOL KIRIM EMAIL */}
                    <Button 
                        variant="outline-primary" 
                        onClick={handleSendEmail} 
                        disabled={sendingEmail} 
                        className="d-flex align-items-center shadow-sm justify-content-center flex-grow-1 flex-md-grow-0"
                    >
                        <Mail size={16} className="me-2" />
                        {sendingEmail ? "Mengirim..." : "Kirim Email"}
                    </Button>

                    <Button 
                        variant="primary" 
                        onClick={handleDownloadPDF} 
                        disabled={downloading} 
                        className="d-flex align-items-center shadow-sm justify-content-center flex-grow-1 flex-md-grow-0"
                    >
                        <Download size={16} className="me-2" />
                        {downloading ? "Proses..." : "Download PDF"}
                    </Button>
                </div>
              )}
            </div>

            <InvoicePreviewWrapper>
              {invoice && (
                 <InvoicePaper ref={printRef} invoice={invoice}>
                   {renderUploadForm()}
                 </InvoicePaper>
              )}
            </InvoicePreviewWrapper>
          </>
        )}
      </Container>

      <StatusModal
        show={statusModal.show}
        onHide={handleStatusModalClose}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </Container>
  );
}