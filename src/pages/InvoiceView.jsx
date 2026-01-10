import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { Download, Upload, ArrowLeft } from "lucide-react";
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
    // Jika upload sukses, redirect ke Home agar user melihat status 'Menunggu'
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
      await fetchHistory(); // Refresh data
      showStatus("Upload Berhasil", "Bukti pembayaran telah dikirim. Status pesananmu kini 'Menunggu Konfirmasi'.", "success");
      setFile(null);
    } catch (error) {
      showStatus("Upload Gagal", error.message, "error");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    setDownloading(true);

    try {
      const clone = element.cloneNode(true);
      
      Object.assign(clone.style, {
        transform: "none",     
        position: "absolute",
        top: "-10000px",       
        left: "-10000px",
        width: "800px",        
        height: "auto",
        margin: "0",
        padding: "48px"         
      });

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,              
        useCORS: true,
        logging: false,
        windowWidth: 1000      
      });

      document.body.removeChild(clone);

      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/jpeg", 0.7); 

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      pdf.save(`Invoice-${invoice?.invoice_no || 'MAPA'}.pdf`);

    } catch (error) {
      console.error(error);
      showStatus("Gagal Download", "Terjadi kesalahan sistem.", "error");
    } finally {
      setDownloading(false);
    }
  };

  
  const renderUploadForm = () => {
    // Tampilkan hanya jika status UNPAID
    if (!invoice || invoice.status !== APP_CONFIG.INVOICE.STATUS.UNPAID) return null;
    
    return (
      <div className="mt-5 p-4 border border-dashed rounded bg-blue-50" style={{ backgroundColor: "#f8f9fa" }}>
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
              
              {/* Tombol Download PDF hanya jika sudah ada invoice data */}
              {invoice && (
                <Button variant="primary" onClick={handleDownloadPDF} disabled={downloading} className="d-flex align-items-center shadow-sm w-100 w-md-auto justify-content-center">
                  <Download size={16} className="me-2" />
                  {downloading ? "Memproses..." : "Download PDF"}
                </Button>
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