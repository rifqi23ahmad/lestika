import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-dark-blue text-white pt-5 mt-auto">
      <Container className="pb-4">
        <Row className="gy-4 justify-content-between">
          <Col lg={4} md={6}>
            <div className="mb-3">
              <h4 className="fw-bold text-white mb-2">
                Bimbel <span className="text-warning">MAPA</span>
              </h4>
              <p className="text-white-50 small" style={{ lineHeight: "1.6" }}>
                Membimbing dan Mengantarkan Prestasi.
              </p>
            </div>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="fw-bold text-white mb-3">Hubungi Kami</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li>
                <a
                  href="https://wa.me/6288211058777"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 text-decoration-none d-flex align-items-center gap-2 small hover-text-warning"
                >
                  <Phone size={16} className="text-warning" />
                  <span>+62 882-1105-8777</span>
                </a>
              </li>

              <li>
                <a
                  href="https://www.instagram.com/bimbelmapa?igsh=MTR4cTc0Nmtsc2k1Zw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white-50 text-decoration-none d-flex align-items-center gap-2 small hover-text-warning"
                >
                  <Instagram size={16} className="text-warning" />
                  <span>@bimbelmapa</span>
                </a>
              </li>

              <li>
                <a
                  href="mailto:bimbelmapa@gmail.com"
                  className="text-white-50 text-decoration-none d-flex align-items-center gap-2 small hover-text-warning"
                >
                  <Mail size={16} className="text-warning" />
                  <span>bimbelmapa@gmail.com</span>
                </a>
              </li>
            </ul>
          </Col>

          <Col lg={5} md={12}>
            <h6 className="fw-bold text-white mb-3">Lokasi</h6>
            <div
              className="rounded-3 overflow-hidden shadow-sm border border-secondary"
              style={{ height: "200px" }} 
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.654284215532!2d106.64978149999999!3d-6.177013199999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f90047331c09%3A0xbfe8bc770b1f4b07!2sBimbel%20Mapa!5e0!3m2!1sen!2sid!4v1767509834692!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Bimbel MAPA"
              ></iframe>
            </div>
            <div className="mt-2 d-flex gap-2 text-white-50 small align-items-start">
              <MapPin size={14} className="text-warning flex-shrink-0 mt-1" />
              <span style={{ fontSize: "0.85rem" }}>
                Jl. Karya Damai, RT.003/RW.003, Buaran Indah, Kec. Tangerang,
                Kota Tangerang, Banten
              </span>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="divider-glass py-3 mt-3">
        <Container className="text-center">
          <p className="mb-0 text-white-50" style={{ fontSize: "0.75rem" }}>
            © {new Date().getFullYear()} Bimbel MAPA. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
