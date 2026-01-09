import React, { useState, useEffect } from "react";
import {
  Card,
  Badge,
  Button,
  Row,
  Col,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { Clock, Award, User, Star, Edit2, Camera } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function StudentInfoCard({
  user,
  activeInvoice,
  onReviewClick,
}) {
  const { updateUserProfileData } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    jenjang: "",
    kelas: "",
    whatsapp: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!user || !showEditModal) return;

    setFormData({
      fullName: user.name || "",
      jenjang: user.jenjang || "",
      kelas: user.kelas || "",
      whatsapp: user.whatsapp || "",
    });

    setAvatarFile(null);
    setPreviewUrl(user.avatar_url || null);
  }, [user, showEditModal]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

  const displayName =
    user?.name || user?.full_name || user?.email?.split("@")[0] || "Siswa";

  const displayEmail = user?.email || "-";

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfileData(formData, avatarFile);
      setShowEditModal(false);
    } catch (error) {
      alert("Gagal memperbarui profil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        className="border-0 shadow-sm overflow-hidden mb-4"
        style={{ borderRadius: 15 }}
      >
        <div className="bg-primary bg-gradient p-4 text-white">
          <Row className="align-items-center gy-4">
            <Col
              md={7}
              className="d-flex gap-3 border-end border-light border-opacity-25"
            >
              <div
                className="bg-white rounded-circle shadow-sm overflow-hidden"
                style={{ width: 80, height: 80, flexShrink: 0 }}
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <User size={40} className="text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="mb-0 opacity-75 small text-uppercase fw-semibold">
                      Selamat Datang,
                    </p>
                    <h3 className="fw-bold mb-1 text-truncate">
                      {displayName}
                    </h3>
                  </div>

                  <Button
                    variant="link"
                    className="text-white p-0 opacity-75"
                    onClick={() => setShowEditModal(true)}
                    title="Edit Profil"
                  >
                    <Edit2 size={18} />
                  </Button>
                </div>

                <div className="d-flex gap-2 small opacity-75 flex-wrap">
                  <span className="bg-white bg-opacity-25 px-2 py-1 rounded">
                    Siswa
                  </span>
                  <span>{displayEmail}</span>
                  {user?.jenjang && <span>{user.jenjang}</span>}
                  {user?.kelas && <span>- {user.kelas}</span>}
                </div>
              </div>
            </Col>

            <Col md={5}>
              <div className="bg-white bg-opacity-10 rounded-3 p-3 position-relative">
                <Award
                  size={80}
                  className="position-absolute text-white opacity-10"
                  style={{ right: -10, top: -10 }}
                />

                <div className="position-relative">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small opacity-75">
                      Paket Belajar Saat Ini:
                    </span>
                    <Badge bg="light" text="primary">
                      Aktif
                    </Badge>
                  </div>

                  <h4 className="fw-bold mb-2">
                    {activeInvoice?.package_name || "Belum Berlangganan"}
                  </h4>

                  <div className="d-flex gap-2 mb-3 small opacity-75">
                    <Clock size={16} />
                    <span>
                      Berlaku s.d:{" "}
                      <strong>{formatDate(activeInvoice?.expiry_date)}</strong>
                    </span>
                  </div>

                  {activeInvoice && (
                    <Button
                      variant="light"
                      size="sm"
                      className="w-100 fw-bold"
                      onClick={onReviewClick}
                    >
                      <Star size={16} fill="currentColor" /> Beri Ulasan Paket
                    </Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Profil</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="text-center mb-4">
              <label className="d-inline-block position-relative">
                <input
                  type="file"
                  className="d-none"
                  onChange={handleFileChange}
                />
                <div
                  className="rounded-circle overflow-hidden border shadow-sm"
                  style={{ width: 100, height: 100 }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <div className="small mt-1 text-muted">
                  <Camera size={12} /> Ubah foto
                </div>
              </label>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Select
                  name="jenjang"
                  value={formData.jenjang}
                  onChange={handleChange}
                >
                  <option value="">Pilih Jenjang</option>
                  <option>SD</option>
                  <option>SMP</option>
                  <option>SMA</option>
                  <option>Mahasiswa</option>
                  <option>Umum</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Control
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  placeholder="Kelas"
                />
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>WhatsApp</Form.Label>
              <Form.Control
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" /> Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
