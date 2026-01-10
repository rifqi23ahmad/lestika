import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Badge,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  BookOpen,
  Clock,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";

export default function PackageListView({ user, onSelectPackage, showToast }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [currentPkg, setCurrentPkg] = useState(null);

  const initialForm = {
    title: "",
    subject: "",
    level: "",
    description: "",
    duration_minutes: 60,
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (user?.id) fetchPackages();
  }, [user]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("question_packages")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (err) {
      console.error(err);
      showToast("Error", "Gagal memuat paket.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        teacher_id: user.id,
        title: formData.title,
        subject: formData.subject,
        level: formData.level,
        description: formData.description,
        duration_minutes: parseInt(formData.duration_minutes),
      };

      if (currentPkg?.id) {
        await supabase
          .from("question_packages")
          .update(payload)
          .eq("id", currentPkg.id);
        showToast("Sukses", "Paket diperbarui.", "success");
      } else {
        await supabase.from("question_packages").insert([payload]);
        showToast("Sukses", "Paket dibuat.", "success");
      }

      setShowModal(false);
      fetchPackages();
    } catch (err) {
      showToast("Gagal", "Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus paket ini? Semua soal di dalamnya akan hilang."))
      return;
    try {
      await supabase.from("question_packages").delete().eq("id", id);
      fetchPackages();
      showToast("Terhapus", "Paket dihapus.", "success");
    } catch (err) {
      showToast("Gagal", "Gagal menghapus.", "error");
    }
  };

  const openModal = (pkg = null) => {
    setCurrentPkg(pkg);
    setFormData(pkg ? { ...pkg } : initialForm);
    setShowModal(true);
  };

  const filteredPackages = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-100">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Bank Soal & Kuis</h4>
          <p className="text-muted small mb-0">
            Kelola paket soal latihan dan ujian.
          </p>
        </div>
        <div className="d-flex gap-2">
          <div className="position-relative">
            <Search
              size={18}
              className="text-muted position-absolute top-50 start-0 translate-middle-y ms-3"
            />
            <Form.Control
              placeholder="Cari paket..."
              className="ps-5 rounded-pill border-light bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: "200px" }}
            />
          </div>
          <Button
            variant="primary"
            className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={() => openModal(null)}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="d-none d-md-inline">Paket Baru</span>
          </Button>
        </div>
      </div>

      {loading && !showModal ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">
            Belum ada paket soal. Klik "Paket Baru" untuk membuat.
          </p>
        </div>
      ) : (
        <Row className="g-4">
          {filteredPackages.map((pkg) => (
            <Col md={6} lg={4} key={pkg.id}>
              <Card className="h-100 border-0 shadow-sm rounded-4 hover-top transition-all">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between mb-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-3">
                      <FileText size={24} className="text-primary" />
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 text-muted"
                        onClick={() => openModal(pkg)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 text-danger"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <h5 className="fw-bold text-dark mb-1 text-truncate">
                    {pkg.title}
                  </h5>
                  <p className="text-muted small mb-3 line-clamp-2 flex-grow-1">
                    {pkg.description || "Tanpa deskripsi."}
                  </p>
                  <div className="d-flex gap-3 text-muted small mb-3">
                    <span>
                      <BookOpen size={14} className="me-1" />
                      {pkg.subject}
                    </span>
                    <span>
                      <Clock size={14} className="me-1" />
                      {pkg.duration_minutes} mnt
                    </span>
                  </div>

                  <Button
                    variant="outline-primary"
                    className="w-100 rounded-pill fw-bold mt-auto"
                    onClick={() => onSelectPackage(pkg)}
                  >
                    Kelola Soal
                  </Button>
                </Card.Body>
                <Card.Footer className="bg-white border-0 px-4 pb-4 pt-0">
                  <Badge bg="light" className="text-muted fw-normal border">
                    Kelas {pkg.level}
                  </Badge>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            {currentPkg ? "Edit Paket" : "Paket Baru"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Judul Paket</Form.Label>
              <Form.Control
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Latihan Harian Matematika"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Mapel</Form.Label>
                  <Form.Control
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Contoh: Matematika"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Kelas</Form.Label>
                  <Form.Control
                    required
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    placeholder="Contoh: 10, 12 IPA"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Durasi (Menit)</Form.Label>
              <Form.Control
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small fw-bold">Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              variant="light"
              className="rounded-pill"
              onClick={() => setShowModal(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="rounded-pill"
              disabled={loading}
            >
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
