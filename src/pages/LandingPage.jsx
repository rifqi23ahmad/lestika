import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function LandingPage() {
  const [content, setContent] = useState({
    hero_title: 'Bimbingan Belajar Les Privat Terpercaya',
    hero_description: 'Kami Menyediakan Layanan Terbaik Guru Les Privat untuk TK, SD, SMP, SMA.',
    footer_text: '© 2025 MAPA | PT Sahabat Pendidikan Indonesia.',
    programs: [] 
  });

  // --- EFFECT 1: AMBIL DATA (Hanya Jalan Sekali) ---
  useEffect(() => {
    async function fetchContent() {
        const { data } = await supabase
            .from('landing_settings')
            .select('*')
            .single();
        
        if (data) {
            setContent(data);
        }
    }
    fetchContent();
  }, []); // <--- Dependency Kosong [] Wajib ada agar tidak loop!

  // --- EFFECT 2: ANIMASI SCROLL (Jalan saat programs berubah) ---
  useEffect(() => {
    // Jika belum ada program, jangan jalankan observer
    if (!content.programs || content.programs.length === 0) return;

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Timeout kecil untuk memastikan DOM sudah dirender
    const timer = setTimeout(() => {
        const items = document.querySelectorAll('.program-item');
        items.forEach(item => {
            // Set style awal via JS agar kalau JS mati tetap muncul (opsional)
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    }, 100);

    return () => {
        observer.disconnect();
        clearTimeout(timer);
    };
  }, [content.programs]); // Hanya jalankan ulang jika list program berubah

  return (
    <main>
        <section className="hero-section">
            <div className="container">
                <h1>{content.hero_title}</h1>
                <p>{content.hero_description}</p>
                <Link to="/login" className="btn-primary">Daftar Sekarang</Link>
            </div>
        </section>

        <section id="programs" className="section-padding bg-light">
            <div className="container">
                <h2>Program Unggulan</h2>
                <div className="program-grid">
                    {/* Render List Program Secara Dinamis */}
                    {content.programs && content.programs.length > 0 ? (
                        content.programs.map((prog, index) => (
                            <div className="program-item" key={index}>
                                <img 
                                    src={prog.img || "https://via.placeholder.com/300x200?text=No+Image"} 
                                    alt={prog.title} 
                                    style={{objectFit: 'cover', width: '100%', height: '200px'}}
                                />
                                <h3>{prog.title}</h3>
                                <p>{prog.desc}</p>
                                <Link to="/login" className="btn-secondary">Daftar</Link>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign:'center', width:'100%'}}>Belum ada program yang ditambahkan.</p>
                    )}
                </div>
            </div>
        </section>

        <footer>
            <div className="container">
                <p className="copyright">{content.footer_text}</p>
            </div>
        </footer>
    </main>
  );
}