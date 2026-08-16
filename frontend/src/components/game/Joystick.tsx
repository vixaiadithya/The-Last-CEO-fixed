import React, { useRef, useState } from 'react';

export const Joystick: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setActive(true);
    updatePosition(e.clientX, e.clientY);
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!active) return;
    updatePosition(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    window.dispatchEvent(new CustomEvent('joystickMove', { detail: { x: 0, y: 0 } }));
    if (e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    setPos({ x: deltaX, y: deltaY });

    const normalizedX = deltaX / maxRadius;
    const normalizedY = deltaY / maxRadius;
    window.dispatchEvent(new CustomEvent('joystickMove', { detail: { x: normalizedX, y: normalizedY } }));
  };

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-6 left-6 w-20 h-20 rounded-full border-2 border-cyan-500/30 bg-slate-900/50 backdrop-blur-md z-50 touch-none flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div 
        ref={knobRef}
        className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] pointer-events-none transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      />
    </div>
  );
};
