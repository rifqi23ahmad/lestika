// src/components/admin/panels/AdminUserPanel.jsx
import React, { useState, useEffect } from "react";
import { Card, Table, Button, Alert } from "react-bootstrap";
import { userService } from "../../../services/userService"; // Import service baru
import RoleBadge from "../../common/RoleBadge"; // Import komponen badge

export default function AdminUserPanel({ showInfo, showConfirm }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Gagal memuat user:", error);
      showInfo("Error", "Gagal memuat data user.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole, actionName) => {
    showConfirm(
      "Konfirmasi Perubahan Role",
      `Apakah Anda yakin ingin mengubah user ini menjadi ${newRole.toUpperCase()}?`,
      newRole === "siswa" ? "warning" : "info", // Warning kalau demote, Info kalau promote
      async () => {
        try {
          await userService.updateUserRole(userId, newRole);
          await loadUsers(); // Reload data local
          showInfo("Berhasil", `User berhasil diubah menjadi ${newRole}.`, "success");
        } catch (error) {
          console.error(error);
          showInfo("Gagal", "Terjadi kesalahan saat update role.", "error");
        }
      }
    );
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 fw-bold">Manajemen User (Guru & Siswa)</h5>
      </Card.Header>
      <Card.Body>
        <Alert variant="info" className="small mb-3">
          Cari user dengan role 'siswa' dan klik <strong>Promote Guru</strong>{" "}
          untuk memberi akses Dashboard Guru.
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
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-3">Memuat data...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-medium">{u.full_name || "-"}</td>
                  <td>{u.email}</td>
                  <td>
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="text-end">
                    {u.role === "siswa" && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => handleRoleChange(u.id, "guru")}
                      >
                        Promote Guru
                      </Button>
                    )}
                    {u.role === "guru" && (
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => handleRoleChange(u.id, "siswa")}
                      >
                        Demote Siswa
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}