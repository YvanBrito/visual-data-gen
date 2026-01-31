import { useDraggable } from "../../hooks/useDraggable";
import { useConnection } from "../../context/ConnectionContext";
import "./styles.css";

interface CardProps {
  id: string;
  initialPosition?: { x: number; y: number };
  children?: React.ReactNode;
}

const Card = ({ id, initialPosition = { x: 50, y: 50 }, children }: CardProps) => {
  const cardRef = useDraggable(initialPosition);
  const { startConnection, completeConnection } = useConnection();

  const handlePortMouseDown = (e: React.MouseEvent, port: 'left' | 'right') => {
    e.stopPropagation(); // Evitar que o drag do card seja ativado
    
    // Calcular posição do mouse relativa ao editor
    const editor = document.querySelector('.editor') as HTMLElement;
    if (!editor) return;
    
    // Pegar o scale atual do editor
    const transform = window.getComputedStyle(editor).transform;
    let scale = 1;
    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(',').map(parseFloat);
        scale = values[0]; // scaleX
      }
    }
    
    const editorRect = editor.getBoundingClientRect();
    const mouseX = (e.clientX - editorRect.left) / scale;
    const mouseY = (e.clientY - editorRect.top) / scale;
    
    startConnection(id, port, mouseX, mouseY);
  };

  const handlePortMouseUp = (e: React.MouseEvent, port: 'left' | 'right') => {
    e.stopPropagation();
    completeConnection(id, port);
  };

  return (
    <div ref={cardRef} className="card" data-id={id}>
      {/* Círculos de conexão */}
      <div 
        className="connection-port left" 
        data-port="left"
        onMouseDown={(e) => handlePortMouseDown(e, 'left')}
        onMouseUp={(e) => handlePortMouseUp(e, 'left')}
      ></div>
      <div 
        className="connection-port right" 
        data-port="right"
        onMouseDown={(e) => handlePortMouseDown(e, 'right')}
        onMouseUp={(e) => handlePortMouseUp(e, 'right')}
      ></div>
      
      {children || <div className="card-content">Card {id}</div>}
    </div>
  );
};

export { Card };