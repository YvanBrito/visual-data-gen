import ChartTypes from "../../constants/charts";
import { useDGStore } from "../../context/store";
import { LinePlot } from "../LinePlot";

const Chart = () => {
    const sample = useDGStore((state) => state.sample)
    const chart = useDGStore((state) => state.chart)

    return (
        <div className="chart">
            {chart === ChartTypes.LINE_PLOT ? <LinePlot data={sample} /> : null}
        </div>
    );
}

export { Chart };