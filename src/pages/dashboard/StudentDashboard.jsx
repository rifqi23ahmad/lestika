import React from 'react';
import { Award, BookOpen, ChevronRight } from 'lucide-react';

const mockSchedules = [
  { id: 1, day: "Senin", time: "14:00 - 16:00", subject: "Matematika", teacher: "Pak Budi", room: "Ruang A" },
  { id: 2, day: "Rabu", time: "14:00 - 16:00", subject: "Bahasa Inggris", teacher: "Ms. Sarah", room: "Ruang B" },
  { id: 3, day: "Jumat", time: "15:30 - 17:30", subject: "Fisika", teacher: "Bu Ratna", room: "Lab 1" },
];

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Kartu Status Paket */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Paket Aktif: Reguler SMA</h2>
            <p className="text-blue-100 opacity-90">Berlaku hingga: 31 Des 2024</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Award className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Kehadiran Bulan Ini</span>
            <span>85%</span>
          </div>
          <div className="w-full bg-blue-900/50 rounded-full h-2.5">
            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jadwal Siswa */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Jadwal Saya</h3>
          <ul className="divide-y divide-gray-100">
            {mockSchedules.map(sch => (
              <li key={sch.id} className="py-3 flex items-center">
                <div className="bg-gray-100 p-2 rounded text-center min-w-[60px] mr-4">
                  <span className="block text-xs font-bold text-gray-500">{sch.day}</span>
                  <span className="block text-sm font-bold text-blue-600">{sch.time.split(' - ')[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{sch.subject}</p>
                  <p className="text-sm text-gray-500">Bersama {sch.teacher}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Materi Terbaru */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Materi Terbaru</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 transition cursor-pointer group">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded mr-3">
                    <BookOpen className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-blue-600">Rumus Trigonometri Dasar.pdf</p>
                    <p className="text-xs text-gray-500">Diunggah 2 jam lalu</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}