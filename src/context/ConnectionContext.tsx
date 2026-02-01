import { createContext, useContext, useState, ReactNode } from 'react';
import { useDGStore } from './store';

interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
  fromPort: string;
  toPort: string;
}

interface TempConnection {
  fromId: string;
  fromPort: string;
  mouseX: number;
  mouseY: number;
}

interface CardOutputData {
  [cardId: string]: any; // Armazena o output de cada card
}

interface ConnectionContextType {
  connections: ConnectionData[];
  tempConnection: TempConnection | null;
  cardOutputs: CardOutputData;
  startConnection: (fromId: string, fromPort: string, mouseX: number, mouseY: number) => void;
  updateTempConnection: (mouseX: number, mouseY: number) => void;
  completeConnection: (toId: string, toPort: string) => void;
  cancelConnection: () => void;
  setCardOutput: (cardId: string, output: any) => void;
  getConnectedOutput: (cardId: string, inputPort: string) => any;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection deve ser usado dentro de ConnectionProvider');
  }
  return context;
};

interface ConnectionProviderProps {
  children: ReactNode;
}

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [tempConnection, setTempConnection] = useState<TempConnection | null>(null);
  const [cardOutputs, setCardOutputs] = useState<CardOutputData>({});

  const setCardOutput = (cardId: string, output: any) => {
    setCardOutputs(prev => ({
      ...prev,
      [cardId]: output
    }));
  };

  const getConnectedOutput = (cardId: string, inputPort: string): any => {
    // Encontrar a conexão que vai para este card e input
    const connection = connections.find(conn => 
      conn.toId === cardId && conn.toPort === inputPort
    );
    
    if (!connection) {
      return undefined;
    }
    
    // Retornar o output do card conectado
    return cardOutputs[connection.fromId];
  };

  const startConnection = (fromId: string, fromPort: string, mouseX: number, mouseY: number) => {
    // Remover conexões existentes deste círculo específico
    setConnections(prevConnections => 
      prevConnections.filter(conn => 
        !(conn.fromId === fromId && conn.fromPort === fromPort) &&
        !(conn.toId === fromId && conn.toPort === fromPort)
      )
    );
    
    setTempConnection({ fromId, fromPort, mouseX, mouseY });
  };

  const updateTempConnection = (mouseX: number, mouseY: number) => {
    if (tempConnection) {
      setTempConnection({ ...tempConnection, mouseX, mouseY });
    }
  };

  const completeConnection = (toId: string, toPort: string) => {
    if (!tempConnection || tempConnection.fromId === toId) {
      setTempConnection(null);
      return;
    }

    // Validar que saída (right) só conecta com entrada (input IDs)
    const fromPort = tempConnection.fromPort;
    const isFromOutput = fromPort === 'right';
    const isToOutput = toPort === 'right';
    
    // Não permitir conectar saída com saída ou entrada com entrada (mesmo card)
    if (isFromOutput === isToOutput) {
      setTempConnection(null);
      return;
    }

    // Garantir que a conexão sempre vai de saída (right) para entrada (input ID)
    let finalFromId = tempConnection.fromId;
    let finalFromPort = fromPort;
    let finalToId = toId;
    let finalToPort = toPort;

    // Se a conexão começou na entrada, inverter a direção
    if (!isFromOutput) {
      finalFromId = toId;
      finalFromPort = toPort;
      finalToId = tempConnection.fromId;
      finalToPort = fromPort;
    }

    // Remover conexões existentes dos círculos envolvidos
    const filteredConnections = connections.filter(conn => 
      !(conn.fromId === finalFromId && conn.fromPort === finalFromPort) &&
      !(conn.toId === finalToId && conn.toPort === finalToPort)
    );
    
    const newConnection: ConnectionData = {
      id: `${finalFromId}-${finalToId}-${Date.now()}`,
      fromId: finalFromId,
      toId: finalToId,
      fromPort: finalFromPort,
      toPort: finalToPort,
    };
    setConnections([...filteredConnections, newConnection]);
    setTempConnection(null);
  };

  const cancelConnection = () => {
    setTempConnection(null);
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        tempConnection,
        cardOutputs,
        startConnection,
        updateTempConnection,
        completeConnection,
        cancelConnection,
        setCardOutput,
        getConnectedOutput,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
