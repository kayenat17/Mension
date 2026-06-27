"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import InteractiveCanvas from "./InteractiveCanvas";
import VibeRadio from "./VibeRadio";
import DrawingCanvasModal from "./DrawingCanvasModal";

type BreathingStyle = "box" | "relax" | "equal";

interface PhaseConfig {
  name: string;
  duration: number; // in seconds
  instruction: string;
}

export default function BreathingPacer() {
  const [breathingStyle, setBreathingStyle] = useState<BreathingStyle>("box");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);

  // --- BURN BOOK / INCINERATOR STATE ---
  const [burnText, setBurnText] = useState("");
  const [isBurning, setIsBurning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const intensityRef = useRef<number>(1.0);
  const [showShader, setShowShader] = useState(false);

  // Breathing Configurations
  const configs: Record<BreathingStyle, PhaseConfig[]> = {
    box: [
      { name: "Inhale", duration: 4, instruction: "Breathe in slowly..." },
      { name: "Hold", duration: 4, instruction: "Pause and settle..." },
      { name: "Exhale", duration: 4, instruction: "Exhale fully..." },
      { name: "Hold", duration: 4, instruction: "Pause before next breath..." },
    ],
    relax: [
      { name: "Inhale", duration: 4, instruction: "Breathe in gentleness..." },
      { name: "Hold", duration: 7, instruction: "Hold and let the calm absorb..." },
      { name: "Exhale", duration: 8, instruction: "Exhale all tension..." },
    ],
    equal: [
      { name: "Inhale", duration: 5, instruction: "Breathe in deeply..." },
      { name: "Exhale", duration: 5, instruction: "Breathe out slowly..." },
    ],
  };

  const currentPhases = configs[breathingStyle];
  const activePhase = currentPhases[currentPhaseIndex];

  // Sync timer when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            const nextIndex = (currentPhaseIndex + 1) % currentPhases.length;
            setCurrentPhaseIndex(nextIndex);
            return currentPhases[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentPhaseIndex, breathingStyle, currentPhases]);

  // Handle changing style
  const handleStyleChange = (style: BreathingStyle) => {
    setIsPlaying(false);
    setBreathingStyle(style);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(configs[style][0].duration);
  };

  const resetPacer = () => {
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    setSecondsRemaining(configs[breathingStyle][0].duration);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  // Background parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const blobs = document.querySelectorAll('.calm-blob') as NodeListOf<HTMLElement>;
      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 20;
        blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // WebGL Shader Effect for Incinerator
  useEffect(() => {
    if (!showShader) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float time;
      uniform vec2 resolution;
      uniform float intensity;
      varying vec2 vUv;

      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
              value += amplitude * noise(st);
              st *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void main() {
          vec2 st = gl_FragCoord.xy / resolution.xy;
          st.x *= resolution.x / resolution.y;

          vec2 q = vec2(0.);
          q.x = fbm(st + 0.00 * time);
          q.y = fbm(st + vec2(1.0));

          vec2 r = vec2(0.);
          r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * time);
          r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * time);

          float f = fbm(st + r);

          // Pinkish/Magenta fire colors
          vec3 color = mix(
              vec3(0.1, 0.0, 0.1),
              vec3(0.9, 0.1, 0.5),
              clamp((f * f) * 4.0, 0.0, 1.0)
          );

          color = mix(
              color,
              vec3(1.0, 0.8, 0.9),
              clamp(length(q), 0.0, 1.0)
          );

          color = mix(
              color,
              vec3(1.0, 0.9, 1.0),
              clamp(length(r.x), 0.0, 1.0)
          );

          gl_FragColor = vec4((f * f * f + .6 * f * f + .5 * f) * color * intensity, 1.0);
      }
    `;

    // Compile shader helper
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "time");
    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    const intensityLocation = gl.getUniformLocation(program, "intensity");

    let startTime = Date.now();
    let animationFrameId: number;

    const render = () => {
      const currentTime = Date.now();
      gl.uniform1f(timeLocation, (currentTime - startTime) / 1000.0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(intensityLocation, intensityRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showShader]);

  const handleIncinerate = () => {
    setIsBurning(true);
    setShowShader(true);
    
    // Play crackle sound
    try {
      const audio = new Audio("https://cdn.pixabay.com/audio/2022/02/11/audio_1cd613cf5d.mp3"); // Fire crackle
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play failed:", e));
    } catch(e) {}

    // Animate intensity
    intensityRef.current = 0.0;
    let upInterval = setInterval(() => {
      if (intensityRef.current < 2.0) {
        intensityRef.current += 0.05;
      }
    }, 50);

    setTimeout(() => {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (intensityRef.current > 0.0) {
          intensityRef.current -= 0.05;
        } else {
          clearInterval(downInterval);
          setBurnText(""); // Clear the text
          setIsBurning(false);
          setShowShader(false);
        }
      }, 50);
    }, 4000);
  };


  return (
    <div className="bg-[#fdf8ff] text-[#1c1b21] font-sans min-h-screen flex flex-col overflow-x-hidden relative pb-32">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        .glow-lavender { box-shadow: 0 0 30px 5px rgba(157, 138, 242, 0.25); }
        .glow-pink { box-shadow: 0 0 30px 5px rgba(185, 7, 96, 0.15); }
        .glow-yellow { box-shadow: 0 0 30px 5px rgba(237, 228, 163, 0.3); }
        
        .calm-blob {
            position: fixed;
            z-index: 0;
            filter: blur(60px);
            opacity: 0.5;
            animation: blob-move 20s infinite alternate;
        }
        @keyframes blob-move {
            from { transform: translate(0, 0) scale(1); }
            to { transform: translate(50px, 100px) scale(1.1); }
        }
        
        .breathing-circle-outer {
            background: linear-gradient(135deg, #e6deff 0%, #ffd9e2 50%, #ede4a3 100%);
            animation: pulse-ring 4s ease-in-out infinite;
        }
        @keyframes pulse-ring {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(157, 138, 242, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 50px 20px rgba(157, 138, 242, 0.2); }
        }
        .breathing-circle-inner {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(8px);
        }
        
        .btn-pink-shadow {
            box-shadow: 0 10px 0 0 #8e0048;
        }
        .btn-pink-shadow:active {
            transform: translateY(4px);
            box-shadow: 0 6px 0 0 #8e0048;
        }

        .mural-gradient {
            background: linear-gradient(45deg, #e6deff, #ffd9e2, #ede4a3, #cbbeff);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
        }
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .incinerator-theme {
            --primary: 185, 0, 104;
            --background: #11010a;
            --surface: #290616;
            --outline: #755564;
        }
        .is-burning {
            animation: burn-shake 0.1s infinite;
        }
        @keyframes burn-shake {
            0% { transform: translate(1px, 1px) rotate(-1deg); }
            50% { transform: translate(-1px, -2px) rotate(0deg); }
            100% { transform: translate(1px, 2px) rotate(-1deg); }
        }
      `}} />

      {/* Background Blobs */}
      <div className="calm-blob w-96 h-96 bg-[#cbbeff] rounded-full top-[-10%] left-[-5%]"></div>
      <div className="calm-blob w-[500px] h-[500px] bg-[#ffd9e2] rounded-full bottom-[-10%] right-[-5%]" style={{animationDelay: "-5s"}}></div>
      <div className="calm-blob w-80 h-80 bg-[#ede4a3] rounded-full top-[40%] right-[10%]" style={{animationDelay: "-10s"}}></div>

      <main className="flex-grow pt-8 md:pt-12 px-4 md:px-16 max-w-[1440px] mx-auto w-full relative z-10 space-y-8">
        
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-4 mb-4 bg-white/40 p-4 rounded-3xl backdrop-blur-sm border border-white/50">
            <span className="material-symbols-outlined text-[#b90760] text-4xl animate-bounce">energy_savings_leaf</span>
            <h1 className="font-serif italic text-5xl md:text-6xl font-extrabold text-[#1c1b21] tracking-tight">Calm Sanctuary</h1>
          </div>
          <p className="font-sans text-lg text-[#1c1b21] font-medium max-w-xl mx-auto">
            Explore a multisensory escape. Breathe, ground, create, and listen.
          </p>
        </section>

        {/* Row 1: Breathing & Grounding */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Breathing Exercise */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-[32px] p-8 md:p-10 glow-lavender h-full flex flex-col items-center">
              {/* Tab Switcher */}
              <div className="flex p-1.5 bg-[#f1ecf5]/50 rounded-full mb-12 w-full">
                {(["box", "relax", "equal"] as BreathingStyle[]).map(style => (
                  <button 
                    key={style}
                    onClick={() => handleStyleChange(style)}
                    className={`flex-1 py-3 rounded-full font-bold text-sm transition-all capitalize ${breathingStyle === style ? 'bg-white shadow-md text-[#614eb2]' : 'text-[#484552] hover:bg-white/40'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              {/* Dynamic Breathing Circle */}
              <div className="flex-grow flex flex-col items-center justify-center w-full py-8 relative">
                <div className={`w-64 h-64 md:w-72 md:h-72 rounded-full p-2 breathing-circle-outer transition-transform duration-1000 ${isPlaying && activePhase.name === 'Inhale' ? 'scale-110' : (isPlaying && activePhase.name === 'Exhale' ? 'scale-90' : 'scale-100')}`}>
                  <div className="w-full h-full rounded-full breathing-circle-inner flex items-center justify-center flex-col">
                    <span className="font-serif italic text-2xl text-[#484552] font-medium">{activePhase.name}</span>
                    <span className="font-serif text-7xl text-[#614eb2] font-bold">{secondsRemaining}s</span>
                  </div>
                </div>

                <div className="mt-12 text-center h-16">
                  <p className="font-serif italic text-2xl text-[#1c1b21] font-semibold mb-2">{activePhase.instruction}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-6 mt-4 w-full">
                <button 
                  onClick={togglePlay}
                  className="flex-grow bg-[#b90760] text-white py-5 rounded-3xl font-extrabold flex items-center justify-center space-x-3 text-lg btn-pink-shadow transition-all"
                >
                  {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6" />}
                  <span>{isPlaying ? 'PAUSE BREATHING' : 'START BREATHING'}</span>
                </button>
                <button onClick={resetPacer} className="w-16 h-16 rounded-3xl bg-white border-2 border-[#c9c4d4]/30 flex items-center justify-center hover:bg-[#ede4a3] transition-all active:scale-90 shadow-sm text-[#484552]">
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Grounding Exercise */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-[32px] p-8 md:p-10 glow-pink h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="font-serif italic text-3xl font-bold text-[#1c1b21] mb-1">5-4-3-2-1 Grounding</h2>
                  <p className="font-sans text-[#484552] font-medium">Anchor yourself in the present moment.</p>
                </div>
                <button className="text-sm text-[#1c1b21] font-bold border-2 border-[#1c1b21] px-6 py-2 rounded-2xl hover:bg-[#1c1b21] hover:text-white transition-all">
                  CLEAR ALL
                </button>
              </div>

              <div className="space-y-4">
                {/* Sight */}
                <div className="p-5 rounded-3xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#e6deff] flex items-center justify-center text-xl shadow-inner">👀</div>
                    <span className="font-serif text-xl text-[#1c1b21] font-semibold">5 things you see</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(i => <input key={i} className="bg-[#fdf8ff]/50 border-2 border-transparent rounded-2xl text-center font-bold focus:ring-4 focus:ring-[#9d8af2] focus:border-[#9d8af2] p-2.5 text-[#484552] placeholder:text-[#c9c4d4]" placeholder={`#${i}`} type="text"/>)}
                  </div>
                </div>

                {/* Feel */}
                <div className="p-5 rounded-3xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffd9e2] flex items-center justify-center text-xl shadow-inner">🙌</div>
                    <span className="font-serif text-xl text-[#1c1b21] font-semibold">4 things you feel</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(i => <input key={i} className="bg-[#fdf8ff]/50 border-2 border-transparent rounded-2xl text-center font-bold focus:ring-4 focus:ring-[#ff5f9b] focus:border-[#ff5f9b] p-2.5 text-[#484552] placeholder:text-[#c9c4d4]" placeholder={`#${i}`} type="text"/>)}
                  </div>
                </div>

                {/* 3, 2, 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-3xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all shadow-sm md:col-span-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#ede4a3] flex items-center justify-center text-lg">👂</div>
                      <span className="font-serif text-md text-[#1c1b21] font-semibold">3 Sounds</span>
                    </div>
                    <div className="space-y-1.5">
                      {[1, 2, 3].map(i => <input key={i} className="w-full bg-[#fdf8ff]/40 border-none rounded-xl font-bold p-2 text-xs" placeholder={`#${i}`} type="text"/>)}
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all shadow-sm md:col-span-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#e6deff] flex items-center justify-center text-lg">👃</div>
                      <span className="font-serif text-md text-[#1c1b21] font-semibold">2 Smells</span>
                    </div>
                    <div className="space-y-1.5">
                      {[1, 2].map(i => <input key={i} className="w-full bg-[#fdf8ff]/40 border-none rounded-xl font-bold p-2 text-xs" placeholder={`#${i}`} type="text"/>)}
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all shadow-sm md:col-span-1 flex flex-col">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#ffd9e2] flex items-center justify-center text-lg">👅</div>
                      <span className="font-serif text-md text-[#1c1b21] font-semibold">1 Taste</span>
                    </div>
                    <input className="w-full flex-grow bg-[#fdf8ff]/40 border-none rounded-xl font-bold p-2 text-xs" placeholder="Sweet?" type="text"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Mood Mural & Vibe Radio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Mood Mural (Canvas) */}
          <div className="lg:col-span-8">
            <div className="glass-card rounded-[32px] p-8 md:p-10 glow-yellow relative overflow-hidden h-full group">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="material-symbols-outlined text-[#614eb2] text-3xl">palette</span>
                  <h2 className="font-serif italic text-3xl font-bold text-[#1c1b21]">Mood Mural</h2>
                </div>
                <p className="font-sans text-[#484552] font-medium mb-8 max-w-md">Paint your feelings. A digital canvas for abstract expression when words aren't enough.</p>
                
                <div className="flex-grow w-full rounded-3xl mural-gradient border-4 border-white/80 shadow-2xl relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop')" }}></div>
                  <button 
                    onClick={() => setIsDrawingModalOpen(true)}
                    className="relative z-10 bg-white/90 backdrop-blur-md text-[#1c1b21] font-bold px-10 py-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center space-x-2"
                  >
                    <span className="material-symbols-outlined">gesture</span>
                    <span>INTERACT WITH CANVAS</span>
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 text-[#484552]/10 hidden md:block pointer-events-none">
                <span className="material-symbols-outlined text-[120px] rotate-12">draw</span>
              </div>
            </div>
          </div>

          {/* Vibe Radio */}
          <div className="lg:col-span-4">
            <VibeRadio />
          </div>

        </div>

        {/* Row 3: Incinerator */}
        <section className="incinerator-theme rounded-[32px] overflow-hidden relative border border-[#11010a] shadow-[0_8px_32px_rgba(185,0,104,0.15)] min-h-[500px] flex items-center justify-center mt-12 bg-[#11010a]">
          {/* WEBGL FLAME SHADER LAYER */}
          <div className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-1000 ${showShader ? 'opacity-100' : 'opacity-0'}`}>
            <canvas ref={canvasRef} className="w-full h-full" id="shader-canvas"></canvas>
          </div>

          <div className="relative z-30 w-full max-w-4xl flex flex-col items-center p-6 py-12">
            
            <div 
              className={`w-full bg-[#fdfcf0] shadow-[12px_12px_0_0_rgba(0,0,0,0.6)] p-8 md:p-12 rotate-[-1deg] relative overflow-hidden group border-x border-[#755564]/30 z-40 ${isBurning ? 'is-burning' : ''}`}
              style={{ backgroundImage: "repeating-linear-gradient(#fdfcf0 0px, #fdfcf0 31px, #e3bdc7 32px)", backgroundSize: "100% 32px" }}
            >
              {/* Header */}
              <div className="mb-6 text-center relative z-10">
                <h3 className="font-serif italic text-4xl uppercase text-[#b90068] mb-1 drop-shadow-sm font-bold">THE INCINERATOR</h3>
                <p className="font-sans text-xs text-[#484552] tracking-widest uppercase font-bold">Release the heat. Burn the drama.</p>
              </div>

              {/* Text Area */}
              <div className="relative w-full z-10">
                <textarea 
                  value={burnText}
                  onChange={(e) => setBurnText(e.target.value)}
                  placeholder="Type your intrusive thoughts, the angry text you shouldn't send, or whatever is weighing you down here..."
                  disabled={isBurning}
                  className="w-full h-48 bg-transparent border-none focus:ring-0 font-serif text-lg text-[#290616] placeholder:text-[#290616]/40 resize-none leading-[32px] outline-none"
                ></textarea>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#b90068]/30 rounded-tr-xl pointer-events-none"></div>
              </div>

              {/* Action Button */}
              <div className="mt-8 flex flex-col items-center gap-4 relative z-10">
                <button 
                  onClick={handleIncinerate}
                  disabled={isBurning || !burnText.trim()}
                  className="group relative px-8 py-4 bg-[#b90068] text-white font-serif text-xl font-bold uppercase tracking-tighter shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 rotate-[1deg] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    INCINERATE
                    <span className="material-symbols-outlined burn-effect">local_fire_department</span>
                  </span>
                </button>
                <span className="font-sans text-[10px] text-[#755564] font-bold uppercase animate-pulse">Destructive action permanent</span>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      {isDrawingModalOpen && (
        <DrawingCanvasModal onClose={() => setIsDrawingModalOpen(false)} />
      )}
    </div>
  );
}
