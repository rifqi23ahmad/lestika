import React, { useState, useEffect, useRef } from "react";
import { ListGroup, Button, Alert, Spinner, Modal, Badge } from "react-bootstrap";
import { Download, Eye, ChevronLeft, ChevronRight, FileText, X, ZoomIn, ZoomOut } from "lucide-react";
import { supabase } from "../../../lib/supabase";

// --- SETUP REACT-PDF ---
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- KOMPONEN PDF VIEWER RESPONSIVE (Auto-Width) ---
const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);

  // Observer: Deteksi lebar layar HP/Laptop untuk atur ukuran PDF
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Kurangi sedikit padding agar tidak nempel pinggir
        setContainerWidth(entries[0].contentRect.width - 20); 
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  return (
    <div className="d-flex flex-column align-items-center w-100" ref={containerRef}>
      
      {/* TOOLBAR NAVIGASI (Sticky di atas saat scroll) */}
      {numPages && (
        <div 
            className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm mb-3 sticky-top border" 
            style={{zIndex: 10, flexWrap: 'nowrap', maxWidth: '100%', overflowX: 'auto'}}
        >
            <Button variant="light" size="sm" disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="rounded-circle p-1 border" style={{width:32, height:32}}>
                <ChevronLeft size={16}/>
            </Button>
            
            <span className="small fw-bold text-nowrap mx-1">
                {pageNumber} / {numPages}
            </span>
            
            <Button variant="light" size="sm" disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="rounded-circle p-1 border" style={{width:32, height:32}}>
                <ChevronRight size={16}/>
            </Button>

            <div className="vr mx-1"></div>

            <Button variant="outline-secondary" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1" style={{width:32, height:32}}><ZoomOut size={14}/></Button>
            <span className="small text-muted" style={{minWidth: '35px', textAlign:'center'}}>{Math.round(scale * 100)}%</span>
            <Button variant="outline-secondary" size="sm" onClick={() => setScale(s => Math.min(2.0, s + 0.2))} className="p-1" style={{width:32, height:32}}><ZoomIn size={14}/></Button>
        </div>
      )}

      {/* AREA PDF */}
      <div className="border shadow-sm bg-dark p-2 rounded w-100 d-flex justify-content-center" style={{ minHeight: '300px' }}>
        <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-white p-5 text-center"><Spinner animation="border" size="sm"/> Memuat...</div>}
            error={<div className="text-danger p-4 bg-white rounded text-center small">Gagal memuat PDF. File mungkin rusak/private.</div>}
        >
            <Page 
                pageNumber={pageNumber} 
                scale={scale}
                // KUNCI RESPONSIF: Lebar PDF mengikuti lebar container (HP)
                width={containerWidth ? Math.min(containerWidth, 800) : 300} 
                renderTextLayer={false} 
                renderAnnotationLayer={false}
                canvasBackground="white"
                className="shadow-lg"
            />
        </Document>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA TAB MATERI ---
export default function StudentMaterialsTab() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
      setMaterials(data || []);
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const isPdf = (url) => url?.toLowerCase().includes('.pdf');

  const handleView = (material) => {
      if (isPdf(material.file_url)) {
          setSelectedMaterial(material);
          setShowModal(true);
      } else {
          window.open(material.file_url, '_blank');
      }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (materials.length === 0) return <Alert variant="light" className="text-center py-5">Belum ada materi dibagikan.</Alert>;

  return (
    <>
      <ListGroup variant="flush">
        {materials.map((item) => (
          <ListGroup.Item key={item.id} className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center py-3 gap-3">
            <div className="d-flex align-items-start gap-3">
                <div className="bg-light p-2 rounded text-primary flex-shrink-0">
                    <FileText size={24} />
                </div>
                <div>
                    <h6 className="fw-bold mb-1 text-break">{item.title}</h6>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <Badge bg="info" className="fw-normal">{item.jenjang}</Badge>
                        <small className="text-muted">• {formatDate(item.created_at)}</small>
                    </div>
                </div>
            </div>
            
            <div className="d-flex gap-2 align-self-stretch align-self-sm-center">
                <Button variant="primary" size="sm" onClick={() => handleView(item)} className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Eye size={16} className="me-2" /> Lihat
                </Button>

                <Button variant="outline-secondary" size="sm" href={item.file_url} target="_blank" className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <Download size={16} className="me-2" /> Unduh
                </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* MODAL PREVIEW (Fullscreen di Mobile) */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        fullscreen="sm-down" // Fullscreen di HP
        size="xl"            // Besar di Desktop
        style={{zIndex: 1050}}
      >
        <Modal.Header className="bg-light py-2 px-3 shadow-sm border-0">
            <Modal.Title className="h6 m-0 d-flex align-items-center gap-2 text-truncate" style={{maxWidth: '70%'}}>
                <FileText size={18} className="text-primary"/> 
                <span className="text-truncate">{selectedMaterial?.title || "Materi"}</span>
            </Modal.Title>
            <div className="ms-auto d-flex gap-2">
                <Button variant="outline-dark" size="sm" href={selectedMaterial?.file_url} target="_blank">
                    <Download size={16}/>
                </Button>
                <Button variant="danger" size="sm" onClick={() => setShowModal(false)}>
                    <X size={18}/>
                </Button>
            </div>
        </Modal.Header>
        <Modal.Body className="bg-secondary bg-opacity-10 d-flex justify-content-center overflow-auto p-0 p-md-3">
            {selectedMaterial && (
                <div className="w-100" style={{ maxWidth: '800px' }}>
                    <PdfViewer url={selectedMaterial.file_url} />
                </div>
            )}
        </Modal.Body>
      </Modal>
    </>
  );
}