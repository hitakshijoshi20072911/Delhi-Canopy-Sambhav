import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { wardData } from "@/data/mockData";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  TreeDeciduous,
  Thermometer
} from "lucide-react";

const priorityColors = {
  low: 'bg-primary/20 text-primary border-primary/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  high: 'bg-warning/30 text-warning border-warning/50',
  critical: 'bg-destructive/20 text-destructive border-destructive/30 animate-pulse'
};

export function WardRankingTable() {
  const sortedWards = [...wardData].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-display font-semibold">WARD RISK RANKING</h3>
          <p className="text-[10px] text-muted-foreground font-tech">TOP 10 HIGH-RISK ZONES</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-tech">SORT BY: RISK SCORE</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 px-2 text-[10px] font-tech text-muted-foreground uppercase tracking-wider">#</th>
              <th className="text-left py-2 px-2 text-[10px] font-tech text-muted-foreground uppercase tracking-wider">Zone</th>
              <th className="text-center py-2 px-2 text-[10px] font-tech text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <TreeDeciduous className="w-3 h-3" />
                  Green %
                </div>
              </th>
              <th className="text-center py-2 px-2 text-[10px] font-tech text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  Heat
                </div>
              </th>
              <th className="text-center py-2 px-2 text-[10px] font-tech text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Risk
                </div>
              </th>
              <th className="text-center py-2 px-2 text-[10px] font-tech text-muted-foreground uppercase tracking-wider">Priority</th>
            </tr>
          </thead>
          <tbody>
            {sortedWards.map((ward, index) => (
              <motion.tr
                key={ward.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-border/30 hover:bg-card/50 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-2">
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    index < 3 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {ward.name}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className={cn(
                      "text-sm font-tech",
                      ward.greenCover < 20 ? 'text-destructive' : ward.greenCover < 30 ? 'text-warning' : 'text-primary'
                    )}>
                      {ward.greenCover}%
                    </span>
                    {ward.greenCover < 20 ? (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    ) : ward.greenCover > 35 ? (
                      <TrendingUp className="w-3 h-3 text-primary" />
                    ) : null}
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <div className="inline-flex items-center">
                    <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden mr-2">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          ward.heatIndex > 85 ? 'bg-destructive' : ward.heatIndex > 70 ? 'bg-warning' : 'bg-primary'
                        )}
                        style={{ width: `${ward.heatIndex}%` }}
                      />
                    </div>
                    <span className="text-xs font-tech text-muted-foreground">{ward.heatIndex}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={cn(
                    "text-sm font-display font-bold",
                    ward.riskScore > 80 ? 'text-destructive text-glow' : 
                    ward.riskScore > 50 ? 'text-warning' : 'text-primary'
                  )}>
                    {ward.riskScore}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                    priorityColors[ward.priority]
                  )}>
                    {ward.priority}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
