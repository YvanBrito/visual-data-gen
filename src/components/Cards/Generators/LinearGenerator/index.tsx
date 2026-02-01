import { useEffect, useState, useRef } from "react";
import { Card, CardConnectionInfo, CardRef } from "../../../Card";
import { useDGStore } from "../../../../context/store";

const LinearGeneratorCard = () => {
    const setNewGenerator = useDGStore((state) => state.setNewGenerator);
    const sampleSize = useDGStore((state) => state.sampleSize);
    const [uuid] = useState(() => crypto.randomUUID()); // Inicializar UUID uma única vez
    const hasInitialized = useRef(false); // Flag para controlar inicialização
    const cardRef = useRef<CardRef>(null);
    
    const handleInputChange = (info: CardConnectionInfo) => {        
        // Processar os valores
        const start = info.values.start as number;
        const steps = info.values.steps as number;

        const randomValues: number[] = [];

        for (let i = 0; i < sampleSize; i++) {
            const startTemp = Array.isArray(start) ? start[i] : start;
            const stepsTemp = Array.isArray(steps) ? steps[i] : steps;

            if (i === 0) {
                randomValues.push(startTemp);
                continue;
            }

            const linearValue = randomValues[i-1] + stepsTemp;
            randomValues.push(linearValue);
        }
        console.log("Linear Values:");
        console.log(randomValues);
        
        // Atualizar o output do card com o array
        if (cardRef.current) {
            cardRef.current.updateOutput(randomValues);
        }
    };

    useEffect(() => {
        if (!hasInitialized.current) {
            setNewGenerator([{ id: uuid, type: 'linear', start: 0, steps: 1 }]);
            hasInitialized.current = true;
        }
    }, [uuid, setNewGenerator]); // Adicionar dependências corretas

    return (
        <Card 
            ref={cardRef}
            id={`${uuid}`}
            initialPosition={{ x: 3800, y: 1400 }}
            title="Linear Generator"
            inputs={[
                { id: 'start', type: 'number', label: 'Start', value: 0 },
                { id: 'steps', type: 'number', label: 'Steps', value: 1 },
            ]}
            onInputChange={handleInputChange}
        />
    );
};

export { LinearGeneratorCard };