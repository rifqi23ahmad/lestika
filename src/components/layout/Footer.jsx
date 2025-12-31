import React from 'react';
import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container className="text-center">
        <p className="mb-0 text-white-50 small">&copy; {new Date().getFullYear()} Bimbel MAPA. All rights reserved.</p>
        <p className="mb-0 small text-white-50">Mencerdaskan Kehidupan Bangsa</p>
      </Container>
    </footer>
  );
}