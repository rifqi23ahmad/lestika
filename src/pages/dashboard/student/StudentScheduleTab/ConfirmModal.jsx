import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export default function ConfirmModal({ 
  show, 
  slot, 
  loading, 
  onCancel, 
  onConfirm, 
  getDayName, 
  formatTime,
  user // Opsional: jika ingin logic teks lebih pintar
}) {
  if (!slot) return null;

  // Cek apakah ini aksi Booking atau Cancel
  // Kita asumsikan jika slot sudah ada student_id, berarti user sedang ingin cancel (karena validasi klik sudah filter punya orang lain)
  const isCancelling = slot.status === 'booked' && slot.student_id;

  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Body className="text-center pt-5 pb-4 px-4">
        <div 
            className={`mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle ${isCancelling ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`} 
            style={{width: 70, height: 70}}
        >
          {isCancelling ? <XCircle size={32} /> : <CheckCircle size={32} />}
        </div>
        
        <h5 className="fw-bold mb-2">
            {isCancelling ? "Batalkan Jadwal?" : "Ambil Jadwal Ini?"}
        </h5>
        
        <p className="text-muted small mb-4">
            {isCancelling 
                ? "Apakah Anda yakin ingin membatalkan kehadiran di sesi ini?" 
                : "Pastikan Anda bisa hadir pada waktu yang dipilih."}
        </p>

        <div className="bg-light p-3 rounded mb-4 text-start border">
            <div className="fw-bold text-dark mb-1">{slot.subject}</div>
            <div className="d-flex justify-content-between text-secondary small">
                <span>{getDayName(slot.start_time)}</span>
                <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
            </div>
        </div>

        <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-secondary" onClick={onCancel} disabled={loading} className="w-50">
                Kembali
            </Button>
            <Button 
                variant={isCancelling ? "danger" : "primary"} 
                onClick={onConfirm} 
                disabled={loading} 
                className="w-50"
            >
                {loading ? <Spinner size="sm" animation="border" /> : (isCancelling ? "Ya, Batalkan" : "Ya, Booking")}
            </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}