import { useDraggable } from "../../hooks/useDraggable";
import { useConnection } from "../../context/ConnectionContext";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import "./styles.css";

export interface CardInput {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  label: string;
  options?: string[]; // Para select
  value?: string | number | boolean;
}

export interface CardInputValues {
  [inputId: string]: string | number | boolean;
}

export interface CardConnectionInfo {
  values: CardInputValues;
  connectedInputs: string[]; // IDs dos inputs que têm conexão
}

export interface CardRef {
  updateOutput: (output: any) => void;
}

interface CardProps {
  id: string;
  initialPosition?: { x: number; y: number };
  title?: string;
  inputs?: CardInput[];
  hasOutput?: boolean; // Opcional, padrão true
  onInputChange?: (info: CardConnectionInfo) => void; // Callback com valores e info de conexões
  children?: React.ReactNode;
}

const INPUT_COLORS = [
  '#ef4444', // Vermelho
  '#f59e0b', // Laranja
  '#eab308', // Amarelo
  '#10b981', // Verde
  '#3b82f6', // Azul
  '#8b5cf6', // Roxo
  '#ec4899', // Rosa
];

const Card = forwardRef<CardRef, CardProps>(({ 
  id, 
  initialPosition = { x: 50, y: 50 }, 
  title,
  inputs = [],
  hasOutput = true, // Padrão true
  onInputChange,
  children 
}, ref) => {
  const cardRef = useDraggable(initialPosition);
  const { startConnection, completeConnection, connections, setCardOutput, getConnectedOutput } = useConnection();

  // Limitar a 5 entradas
  const limitedInputs = inputs.slice(0, 5);

  // Estado para armazenar os valores dos inputs
  const [inputValues, setInputValues] = useState<CardInputValues>(() => {
    const initialValues: CardInputValues = {};
    limitedInputs.forEach(input => {
      initialValues[input.id] = input.value ?? '';
    });
    return initialValues;
  });

  // Estado para armazenar o output
  const [output, setOutput] = useState<any>(null);

  // Função para atualizar o output
  const updateOutput = (newOutput: any) => {
    setOutput(newOutput);
    setCardOutput(id, newOutput);
  };

  // Expor a função updateOutput através do ref
  useImperativeHandle(ref, () => ({
    updateOutput
  }));

  // Log do output quando mudar (para debugging)
  useEffect(() => {
    if (output !== null) {
      console.log(`Card ${id} - Output atualizado:`, output);
    }
  }, [output, id]);

  // Atualizar valores e notificar pai
  const handleInputValueChange = (inputId: string, value: string | number | boolean) => {
    const newValues = { ...inputValues, [inputId]: value };
    setInputValues(newValues);
    
    // Identificar quais inputs têm conexão
    const connectedInputs = limitedInputs
      .filter(input => hasConnection(input.id))
      .map(input => input.id);
    
    onInputChange?.({
      values: newValues,
      connectedInputs
    });
  };

  // Verificar se um input tem conexão
  const hasConnection = (inputId: string) => {
    return connections.some(conn => 
      (conn.toId === id && conn.toPort === inputId)
    );
  };

  // Notificar o pai quando as conexões mudarem
  useEffect(() => {
    const connectedInputs = limitedInputs
      .filter(input => hasConnection(input.id))
      .map(input => input.id);
    
    onInputChange?.({
      values: inputValues,
      connectedInputs
    });
  }, [connections]); // Executar quando as conexões mudarem

  // Atualizar valores dos inputs quando receber dados de conexões
  useEffect(() => {
    const newValues = { ...inputValues };
    let hasChanges = false;

    limitedInputs.forEach(input => {
      if (hasConnection(input.id)) {
        const connectedOutput = getConnectedOutput(id, input.id);
        if (connectedOutput !== undefined && connectedOutput !== newValues[input.id]) {
          newValues[input.id] = connectedOutput;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setInputValues(newValues);
      
      const connectedInputs = limitedInputs
        .filter(input => hasConnection(input.id))
        .map(input => input.id);
      
      onInputChange?.({
        values: newValues,
        connectedInputs
      });
    }
  }, [connections, getConnectedOutput, id, limitedInputs, inputValues, hasConnection, onInputChange]);

  const handlePortMouseDown = (e: React.MouseEvent, port: string) => {
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

  const handlePortMouseUp = (e: React.MouseEvent, port: string) => {
    e.stopPropagation();
    completeConnection(id, port);
  };

  const renderInput = (input: CardInput) => {
    const connected = hasConnection(input.id);
    
    if (connected) {
      return <span className="input-label">{input.label}</span>;
    }

    switch (input.type) {
      case 'number':
        return (
          <>
            <input 
              type="number" 
              className="card-input" 
              value={inputValues[input.id] as number}
              onChange={(e) => handleInputValueChange(input.id, parseFloat(e.target.value) || 0)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="input-label">{input.label}</span>
          </>
        );
      case 'select':
        return (
          <>
            <select 
              className="card-input" 
              value={inputValues[input.id] as string}
              onChange={(e) => handleInputValueChange(input.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              {input.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="input-label">{input.label}</span>
          </>
        );
      case 'checkbox':
        return (
          <>
            <input 
              type="checkbox" 
              className="card-input-checkbox" 
              checked={inputValues[input.id] as boolean}
              onChange={(e) => handleInputValueChange(input.id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="input-label">{input.label}</span>
          </>
        );
      case 'text':
      default:
        return (
          <>
            <input 
              type="text" 
              className="card-input" 
              value={inputValues[input.id] as string}
              onChange={(e) => handleInputValueChange(input.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="input-label">{input.label}</span>
          </>
        );
    }
  };

  return (
    <div ref={cardRef} className="card" data-id={id}>
      {/* Título do card */}
      {title && <div className="card-title">{title}</div>}
      
      {/* Inputs com círculos de entrada */}
      {limitedInputs.length > 0 && (
        <div className="card-inputs">
          {limitedInputs.map((input, index) => (
            <div key={input.id} className="card-input-row">
              <div 
                className="connection-port input-port" 
                data-port={input.id}
                style={{ backgroundColor: INPUT_COLORS[index] }}
                onMouseDown={(e) => handlePortMouseDown(e, input.id)}
                onMouseUp={(e) => handlePortMouseUp(e, input.id)}
              ></div>
              <div className="input-field">
                {renderInput(input)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Círculo de saída (direita) - opcional */}
      {hasOutput && (
        <div 
          className="connection-port right" 
          data-port="right"
          onMouseDown={(e) => handlePortMouseDown(e, 'right')}
          onMouseUp={(e) => handlePortMouseUp(e, 'right')}
        ></div>
      )}
      
      {children && <div className="card-content">{children}</div>}
    </div>
  );
});

Card.displayName = 'Card';

export { Card };