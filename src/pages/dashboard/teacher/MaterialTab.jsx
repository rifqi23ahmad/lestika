import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  ProgressBar,
  Nav
} from "react-bootstrap";
import {
  Trash2,
  Eye,
  FileText,
  Plus,
  AlertCircle,
  Edit,
  Upload,
  Save,
  Youtube,
  Link as LinkIcon,
  Sparkles 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import AiMaterialModal from "../../../components/teacher/modals/AiMaterialModal";

export default function MaterialTab() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [showAiModal, setShowAiModal] = useState(false);
  
  const [uploadType, setUploadType] = useState('file');

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    jenjang: "",
    kelas: "",
    subject: "",
    file: null,
    youtubeUrl: ""
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [previewData, setPreviewData] = useState({ url: "", title: "", type: "file" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) fetchMaterials();
  }, [user]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      console.error("Error:", err);
      setError("Gagal memuat daftar materi.");
    } finally {
      setLoading(false);
    }
  };

  const getJenjangFromKelas = (kelas) => {
    const k = parseInt(kelas);
    if (k >= 1 && k <= 6) return "SD";
    if (k >= 7 && k <= 9) return "SMP";
    if (k >= 10 && k <= 12) return "SMA";
    return "";
  };

  const getClassOptions = (jenjang) => {
    if (jenjang === "SD") return [1, 2, 3, 4, 5, 6];
    if (jenjang === "SMP") return [7, 8, 9];
    if (jenjang === "SMA") return [10, 11, 12];
    return [];
  };

  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  const handleShowUpload = () => {
    setIsEditing(false);
    setUploadType('file');
    setFormData({
      id: null,
      title: "",
      description: "",
      jenjang: "",
      kelas: "",
      subject: "",
      file: null,
      youtubeUrl: ""
    });
    setShowFormModal(true);
  };

  const handleShowEdit = (item) => {
    setIsEditing(true);
    const detectedJenjang = item.jenjang || getJenjangFromKelas(item.kelas);
    
    const isYoutube = isYouTubeUrl(item.file_url);
    setUploadType(isYoutube ? 'youtube' : 'file');

    setFormData({
      id: item.id,
      title: item.title,
      description: item.description || "",
      jenjang: detectedJenjang,
      kelas: item.kelas || "",
      subject: item.subject || "",
      file: null,
      youtubeUrl: isYoutube ? item.file_url : ""
    });
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    if (!formLoading) setShowFormModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      if (!formData.title || !formData.jenjang || !formData.kelas || !formData.subject) {
        throw new Error("Mohon lengkapi Judul, Jenjang, Kelas, dan Mapel.");
      }

      if (!isEditing) {
          if (uploadType === 'file' && !formData.file) throw new Error("File materi wajib diupload.");
          if (uploadType === 'youtube' && !formData.youtubeUrl) throw new Error("Link YouTube wajib diisi.");
      }

      let finalFileUrl = null;

      if (uploadType === 'youtube') {
         finalFileUrl = formData.youtubeUrl;
      } 
      else if (uploadType === 'file' && formData.file) {
        const fileExt = formData.file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(filePath, formData.file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("materials")
          .getPublicUrl(filePath);

        finalFileUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        jenjang: formData.jenjang, 
        kelas: formData.kelas,
        subject: formData.subject,
        updated_at: new Date(),
      };

      if (finalFileUrl) {
        payload.file_url = finalFileUrl;
      }

      if (isEditing) {
        const { error } = await supabase.from("materials").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        payload.teacher_id = user.id;
        const { error } = await supabase.from("materials").insert([payload]);
        if (error) throw error;
      }

      await fetchMaterials();
      handleCloseForm();
    } catch (err) {
      alert(err.message || "Gagal menyimpan data.");
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtu.be")) {
        videoId = url.split("/").pop().split("?")[0];
    } 
    else if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
    }
    else if (url.includes("embed")) {
        return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handleView = (item) => {
    const isYt = isYouTubeUrl(item.file_url);
    setPreviewData({ 
        url: isYt ? getEmbedUrl(item.file_url) : item.file_url, 
        title: item.title,
        type: isYt ? 'youtube' : 'file'
    });
    setShowViewModal(true);
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    setDeleteLoading(true);
    try {
      if (selectedMaterial.file_url && !isYouTubeUrl(selectedMaterial.file_url)) {
        try {
          const urlParts = selectedMaterial.file_url.split("/materials/");
          if (urlParts.length > 1) {
            const storagePath = urlParts[1]; 
            await supabase.storage.from("materials").remove([storagePath]);
          }
        } catch (storageErr) {
          console.warn("Gagal menghapus file fisik, lanjut hapus data DB.", storageErr);
        }
      }

      const { error } = await supabase.from("materials").delete().eq("id", selectedMaterial.id);
      if (error) throw error;

      setMaterials(materials.filter((m) => m.id !== selectedMaterial.id));
      setShowDeleteModal(false);
    } catch (err) {
      alert("Gagal menghapus materi.");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Materi Pembelajaran</h4>
          <p className="text-muted small mb-0">
            Kelola materi untuk SD, SMP, dan SMA.
          </p>
        </div>
        
        {/* Update Tombol Group */}
        <div className="d-flex gap-2">
            <Button
              onClick={() => setShowAiModal(true)}
              variant="light"
              className="text-primary bg-primary-subtle border-0 shadow-sm d-flex align-items-center gap-2 fw-medium"
            >
              <Sparkles size={18} /> Generate AI PDF
            </Button>
            <Button
              onClick={handleShowUpload}
              variant="primary"
              className="shadow-sm d-flex align-items-center gap-2"
            >
              <Plus size={18} /> Tambah Materi
            </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {materials.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle p-3 mb-3 d-inline-block">
                <FileText size={32} className="text-muted" />
              </div>
              <h6 className="fw-bold">Belum ada materi</h6>
              <p className="text-muted small">
                Upload materi pertama Anda sekarang.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4 border-0 small text-uppercase text-secondary fw-bold">
                      Judul Materi
                    </th>
                    <th className="py-3 border-0 small text-uppercase text-secondary fw-bold">
                      Jenjang
                    </th>
                    <th className="py-3 border-0 small text-uppercase text-secondary fw-bold">
                      Tanggal
                    </th>
                    <th className="py-3 border-0 small text-uppercase text-secondary fw-bold text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((item) => {
                    const isYt = isYouTubeUrl(item.file_url);
                    return (
                    <tr key={item.id} className="border-bottom-0">
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className={`p-2 rounded me-3 ${isYt ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}`}>
                            {isYt ? <Youtube size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">
                              {item.title}
                            </div>
                            <div
                              className="small text-muted text-truncate"
                              style={{ maxWidth: "200px" }}
                            >
                              {item.subject}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <Badge bg="info" className="w-fit-content">
                            {item.jenjang || getJenjangFromKelas(item.kelas)}
                          </Badge>
                          <span className="small text-muted">
                            Kelas {item.kelas}
                          </span>
                        </div>
                      </td>
                      <td className="small text-muted">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            className="text-primary bg-primary-subtle"
                            onClick={() => handleView(item)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-success bg-success-subtle"
                            onClick={() => handleShowEdit(item)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-danger bg-danger-subtle"
                            onClick={() => {
                              setSelectedMaterial(item);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* --- MODAL MANUAL UPLOAD/EDIT --- */}
      <Modal
        show={showFormModal}
        onHide={handleCloseForm}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {isEditing ? "Edit Materi" : "Tambah Materi Baru"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            
            <div className="mb-4">
                <Nav variant="pills" className="bg-light p-1 rounded-3" activeKey={uploadType}>
                    <Nav.Item className="w-50">
                        <Nav.Link 
                            eventKey="file" 
                            onClick={() => setUploadType('file')}
                            className="text-center fw-semibold rounded-3"
                        >
                            <Upload size={18} className="me-2 mb-1"/> Upload File
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="w-50">
                        <Nav.Link 
                            eventKey="youtube" 
                            onClick={() => setUploadType('youtube')}
                            className="text-center fw-semibold rounded-3"
                        >
                            <Youtube size={18} className="me-2 mb-1"/> Video YouTube
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="fw-medium">Judul Materi</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Modul Bahasa Inggris Chapter 1"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Jenjang Pendidikan
                  </Form.Label>
                  <Form.Select
                    value={formData.jenjang}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        jenjang: e.target.value,
                        kelas: "",
                      });
                    }}
                    required
                  >
                    <option value="">Pilih Jenjang...</option>
                    <option value="SD">SD (Sekolah Dasar)</option>
                    <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                    <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="fw-medium">Kelas</Form.Label>
                  <Form.Select
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    required
                    disabled={!formData.jenjang}
                  >
                    <option value="">Pilih Kelas...</option>
                    {getClassOptions(formData.jenjang).map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="fw-medium">Mata Pelajaran</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Contoh: Matematika"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </Form.Group>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Deskripsi (Opsional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </Form.Group>
              </div>

              <div className="col-12">
                <Form.Group>
                  <Form.Label className="fw-medium">
                    {uploadType === 'file' ? "File Materi" : "Link Video YouTube"}
                  </Form.Label>
                  
                  {uploadType === 'file' ? (
                      <>
                        <div
                            className={`border rounded-3 p-3 text-center ${
                            formData.file
                                ? "bg-primary-subtle border-primary"
                                : "bg-light"
                            }`}
                        >
                            <div className="d-flex flex-column align-items-center justify-content-center cursor-pointer position-relative">
                            {!formData.file ? (
                                <>
                                <Upload size={24} className="text-muted mb-2" />
                                <span className="small text-muted">
                                    Klik untuk upload (PDF, DOCX, JPG)
                                </span>
                                </>
                            ) : (
                                <>
                                <FileText size={24} className="text-primary mb-2" />
                                <span className="small fw-bold text-primary">
                                    {formData.file.name}
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-danger p-0 mt-1 text-decoration-none"
                                    onClick={() =>
                                    setFormData({ ...formData, file: null })
                                    }
                                >
                                    Ganti File
                                </Button>
                                </>
                            )}
                            <Form.Control
                                type="file"
                                className="position-absolute opacity-0 w-100 h-100"
                                style={{ cursor: "pointer" }}
                                onChange={(e) => {
                                if (e.target.files[0])
                                    setFormData({
                                    ...formData,
                                    file: e.target.files[0],
                                    });
                                }}
                            />
                            </div>
                        </div>
                        {isEditing && !formData.file && (
                            <Form.Text className="text-muted">
                            *Kosongkan jika tidak ingin mengubah file.
                            </Form.Text>
                        )}
                      </>
                  ) : (
                      <div className="input-group">
                         <span className="input-group-text bg-light"><LinkIcon size={18}/></span>
                         <Form.Control 
                            type="url"
                            placeholder="Contoh: https://www.youtube.com/watch?v=..."
                            value={formData.youtubeUrl}
                            onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                         />
                      </div>
                  )}

                </Form.Group>
              </div>
            </div>

            {formLoading && (
              <div className="mt-3">
                <ProgressBar
                  animated
                  now={100}
                  variant="primary"
                  style={{ height: "4px" }}
                />
                <div className="text-center small text-muted mt-1">
                  Menyimpan data...
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={handleCloseForm}
              disabled={formLoading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              <Save size={18} className="me-2" />
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* --- PREVIEW MODAL --- */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {previewData.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-dark" style={{ height: "80vh" }}>
          {previewData.type === 'youtube' ? (
              <iframe
                src={previewData.url}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                width="100%"
                height="100%"
                className="border-0"
              />
          ) : (
              previewData.url ? (
                <iframe
                src={previewData.url}
                width="100%"
                height="100%"
                title="Preview"
                className="border-0 bg-light"
                />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center">
                    <p className="text-muted">File rusak.</p>
                </div>
              )
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
        centered
      >
        <Modal.Body className="text-center p-4">
          <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex p-3 mb-3">
            <AlertCircle size={32} />
          </div>
          <h5 className="fw-bold">Hapus Materi?</h5>
          <p className="text-muted">Materi ini akan dihapus permanen.</p>
          <div className="d-flex justify-content-center gap-2">
            <Button
              variant="light"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* --- INTEGRASI AI MATERIAL MODAL --- */}
      <AiMaterialModal 
        show={showAiModal} 
        onHide={() => setShowAiModal(false)}
        onSuccess={fetchMaterials}
      />
    </div>
  );
}