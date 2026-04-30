import { useState, useEffect } from "react";
import emploiaFaviconBranco from "../../../img/emploia-favicon-branco@2x-1.png";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Config inicial caso mude logo após a montagem
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Coordenadas normalizadas (-1 a 1)
  const centerX = windowSize.width / 2;
  const centerY = windowSize.height / 2;
  const normX = centerX === 0 ? 0 : (mousePos.x - centerX) / centerX;
  const normY = centerY === 0 ? 0 : (mousePos.y - centerY) / centerY;

  return (
    <div style={{ fontFamily: "'Lexend Deca', sans-serif" }} className="flex min-h-screen relative overflow-hidden">

      {/* ── Painel Esquerdo ── */}
      <div
        className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{ backgroundColor: "#3F1757" }}
      >
        {/* Glow Líquido que segue o mouse (agora rastreia a tela toda) */}
        <div 
          className="absolute pointer-events-none transition-transform duration-300 ease-out"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle at center, rgba(151,234,210,0.15) 0%, rgba(203,197,234,0.1) 30%, rgba(237,106,90,0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
            opacity: 1,
            zIndex: 1,
            mixBlendMode: 'screen',
          }}
        />

        {/* Grade de pontos com Parallax */}
        <div
          className="absolute pointer-events-none z-0 transition-transform duration-700 ease-out"
          style={{
            top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
            transform: `translate(${normX * -20}px, ${normY * -20}px)`,
            backgroundImage:
              "radial-gradient(circle, rgba(203,197,234,0.18) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Anéis decorativos com níveis diferentes de Parallax */}
        <div
          className="absolute -bottom-32 -left-32 rounded-full pointer-events-none z-0 transition-transform duration-1000 ease-out"
          style={{ width: 480, height: 480, border: "1px solid rgba(151,234,210,0.12)", transform: `translate(${normX * 15}px, ${normY * 15}px)` }}
        />
        <div
          className="absolute -bottom-16 -left-16 rounded-full pointer-events-none z-0 transition-transform duration-1000 ease-out delay-75"
          style={{ width: 320, height: 320, border: "1px solid rgba(151,234,210,0.18)", transform: `translate(${normX * -10}px, ${normY * -10}px)` }}
        />
        <div
          className="absolute -top-40 -right-40 rounded-full pointer-events-none z-0 transition-transform duration-700 ease-out delay-100"
          style={{ width: 520, height: 520, border: "1px solid rgba(203,197,234,0.1)", transform: `translate(${normX * 25}px, ${normY * 25}px)` }}
        />
        <div
          className="absolute -top-20 -right-20 rounded-full pointer-events-none z-0 transition-transform duration-1000 ease-out"
          style={{ width: 320, height: 320, border: "1px solid rgba(203,197,234,0.15)", transform: `translate(${normX * 10}px, ${normY * 10}px)` }}
        />

        {/* Blob central Parallax */}
        <div
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none z-0 transition-transform duration-1000 ease-out"
          style={{
            width: 560,
            height: 560,
            transform: `translate(calc(-50% + ${normX * -30}px), calc(-50% + ${normY * -30}px))`,
            background: "radial-gradient(circle, rgba(203,197,234,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Logo branca com sutil expansão 3D */}
        <div className="relative z-10 transition-transform duration-700 ease-out" style={{ padding: "8px 0", transform: `translate(${normX * -5}px, ${normY * -5}px)` }}>
          <img
            src={emploiaFaviconBranco}
            alt="emplo.ia"
            style={{ width: 44, height: "auto" }}
            draggable={false}
          />
        </div>

        {/* Frase central Parallax suave */}
        <div className="relative z-10 transition-transform duration-700 ease-out delay-75" style={{ transform: `translate(${normX * -10}px, ${normY * -10}px)` }}>
          <h1
            className="text-white drop-shadow-lg"
            style={{
              fontFamily: "'Krona One', sans-serif",
              fontSize: "2rem",
              lineHeight: 1.25,
              maxWidth: "480px",
            }}
          >
            Plataforma de gestão de projetos customizável e inteligente.
          </h1>
        </div>

        {/* Espaço inferior vazio */}
        <div />
      </div>

      {/* ── Painel Direito ── */}
      <div
        className="flex-1 lg:w-2/5 flex flex-col items-center justify-center px-8 py-12 z-20"
        style={{ backgroundColor: "#12101A", boxShadow: "-20px 0 40px rgba(0,0,0,0.3)" }}
      >
        <div className="w-full max-w-sm space-y-8">
          {children}
        </div>
      </div>

    </div>
  );
}
