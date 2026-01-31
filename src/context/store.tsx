import { create } from 'zustand'
import ChartTypes from '../constants/charts';

interface DataGeneratorState {
    chart: ChartTypes;
    sampleSize: number;
    sample: {
        x: Array<number>,
        y: Array<number>
    };
    setChart: (newChart: ChartTypes) => void;
    setSample: (newSample: { x: Array<number>, y: Array<number> }) => void;
    generateSample: () => void;
}

const useDGStore = create<DataGeneratorState>((set, get) => ({
    chart: ChartTypes.LINE_PLOT,
    sampleSize: 50,
    sample: { x: [], y: [] },
    setChart: (newChart: ChartTypes) => set({ chart: newChart }),
    setSample: (newSample: { x: Array<number>, y: Array<number> }) => set({ sample: newSample }),
    generateSample: () => {
        const { sampleSize } = get();
        const x = Array.from({ length: sampleSize }, (_, i) => i + 1);
        const y = x.map(() => Math.floor(Math.random() * 100));
        set({ sample: { x, y } });
    }
}))

export { useDGStore };