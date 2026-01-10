// src/components/admin/panels/AdminPackagePanel.jsx
import React, { useState, useEffect } from "react";
import { Card, Button, Table, Form, Row, Col } from "react-bootstrap";
import { Plus, Edit, Trash2 } from "lucide-react";
import { packageService } from "../../../services/packageService";

export default function AdminPackagePanel({ showInfo, showConfirm }) {
  const [packages, setPackages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // State awal dipisah agar mudah di-reset
  const initialPkgState = { title: "", price: "", features: "" };
  const [currentPkg, setCurrentPkg] = useState(initialPkgState);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packageService.getAll();
      setPackages(data);
    } catch (err) {
      console.error(err);
      showInfo("Error", "Gagal memuat paket.", "error");
    }
  };

  const handleSavePkg = async (e) => {
    e.preventDefault();

    // 1. Format Fitur (Array)
    const formattedFeatures = typeof currentPkg.features === "string"
        ? currentPkg.features.split(",").map((f) => f.trim()).filter(f => f) // filter(f=>f) menghapus string kosong
        : currentPkg.features;

    // 2. Format Harga
    const numericPrice = Number(currentPkg.price);
    
    // Payload preparation
    const payload = {
      ...currentPkg,
      features: formattedFeatures,
      price: numericPrice,
      price_display: `Rp ${numericPrice.toLocaleString("id-ID")}`,
    };

    try {
      if (currentPkg.id) {
        await packageService.update(currentPkg.id, payload);
      } else {
        await packageService.create(payload);
      }

      setIsEditing(false);
      loadPackages();
      showInfo("Disimpan", "Data paket berhasil disimpan.", "success");
    } catch (err) {
      console.error(err);
      showInfo("Gagal", "Gagal menyimpan paket.", "error");
    }
  };

  const handleDeletePkg = (id) => {
    showConfirm(
      "Hapus Paket?",
      "Yakin ingin menghapus paket ini permanen?",
      "danger",
      async () => {
        try {
          await packageService.delete(id);
          loadPackages();
          showInfo("Terhapus", "Paket berhasil dihapus.", "success");
        } catch (error) {
          showInfo("Gagal", "Gagal menghapus paket.", "error");
        }
      }
    );
  };

  const openEditPkg = (pkg) => {
    setCurrentPkg({
      ...pkg,
      features: Array.isArray(pkg.features) ? pkg.features.join(", ") : pkg.features,
      price: pkg.price,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentPkg(initialPkgState);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Daftar Paket Belajar</h5>
        <Button
          size="sm"
          onClick={() => {
            setCurrentPkg(initialPkgState);
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
                    setCurrentPkg({ ...currentPkg, title: e.target.value })
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
                    setCurrentPkg({ ...currentPkg, price: e.target.value })
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
                onClick={handleCancel}
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
              <td className="text-primary fw-bold">{pkg.price_display}</td>
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
  );
}