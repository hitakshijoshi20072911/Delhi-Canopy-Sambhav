import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { monthlyHeatData } from "@/data/mockData";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-primary/30 shadow-lg">
        <p className="text-xs font-tech text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="text-foreground font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AdvancedHeatChart() {
  const chartData = useMemo(() => monthlyHeatData, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-5 h-[300px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-display font-semibold">
            CLIMATE TREND ANALYSIS
          </h3>
          <p className="text-[10px] text-muted-foreground font-tech">
            TEMPERATURE VS GREEN COVER • 12 MONTHS
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground font-tech">
              Heat Index
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground font-tech">
              Green Cover
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(155, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 20%, 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 20%, 20%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="heatIndex"
              name="Heat Index"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              fill="url(#heatGradient)"
              dot={false}
              activeDot={{ r: 4, stroke: "hsl(0, 84%, 60%)", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="greenCover"
              name="Green Cover"
              stroke="hsl(155, 100%, 50%)"
              strokeWidth={2}
              fill="url(#greenGradient)"
              dot={false}
              activeDot={{ r: 4, stroke: "hsl(155, 100%, 50%)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
