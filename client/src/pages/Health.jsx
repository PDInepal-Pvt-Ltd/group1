import * as React from "react";
import {
  Activity, Database, Cpu, MemoryStick, RefreshCw,
  CheckCircle2, AlertTriangle, Clock, HardDrive, Info
} from "lucide-react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { checkSystemHealth } from "@/store/healthSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
export default function HealthDashboard() {
  const dispatch = useDispatch();
  const { status, error, loading, lastChecked } = useSelector(
    (state) => state.health
  );

  React.useEffect(() => {
    dispatch(checkSystemHealth());

    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !loading) {
        dispatch(checkSystemHealth());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, loading]); // Added loading to deps to recreate interval if needed, but generally stable

  const metrics = React.useMemo(() => {
    if (!status) return null;
    const used = status.system.memoryUsage.heapUsed / (1024 * 1024);
    const total = status.system.memoryUsage.heapTotal / (1024 * 1024);
    return {
      memUsed: used.toFixed(2),
      memTotal: total.toFixed(2),
      memPercentage: Math.min((used / total) * 100, 100),
      uptime: (status.uptime / 3600).toFixed(2),
      rss: (status.system.memoryUsage.rss / (1024 * 1024)).toFixed(2)
    };
  }, [status]);

  if (loading && !status) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <RefreshCw className="h-12 w-12 animate-spin text-primary" />
        <p className="animate-pulse text-base text-muted-foreground">Initializing System Health Monitor...</p>
      </div>
    );
  }

  if (!status) return <div className="flex h-screen items-center justify-center"><h1 className="text-2xl font-bold text-muted-foreground">No Data Available</h1></div>;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">System Health Overview</h2>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last Updated: {lastChecked ? format(lastChecked, "PPP HH:mm:ss") : "Never"}</span>
                {error && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive" className="ml-2 animate-pulse cursor-help">Sync Failed</Badge>
                    </TooltipTrigger>
                    <TooltipContent>{error}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => dispatch(checkSystemHealth())}
              disabled={loading}
              className="w-full sm:w-auto transition-all hover:bg-primary/5"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh Now
            </Button>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Database Status"
              value="PostgreSQL"
              icon={<Database className="h-5 w-5" />}
              subtext={`Latency: ${status.checks.database.responseTime}ms`}
              badge={status.checks.database.status.toUpperCase()}
              status={status.checks.database.status === 'up' ? 'success' : 'danger'}
              tooltip="Database connection and query performance"
            />

            <StatCard
              title="System Uptime"
              value={`${metrics?.uptime} hours`}
              icon={<Activity className="h-5 w-5" />}
              subtext="Continuous operation time"
              tooltip="Time since last system restart or process start"
            />

            <StatCard
              title="CPU Load"
              value={`${status.system.cpuUsage.user.toFixed(1)}%`}
              icon={<Cpu className="h-5 w-5" />}
              badge={status.system.cpuStatus.toUpperCase()}
              status={status.system.cpuStatus === 'stable' ? 'success' : 'warning'}
              tooltip="Current CPU utilization across user processes"
            />

            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Memory Usage</CardTitle>
                <Tooltip>
                  <TooltipTrigger><MemoryStick className="h-5 w-5 text-muted-foreground cursor-help" /></TooltipTrigger>
                  <TooltipContent>System memory allocation details</TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{metrics?.memPercentage.toFixed(1)}%</span>
                  <Badge variant="secondary" className="capitalize">{status.system.memoryStatus}</Badge>
                </div>
                <Progress value={metrics?.memPercentage} className="mt-4 h-2 rounded-full"/>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <HardDrive className="h-6 w-6 text-primary" /> Advanced Memory Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <DetailRow label="Heap Used" value={`${metrics?.memUsed} MB`} tooltip="Memory currently in use by the application" />
                <DetailRow label="Heap Total" value={`${metrics?.memTotal} MB`} tooltip="Total allocated heap memory" />
                <DetailRow label="RSS (Physical)" value={`${metrics?.rss} MB`} tooltip="Resident Set Size - physical memory usage" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-md">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" /> System Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                {status.checks.database.status === "up" && !error ? (
                  <div className="space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 ring-4 ring-green-50">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-700">All Systems Operational</h3>
                    <p className="text-base text-muted-foreground max-w-md">
                      Your infrastructure is performing optimally. No anomalies detected in core components.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-50">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-700">System Alert</h3>
                    <p className="text-base text-muted-foreground max-w-md">
                      {error || status.checks.database.error || "Potential issue detected. Please check connections and logs."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Reusable Sub-components ---

function StatCard({ title, value, icon, subtext, badge, status, tooltip }) {
  const statusColors = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    default: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const content = (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold uppercase text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">{value}</div>
          {badge && (
            <Badge variant="outline" className={cn("text-xs px-2 py-1", statusColors[status] || statusColors.default)}>
              {badge}
            </Badge>
          )}
        </div>
        {subtext && <p className="mt-2 text-sm text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  ) : content;
}

function DetailRow({ label, value, tooltip }) {
  const content = (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <span className="text-base text-muted-foreground">{label}</span>
      <span className="font-mono text-base font-medium">{value}</span>
    </div>
  );

  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  ) : content;
}