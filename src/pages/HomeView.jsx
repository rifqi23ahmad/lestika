import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, CheckCircle, Loader } from 'lucide-react';
import { packageService } from '../services/packageService';

export default function HomeView({ onRegister, onNavigate }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mengambil data paket saat komponen dimuat
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await packageService.getAll();
        setPackages(data);
      } catch (error) {
        console.error("Gagal mengambil paket:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Raih Prestasi Bersama <span className="text-yellow-400">MAPA</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mb-10">
            Bimbel terpercaya dengan tutor berpengalaman dan metode belajar modern.
          </p>
          <div className="flex space-x-4">
            <button onClick={() => document.getElementById('paket')?.scrollIntoView({ behavior: 'smooth' })} className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition shadow-lg transform hover:scale-105">
              Lihat Paket
            </button>
            <button onClick={() => onNavigate('login')} className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-900 transition">
              Masuk Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Features Section (Static) */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ... (Konten fitur sama seperti sebelumnya, dipersingkat untuk hemat tempat) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Tutor Profesional", desc: "Lulusan PTN ternama berpengalaman > 3 tahun." },
              { icon: BookOpen, title: "Modul Lengkap", desc: "Materi update kurikulum Merdeka & HOTS." },
              { icon: Award, title: "Jaminan Kualitas", desc: "Laporan perkembangan siswa transparan." }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-xl text-center hover:shadow-lg transition duration-300">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages Section (Dynamic from Supabase) */}
      <div id="paket" className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Pilihan Paket Belajar</h2>
            <p className="mt-4 text-gray-500">Investasi terbaik untuk masa depan pendidikan.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin text-blue-600 h-10 w-10" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col border border-gray-100">
                  <div className={`p-6 ${pkg.color || 'bg-blue-50'}`}>
                    <h3 className="text-2xl font-bold text-gray-900">{pkg.title}</h3>
                    <p className="text-blue-600 text-xl font-bold mt-2">
                      {pkg.price_display || `Rp ${pkg.price.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div className="p-6 flex-grow">
                    <ul className="space-y-4">
                      {/* Handle array from Supabase or fallback */}
                      {(pkg.features || []).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-gray-50 border-t">
                    <button 
                      onClick={() => onRegister(pkg)} 
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                      Daftar Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}