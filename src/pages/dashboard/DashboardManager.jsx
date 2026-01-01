import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Container, Alert } from 'react-bootstrap';
import { APP_CONFIG } from '../../config/constants';

import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const DASHBOARD_COMPONENTS = {
  [APP_CONFIG.ROLES.ADMIN]: AdminDashboard,
  [APP_CONFIG.ROLES.GURU]: TeacherDashboard,
  [APP_CONFIG.ROLES.SISWA]: StudentDashboard,
};

export default function DashboardManager() {
  const { user } = useAuth();

  const DashboardComponent = DASHBOARD_COMPONENTS[user?.role];

  return (
    <Container className="py-5">
      <div className="mb-4 border-bottom pb-3">
        <h2 className="fw-bold text-dark">
          Dashboard {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
        </h2>
        <p className="text-muted">Selamat datang kembali, <strong>{user?.name}</strong></p>
      </div>

      {DashboardComponent ? (
        <DashboardComponent />
      ) : (
        <Alert variant="warning">
          Role pengguna tidak dikenali atau Anda tidak memiliki akses ke dashboard ini.
        </Alert>
      )}
    </Container>
  );
}