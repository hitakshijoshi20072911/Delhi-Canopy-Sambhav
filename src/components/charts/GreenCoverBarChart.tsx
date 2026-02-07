import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { wardData } from "@/data/mockData";
import { TreeDeciduous } from "lucide-react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; greenCover: number; heatIndex: number } }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 border border-primary/30 shadow-lg">
        <p className="text-xs font-tech text-primary mb-2">{data.name}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Green Cover:</span>
            <span className="text-foreground font-medium">{data.greenCover}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Heat Index:</span>
            <span className="text-foreground font-medium">{data.heatIndex}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function GreenCoverBarChart() {
  const chartData = useMemo(() => {
    return wardData
      .sort((a, b) => b.greenCover - a.greenCover)
      .slice(0, 8)
      .map(ward => ({
        name: ward.name.split(' ')[0],
        greenCover: ward.greenCover,
        heatIndex: ward.heatIndex,
        priority: ward.priority,
      }));
  }, []);

  const getBarColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'hsl(0, 84%, 60%)';
      case 'high':
        return 'hsl(38, 92%, 50%)';
      case 'medium':
        return 'hsl(155, 100%, 40%)';
      default:
        return 'hsl(155, 100%, 50%)';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TreeDeciduous className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold">
          GREEN COVER BY ZONE
        </h3>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 20%, 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "hsl(220, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 20%, 20%)" }}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="greenCover"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.priority)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        {[
          { label: 'Low Risk', color: 'bg-primary' },
          { label: 'Medium', color: 'bg-primary/60' },
          { label: 'High', color: 'bg-warning' },
          { label: 'Critical', color: 'bg-destructive' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-muted-foreground font-tech">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
