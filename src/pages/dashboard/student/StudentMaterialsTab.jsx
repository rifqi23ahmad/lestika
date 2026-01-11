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
  Video, // Icon untuk Video
  Eye,
  ExternalLink,
  Lock,
  Youtube // Icon khusus Youtube
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function StudentMaterialsTab({ isExpired }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState(null);

  // --- BLOKIR JIKA EXPIRED ---
  if (isExpired) {
    return (
      <div className="text-center py-5">
        <div className="bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
          <Lock size={48} className="text-danger" />
        </div>
        <h5 className="fw-bold text-dark">Materi Terkunci</h5>
        <p className="text-muted">
          Perpanjang paket untuk mengakses perpustakaan materi dan modul.
        </p>
      </div>
    );
  }

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("materials")
        .select(`*, teacher:profiles!teacher_id(full_name)`)
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
      const { data, error } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setMaterials(data || []);
    } catch {
      setErrorMsg("Gagal memuat materi.");
    }
  };

  // Helper cek apakah URL adalah YouTube
  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  // Helper convert Youtube Link to Embed
  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be")) {
        videoId = url.split("/").pop().split("?")[0];
    } else if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("embed")) {
        return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getFileType = (url) => {
    if (!url) return "unknown";
    if (isYouTubeUrl(url)) return "youtube"; // Tipe baru

    const ext = url.split(".").pop().toLowerCase().split("?")[0];
    if (["pdf"].includes(ext)) return "pdf";
    if (["mp4", "webm", "mov", "mkv"].includes(ext)) return "video";
    return "file";
  };

  const getFileIcon = (url) => {
    const type = getFileType(url);
    if (type === "youtube") return <Youtube size={24} />;
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
      <Alert variant="danger" className="border-0 shadow-sm rounded-3">{errorMsg}</Alert>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h5 className="fw-bold mb-1">Perpustakaan Materi</h5>
        <p className="text-muted small">Unduh atau lihat langsung materi yang diupload guru.</p>
      </div>

      {materials.length === 0 ? (
        <Alert variant="info" className="border-0 shadow-sm rounded-3">
          <div className="d-flex align-items-center gap-3">
            <BookOpen size={24} className="text-info opacity-75" />
            <div>
              <strong>Belum ada materi tersedia.</strong>
              <div className="small text-muted">Guru belum mengunggah materi baru.</div>
            </div>
          </div>
        </Alert>
      ) : (
        <Row className="g-3">
          {materials.map((m) => {
            const fileType = getFileType(m.file_url);
            const isYt = fileType === "youtube";
            
            return (
            <Col md={6} lg={4} key={m.id}>
              <Card className="h-100 border-0 shadow-sm rounded-4 bg-white hover-top transition-all">
                <Card.Body className="p-3 d-flex align-items-center">
                  <div className={`p-3 rounded-3 me-3 ${isYt ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                    {getFileIcon(m.file_url)}
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex gap-1 mb-1">
                      <Badge bg="light" className="text-secondary border fw-normal">{m.subject}</Badge>
                      {m.kelas && <Badge bg="info" className="bg-opacity-10 text-info border fw-normal">Kls {m.kelas}</Badge>}
                    </div>
                    <h6 className="fw-bold mb-1 text-truncate" title={m.title}>{m.title}</h6>
                    <small className="text-muted text-truncate d-block">
                      {m.teacher?.full_name ? `Oleh: ${m.teacher.full_name}` : "Bimbel Mapa"}
                    </small>
                  </div>
                  {m.file_url && (
                    <div className="d-flex gap-1 ms-2">
                      <Button variant="light" size="sm" className="rounded-circle p-2 border" onClick={() => openView(m)} title="Lihat Materi">
                        <Eye size={18} />
                      </Button>
                      {/* Tombol Download hanya muncul jika bukan YouTube */}
                      {!isYt && (
                        <Button variant="light" size="sm" className="rounded-circle p-2 border" href={m.file_url} target="_blank" rel="noopener noreferrer" title="Download">
                            <Download size={18} />
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )})}
        </Row>
      )}

      {/* MODAL FULLSCREEN UNTUK PREVIEW */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} fullscreen centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 mb-0 d-flex align-items-center gap-2">
             {activeMaterial && getFileType(activeMaterial.file_url) === 'youtube' && <Youtube className="text-danger"/>}
             {activeMaterial?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark bg-opacity-95 p-0 d-flex justify-content-center align-items-center">
          {activeMaterial?.file_url && (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
              
              {/* --- RENDER YOUTUBE --- */}
              {getFileType(activeMaterial.file_url) === "youtube" && (
                 <div style={{ width: "100%", height: "100%", maxWidth: "1200px", margin: "0 auto" }}>
                    <iframe 
                        src={getEmbedUrl(activeMaterial.file_url)} 
                        title="YouTube Video Player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: "100%", height: "100%", border: "none" }}
                    />
                 </div>
              )}

              {/* --- RENDER PDF --- */}
              {getFileType(activeMaterial.file_url) === "pdf" && (
                <iframe src={activeMaterial.file_url} title="PDF Viewer" style={{ width: "100%", height: "100%", border: "none", backgroundColor: "white" }} />
              )}

              {/* --- RENDER VIDEO FILE (MP4, etc) --- */}
              {getFileType(activeMaterial.file_url) === "video" && (
                <video src={activeMaterial.file_url} controls style={{ width: "100%", maxHeight: "90vh" }} />
              )}

              {/* --- RENDER UNKNOWN/DOWNLOAD ONLY --- */}
              {getFileType(activeMaterial.file_url) === "file" && (
                <div className="text-center py-5 text-white">
                  <FileText size={64} className="mb-4 opacity-75" />
                  <h4 className="mb-3">Preview tidak tersedia</h4>
                  <p className="mb-4 text-white-50">File ini harus diunduh untuk dapat dibuka.</p>
                  <Button href={activeMaterial.file_url} target="_blank" rel="noopener noreferrer" variant="primary" size="lg">
                    <Download size={20} className="me-2" /> Download File
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}