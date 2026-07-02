"use client";
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Eraser, Download } from "lucide-react";

export default function DrawingCanvasModal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#614eb2"); // Default primary purple
  const [brushSize, setBrushSize] = useState(5);

  const colors = [
    "#614eb2", "#ff5f9b", "#ede4a3", "#cbbeff", "#1c1b21", "#ffffff"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions to match container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath(); // Reset path so next line doesn't connect
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "mood-mural.png";
    a.click();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-full max-h-[800px] rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header toolbar */}
        <div className="flex flex-wrap items-center justify-between p-4 md:px-6 border-b border-[#e6e1ea] bg-[#fdf8ff] gap-4">
          <div className="flex flex-wrap items-center gap-4 md:space-x-6 w-full md:w-auto">
            <div className="flex justify-between w-full md:w-auto items-center">
              <h2 className="font-serif italic text-2xl font-bold text-[#1c1b21]">Mood Mural</h2>
              {/* Close button on mobile right next to title */}
              <button onClick={onClose} className="md:hidden p-2 bg-[#f1ecf5] hover:bg-[#e6e1ea] text-[#1c1b21] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tools */}
            <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-2 rounded-[24px] shadow-sm border border-[#e6e1ea] overflow-x-auto w-full md:w-auto">
              <div className="flex items-center space-x-3 shrink-0">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-black scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              
              <div className="hidden md:block w-px h-6 bg-[#e6e1ea] mx-2"></div>
              
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-20 md:w-24 accent-[#614eb2] shrink-0"
              />
              
              <div className="hidden md:block w-px h-6 bg-[#e6e1ea] mx-2"></div>

              <button onClick={() => setColor("#ffffff")} className="p-2 hover:bg-[#f1ecf5] rounded-full text-[#484552] transition-colors shrink-0" title="Eraser">
                <Eraser className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
            <button onClick={clearCanvas} className="text-[#484552] font-bold text-sm hover:text-[#ba1a1a] transition-colors">
              CLEAR
            </button>
            <button onClick={downloadArt} className="bg-[#1c1b21] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#614eb2] transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">SAVE</span>
            </button>
            <button onClick={onClose} className="hidden md:block p-2 bg-[#f1ecf5] hover:bg-[#e6e1ea] text-[#1c1b21] rounded-full transition-colors ml-4">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Drawing Area */}
        <div className="flex-grow w-full relative bg-gray-50 cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="absolute inset-0 touch-none"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
