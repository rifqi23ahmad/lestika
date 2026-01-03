import React from "react";
import { Container, Card } from "react-bootstrap";

export default function AuthLayout({ 
  title, 
  subtitle, 
  children, 
  footer, 
  maxWidth = "450px" 
}) {
  return (
    <Container
      className="d-flex align-items-center justify-content-center py-5"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <Card
        className="shadow-lg border-0"
        style={{ maxWidth, width: "100%", borderRadius: "15px" }}
      >
        <Card.Body className="p-4 p-md-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">{title}</h2>
            <p className="text-muted small">{subtitle}</p>
          </div>

          {children}

          {footer && (
            <div className="text-center mt-4 pt-3 border-top">
              {footer}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}