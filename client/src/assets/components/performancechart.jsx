import {LineChart,Line,XAxis,YAxis} from "recharts"

export default function PerformanceChart({data}){

return(
<LineChart width={400} height={200} data={data}>
<XAxis dataKey="name"/>
<YAxis/>
<Line type="monotone" dataKey="score"/>
</LineChart>
)
}