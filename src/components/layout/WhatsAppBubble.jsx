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

  /* ======================
     STYLE ASLI (FLOATING)
     ====================== */
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
      width: "320px",
      marginBottom: "15px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      border: "none",
      borderRadius: "16px",
      overflow: "hidden",
      animation: "fadeIn 0.3s ease-out",
    },

    /* ======================
       FORM REDESIGN (NEW)
       ====================== */
    header: {
      background: "linear-gradient(135deg, #128C7E, #075E54)",
      color: "white",
      padding: "14px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    body: {
      backgroundColor: "#F4F6F8",
      padding: "16px",
    },
    label: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#6B7280",
      marginBottom: "4px",
    },
    input: {
      fontSize: "14px",
      borderRadius: "10px",
      padding: "10px 12px",
    },
    textarea: {
      fontSize: "14px",
      borderRadius: "10px",
      padding: "10px 12px",
      resize: "none",
    },
    button: {
      backgroundColor: "#25D366",
      border: "none",
      borderRadius: "999px",
      fontWeight: 700,
      padding: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
  };

  return (
    <div style={styles.container}>
      {isOpen && (
        <Card style={styles.chatBox}>
          {/* HEADER */}
          <div style={styles.header}>
            <div className="d-flex align-items-center gap-2">
              <MessageCircle size={18} />
              <span className="fw-bold">Chat Admin MAPA</span>
            </div>
            <CloseButton variant="white" onClick={() => setIsOpen(false)} />
          </div>

          {/* BODY */}
          <Card.Body style={styles.body}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label style={styles.label}>
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
                  style={styles.input}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={styles.label}>
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
                  style={styles.textarea}
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100"
                style={styles.button}
              >
                <Send size={16} /> Kirim ke WhatsApp
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* FLOATING BUTTON — TETAP ASLI */}
      <div
        style={{
          ...styles.bubble,
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat WhatsApp"
      >
        {isOpen ? (
          <CloseButton variant="white" />
        ) : (
          <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            fill="currentColor"
          >
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.632 4.793 1.748 6.81L2.096 28.5l5.88-1.54A13.937 13.937 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" />
          </svg>
        )}
      </div>
    </div>
  );
}
