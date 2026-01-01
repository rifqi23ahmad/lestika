import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Modal, // [UBAH] Import Modal
} from "react-bootstrap";
import { FileText, CreditCard, CheckCircle, XCircle } from "lucide-react"; // [UBAH] Tambah Icon
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { invoiceService } from "../services/invoiceService";
import { APP_CONFIG } from "../config/constants";

export default function RegisterView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedPackage = location.state?.pkg;
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    msg: "",
    type: "success",
    nextData: null,
  });

  useEffect(() => {
    if (!selectedPackage) navigate("/");
  }, [selectedPackage, navigate]);

  if (!selectedPackage || !user) return null;

  const { adminFee, total } = invoiceService.calculateTotal(
    selectedPackage.price
  );

  const handleProcess = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newInvoice = await invoiceService.create(user, selectedPackage);

      if (file) {
        await invoiceService.processPaymentConfirmation(
          newInvoice.id,
          user.id,
          file
        );
        newInvoice.status = APP_CONFIG.INVOICE.STATUS.WAITING;
      }

      setModalContent({
        title: "Transaksi Berhasil!",
        msg: "Invoice berhasil dibuat. Silakan cek detail pembayaran Anda.",
        type: "success",
        nextData: newInvoice,
      });
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setModalContent({
        title: "Gagal Memproses",
        msg: error.message,
        type: "error",
        nextData: null,
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalContent.type === "success" && modalContent.nextData) {
      navigate("/invoice", { state: { invoice: modalContent.nextData } });
    }
  };

  return (
    <Container className="py-5">
      <Card
        className="shadow-lg border-0 overflow-hidden mx-auto"
        style={{ maxWidth: "900px" }}
      >
        {/* ... (Isi Card header dan body SAMA seperti sebelumnya, tidak berubah) ... */}
        {/* Supaya kode tidak terlalu panjang, saya persingkat bagian tampilan statis. 
            Pastikan bagian <Card.Body>...</Card.Body> tetap ada seperti aslinya. 
            Hanya bagian bawah ini yang ditambahkan: */}

        <Card.Body className="p-4">
          <Row>
            <Col md={7} className="border-end pe-md-5">
              {/* ... (Konten Kiri Tetap) ... */}
              <h5 className="fw-bold mb-4 text-secondary">Rincian Tagihan</h5>
              {/* ... Copy paste isi original ... */}
              <div className="d-flex justify-content-between mb-2">
                <span>Paket Belajar</span>
                <span className="fw-bold">{selectedPackage.title}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Harga Paket</span>
                <span>
                  Rp {Number(selectedPackage.price).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Biaya Admin</span>
                <span>Rp {adminFee.toLocaleString("id-ID")}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total Pembayaran</span>
                <span className="h4 fw-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <Alert variant="info" className="small">
                <strong>Data Siswa:</strong> <br />
                {user.name} ({user.kelas || "-"} - {user.jenjang || "-"}) <br />
                WA: {user.whatsapp || "-"}
              </Alert>
            </Col>

            <Col md={5} className="ps-md-4 mt-4 mt-md-0">
              {/* ... (Konten Kanan Form Tetap) ... */}
              <h5 className="fw-bold mb-3 text-secondary">Transfer Bank</h5>
              <Card className="bg-light border-0 mb-3">
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <CreditCard className="me-2 text-primary" />{" "}
                    <strong>BCA</strong>
                  </div>
                  <div className="h4 fw-bold mb-0 text-dark">123 456 7890</div>
                  <small>a.n. PT BIMBEL MAPA</small>
                </Card.Body>
              </Card>
              <Form onSubmit={handleProcess}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Upload Bukti Transfer
                  </Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <Form.Text className="text-muted">
                    Opsional. Jika kosong, status invoice:{" "}
                    <strong>Unpaid</strong>.
                  </Form.Text>
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    disabled={loading}
                  >
                    {loading
                      ? "Memproses..."
                      : file
                      ? "Kirim Bukti & Bayar"
                      : "Bayar Nanti"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/")}
                  >
                    Batal
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* [BARU] Modal Cantik */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center p-5">
          <div
            className={`mx-auto mb-4 p-3 rounded-full w-fit ${
              modalContent.type === "success"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {modalContent.type === "success" ? (
              <CheckCircle size={48} />
            ) : (
              <XCircle size={48} />
            )}
          </div>
          <h3 className="fw-bold mb-3">{modalContent.title}</h3>
          <p className="text-muted mb-4">{modalContent.msg}</p>
          <Button
            variant={modalContent.type === "success" ? "success" : "secondary"}
            size="lg"
            className="w-100 rounded-pill"
            onClick={handleCloseModal}
          >
            {modalContent.type === "success" ? "Lihat Invoice" : "Tutup"}
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
