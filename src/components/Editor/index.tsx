import { useDGStore } from "../../context/store";
import { useDragScroll } from "../../hooks/useDragScroll";
import { useConnection } from "../../context/ConnectionContext";
import { Connection } from "../Connection";
import { TempConnection } from "../TempConnection";
import { ContextMenu, ContextMenuItem } from "../ContextMenu";
import { useState } from "react";
import "./styles.css";
import { LinePlotCard } from "../Cards/LinePlot";
import { UniformGeneratorCard } from "../Cards/Generators/UniformGenerator";
import { LinearGeneratorCard } from "../Cards/Generators/LinearGenerator";

const Editor = () => {
    const scrollRef = useDragScroll();
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
                console.log('Gerar dados');
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
        <button onClick={() => console.log('Generate Sample Data clicked')}>Generate Sample Data</button>
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
            
            <LinearGeneratorCard />
            <UniformGeneratorCard />
            <UniformGeneratorCard />
            <UniformGeneratorCard />
            <LinePlotCard />

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