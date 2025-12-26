import React from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import PackageManager from '../../components/admin/PackageManager';
import WebsiteEditor from '../../components/admin/WebsiteEditor';

export default function AdminDashboard() {
  // Logic fetching ada di hook, UI jadi bersih
  const { packages, refetch } = useDashboardData(null, true); 

  return (
    <div>
      {/* Bagian Kelola Paket */}
      <PackageManager currentPackages={packages} onUpdate={refetch} />
      
      <hr className="my-10 border-gray-200" />
      
      {/* Bagian Kelola Website */}
      <WebsiteEditor />
    </div>
  );
}