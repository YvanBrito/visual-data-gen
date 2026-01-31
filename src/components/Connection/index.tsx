import { useEffect, useState, useRef } from 'react';
import './styles.css';

interface ConnectionProps {
  fromId: string;
  toId: string;
  fromPort?: 'left' | 'right' | 'top' | 'bottom';
  toPort?: 'left' | 'right' | 'top' | 'bottom';
  color?: string;
  strokeWidth?: number;
}

const Connection = ({ 
  fromId, 
  toId,
  fromPort = 'right',
  toPort = 'left',
  color = '#3b82f6', // Azul por padrão (saída -> entrada)
  strokeWidth = 2 
}: ConnectionProps) => {
  const [path, setPath] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updatePath = () => {
      const fromCard = document.querySelector(`[data-id="${fromId}"]`) as HTMLElement;
      const toCard = document.querySelector(`[data-id="${toId}"]`) as HTMLElement;

      if (!fromCard || !toCard) return;

      // Buscar os círculos de conexão
      const fromCircle = fromCard.querySelector(`[data-port="${fromPort}"]`) as HTMLElement;
      const toCircle = toCard.querySelector(`[data-port="${toPort}"]`) as HTMLElement;

      if (!fromCircle || !toCircle) return;

      // Pegar o container .editor
      const editor = fromCard.offsetParent as HTMLElement;
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

      // Usar getBoundingClientRect para pegar posições reais (com transform)
      const fromCircleRect = fromCircle.getBoundingClientRect();
      const toCircleRect = toCircle.getBoundingClientRect();
      const editorRect = editor.getBoundingClientRect();

      // Calcular posição central do círculo de origem relativo ao editor
      // Dividir por scale para compensar o transform do editor
      const from = {
        x: (fromCircleRect.left + fromCircleRect.width / 2 - editorRect.left) / scale,
        y: (fromCircleRect.top + fromCircleRect.height / 2 - editorRect.top) / scale
      };

      // Calcular posição central do círculo de destino relativo ao editor
      const to = {
        x: (toCircleRect.left + toCircleRect.width / 2 - editorRect.left) / scale,
        y: (toCircleRect.top + toCircleRect.height / 2 - editorRect.top) / scale
      };

      // Calcular distância horizontal para ajustar a curva
      const dx = to.x - from.x;
      const distance = Math.abs(dx);

      // Controlar a curvatura baseado na distância
      const curveIntensity = Math.min(distance * 0.5, 200);

      // Pontos de controle para criar curva em S
      const cp1x = from.x + curveIntensity;
      const cp1y = from.y;
      const cp2x = to.x - curveIntensity;
      const cp2y = to.y;

      // Criar path SVG com curva Bézier cúbica
      const pathData = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
      setPath(pathData);
    };

    // Atualizar inicialmente
    updatePath();

    // Observer para detectar mudanças de estilo (drag de cards)
    const observer = new MutationObserver(updatePath);
    const fromCard = document.querySelector(`[data-id="${fromId}"]`) as HTMLElement;
    const toCard = document.querySelector(`[data-id="${toId}"]`) as HTMLElement;
    const editor = fromCard?.closest('.editor') as HTMLElement;
    
    if (fromCard) {
      observer.observe(fromCard, { 
        attributes: true, 
        attributeFilter: ['style'] 
      });
    }
    if (toCard) {
      observer.observe(toCard, { 
        attributes: true, 
        attributeFilter: ['style'] 
      });
    }
    // Observar também mudanças no editor (zoom)
    if (editor) {
      observer.observe(editor, {
        attributes: true,
        attributeFilter: ['style']
      });
    }

    // Atualizar quando a janela redimensionar
    window.addEventListener('resize', updatePath);

    return () => {
      window.removeEventListener('resize', updatePath);
      observer.disconnect();
    };
  }, [fromId, toId, fromPort, toPort]);

  if (!path) return null;

  return (
    <svg ref={svgRef} className="connection-svg">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

export { Connection };