import { useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDraggable = (initialPosition: Position = { x: 0, y: 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const position = useRef(initialPosition);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Aplicar posição inicial
    element.style.position = 'relative';
    element.style.left = `${position.current.x}px`;
    element.style.top = `${position.current.y}px`;
    element.style.userSelect = 'none'; // Prevenir seleção de texto

    const handleMouseDown = (e: MouseEvent) => {
      // Ignorar se clicar em um círculo de conexão
      const target = e.target as HTMLElement;
      if (target.classList.contains('connection-port')) {
        return;
      }
      
      isDragging.current = true;
      element.style.cursor = 'grabbing';
      element.style.zIndex = '1000';
      
      // Pegar o scale atual do editor
      const editor = element.offsetParent as HTMLElement;
      const transform = window.getComputedStyle(editor).transform;
      let scale = 1;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(',').map(parseFloat);
          scale = values[0]; // scaleX
        }
      }
      
      // Calcular offset entre o mouse e a posição atual do elemento
      // Multiplicar a posição pelo scale para compensar
      offset.current = {
        x: e.clientX - (position.current.x * scale),
        y: e.clientY - (position.current.y * scale)
      };

      e.stopPropagation(); // Prevenir que o scroll do editor seja ativado
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      e.preventDefault();
      
      // Pegar o scale atual do editor
      const editor = element.offsetParent as HTMLElement;
      const transform = window.getComputedStyle(editor).transform;
      let scale = 1;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(',').map(parseFloat);
          scale = values[0]; // scaleX
        }
      }
      
      // Calcular nova posição dividindo pelo scale para compensar o zoom
      position.current = {
        x: (e.clientX - offset.current.x) / scale,
        y: (e.clientY - offset.current.y) / scale
      };
      
      element.style.left = `${position.current.x}px`;
      element.style.top = `${position.current.y}px`;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      element.style.cursor = 'grab';
      element.style.zIndex = 'auto';
    };

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return ref;
};