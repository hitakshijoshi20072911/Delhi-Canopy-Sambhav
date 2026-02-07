import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/layout/Navigation";
import { FloatingAIAssistant } from "@/components/ai/FloatingAIAssistant";
import { GlassCard } from "@/components/ui/GlassCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { 
  FileText, 
  Download,
  Calendar,
  BarChart3,
  MapPin,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  status: 'ready' | 'generating';
  pages: number | null;
  dataType: 'wards' | 'alerts' | 'kpis' | 'climate' | 'plans';
}

const Reports = () => {
  const { wards, alerts, kpis, climateTrends, plantationPlans, isSeeded } = useDashboardData();
  const [generatingReport, setGeneratingReport] = useState<number | null>(null);

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const reports: Report[] = [
    {
      id: 1,
      title: 'Monthly Green Cover Analysis',
      type: 'Vegetation Report',
      date: monthYear,
      status: 'ready',
      pages: wards.length > 0 ? Math.ceil(wards.length / 2) + 4 : 24,
      dataType: 'wards'
    },
    {
      id: 2,
      title: 'Urban Heat Island Assessment',
      type: 'Climate Report',
      date: monthYear,
      status: 'ready',
      pages: climateTrends.length > 0 ? 18 : 18,
      dataType: 'climate'
    },
    {
      id: 3,
      title: 'Tree Loss Incident Summary',
      type: 'Enforcement Report',
      date: `Week ${Math.ceil(currentDate.getDate() / 7)}, ${currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      status: 'ready',
      pages: alerts.filter(a => a.alert_type === 'tree_loss').length > 0 ? 12 : 12,
      dataType: 'alerts'
    },
    {
      id: 4,
      title: 'AI Plantation Recommendations',
      type: 'Strategy Report',
      date: `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${currentDate.getFullYear()}`,
      status: plantationPlans.length > 0 ? 'ready' : 'generating',
      pages: plantationPlans.length > 0 ? plantationPlans.length * 2 + 8 : null,
      dataType: 'plans'
    },
    {
      id: 5,
      title: 'Ward-wise Performance Metrics',
      type: 'Analytics Report',
      date: monthYear,
      status: 'ready',
      pages: wards.length > 0 ? wards.length + 10 : 32,
      dataType: 'wards'
    },
  ];

  const generateCSV = (reportType: string, data: any[]) => {
    let csvContent = "";
    
    if (reportType === 'wards' && wards.length > 0) {
      csvContent = "Ward Name,Zone,Green Cover %,Heat Index,Risk Score,Priority,Population\n";
      wards.forEach(w => {
        csvContent += `"${w.name}","${w.zone}",${w.green_cover_percent},${w.heat_index},${w.risk_score},${w.priority},${w.population || 'N/A'}\n`;
      });
    } else if (reportType === 'alerts') {
      csvContent = "Alert ID,Type,Severity,Ward,Message,Detected At,Active\n";
      alerts.forEach(a => {
        csvContent += `"${a.id}","${a.alert_type}","${a.severity}","${a.wards?.name || a.location_description}","${a.message}","${a.detected_at}",${a.is_active}\n`;
      });
    } else if (reportType === 'climate') {
      csvContent = "Month,Average Temp,Heat Index,Green Cover %\n";
      climateTrends.forEach(t => {
        csvContent += `"${t.month}",${t.avgTemp},${t.heatIndex},${t.greenCover}\n`;
      });
    } else if (reportType === 'plans') {
      csvContent = "Ward,Priority,Required Trees,Heat Reduction,CO2 Offset,Estimated Cost\n";
      plantationPlans.forEach(p => {
        csvContent += `"${p.ward}","${p.priority}",${p.requiredTrees},${p.heatReduction},${p.carbonOffset},"${p.estimatedCost}"\n`;
      });
    } else if (reportType === 'kpis') {
      csvContent = "Metric,Value,Unit,Trend,Status\n";
      kpis.forEach(k => {
        csvContent += `"${k.label}",${k.value},"${k.unit}","${k.trend}","${k.status}"\n`;
      });
    }

    return csvContent;
  };

  const handleDownloadCSV = (report: Report) => {
    setGeneratingReport(report.id);
    
    setTimeout(() => {
      const csvContent = generateCSV(report.dataType, []);
      
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${report.title} downloaded successfully!`);
      } else {
        toast.error("No data available for this report. Please initialize the database first.");
      }
      
      setGeneratingReport(null);
    }, 1000);
  };

  const handlePrintReport = (report: Report) => {
    // Create a printable summary
    let content = `
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
            h1 { color: #00FF9C; border-bottom: 2px solid #00FF9C; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .critical { background: #fee2e2; color: #dc2626; }
            .high { background: #fef3c7; color: #f59e0b; }
            .medium { background: #dbeafe; color: #3b82f6; }
            .low { background: #dcfce7; color: #22c55e; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DelhiCanopy - ${report.title}</h1>
            <div>
              <p><strong>Report Type:</strong> ${report.type}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
    `;

    if (report.dataType === 'wards' && wards.length > 0) {
      content += `
        <h2>Ward Summary (${wards.length} Wards)</h2>
        <table>
          <tr><th>Ward</th><th>Zone</th><th>Green Cover</th><th>Heat Index</th><th>Risk Score</th><th>Priority</th></tr>
          ${wards.slice(0, 20).map(w => `
            <tr>
              <td>${w.name}</td>
              <td>${w.zone}</td>
              <td>${w.green_cover_percent?.toFixed(1)}%</td>
              <td>${w.heat_index}</td>
              <td>${w.risk_score}</td>
              <td><span class="badge ${w.priority}">${w.priority.toUpperCase()}</span></td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (report.dataType === 'alerts') {
      const treeLossAlerts = alerts.filter(a => a.alert_type === 'tree_loss');
      content += `
        <h2>Active Alerts (${alerts.length} Total, ${treeLossAlerts.length} Tree Loss)</h2>
        <table>
          <tr><th>Type</th><th>Severity</th><th>Location</th><th>Message</th><th>Time</th></tr>
          ${alerts.slice(0, 15).map(a => `
            <tr>
              <td>${a.alert_type.replace('_', ' ').toUpperCase()}</td>
              <td><span class="badge ${a.severity}">${a.severity.toUpperCase()}</span></td>
              <td>${a.wards?.name || a.location_description}</td>
              <td>${a.message}</td>
              <td>${new Date(a.detected_at).toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    content += `
          <div class="footer">
            <p>This report was generated by DelhiCanopy AI Intelligence Platform</p>
            <p>Data is ${isSeeded ? 'from live database' : 'simulated for demonstration purposes'}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-[1400px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-wide">
                  <span className="text-glow">INTELLIGENCE</span>{" "}
                  <span className="text-muted-foreground">REPORTS</span>
                </h1>
                <p className="text-xs text-muted-foreground font-tech">
                  {isSeeded ? 'Live Data Reports' : 'Auto-Generated Analytics'} • CSV Export • Print Support
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Wards', value: wards.length > 0 ? String(wards.length) : '47', icon: MapPin, color: 'text-primary' },
              { label: 'Active Alerts', value: String(alerts.filter(a => a.is_active).length || 12), icon: Calendar, color: 'text-destructive' },
              { label: 'Data Points', value: isSeeded ? '2.4M' : '1.2M', icon: BarChart3, color: 'text-warning' },
              { label: 'Plans Generated', value: String(plantationPlans.length || 15), icon: TrendingUp, color: 'text-secondary' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                  <span className="text-xs text-muted-foreground font-tech uppercase">{stat.label}</span>
                </div>
                <span className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Reports Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, idx) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      report.status === 'ready' 
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-warning/20 text-warning border border-warning/30 animate-pulse'
                    )}>
                      {report.status === 'ready' ? 'Ready' : 'Generating...'}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-semibold mb-1">{report.title}</h3>
                  <p className="text-xs text-muted-foreground font-tech mb-4">{report.type}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 mt-auto">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </span>
                    {report.pages && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {report.pages} pages
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadCSV(report)}
                      disabled={report.status !== 'ready' || generatingReport === report.id}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all",
                        report.status === 'ready' && generatingReport !== report.id
                          ? "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {generatingReport === report.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-3 h-3" />
                      )}
                      Export CSV
                    </button>
                    <button 
                      onClick={() => handlePrintReport(report)}
                      disabled={report.status !== 'ready'}
                      className="px-3 py-2 rounded-lg bg-card/50 hover:bg-card border border-border/50 transition-all disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Generate New Report Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reports.length * 0.1 }}
            >
              <div className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center p-6 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <TrendingUp className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Generate New Report</span>
                <span className="text-xs text-muted-foreground/60 font-tech mt-1">Custom Analytics</span>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <GlassCard className="p-5 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-display font-semibold">RECENT ACTIVITY</h3>
            </div>
            <div className="space-y-3">
              {[
                { action: 'System initialized with live data', time: isSeeded ? 'Active' : 'Pending', user: 'System' },
                { action: `${wards.length || 47} wards analyzed`, time: 'Real-time', user: 'AI Engine' },
                { action: `${alerts.length || 25} alerts processed`, time: 'Last 24h', user: 'Detection System' },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      idx === 0 && isSeeded ? "bg-primary" : idx === 0 ? "bg-warning" : "bg-primary"
                    )} />
                    <span className="text-sm">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
};

export default Reports;
