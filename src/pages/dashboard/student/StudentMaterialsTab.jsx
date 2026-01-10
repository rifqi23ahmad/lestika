import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import {
  BookOpen,
  Download,
  FileText,
  Video,
  Eye,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function StudentMaterialsTab() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("materials")
        .select(
          `
          *,
          teacher:profiles!teacher_id(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      if (err.message?.includes("foreign keys") || err.code === "PGRST200") {
        fetchMaterialsFallback();
      } else {
        setErrorMsg("Gagal memuat materi. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialsFallback = async () => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch {
      setErrorMsg("Gagal memuat materi.");
    }
  };

  const getFileType = (url) => {
    if (!url) return "unknown";
    const ext = url.split(".").pop().toLowerCase().split("?")[0];
    if (["pdf"].includes(ext)) return "pdf";
    if (["mp4", "webm", "mov", "mkv"].includes(ext)) return "video";
    return "file";
  };

  const getFileIcon = (url) => {
    const type = getFileType(url);
    if (type === "video") return <Video size={24} />;
    return <FileText size={24} />;
  };

  const openView = (material) => {
    if (!material?.file_url) return;
    setActiveMaterial(material);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Memuat daftar materi...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <Alert variant="danger" className="border-0 shadow-sm rounded-3">
        {errorMsg}
      </Alert>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h5 className="fw-bold mb-1">Perpustakaan Materi</h5>
        <p className="text-muted small">
          Unduh atau lihat langsung materi yang diupload guru.
        </p>
      </div>

      {materials.length === 0 ? (
        <Alert variant="info" className="border-0 shadow-sm rounded-3">
          <div className="d-flex align-items-center gap-3">
            <BookOpen size={24} className="text-info opacity-75" />
            <div>
              <strong>Belum ada materi tersedia.</strong>
              <div className="small text-muted">
                Guru belum mengunggah materi baru.
              </div>
            </div>
          </div>
        </Alert>
      ) : (
        <Row className="g-3">
          {materials.map((m) => (
            <Col md={6} lg={4} key={m.id}>
              <Card className="h-100 border-0 shadow-sm rounded-4 bg-white">
                <Card.Body className="p-3 d-flex align-items-center">
                  <div className="p-3 rounded-3 me-3 bg-primary bg-opacity-10 text-primary">
                    {getFileIcon(m.file_url)}
                  </div>

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex gap-1 mb-1">
                      <Badge
                        bg="light"
                        className="text-secondary border fw-normal"
                      >
                        {m.subject}
                      </Badge>
                      {m.kelas && (
                        <Badge
                          bg="info"
                          className="bg-opacity-10 text-info border fw-normal"
                        >
                          Kls {m.kelas}
                        </Badge>
                      )}
                    </div>
                    <h6 className="fw-bold mb-1 text-truncate" title={m.title}>
                      {m.title}
                    </h6>
                    <small className="text-muted text-truncate d-block">
                      {m.teacher?.full_name
                        ? `Oleh: ${m.teacher.full_name}`
                        : "Bimbel Mapa"}
                    </small>
                  </div>

                  {m.file_url && (
                    <div className="d-flex gap-1 ms-2">
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 border"
                        onClick={() => openView(m)}
                        title="Lihat Materi"
                      >
                        <Eye size={18} />
                      </Button>

                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-circle p-2 border"
                        href={m.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download / Buka Tab Baru"
                      >
                        <Download size={18} />
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        fullscreen
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0">{activeMaterial?.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="bg-dark bg-opacity-10 p-2 p-md-4">
          {activeMaterial?.file_url && (
            <>
              {getFileType(activeMaterial.file_url) === "pdf" && (
                <iframe
                  src={activeMaterial.file_url}
                  title="PDF Viewer"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              )}

              {getFileType(activeMaterial.file_url) === "video" && (
                <video
                  src={activeMaterial.file_url}
                  controls
                  style={{ width: "100%", maxHeight: "90vh" }}
                />
              )}

              {getFileType(activeMaterial.file_url) === "file" && (
                <div className="text-center py-5">
                  <FileText size={48} className="mb-3 text-muted" />
                  <p className="mb-3">File tidak dapat dipratinjau langsung.</p>
                  <Button
                    href={activeMaterial.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={16} className="me-2" />
                    Buka di Tab Baru
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
