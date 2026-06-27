"use client";
import React, { useEffect, useRef, useState } from 'react';

export default function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to match container size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();

    let particles: Array<{ x: number, y: number, r: number, a: number, color: string, vx: number, vy: number, life: number, maxLife: number }> = [];
    let mouse = { x: -1000, y: -1000 };

    const colors = ['#e9ddff', '#d0bcff', '#ffe24c', '#fcdf46', '#ffffff'];

    const updateMousePos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      
      // Create burst on move
      for (let i = 0; i < 3; i++) {
        createParticle(mouse.x, mouse.y);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setIsInteracting(true);
      updateMousePos(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      setIsInteracting(true);
      updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleMouseLeave = () => {
      setIsInteracting(false);
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    function createParticle(x: number, y: number) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2;
      particles.push({
        x: x,
        y: y,
        r: Math.random() * 15 + 5,
        a: 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 40 + 20
      });
    }

    function animate() {
      if (!ctx) return;
      if (!canvas) return;
      // Gentle fade out effect
      ctx.fillStyle = 'rgba(252, 249, 248, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const progress = p.life / p.maxLife;
        const opacity = Math.max(0, p.a * (1 - progress));
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + (progress * 15), 0, Math.PI * 2);
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          i--;
        }
      }

      // Add ambient particles if interacting
      if (isInteracting && Math.random() < 0.2) {
        createParticle(Math.random() * canvas.width, Math.random() * canvas.height);
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isInteracting]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full mix-blend-multiply z-10"
        style={{ background: 'transparent' }}
      />
      
      {/* Hide the prompt button smoothly when interacting */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700 z-20 ${isInteracting ? 'opacity-0' : 'opacity-100'}`}>
        <button className="bg-white/90 backdrop-blur-md text-[#1c1b21] font-bold px-10 py-4 rounded-full shadow-xl flex items-center space-x-2 animate-pulse">
          <span className="material-symbols-outlined">gesture</span>
          <span>HOVER OR SWIPE TO PAINT</span>
        </button>
      </div>
    </div>
  );
}
