import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { wardData } from "@/data/mockData";
import { TrendingUp } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; greenCover: number; heatIndex: number; riskScore: number } }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 border border-destructive/30 shadow-lg">
        <p className="text-xs font-tech text-destructive mb-2">{data.name}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Green Cover:</span>
            <span className="text-primary font-medium">{data.greenCover}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Heat Index:</span>
            <span className="text-destructive font-medium">{data.heatIndex}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Risk Score:</span>
            <span className="text-warning font-medium">{data.riskScore}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function HeatScatterChart() {
  const chartData = useMemo(() => {
    return wardData.map(ward => ({
      name: ward.name,
      greenCover: ward.greenCover,
      heatIndex: ward.heatIndex,
      riskScore: ward.riskScore,
    }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-display font-semibold">
          HEAT VS GREEN COVER CORRELATION
        </h3>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 20%, 20%)"
            />
            <XAxis
              type="number"
              dataKey="greenCover"
              name="Green Cover"
              unit="%"
              domain={[0, 60]}
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 20%, 20%)" }}
              tickLine={false}
              label={{
                value: 'Green Cover %',
                position: 'bottom',
                fontSize: 10,
                fill: 'hsl(220, 10%, 50%)',
              }}
            />
            <YAxis
              type="number"
              dataKey="heatIndex"
              name="Heat Index"
              domain={[40, 100]}
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Heat Index',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10,
                fill: 'hsl(220, 10%, 50%)',
              }}
            />
            <ZAxis
              type="number"
              dataKey="riskScore"
              range={[60, 200]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={chartData}
              fill="hsl(0, 84%, 60%)"
              fillOpacity={0.6}
              stroke="hsl(0, 84%, 50%)"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <p className="text-xs text-muted-foreground font-tech text-center mt-2">
        Negative correlation detected: Lower green cover = Higher heat stress
      </p>
    </motion.div>
  );
}
