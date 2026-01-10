import React, { useState, useEffect, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width - 30);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(null);
  }

  function onDocumentLoadError(error) {
    console.error("PDF Load Error:", error);
    setLoadError(error.message);
  }

  const changePage = (offset) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages));
  };

  return (
    <div
      className="d-flex flex-column align-items-center w-100"
      ref={containerRef}
    >
      {loadError && (
        <div className="alert alert-danger w-100 text-center">
          <strong>Gagal memuat PDF:</strong> {loadError}
        </div>
      )}

      {!loadError && numPages && (
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm mb-3 sticky-top border z-3">
          <Button
            variant="light"
            size="sm"
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className="rounded-circle p-1 border"
            style={{ width: 32, height: 32 }}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="small fw-bold text-nowrap mx-1">
            {pageNumber} / {numPages}
          </span>
          <Button
            variant="light"
            size="sm"
            disabled={pageNumber >= numPages}
            onClick={() => changePage(1)}
            className="rounded-circle p-1 border"
            style={{ width: 32, height: 32 }}
          >
            <ChevronRight size={16} />
          </Button>
          <div className="vr mx-2"></div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-1"
            style={{ width: 32, height: 32 }}
          >
            <ZoomOut size={14} />
          </Button>
          <span className="small text-muted fw-bold">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            className="p-1"
            style={{ width: 32, height: 32 }}
          >
            <ZoomIn size={14} />
          </Button>
        </div>
      )}

      <div
        className="border shadow-sm bg-dark p-3 rounded w-100 overflow-auto d-flex justify-content-center"
        style={{ maxHeight: "75vh", minHeight: "300px" }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="text-white p-5 text-center">
              <Spinner animation="border" size="sm" /> Memuat PDF...
            </div>
          }
          noData={<div className="text-white p-5">Tidak ada data PDF.</div>}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={containerWidth || 500}
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

export default PdfViewer;
