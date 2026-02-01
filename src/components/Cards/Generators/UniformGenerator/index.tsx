import { useEffect, useState, useRef } from "react";
import { Card, CardConnectionInfo, CardRef } from "../../../Card";
import { useDGStore } from "../../../../context/store";

const UniformGeneratorCard = () => {
    const setNewGenerator = useDGStore((state) => state.setNewGenerator);
    const sampleSize = useDGStore((state) => state.sampleSize);
    const [uuid] = useState(() => crypto.randomUUID()); // Inicializar UUID uma única vez
    const hasInitialized = useRef(false); // Flag para controlar inicialização
    const cardRef = useRef<CardRef>(null);
    
    const handleInputChange = (info: CardConnectionInfo) => {        
        // Processar os valores
        const min = info.values.min as number;
        const max = info.values.max as number;

        // if (info.connectedInputs.includes('min')) {
        //     min = info.values.min as number;
        // }
            
        // if (info.connectedInputs.includes('max')) {}
        
        // Gerar um array de valores aleatórios baseado no sampleSize
        const randomValues: number[] = [];

        console.log(max, min);
        for (let i = 0; i < sampleSize; i++) {
            const maxTemp = Array.isArray(max) ? max[i] : max;
            const minTemp = Array.isArray(min) ? min[i] : min;
            const randomValue = Math.random() * (maxTemp - minTemp) + minTemp;
            randomValues.push(randomValue);
        }

        console.log(randomValues);
        
        // Atualizar o output do card com o array
        if (cardRef.current) {
            cardRef.current.updateOutput(randomValues);
        }
    };

    useEffect(() => {
        if (!hasInitialized.current) {
            setNewGenerator([{ id: uuid, type: 'uniform', min: 0, max: 100 }]);
            hasInitialized.current = true;
        }
    }, [uuid, setNewGenerator]); // Adicionar dependências corretas

    return (
        <Card 
            ref={cardRef}
            id={`${uuid}`}
            initialPosition={{ x: 3800, y: 1400 }}
            title="Uniform Generator"
            inputs={[
                { id: 'min', type: 'number', label: 'Min', value: 0 },
                { id: 'max', type: 'number', label: 'Max', value: 100 },
            ]}
            onInputChange={handleInputChange}
        />
    );
};

export { UniformGeneratorCard };