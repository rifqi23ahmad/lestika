import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (session?.user) {
        const { data } = await authService.getUserProfile(session.user.id);
        setProfile(data);
        setLoading(false);
      }
    };
    loadProfile();
  }, [session]);

  if (loading) return <div className="text-center p-10">Loading Profile...</div>;

  // Liskov Substitution / Strategy Pattern:
  // Render komponen berbeda berdasarkan role, tapi props yang dikirim konsisten
  return (
    <div className="container section-padding">
      <Header profile={profile} />
      {profile?.role === 'admin' ? (
        <AdminDashboard user={session.user} />
      ) : (
        <StudentDashboard user={session.user} />
      )}
    </div>
  );
}

const Header = ({ profile }) => (
    <div className="flex justify-between mb-5">
        <h1>Halo, {profile?.full_name}</h1>
        <span className={profile?.role === 'admin' ? 'bg-red-500 badge' : 'bg-green-500 badge'}>
            {profile?.role === 'admin' ? 'ADMIN' : 'SISWA'}
        </span>
    </div>
);