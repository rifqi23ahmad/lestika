import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Container, Alert, Spinner } from "react-bootstrap";
import { APP_CONFIG } from "../../config/constants";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

const DASHBOARD_COMPONENTS = {
  [APP_CONFIG.ROLES.ADMIN]: AdminDashboard,
  [APP_CONFIG.ROLES.GURU]: TeacherDashboard,
  [APP_CONFIG.ROLES.SISWA]: StudentDashboard,
};

export default function DashboardManager() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Memuat data pengguna...</p>
      </Container>
    );
  }

  const DashboardComponent = user?.role
    ? DASHBOARD_COMPONENTS[user.role]
    : null;

  return (
    <Container className="py-5">
      <div className="mb-4 border-bottom pb-3">
        <h2 className="fw-bold text-dark">
          Dashboard{" "}
          {user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : ""}
        </h2>
        <p className="text-muted">
          Selamat datang kembali, <strong>{user?.name || user?.email}</strong>
        </p>
      </div>

      {DashboardComponent ? (
        <DashboardComponent />
      ) : (
        <Alert variant="warning">
          <Alert.Heading>Role Tidak Dikenali</Alert.Heading>
          <p>
            Akun Anda terdeteksi sebagai role:{" "}
            <strong>{user?.role || "Tidak ada"}</strong>.
            <br />
            Silakan hubungi admin jika ini adalah kesalahan.
          </p>
        </Alert>
      )}
    </Container>
  );
}
