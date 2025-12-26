import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import PackageManager from '../../components/admin/PackageManager'; // Komponen baru
import WebsiteEditor from '../../components/admin/WebsiteEditor';   // Komponen baru

export default function AdminDashboard() {
  // Logic fetching ada di hook, UI jadi bersih
  const { packages, refetch } = useDashboardData(null, true); 

  return (
    <div>
      {/* Menerapkan Interface Segregation: Kirim props yang dibutuhkan saja */}
      <PackageManager currentPackages={packages} onUpdate={refetch} />
      <hr className="my-10" />
      <WebsiteEditor />
    </div>
  );
}