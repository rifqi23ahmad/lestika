import React, { useState, useEffect } from "react";
import { Card, Table, Button, Badge, Alert } from "react-bootstrap";
import { supabase } from "../../../lib/supabase"; // Adjust path

export default function AdminUserPanel({ showInfo, showConfirm }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

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
      "info",
      async () => {
        const { error: errPromo } = await supabase
          .from("profiles")
          .update({ role: "guru" })
          .eq("id", userId);
        if (errPromo) throw errPromo;
        loadUsers();
        showInfo("Berhasil", "User berhasil diubah menjadi Guru.", "success");
      }
    );
  };

  const handleDemoteToStudent = (userId) => {
    showConfirm(
      "Konfirmasi",
      "Cabut akses guru dan kembalikan jadi SISWA?",
      "warning",
      async () => {
        const { error: errDemo } = await supabase
          .from("profiles")
          .update({ role: "siswa" })
          .eq("id", userId);
        if (errDemo) throw errDemo;
        loadUsers();
        showInfo("Berhasil", "User dikembalikan menjadi Siswa.", "success");
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
  );
}