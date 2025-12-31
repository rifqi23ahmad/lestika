import React from 'react';
import { Calendar, User } from 'lucide-react';

// Data dummy untuk tampilan
const mockSchedules = [
  { id: 1, day: "Senin", time: "14:00 - 16:00", subject: "Matematika", teacher: "Pak Budi", room: "Ruang A" },
  { id: 2, day: "Rabu", time: "14:00 - 16:00", subject: "Bahasa Inggris", teacher: "Ms. Sarah", room: "Ruang B" },
  { id: 3, day: "Jumat", time: "15:30 - 17:30", subject: "Fisika", teacher: "Bu Ratna", room: "Lab 1" },
];

export default function TeacherDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Jadwal Mengajar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-800">Jadwal Mengajar Hari Ini</h3>
          <Calendar className="text-blue-500 w-5 h-5" />
        </div>
        <div className="space-y-4">
          {mockSchedules.slice(0, 2).map(sch => (
             <div key={sch.id} className="flex border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
               <div className="mr-4 text-center">
                 <p className="text-xs font-bold text-blue-800 uppercase">{sch.day}</p>
                 <p className="font-bold text-gray-900">{sch.time.split(' - ')[0]}</p>
               </div>
               <div>
                 <p className="font-bold text-gray-900">{sch.subject}</p>
                 <p className="text-sm text-gray-600">{sch.room} &bull; Kelas 12 IPA</p>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Input Nilai */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-800">Input Nilai / Catatan</h3>
          <User className="text-green-500 w-5 h-5" />
        </div>
        <div className="space-y-4">
          <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center">
            <div>
              <p className="font-medium">Andi Saputra</p>
              <p className="text-xs text-gray-500">Matematika - Quiz 3</p>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Belum Dinilai</span>
          </div>
           <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center">
            <div>
              <p className="font-medium">Siti Aminah</p>
              <p className="text-xs text-gray-500">Fisika - PR Bab 2</p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Selesai: 95</span>
          </div>
        </div>
        <button className="w-full mt-4 text-blue-600 text-sm font-medium hover:underline">Lihat Semua Siswa</button>
      </div>
    </div>
  );
}