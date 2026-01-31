import { createContext, useContext, useState, ReactNode } from 'react';

interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
  fromPort: 'left' | 'right';
  toPort: 'left' | 'right';
}

interface TempConnection {
  fromId: string;
  fromPort: 'left' | 'right';
  mouseX: number;
  mouseY: number;
}

interface ConnectionContextType {
  connections: ConnectionData[];
  tempConnection: TempConnection | null;
  startConnection: (fromId: string, fromPort: 'left' | 'right') => void;
  updateTempConnection: (mouseX: number, mouseY: number) => void;
  completeConnection: (toId: string, toPort: 'left' | 'right') => void;
  cancelConnection: () => void;
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

  const startConnection = (fromId: string, fromPort: 'left' | 'right') => {
    // Remover conexões existentes deste círculo específico
    setConnections(prevConnections => 
      prevConnections.filter(conn => 
        !(conn.fromId === fromId && conn.fromPort === fromPort) &&
        !(conn.toId === fromId && conn.toPort === fromPort)
      )
    );
    setTempConnection({ fromId, fromPort, mouseX: 0, mouseY: 0 });
  };

  const updateTempConnection = (mouseX: number, mouseY: number) => {
    if (tempConnection) {
      setTempConnection({ ...tempConnection, mouseX, mouseY });
    }
  };

  const completeConnection = (toId: string, toPort: 'left' | 'right') => {
    if (!tempConnection || tempConnection.fromId === toId) {
      setTempConnection(null);
      return;
    }

    // Validar que entrada (left) só conecta com saída (right) e vice-versa
    const fromPort = tempConnection.fromPort;
    
    // Se ambos forem do mesmo tipo (ambos entrada ou ambos saída), não permitir
    if (fromPort === toPort) {
      setTempConnection(null);
      return;
    }

    // Garantir que a conexão sempre vai de saída (right) para entrada (left)
    let finalFromId = tempConnection.fromId;
    let finalFromPort = fromPort;
    let finalToId = toId;
    let finalToPort = toPort;

    // Se a conexão começou na entrada (left), inverter a direção
    if (fromPort === 'left') {
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
        startConnection,
        updateTempConnection,
        completeConnection,
        cancelConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
