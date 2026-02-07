import { motion } from "framer-motion";
import { monthlyHeatData } from "@/data/mockData";

export function HeatTrendChart() {
  const maxHeat = Math.max(...monthlyHeatData.map(d => d.heatIndex));
  const maxGreen = Math.max(...monthlyHeatData.map(d => d.greenCover));

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
          <h3 className="text-sm font-display font-semibold">CLIMATE TREND ANALYSIS</h3>
          <p className="text-[10px] text-muted-foreground font-tech">TEMPERATURE VS GREEN COVER • 12 MONTHS</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground font-tech">Heat Index</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground font-tech">Green Cover</span>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between h-[200px] gap-1 px-2">
        {monthlyHeatData.map((data, index) => (
          <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center gap-0.5 h-[160px]">
              {/* Heat bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.heatIndex / maxHeat) * 100}%` }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="w-2 bg-gradient-to-t from-destructive/50 to-destructive rounded-t"
              />
              {/* Green bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.greenCover / maxGreen) * 100}%` }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.5 }}
                className="w-2 bg-gradient-to-t from-primary/50 to-primary rounded-t"
              />
            </div>
            <span className="text-[8px] font-tech text-muted-foreground">{data.month}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}