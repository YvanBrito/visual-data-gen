import * as d3 from "d3";
import {useRef, useEffect} from "react";
import { useDGStore } from "../../context/store";
import "./styles.css";

interface LinePlotProps {
  data: {
    x: number[],
    y: number[]
  };
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

const LinePlot = ({
  data,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40
}: LinePlotProps) => {
  const gx = useRef<SVGGElement>(null);
  const gy = useRef<SVGGElement>(null);
  const x = d3.scaleLinear(d3.extent(data.x) as [number, number], [marginLeft, width - marginRight]);
  const y = d3.scaleLinear(d3.extent(data.y) as [number, number], [height - marginBottom, marginTop]);
  const line = d3.line((_d, i) => x(data.x[i]), (_d, i) => y(data.y[i]));
  useEffect(() => {
    d3.select(gx.current as SVGGElement).call(d3.axisBottom(x));
  }, [gx, x]);
  useEffect(() => {
    d3.select(gy.current as SVGGElement).call(d3.axisLeft(y));
  }, [gy, y]);
  return (
    <svg className="line-plot" width={width} height={height}>
      <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
      <g ref={gy} transform={`translate(${marginLeft},0)`} />
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d={line(data.x.map((_, i) => [data.x[i], data.y[i]] as [number, number])) || ""} />
      <g fill="white" stroke="currentColor" strokeWidth="1.5">
        {data.y.map((d, i) => (<circle key={i} cx={x(data.x[i])} cy={y(d)} r="2.5" />))}
      </g>
    </svg>
  );
}

export { LinePlot };