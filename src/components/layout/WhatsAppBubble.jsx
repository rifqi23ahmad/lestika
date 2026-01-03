import React, { useState } from "react";
import { Card, Form, Button, CloseButton } from "react-bootstrap";
import { Send, MessageCircle } from "lucide-react";

export default function WhatsAppBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  });

  const phoneNumber = "6288211058777";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = `Halo, nama saya ${formData.name}. ${formData.message}`;

    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      text
    )}`;

    window.open(whatsappLink, "_blank");

    setFormData({ name: "", message: "" });
    setIsOpen(false);
  };

  const styles = {
    container: {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
    },
    bubble: {
      backgroundColor: "#25D366",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      cursor: "pointer",
      transition: "transform 0.2s",
    },
    chatBox: {
      width: "300px",
      marginBottom: "15px",
      boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
      border: "none",
      borderRadius: "12px",
      overflow: "hidden",
      animation: "fadeIn 0.3s ease-out", 
    },
    header: {
      backgroundColor: "#075e54", 
      color: "white",
      padding: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };

  return (
    <div style={styles.container}>
      {isOpen && (
        <Card style={styles.chatBox}>
          <div style={styles.header}>
            <div className="d-flex align-items-center gap-2">
              <MessageCircle size={20} />
              <span className="fw-bold">Hubungi Admin</span>
            </div>
            <CloseButton variant="white" onClick={() => setIsOpen(false)} />
          </div>

          <Card.Body className="bg-white">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label className="small text-muted fw-bold">
                  Nama Anda
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contoh: Budi"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  style={{ fontSize: "14px" }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formMessage">
                <Form.Label className="small text-muted fw-bold">
                  Pesan
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Tulis pesan Anda..."
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  style={{ fontSize: "14px", resize: "none" }}
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                className="w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
                style={{ backgroundColor: "#25D366", border: "none" }}
              >
                <Send size={16} /> Kirim ke WhatsApp
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      <div
        style={{
          ...styles.bubble,
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", 
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat WhatsApp"
      >
        {isOpen ? (
          <CloseButton variant="white" style={{ fontSize: "1.2rem" }} />
        ) : (
          <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.632 4.793 1.748 6.81L2.096 28.5l5.88-1.54A13.937 13.937 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.86c-2.348 0-4.56-.69-6.44-1.89l-.46-.294-3.803.996 1.015-3.707-.3-.477A11.832 11.832 0 014.14 16c0-6.54 5.32-11.86 11.86-11.86 6.54 0 11.86 5.32 11.86 11.86 0 6.54-5.32 11.86-11.86 11.86zm6.54-8.875c-.358-.18-2.12-.905-2.45-1.01-.328-.103-.568-.155-.807.18-.24.335-.92 1.01-1.13 1.216-.208.206-.418.232-.776.052-.358-.18-1.514-.558-2.884-1.78-.106-.095-1.06-.99-1.464-1.684-.18-.31-.02-.478.16-.657.16-.16.358-.418.538-.627.18-.208.24-.358.358-.596.12-.24.06-.448-.03-.627-.09-.18-.807-1.944-1.105-2.662-.29-.7-.588-.604-.807-.615-.208-.01-.448-.01-.687-.01-.24 0-.627.09-.955.448-.328.358-1.254 1.225-1.254 2.986 0 1.76 1.284 3.46 1.463 3.7.18.24 2.528 3.86 6.124 5.41 2.37 1.02 2.852.818 3.36.767.687-.068 2.12-.866 2.418-1.702.298-.836.298-1.553.208-1.702-.09-.15-.328-.24-.687-.418z" />
          </svg>
        )}
      </div>
    </div>
  );
}
