import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Badge,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Package,
  FileText,
  CheckCircle,
  Eye,
  XCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { packageService } from "../../services/packageService";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("paket"); // 'paket' | 'guru' | 'invoice'

  const [packages, setPackages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPkg, setCurrentPkg] = useState({
    title: "",
    price: "",
    features: "",
  });

  const [users, setUsers] = useState([]);

  const [invoices, setInvoices] = useState([]);

  const [infoModal, setInfoModal] = useState({
    show: false,
    title: "",
    msg: "",
    type: "success",
  }); // type: success|error|info
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    msg: "",
    action: null,
    dataId: null,
    variant: "primary",
  });

  useEffect(() => {
    if (activeTab === "paket") loadPackages();
    if (activeTab === "guru") loadUsers();
    if (activeTab === "invoice") loadInvoices();
  }, [activeTab]);

  const showInfo = (title, msg, type = "success") => {
    setInfoModal({ show: true, title, msg, type });
  };

  const showConfirm = (title, msg, action, dataId, variant = "primary") => {
    setConfirmModal({ show: true, title, msg, action, dataId, variant });
  };

  const closeConfirm = () => setConfirmModal({ ...confirmModal, show: false });

  const executeAction = async () => {
    closeConfirm(); // Tutup modal konfirmasi dulu
    const { action, dataId } = confirmModal;

    try {
      switch (action) {
        case "DELETE_PKG":
          await packageService.delete(dataId);
          loadPackages();
          showInfo("Terhapus", "Paket berhasil dihapus.", "success");
          break;

        case "PROMOTE_TEACHER":
          const { error: errPromo } = await supabase
            .from("profiles")
            .update({ role: "guru" })
            .eq("id", dataId);
          if (errPromo) throw errPromo;
          loadUsers();
          showInfo("Berhasil", "User berhasil diubah menjadi Guru.", "success");
          break;

        case "DEMOTE_STUDENT":
          const { error: errDemo } = await supabase
            .from("profiles")
            .update({ role: "siswa" })
            .eq("id", dataId);
          if (errDemo) throw errDemo;
          loadUsers();
          showInfo("Berhasil", "User dikembalikan menjadi Siswa.", "success");
          break;

        case "CONFIRM_PAYMENT":
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 30); // Tambah 30 hari masa aktif

          const { data: dataPaid, error: errPaid } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              expiry_date: endDate.toISOString(), // Simpan tanggal kadaluarsa ke DB
            })
            .eq("id", dataId)
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
          break;

        case "REJECT_PAYMENT":
          const { data: dataReject, error: errReject } = await supabase
            .from("invoices")
            .update({ status: "unpaid", payment_proof_url: null })
            .eq("id", dataId)
            .select();

          if (errReject) throw errReject;

          loadInvoices();
          showInfo(
            "Pembayaran Ditolak",
            "Bukti dihapus & status kembali ke Unpaid.",
            "info"
          );
          break;

        default:
          break;
      }
    } catch (error) {
      showInfo("Gagal", error.message || "Terjadi kesalahan sistem.", "error");
    }
  };

  const loadPackages = async () => {
    try {
      const data = await packageService.getAll();
      setPackages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();
    const formattedFeatures =
      typeof currentPkg.features === "string"
        ? currentPkg.features.split(",").map((f) => f.trim())
        : currentPkg.features;

    const payload = {
      ...currentPkg,
      features: formattedFeatures,
      price: Number(currentPkg.price),
      price_display:
        currentPkg.price_display ||
        `Rp ${Number(currentPkg.price).toLocaleString("id-ID")}`,
    };

    try {
      if (currentPkg.id) await packageService.update(currentPkg.id, payload);
      else await packageService.create(payload);

      setIsEditing(false);
      loadPackages();
      showInfo("Disimpan", "Data paket berhasil disimpan.", "success");
    } catch (err) {
      showInfo("Gagal", "Gagal menyimpan paket.", "error");
    }
  };

  const handleDeletePkg = (id) => {
    showConfirm(
      "Hapus Paket?",
      "Yakin ingin menghapus paket ini permanen?",
      "DELETE_PKG",
      id,
      "danger"
    );
  };

  const openEditPkg = (pkg) => {
    setCurrentPkg({
      ...pkg,
      features: Array.isArray(pkg.features)
        ? pkg.features.join(", ")
        : pkg.features,
      price: pkg.price,
    });
    setIsEditing(true);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const handlePromoteToTeacher = (userId) => {
    showConfirm(
      "Konfirmasi",
      "Ubah hak akses user ini menjadi GURU?",
      "PROMOTE_TEACHER",
      userId,
      "info"
    );
  };

  const handleDemoteToStudent = (userId) => {
    showConfirm(
      "Konfirmasi",
      "Cabut akses guru dan kembalikan jadi SISWA?",
      "DEMOTE_STUDENT",
      userId,
      "warning"
    );
  };

  const loadInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    setInvoices(data || []);
  };

  const handleConfirmPayment = (id) => {
    showConfirm(
      "Terima Pembayaran",
      "Pastikan bukti valid. Paket akan otomatis aktif selama 30 hari.",
      "CONFIRM_PAYMENT",
      id,
      "success"
    );
  };

  const handleRejectPayment = (id) => {
    showConfirm(
      "Tolak Pembayaran",
      "Status akan kembali ke Unpaid dan bukti dihapus.",
      "REJECT_PAYMENT",
      id,
      "danger"
    );
  };

  return (
    <Row className="g-4">
      {/* SIDEBAR NAVIGATION */}
      <Col lg={3}>
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
                {invoices.filter((i) => i.status === "waiting_confirmation")
                  .length > 0 && (
                  <Badge bg="danger" pill>
                    {
                      invoices.filter(
                        (i) => i.status === "waiting_confirmation"
                      ).length
                    }
                  </Badge>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* MAIN CONTENT AREA */}
      <Col lg={9}>
        {/* --- TAB 1: PAKET --- */}
        {activeTab === "paket" && (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Daftar Paket Belajar</h5>
              <Button
                size="sm"
                onClick={() => {
                  setCurrentPkg({ title: "", price: "", features: "" });
                  setIsEditing(true);
                }}
              >
                <Plus size={16} className="me-1" /> Tambah Paket
              </Button>
            </Card.Header>

            {isEditing && (
              <Card.Body className="bg-light border-bottom">
                <Form onSubmit={handleSavePkg}>
                  <Row className="g-2 mb-2">
                    <Col md={6}>
                      <Form.Control
                        placeholder="Nama Paket"
                        value={currentPkg.title}
                        onChange={(e) =>
                          setCurrentPkg({
                            ...currentPkg,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Control
                        placeholder="Harga (Angka)"
                        type="number"
                        value={currentPkg.price}
                        onChange={(e) =>
                          setCurrentPkg({
                            ...currentPkg,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </Col>
                  </Row>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Fitur (pisahkan dengan koma)"
                    value={currentPkg.features}
                    onChange={(e) =>
                      setCurrentPkg({ ...currentPkg, features: e.target.value })
                    }
                    className="mb-3"
                  />
                  <div className="d-flex gap-2">
                    <Button type="submit" size="sm" variant="success">
                      Simpan
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            )}

            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Paket</th>
                  <th>Harga</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="fw-medium">{pkg.title}</td>
                    <td className="text-primary fw-bold">
                      {pkg.price_display}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="text-warning p-1"
                        onClick={() => openEditPkg(pkg)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="link"
                        className="text-danger p-1"
                        onClick={() => handleDeletePkg(pkg.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {/* --- TAB 2: USER --- */}
        {activeTab === "guru" && (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0 fw-bold">Manajemen User (Guru & Siswa)</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="small mb-3">
                Cari user dengan role 'siswa' dan klik{" "}
                <strong>Promote Guru</strong> untuk memberi akses Dashboard
                Guru.
              </Alert>
              <Table responsive hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-medium">{u.full_name || "-"}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge
                          bg={
                            u.role === "admin"
                              ? "danger"
                              : u.role === "guru"
                              ? "success"
                              : "secondary"
                          }
                          className="text-uppercase"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {u.role === "siswa" && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handlePromoteToTeacher(u.id)}
                          >
                            Promote Guru
                          </Button>
                        )}
                        {u.role === "guru" && (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => handleDemoteToStudent(u.id)}
                          >
                            Demote Siswa
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* --- TAB 3: INVOICE --- */}
        {activeTab === "invoice" && (
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
                        <div className="small text-muted">
                          {inv.student_whatsapp}
                        </div>
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
                        {inv.status === "paid" && (
                          <Badge bg="success">LUNAS</Badge>
                        )}
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
        )}
      </Col>

      {/* ======================= */}
      {/* GLOBAL MODALS COMPONENT */}
      {/* ======================= */}

      {/* 1. CONFIRMATION MODAL */}
      <Modal show={confirmModal.show} onHide={closeConfirm} centered>
        <Modal.Body className="p-4 text-center">
          <div
            className={`mx-auto mb-3 p-3 rounded-full w-fit bg-${
              confirmModal.variant
            }-100 text-${
              confirmModal.variant === "warning"
                ? "yellow"
                : confirmModal.variant
            }-600`}
          >
            <HelpCircle size={32} />
          </div>
          <h5 className="fw-bold mb-2">{confirmModal.title}</h5>
          <p className="text-muted mb-4">{confirmModal.msg}</p>
          <div className="d-flex justify-content-center gap-2">
            <Button variant="secondary" onClick={closeConfirm}>
              Batal
            </Button>
            <Button variant={confirmModal.variant} onClick={executeAction}>
              Ya, Lanjutkan
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* 2. INFO / ALERT MODAL */}
      <Modal
        show={infoModal.show}
        onHide={() => setInfoModal({ ...infoModal, show: false })}
        centered
      >
        <Modal.Body className="p-4 text-center">
          <div
            className={`mx-auto mb-3 p-3 rounded-full w-fit ${
              infoModal.type === "error"
                ? "bg-red-100 text-red-600"
                : infoModal.type === "success"
                ? "bg-green-100 text-green-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {infoModal.type === "error" ? (
              <AlertTriangle size={32} />
            ) : infoModal.type === "success" ? (
              <CheckCircle size={32} />
            ) : (
              <HelpCircle size={32} />
            )}
          </div>
          <h5 className="fw-bold mb-2">{infoModal.title}</h5>
          <p className="text-muted">{infoModal.msg}</p>
          <Button
            variant="outline-dark"
            onClick={() => setInfoModal({ ...infoModal, show: false })}
            className="mt-3 px-4"
          >
            Tutup
          </Button>
        </Modal.Body>
      </Modal>
    </Row>
  );
}
