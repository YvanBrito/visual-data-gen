import { useDGStore } from "../../context/store";
import { useDragScroll } from "../../hooks/useDragScroll";
import { useConnection } from "../../context/ConnectionContext";
import { Card } from "../Card";
import { Connection } from "../Connection";
import { TempConnection } from "../TempConnection";
import { ContextMenu, ContextMenuItem } from "../ContextMenu";
import { useState } from "react";
import "./styles.css";

const Editor = () => {
    const scrollRef = useDragScroll();
    const generateSample = useDGStore((state) => state.generateSample);
    const { connections } = useConnection();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const contextMenuItems: ContextMenuItem[] = [
        {
            label: 'Adicionar Card',
            icon: '➕',
            onClick: () => {
                console.log('Adicionar novo card');
                // Implementar lógica para adicionar card
            }
        },
        {
            label: 'Gerar Dados',
            icon: '🎲',
            onClick: () => {
                generateSample();
            }
        },
        { divider: true } as ContextMenuItem,
        {
            label: 'Limpar Tudo',
            icon: '🗑️',
            onClick: () => {
                console.log('Limpar tudo');
                // Implementar lógica para limpar
            }
        },
        {
            label: 'Resetar Zoom',
            icon: '🔍',
            onClick: () => {
                console.log('Resetar zoom');
                // Implementar lógica para resetar zoom
            }
        },
        { divider: true } as ContextMenuItem,
        {
            label: 'Exportar',
            icon: '💾',
            onClick: () => {
                console.log('Exportar');
            },
            disabled: true
        }
    ];
    
    return (
    <div ref={scrollRef} className="wrapper-editor" onContextMenu={handleContextMenu}>
        <button onClick={generateSample}>Generate Sample Data</button>
        <div className="editor">
            {/* Renderizar todas as conexões */}
            {connections.map((conn) => (
                <Connection 
                    key={conn.id}
                    fromId={conn.fromId} 
                    toId={conn.toId} 
                    fromPort={conn.fromPort}
                    toPort={conn.toPort}
                />
            ))}
            
            {/* Conexão temporária durante drag */}
            <TempConnection />
                
            <Card id="1" initialPosition={{ x: 3800, y: 1400 }}>
                <h3>Card 1</h3>
                <p>Arraste-me!</p>
            </Card>
            
            <Card id="2" initialPosition={{ x: 4100, y: 1450 }}>
                <h3>Card 2</h3>
                <p>Eu também!</p>
            </Card>
            
            <Card id="3" initialPosition={{ x: 4400, y: 1500 }}>
                <h3>Card 3</h3>
                <p>E eu!</p>
            </Card>
        </div>
        
        {/* Context Menu */}
        {contextMenu && (
            <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={contextMenuItems}
                onClose={() => setContextMenu(null)}
            />
        )}
    </div>
    )
}

export { Editor };