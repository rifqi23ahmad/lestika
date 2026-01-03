import React, { useState, useEffect, useRef } from "react";

export default function InvoicePreviewWrapper({ children }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState("auto");

  useEffect(() => {
    const calculateScale = () => {
      const INVOICE_WIDTH = 800; 
      const SCREEN_PADDING = 40; 
      const screenWidth = window.innerWidth;

      if (screenWidth < INVOICE_WIDTH + SCREEN_PADDING) {
        const newScale = (screenWidth - SCREEN_PADDING) / INVOICE_WIDTH;
        setScale(newScale);
      } else {
        setScale(1);
      }
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const visualHeight = contentRef.current.offsetHeight * scale;
      setWrapperHeight(`${visualHeight}px`);
    }
  }, [scale, children]);

  return (
    <div 
      className="d-flex justify-content-center w-100 bg-light py-3 overflow-hidden"
      ref={wrapperRef}
      style={{ minHeight: "500px" }} 
    >
      <div
        style={{
          width: scale < 1 ? "100%" : "800px",
          height: wrapperHeight,
          position: "relative",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          ref={contentRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            minWidth: "800px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}