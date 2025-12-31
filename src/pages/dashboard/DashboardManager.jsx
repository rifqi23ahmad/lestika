import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

export default function DashboardManager() {
  const { user } = useAuth();

  const DashboardLayout = ({ children }) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h1>
        <p className="text-gray-500">Selamat datang kembali, {user.name}</p>
      </div>
      {children}
    </div>
  );

  return (
    <DashboardLayout>
      {user.role === 'admin' && <AdminDashboard />}
      {user.role === 'guru' && <TeacherDashboard />}
      {user.role === 'siswa' && <StudentDashboard />}
    </DashboardLayout>
  );
}