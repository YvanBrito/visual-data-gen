import { Card, CardConnectionInfo } from "../../Card";
import { useDGStore } from "../../../context/store";

const LinePlotCard = () => {
    const sampleSize = useDGStore((state) => state.sampleSize);
    const setSample = useDGStore((state) => state.setSample);
    
    const handleInputChange = (info: CardConnectionInfo) => {
        let xArray: number[];
        let yArray: number[];
        
        // Verificar se 'x' está conectado
        if (info.connectedInputs.includes('x')) {
            const xValue = info.values.x;
            
            // Se for um array, usar diretamente; senão, repetir o valor
            if (Array.isArray(xValue)) {
                xArray = xValue;
            } else {
                xArray = Array(sampleSize).fill(xValue as number);
            }
        } else {
            xArray = Array(sampleSize).fill(info.values.x as number);
        }
        
        // Verificar se 'y' está conectado
        if (info.connectedInputs.includes('y')) {
            const yValue = info.values.y;
            
            // Se for um array, usar diretamente; senão, repetir o valor
            if (Array.isArray(yValue)) {
                yArray = yValue;
            } else {
                yArray = Array(sampleSize).fill(yValue as number);
            }
        } else {
            yArray = Array(sampleSize).fill(info.values.y as number);
        }
        
        // Garantir que ambos os arrays tenham o mesmo tamanho
        const minLength = Math.min(xArray.length, yArray.length, sampleSize);
        xArray = xArray.slice(0, minLength);
        yArray = yArray.slice(0, minLength);
        
        // Atualizar o sample no store
        setSample({ x: xArray, y: yArray });
    };
    
    return (
        <Card 
            id="line-plot-card"
            initialPosition={{ x: 4400, y: 1400 }}
            title="Line Plot"
            hasOutput={false}
            inputs={[
                { id: 'x', type: 'number', label: 'x', value: 0 },
                { id: 'y', type: 'number', label: 'y', value: 0 },
            ]}
            onInputChange={handleInputChange}
        />
    );
};

export { LinePlotCard };