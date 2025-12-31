import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Container } from 'react-bootstrap';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

export default function DashboardManager() {
  const { user } = useAuth();

  return (
    <Container className="py-5">
      <div className="mb-4 border-bottom pb-3">
        <h2 className="fw-bold text-dark">Dashboard {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h2>
        <p className="text-muted">Selamat datang kembali, <strong>{user.name}</strong></p>
      </div>

      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'guru' && <TeacherDashboard />}
      {user.role === 'siswa' && <StudentDashboard />}
    </Container>
  );
}