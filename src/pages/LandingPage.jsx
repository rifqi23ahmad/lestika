import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  
  // Implementasi logika dari script.js untuk animasi scroll
  useEffect(() => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const items = document.querySelectorAll('.program-item, .feature-item');
    items.forEach(item => {
        // Set initial styles sesuai script.js
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
        <section id="home" className="hero-section">
            <div className="container">
                <h1>Bimbingan Belajar Les Privat Terpercaya</h1>
                <p>Kami Menyediakan Layanan Terbaik Guru Les Privat untuk TK, SD, SMP, SMA. Pendampingan Belajar Privat 1 Guru 1 Siswa.</p>
                <Link to="/login" className="btn-primary">Daftar Sekarang</Link>
            </div>
        </section>

        <section id="why-us" className="section-padding">
            <div className="container">
                <h2>Kenapa Harus MAPA</h2>
                <p><strong>MAPA</strong> penyedia les privat matematika SD SMP dan SMA kerumah berpengalaman. Guru datang kerumah, belajar sesuai keahlian guru.</p>
            </div>
        </section>

        <section id="programs" className="section-padding bg-light">
            <div className="container">
                <h2>Program Unggulan</h2>
                <div className="program-grid">
                    <div className="program-item">
                        <img src="https://via.placeholder.com/300x200" alt="Les Privat Calistung" />
                        <h3>Les Privat Calistung</h3>
                        <p>Kemampuan membaca, menulis, dan berhitung merupakan kunci utama bagi anak-anak.</p>
                    </div>
                    <div className="program-item">
                        <img src="https://via.placeholder.com/300x200" alt="Les Privat SD" />
                        <h3>Les Privat SD</h3>
                        <p>Layanan les privat matematika untuk siswa tingkat SD, mulai dari kelas 1 hingga kelas 6.</p>
                    </div>
                    <div className="program-item">
                        <img src="https://via.placeholder.com/300x200" alt="Les Privat SMP" />
                        <h3>Les Privat SMP</h3>
                        <p>Layanan les privat paripurna untuk siswa tingkat SMP, Matematika dan IPA.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="cta" className="section-padding cta-section">
            <div className="container">
                <h2>TUNGGU APALAGI!</h2>
                <p>Ayo Daftar Les Privat Sekarang!</p>
                <Link to="/login" className="btn-primary">Gabung MAPA</Link>
            </div>
        </section>
        
        {/* Footer dari index.html */}
        <footer>
            <div className="container">
                <p className="copyright">2025 MAPA | PT Sahabat Pendidikan Indonesia.</p>
            </div>
        </footer>
    </main>
  );
}