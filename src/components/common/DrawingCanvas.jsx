import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Eraser, Pen, Trash2, Save } from 'lucide-react';

const DrawingCanvas = ({ onSave, initialImage = null }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // pen, eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set resolusi canvas agar tidak blur di layar retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Background putih

    if (initialImage) {
      const img = new Image();
      img.src = initialImage;
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = tool === 'pen' ? 2 : 20;
    ctx.strokeStyle = tool === 'pen' ? '#000' : '#fff';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/png');
  };

  return (
    <div className="border rounded p-2 bg-light">
      <div className="d-flex gap-2 mb-2">
        <Button size="sm" variant={tool === 'pen' ? "primary" : "outline-secondary"} onClick={() => setTool('pen')}>
          <Pen size={16} />
        </Button>
        <Button size="sm" variant={tool === 'eraser' ? "primary" : "outline-secondary"} onClick={() => setTool('eraser')}>
          <Eraser size={16} />
        </Button>
        <Button size="sm" variant="outline-danger" onClick={clearCanvas}>
          <Trash2 size={16} />
        </Button>
        <Button size="sm" variant="success" className="ms-auto" onClick={handleSave}>
          <Save size={16} className="me-1" /> Simpan Gambar
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '300px', touchAction: 'none', background: 'white', cursor: 'crosshair' }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
    </div>
  );
};

export default DrawingCanvas;