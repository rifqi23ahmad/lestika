import React, { useRef, useState, useEffect } from "react";
import { Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { 
  X, Save, Eraser, PenTool, Trash2, 
  Highlighter
} from "lucide-react";
import html2canvas from "html2canvas";

export default function ScreenAnnotation({ isActive, onClose, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State Tools
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#DC2626"); // Default Merah
  
  // Ref untuk logic garis halus & eraser
  const lastPoint = useRef({ x: 0, y: 0 });
  const isRightClickEraser = useRef(false);

  const colors = [
    { name: "Hitam", hex: "#000000" },
    { name: "Merah", hex: "#DC2626" },
    { name: "Biru", hex: "#2563EB" },
    { name: "Hijau", hex: "#16A34A" },
    { name: "Kuning", hex: "#FACC15" },
    { name: "Ungu", hex: "#9333EA" }
  ];

  // --- 1. SETTINGS UKURAN (Perkecil agar pas untuk mengajar) ---
  const getToolSettings = (activeTool, activeColor) => {
    if (activeTool === "highlighter") {
      return {
        composite: "source-over",
        alpha: 0.3,
        width: 16,
        color: activeColor
      };
    } else if (activeTool === "eraser") {
      return {
        composite: "destination-out",
        alpha: 1.0,
        width: 24,
        color: "#000000"
      };
    } else {
      // PEN (SPIDOL)
      return {
        composite: "source-over",
        alpha: 1.0,
        width: 2,
        color: activeColor
      };
    }
  };

  useEffect(() => {
    if (isActive) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.style.touchAction = "none"; 

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isActive]);

  const applySettings = (ctx, settings) => {
    ctx.globalCompositeOperation = settings.composite;
    ctx.globalAlpha = settings.alpha;
    ctx.lineWidth = settings.width;
    ctx.strokeStyle = settings.color;
  };

  // --- 2. START DRAWING ---
  const startDrawing = (e) => {
    if (e.button !== 0 && e.button !== 2 && e.button !== 5) return;
    
    const isRightClick = e.button === 2 || e.buttons === 2;
    isRightClickEraser.current = isRightClick;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const currentTool = isRightClick ? "eraser" : tool;
    const settings = getToolSettings(currentTool, color);
    applySettings(ctx, settings);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastPoint.current = { x, y };

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setIsDrawing(true);
  };

  // --- 3. DRAWING (ALGORITMA CURVE SMOOTHING) ---
  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const drawSmoothLine = (clientX, clientY) => {
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      
      const midPointX = (lastPoint.current.x + x) / 2;
      const midPointY = (lastPoint.current.y + y) / 2;

      ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPointX, midPointY);
      ctx.lineTo(x, y); 
      ctx.stroke();
      
      lastPoint.current = { x, y };
    };

    if (e.getCoalescedEvents) {
      e.getCoalescedEvents().forEach((evt) => {
        drawSmoothLine(evt.clientX, evt.clientY);
      });
    } else {
      drawSmoothLine(e.clientX, e.clientY);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (isRightClickEraser.current) {
        isRightClickEraser.current = false;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  };

  const handleSave = async () => {
    setSaving(true);
    const toolbar = document.getElementById("wayground-toolbar");
    if(toolbar) toolbar.style.visibility = "hidden"; 

    try {
      const fullCanvas = await html2canvas(document.body, {
        useCORS: true, allowTaint: true, scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      });

      fullCanvas.toBlob((blob) => {
        onSave(blob);
        if(toolbar) toolbar.style.visibility = "visible";
        setSaving(false);
        onClose();
      }, "image/png");
    } catch (err) {
      console.error("Gagal screenshot:", err);
      if(toolbar) toolbar.style.visibility = "visible";
      setSaving(false);
    }
  };

  const getCursorStyle = () => {
    if (tool === 'eraser') return 'url(https://img.icons8.com/ios-glyphs/30/000000/eraser.png) 10 20, auto';
    if (tool === 'highlighter') return 'text'; 
    return 'crosshair';
  };

  if (!isActive) return null;

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} 
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        zIndex: 9999,
        cursor: getCursorStyle(),
        backgroundColor: "transparent"
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        onPointerCancel={stopDrawing}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
      />

      {/* --- TOOLBAR RESPONSIVE --- */}
      <div 
        id="wayground-toolbar"
        className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex align-items-center gap-2 p-2 shadow-lg bg-white"
        style={{ 
          borderRadius: "16px", 
          border: "1px solid rgba(0,0,0,0.08)", 
          zIndex: 10000,
          // Mobile Optimization:
          maxWidth: "95vw", // Maksimal 95% lebar layar HP
          overflowX: "auto", // Scroll samping jika tidak muat
          whiteSpace: "nowrap", // Tombol tidak turun ke bawah
          paddingBottom: "8px" // Sedikit ruang untuk scrollbar
        }}
      >
        <div className="d-flex gap-1 bg-light p-1 rounded-pill border flex-shrink-0">
          <OverlayTrigger overlay={<Tooltip>Pen</Tooltip>}>
            <Button variant={tool === 'pen' ? "dark" : "light"} className="rounded-circle p-2 border-0" style={{width: 38, height: 38}} onClick={() => setTool('pen')}><PenTool size={18} /></Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Stabilo</Tooltip>}>
            <Button variant={tool === 'highlighter' ? "dark" : "light"} className="rounded-circle p-2 border-0" style={{width: 38, height: 38}} onClick={() => setTool('highlighter')}><Highlighter size={18} /></Button>
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Penghapus</Tooltip>}>
            <Button variant={tool === 'eraser' ? "dark" : "light"} className="rounded-circle p-2 border-0" style={{width: 38, height: 38}} onClick={() => setTool('eraser')}><Eraser size={18} /></Button>
          </OverlayTrigger>
        </div>

        <div className="vr mx-2 opacity-25 flex-shrink-0"></div>

        <div className="d-flex gap-2 align-items-center px-1 flex-shrink-0">
            {colors.map((c) => (
                <div key={c.hex} onClick={() => { setColor(c.hex); if(tool === 'eraser') setTool('pen'); }}
                    className="rounded-circle shadow-sm"
                    style={{
                        width: 24, height: 24, backgroundColor: c.hex, // Perkecil sedikit bulatan warna
                        border: color === c.hex ? "3px solid #e5e7eb" : "2px solid white",
                        transform: color === c.hex ? "scale(1.2)" : "scale(1)", transition: "all 0.2s",
                        flexShrink: 0
                    }}
                />
            ))}
        </div>

        <div className="vr mx-2 opacity-25 flex-shrink-0"></div>

        <div className="d-flex gap-2 flex-shrink-0">
            <Button variant="light" className="rounded-circle text-danger border-0" style={{width: 38, height: 38}} onClick={clearCanvas}><Trash2 size={18} /></Button>
            <Button variant="success" className="rounded-pill px-3 fw-bold shadow-sm" onClick={handleSave} disabled={saving} style={{fontSize: '0.9rem'}}>
                {saving ? <Spinner size="sm"/> : <><Save size={16} className="me-1"/> Simpan</>}
            </Button>
            <Button variant="light" className="rounded-circle p-2 text-muted border-0" style={{width: 38, height: 38}} onClick={onClose} disabled={saving}><X size={22} /></Button>
        </div>
      </div>
      
      {/* Sembunyikan Scrollbar toolbar tapi tetap bisa discroll */}
      <style>{`
        #wayground-toolbar::-webkit-scrollbar { display: none; }
        #wayground-toolbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}