import { create } from 'zustand'
import ChartTypes from '../constants/charts';

interface DataGeneratorState {
    chart: ChartTypes;
    generators: Array<any>;
    sampleSize: number;
    sample: {
        x: Array<number>,
        y: Array<number>
    };
    setChart: (newChart: ChartTypes) => void;
    setNewGenerator: (newGenerator: Array<any>) => void;
    setSample: (newSample: { x: Array<number>, y: Array<number> }) => void;
}

const useDGStore = create<DataGeneratorState>((set, get) => ({
    chart: ChartTypes.LINE_PLOT,
    generators: [],
    sampleSize: 50,
    sample: { x: [], y: [] },
    setChart: (newChart: ChartTypes) => set({ chart: newChart }),
    setNewGenerator: (newGenerator: any) => {
        console.log('Adding new generator:', newGenerator);
        let gen: Array<any> = [...get().generators];
        gen.push(newGenerator)
        set({ generators: [...gen] });
    },
    setSample: (newSample: { x: Array<number>, y: Array<number> }) => set({ sample: newSample }),
}))

export { useDGStore };