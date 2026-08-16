import { useEffect, useRef } from 'react';

export const CursorTrail = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  
  // Keep track of the actual mouse position
  const mousePos = useRef({ x: 0, y: 0 });
  // Keep track of the dot's current position
  const dotPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      // Ease the dot towards the mouse
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.15;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={dotRef} 
      className="fixed top-0 left-0 w-3 h-3 rounded-full bg-cyan-400/40 blur-[2px] pointer-events-none z-[9999]"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform'
      }}
    />
  );
};
