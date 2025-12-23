import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const items = document.querySelectorAll('.program-item');
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
        <section className="hero-section">
            <div className="container">
                <h1>Bimbingan Belajar Les Privat Terpercaya</h1>
                <p>Kami Menyediakan Layanan Terbaik Guru Les Privat untuk TK, SD, SMP, SMA.</p>
                <Link to="/login" className="btn-primary">Daftar Sekarang</Link>
            </div>
        </section>

        <section id="programs" className="section-padding bg-light">
            <div className="container">
                <h2>Program Unggulan</h2>
                <div className="program-grid">
                    <div className="program-item">
                        <img src="https://via.placeholder.com/300x200" alt="SD" />
                        <h3>Les Privat SD</h3>
                        <p>Matematika dan pelajaran umum kelas 1-6.</p>
                        <Link to="/login" className="btn-secondary">Daftar</Link>
                    </div>
                    <div className="program-item">
                        <img src="https://via.placeholder.com/300x200" alt="SMP" />
                        <h3>Les Privat SMP</h3>
                        <p>Matematika dan IPA kelas 7-9.</p>
                        <Link to="/login" className="btn-secondary">Daftar</Link>
                    </div>
                </div>
            </div>
        </section>

        <footer>
            <div className="container">
                <p className="copyright">© 2025 MAPA | PT Sahabat Pendidikan Indonesia.</p>
            </div>
        </footer>
    </main>
  );
}