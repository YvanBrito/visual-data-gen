import { useState, useRef, useEffect, ReactNode } from 'react';
import './styles.css';

interface ResizablePanelProps {
  topContent: ReactNode;
  bottomContent: ReactNode;
  initialTopHeight?: number;
  minTopHeight?: number;
  minBottomHeight?: number;
}

const ResizablePanel = ({
  topContent,
  bottomContent,
  initialTopHeight = 50,
  minTopHeight = 20,
  minBottomHeight = 20,
}: ResizablePanelProps) => {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const mouseY = e.clientY - containerRect.top;
      
      // Calcular porcentagem da altura
      let newTopHeight = (mouseY / containerHeight) * 100;
      
      // Aplicar limites mínimos
      newTopHeight = Math.max(minTopHeight, Math.min(100 - minBottomHeight, newTopHeight));
      
      setTopHeight(newTopHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minTopHeight, minBottomHeight]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div ref={containerRef} className="resizable-panel-container">
      <div 
        className="resizable-panel-top" 
        style={{ height: `${topHeight}%` }}
      >
        {topContent}
      </div>
      
      <div 
        className={`resizable-divider ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resizable-divider-line" />
      </div>
      
      <div 
        className="resizable-panel-bottom" 
        style={{ height: `${100 - topHeight}%` }}
      >
        {bottomContent}
      </div>
    </div>
  );
};

export { ResizablePanel };
