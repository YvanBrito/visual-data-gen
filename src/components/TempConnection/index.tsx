import { useEffect } from 'react';
import { useConnection } from '../../context/ConnectionContext';

const TempConnection = () => {
  const { tempConnection, updateTempConnection, cancelConnection } = useConnection();

  useEffect(() => {
    if (!tempConnection) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Pegar posição do editor
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
      
      // Posição do mouse relativa ao editor, compensando o scale
      const mouseX = (e.clientX - editorRect.left) / scale;
      const mouseY = (e.clientY - editorRect.top) / scale;
      
      updateTempConnection(mouseX, mouseY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Verificar se soltou em um círculo de conexão
      const target = e.target as HTMLElement;
      if (!target.classList.contains('connection-port')) {
        cancelConnection();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [tempConnection, updateTempConnection, cancelConnection]);

  if (!tempConnection) return null;

  // Buscar posição do círculo de origem
  const fromCard = document.querySelector(`[data-id="${tempConnection.fromId}"]`) as HTMLElement;
  if (!fromCard) return null;

  const fromCircle = fromCard.querySelector(`[data-port="${tempConnection.fromPort}"]`) as HTMLElement;
  if (!fromCircle) return null;

  const editor = fromCard.offsetParent as HTMLElement;
  if (!editor) return null;

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

  const fromCircleRect = fromCircle.getBoundingClientRect();
  const editorRect = editor.getBoundingClientRect();

  const from = {
    x: (fromCircleRect.left + fromCircleRect.width / 2 - editorRect.left) / scale,
    y: (fromCircleRect.top + fromCircleRect.height / 2 - editorRect.top) / scale
  };

  const to = {
    x: tempConnection.mouseX,
    y: tempConnection.mouseY
  };

  const dx = to.x - from.x;
  const distance = Math.abs(dx);
  const curveIntensity = Math.min(distance * 0.5, 200);

  const cp1x = from.x + curveIntensity;
  const cp1y = from.y;
  const cp2x = to.x - curveIntensity;
  const cp2y = to.y;

  const pathData = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

  // Definir cor baseada no tipo de porta de origem
  // Branco para saída (right), cinza para entradas
  const strokeColor = tempConnection.fromPort === 'right' ? '#ffffff' : '#94a3b8';

  return (
    <svg className="connection-svg">
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="5,5"
        opacity={0.6}
      />
    </svg>
  );
};

export { TempConnection };
