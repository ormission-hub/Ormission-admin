"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Layers,
  BarChart2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface OrderItem {
  id: string;
  paid_amount?: number;
  total_amount?: number;
  created_at?: string;
  status?: string;
  payment_method?: string;
  [key: string]: any;
}

interface RevenueAnalyticsChartProps {
  orders?: OrderItem[];
  totalRevenue?: number;
  totalStudents?: number;
  loading?: boolean;
}

type TimeRange = "7d" | "30d" | "90d" | "1y";
type MetricType = "revenue" | "enrollments";
type ChartStyle = "area" | "bar";

interface DataPoint {
  dateKey: string;
  label: string;
  fullDate: string;
  revenue: number;
  enrollments: number;
  isPeak?: boolean;
}

// Convert English numbers to Bengali numerals
export function toBengaliNumerals(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
}

export function formatBDT(amount: number): string {
  return `৳${toBengaliNumerals(Math.round(amount).toLocaleString("en-US"))}`;
}

export function RevenueAnalyticsChart({
  orders = [],
  totalRevenue = 0,
  totalStudents = 0,
  loading = false,
}: RevenueAnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [metric, setMetric] = useState<MetricType>("revenue");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("area");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // SVG Geometry Dimensions
  const width = 840;
  const height = 250;
  const padding = { top: 25, right: 20, bottom: 40, left: 62 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Filter valid completed/paid orders
  const completedOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = String(o.status || "").toLowerCase();
      return s === "completed" || s === "paid" || s === "success" || s === "confirmed";
    });
  }, [orders]);

  const hasRealData = completedOrders.length > 0;

  // Generate reactive time-series data with real order aggregation
  const chartData = useMemo<DataPoint[]>(() => {
    const now = new Date(); // dynamic real date

    let daysCount = 30;
    if (timeRange === "7d") daysCount = 7;
    else if (timeRange === "90d") daysCount = 90;
    else if (timeRange === "1y") daysCount = 12;

    const bnWeekdays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    const bnMonths = [
      "জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে",
    ];
    const bnFullMonths = [
      "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
      "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
    ];

    const points: DataPoint[] = [];

    if (timeRange === "1y") {
      // 12 Months of current year
      const currentYear = now.getFullYear();

      for (let i = 0; i < 12; i++) {
        // Aggregate real completed orders for month i
        const monthOrders = completedOrders.filter((o) => {
          if (!o.created_at) return false;
          const d = new Date(o.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === i;
        });

        const realRev = monthOrders.reduce(
          (sum, o) => sum + (Number(o.paid_amount || o.total_amount) || 0),
          0
        );
        const realEnr = monthOrders.length;

        // Realistic fallback trend if early database stage with 0 orders
        const demoMonthlyRev = [28500, 34200, 41000, 39500, 52000, 68000, 74500, 89000, 94200, 82000, 88500, 96000];
        const demoMonthlyEnr = [22, 28, 35, 31, 44, 58, 62, 75, 80, 68, 74, 82];

        const rev = hasRealData ? realRev : demoMonthlyRev[i];
        const enr = hasRealData ? realEnr : demoMonthlyEnr[i];

        points.push({
          dateKey: `${currentYear}-${i + 1}`,
          label: bnMonths[i],
          fullDate: `${bnFullMonths[i]} ${toBengaliNumerals(currentYear)}`,
          revenue: rev,
          enrollments: enr,
        });
      }
    } else {
      // Days-based breakdown (7d, 30d, 90d)
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);

        const dayOfMonth = d.getDate();
        const monthIdx = d.getMonth();
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday/Saturday in Bangladesh

        // Filter real orders for this specific calendar date
        const dateStr = d.toISOString().slice(0, 10);
        const dayOrders = completedOrders.filter((o) => {
          if (!o.created_at) return false;
          return o.created_at.slice(0, 10) === dateStr;
        });

        const realDayRev = dayOrders.reduce(
          (sum, o) => sum + (Number(o.paid_amount || o.total_amount) || 0),
          0
        );
        const realDayEnr = dayOrders.length;

        // Realistic organic wave fallback when 0 orders exist
        const seedMultiplier = 1 + Math.sin(i * 0.45) * 0.35 + (isWeekend ? 0.3 : 0);
        const demoRev = Math.round((4200 + (i % 7) * 950 + (i % 5) * 1200) * seedMultiplier);
        const demoEnr = Math.max(1, Math.round(demoRev / 1600 + (isWeekend ? 2 : 0)));

        const finalRev = hasRealData ? realDayRev : demoRev;
        const finalEnr = hasRealData ? realDayEnr : demoEnr;

        const label =
          timeRange === "7d"
            ? `${bnWeekdays[dayOfWeek].slice(0, 3)}`
            : `${toBengaliNumerals(dayOfMonth)} ${bnMonths[monthIdx]}`;

        const fullDate = `${toBengaliNumerals(dayOfMonth)} ${bnFullMonths[monthIdx]} ${toBengaliNumerals(
          d.getFullYear()
        )}, ${bnWeekdays[dayOfWeek]}`;

        points.push({
          dateKey: dateStr,
          label,
          fullDate,
          revenue: finalRev,
          enrollments: finalEnr,
        });
      }
    }

    // Mark peak data point
    let maxVal = -1;
    let maxIdx = 0;
    points.forEach((p, idx) => {
      const v = metric === "revenue" ? p.revenue : p.enrollments;
      if (v > maxVal) {
        maxVal = v;
        maxIdx = idx;
      }
    });
    if (points[maxIdx] && maxVal > 0) {
      points[maxIdx].isPeak = true;
    }

    return points;
  }, [completedOrders, hasRealData, timeRange, metric]);

  // Aggregate metrics & compute genuine growth rate
  const summary = useMemo(() => {
    const totalRev = chartData.reduce((acc, p) => acc + p.revenue, 0);
    const totalEnr = chartData.reduce((acc, p) => acc + p.enrollments, 0);
    const count = chartData.length || 1;
    const avgRev = Math.round(totalRev / count);
    const avgEnr = (totalEnr / count).toFixed(1);

    const peakPoint = chartData.find((p) => p.isPeak) || chartData[0];

    // Compute genuine growth rate comparing first half vs second half
    const n = chartData.length;
    const mid = Math.floor(n / 2);
    const firstHalfSum = chartData
      .slice(0, mid)
      .reduce((sum, p) => sum + (metric === "revenue" ? p.revenue : p.enrollments), 0);
    const secondHalfSum = chartData
      .slice(mid)
      .reduce((sum, p) => sum + (metric === "revenue" ? p.revenue : p.enrollments), 0);

    let growthPct = 0;
    if (firstHalfSum > 0) {
      growthPct = Math.round(((secondHalfSum - firstHalfSum) / firstHalfSum) * 100);
    } else if (secondHalfSum > 0) {
      growthPct = 100;
    } else {
      growthPct = 0;
    }

    const isPositive = growthPct >= 0;
    const growthText = `${isPositive ? "+" : ""}${toBengaliNumerals(growthPct)}%`;

    return {
      total: metric === "revenue" ? totalRev : totalEnr,
      avg: metric === "revenue" ? avgRev : avgEnr,
      peakDate: peakPoint?.label || "-",
      peakValue: metric === "revenue" ? peakPoint?.revenue || 0 : peakPoint?.enrollments || 0,
      growth: growthText,
      isPositive,
    };
  }, [chartData, metric]);

  // Scaling calculations
  const values = chartData.map((d) => (metric === "revenue" ? d.revenue : d.enrollments));
  const maxVal = Math.max(...values, 1) * 1.15;
  const minVal = 0;

  const points = useMemo(() => {
    const n = chartData.length;
    return chartData.map((d, i) => {
      const val = metric === "revenue" ? d.revenue : d.enrollments;
      const x = padding.left + (i / Math.max(n - 1, 1)) * graphWidth;
      const y = padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
      return { x, y, data: d, index: i };
    });
  }, [chartData, metric, maxVal, minVal, graphWidth, graphHeight, padding]);

  // Cubic Bezier path calculation
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: "", areaPath: "" };

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x},${p.y} L ${p.x + 10},${p.y}`,
        areaPath: `M ${p.x},${padding.top + graphHeight} L ${p.x},${p.y} L ${p.x + 10},${p.y} L ${p.x + 10},${padding.top + graphHeight} Z`,
      };
    }

    let d = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = padding.top + graphHeight;
    const area = `${d} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    return { linePath: d, areaPath: area };
  }, [points, graphHeight, padding]);

  // Y-axis grid lines and labels
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = Math.round(minVal + pct * (maxVal - minVal));
    const y = padding.top + graphHeight - pct * graphHeight;
    const label =
      metric === "revenue"
        ? val >= 1000
          ? `৳${toBengaliNumerals((val / 1000).toFixed(0))}k`
          : `৳${toBengaliNumerals(val)}`
        : `${toBengaliNumerals(val)}`;
    return { y, label, val };
  });

  const currentHoverPoint =
    hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  // Touch and Mouse handlers for seamless phone and desktop interaction
  const updateHoverFromClientX = useCallback(
    (clientX: number, target: SVGSVGElement) => {
      const rect = target.getBoundingClientRect();
      const relX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, (relX - padding.left) / graphWidth));
      const idx = Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))));
      setHoveredIndex(idx);
    },
    [padding.left, graphWidth, points.length]
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverFromClientX(e.clientX, e.currentTarget);
  };

  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches && e.touches[0]) {
      updateHoverFromClientX(e.touches[0].clientX, e.currentTarget);
    }
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  // Safe Tooltip Positioning that never clips off screen edges
  const tooltipStyle = useMemo(() => {
    if (!currentHoverPoint) return {};
    const xPct = (currentHoverPoint.x / width) * 100;
    const yPct = (currentHoverPoint.y / height) * 100;

    // Edge-clamping for small mobile screens
    if (xPct < 25) {
      return {
        left: `${Math.max(4, xPct)}%`,
        transform: "translateX(0)",
        top: `${Math.max(6, yPct - 28)}%`,
      };
    } else if (xPct > 75) {
      return {
        left: `${Math.min(96, xPct)}%`,
        transform: "translateX(-100%)",
        top: `${Math.max(6, yPct - 28)}%`,
      };
    }

    return {
      left: `${xPct}%`,
      transform: "translateX(-50%)",
      top: `${Math.max(6, yPct - 28)}%`,
    };
  }, [currentHoverPoint, width, height]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-border/70">
          <div className="space-y-2">
            <div className="h-5 bg-surface-secondary rounded-lg w-48" />
            <div className="h-3 bg-surface-secondary rounded-lg w-64" />
          </div>
          <div className="h-8 bg-surface-secondary rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-secondary/70 rounded-xl" />
          ))}
        </div>
        <div className="h-60 bg-surface-secondary/50 rounded-xl mt-2" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-surface rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs relative overflow-hidden transition-all duration-200 hover:border-primary/30"
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

      {/* ========================================================
          1. Header & Controls Toolbar (Mobile-Optimized Flex/Wrap)
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-border/70 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-text font-bengali tracking-tight flex items-center gap-2 flex-wrap">
              <span>মাসিক রাজস্ব ও বিক্রয় বিশ্লেষণ</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  hasRealData
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {hasRealData ? "লাইভ ট্রানজ্যাকশন" : "ডেমো ট্রেন্ড প্রিভিউ"}
              </span>
            </h2>
          </div>
          <p className="text-xs text-text-muted font-bengali mt-0.5 leading-relaxed">
            বিগত দিনের রিয়েল-টাইম আয়, কোর্স ভর্তি প্রবণতা এবং গ্রোথ ট্র্যাকার
          </p>
        </div>

        {/* Toolbar Button Groups (Wrap smoothly on mobile) */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Metric Selector (Revenue vs Enrollments) */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-secondary border border-border text-xs">
            <button
              type="button"
              onClick={() => setMetric("revenue")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bengali font-semibold transition-all duration-150 flex items-center gap-1.5 text-xs ${
                metric === "revenue"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>রাজস্ব (৳)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetric("enrollments")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bengali font-semibold transition-all duration-150 flex items-center gap-1.5 text-xs ${
                metric === "enrollments"
                  ? "bg-surface text-secondary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ভর্তি (জন)</span>
            </button>
          </div>

          {/* Time Range Filter (7d / 30d / 90d / 1y) */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-secondary border border-border text-xs">
            {(
              [
                { key: "7d", label: "৭ দিন" },
                { key: "30d", label: "৩০ দিন" },
                { key: "90d", label: "৩ মাস" },
                { key: "1y", label: "১ বছর" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTimeRange(item.key)}
                className={`px-2 sm:px-2.5 py-1.5 rounded-md font-bengali text-xs font-medium transition-all duration-150 ${
                  timeRange === item.key
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Style Switcher: Wave Area vs Bar Columns */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-secondary border border-border text-xs">
            <button
              type="button"
              onClick={() => setChartStyle("area")}
              title="স্মুথ এরিয়া কার্ভ"
              className={`p-1.5 rounded-md transition-all ${
                chartStyle === "area"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartStyle("bar")}
              title="স্লিক কলাম বার"
              className={`p-1.5 rounded-md transition-all ${
                chartStyle === "bar"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. KPI Highlight Summary Strip (Mobile-Safe Columns)
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-3 sm:py-3.5 my-1">
        {/* Selected Period Total */}
        <div className="bg-surface-secondary/70 rounded-xl p-2.5 sm:p-3 border border-border/60">
          <span className="text-[10px] sm:text-[11px] font-bengali text-text-muted block truncate">
            {timeRange === "7d"
              ? "৭ দিনের মোট"
              : timeRange === "30d"
              ? "৩০ দিনের মোট"
              : timeRange === "90d"
              ? "৩ মাসের মোট"
              : "১ বছরের সর্বমোট"}
          </span>
          <div className="text-sm sm:text-lg font-extrabold text-text font-sans mt-0.5 truncate">
            {metric === "revenue"
              ? formatBDT(summary.total as number)
              : `${toBengaliNumerals(summary.total)} জন`}
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-surface-secondary/70 rounded-xl p-2.5 sm:p-3 border border-border/60">
          <span className="text-[10px] sm:text-[11px] font-bengali text-text-muted block truncate">
            দৈনিক গড় হার
          </span>
          <div className="text-sm sm:text-lg font-bold text-text font-sans mt-0.5 truncate">
            {metric === "revenue"
              ? formatBDT(summary.avg as number)
              : `${toBengaliNumerals(summary.avg)} জন/দিন`}
          </div>
        </div>

        {/* Peak Sales Day */}
        <div className="bg-surface-secondary/70 rounded-xl p-2.5 sm:p-3 border border-border/60">
          <span className="text-[10px] sm:text-[11px] font-bengali text-text-muted flex items-center gap-1 truncate">
            <Zap className="w-3 h-3 text-accent shrink-0" />
            <span>শীর্ষ পিক সেলস</span>
          </span>
          <div className="text-xs sm:text-base font-bold text-primary font-sans mt-0.5 truncate">
            {metric === "revenue"
              ? formatBDT(summary.peakValue)
              : `${toBengaliNumerals(summary.peakValue)} জন`}
            <span className="text-[10px] text-text-muted font-bengali font-normal ml-1 hidden xs:inline">
              ({summary.peakDate})
            </span>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-surface-secondary/70 rounded-xl p-2.5 sm:p-3 border border-border/60">
          <span className="text-[10px] sm:text-[11px] font-bengali text-text-muted block truncate">
            প্রবৃদ্ধি ট্রেন্ড
          </span>
          <div
            className={`flex items-center gap-1 font-bold text-xs sm:text-base mt-0.5 ${
              summary.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
            }`}
          >
            {summary.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            )}
            <span>{summary.growth} চক্রে</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SVG Interactive Chart Canvas (Touch + Mouse Support)
          ======================================================== */}
      <div className="relative mt-2 touch-pan-x select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-52 sm:h-64 select-none overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
          onTouchEnd={handlePointerLeave}
        >
          <defs>
            {/* Smooth Area Gradient */}
            <linearGradient id="revAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
              <stop offset="65%" stopColor="var(--primary)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>

            {/* Column Bar Gradient */}
            <linearGradient id="colBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="colBarHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-hover)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.75" />
            </linearGradient>

            <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(37, 99, 235, 0.35)" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="var(--border)"
                strokeDasharray="4 4"
                strokeOpacity="0.75"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[12px] sm:text-[11px] fill-text-muted font-sans font-semibold"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Area Mode: Flowing Curve & Fill */}
          {chartStyle === "area" && (
            <>
              <path d={areaPath} fill="url(#revAreaGradient)" />

              <path
                d={linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#svgGlow)"
              />

              {/* Data points for 7d or short datasets */}
              {(timeRange === "7d" || points.length <= 14) &&
                points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 6 : p.data.isPeak ? 4.5 : 3.5}
                    className="transition-all duration-150"
                    fill={hoveredIndex === i ? "var(--primary-hover)" : "var(--surface)"}
                    stroke="var(--primary)"
                    strokeWidth={hoveredIndex === i ? 3 : 2}
                  />
                ))}
            </>
          )}

          {/* Bar Mode: Modern Rounded Pillars */}
          {chartStyle === "bar" && (
            <g>
              {points.map((p, i) => {
                const barWidth = Math.max(
                  4,
                  Math.min(24, (graphWidth / points.length) * 0.72)
                );
                const barHeight = Math.max(4, padding.top + graphHeight - p.y);
                const isHovered = hoveredIndex === i;

                return (
                  <g key={i} className="cursor-pointer">
                    <rect
                      x={p.x - barWidth / 2}
                      y={p.y}
                      width={barWidth}
                      height={barHeight}
                      rx={barWidth > 8 ? 4 : 2}
                      ry={barWidth > 8 ? 4 : 2}
                      fill={isHovered ? "url(#colBarHoverGradient)" : "url(#colBarGradient)"}
                      className="transition-all duration-150"
                      filter={isHovered ? "url(#svgGlow)" : undefined}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Guide Line and Active Cursor Marker */}
          {currentHoverPoint && (
            <g>
              <line
                x1={currentHoverPoint.x}
                y1={padding.top}
                x2={currentHoverPoint.x}
                y2={padding.top + graphHeight}
                stroke="var(--primary)"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <circle
                cx={currentHoverPoint.x}
                cy={currentHoverPoint.y}
                r={7}
                fill="var(--primary)"
                stroke="var(--surface)"
                strokeWidth={3}
                filter="url(#svgGlow)"
              />
            </g>
          )}

          {/* X-axis Date Markers (Dynamically spaced to prevent clutter) */}
          {points
            .filter((_, idx) => {
              if (timeRange === "7d") return true;
              if (timeRange === "30d") return idx % 5 === 0 || idx === points.length - 1;
              if (timeRange === "90d") return idx % 15 === 0 || idx === points.length - 1;
              return true; // 1y has 12 items
            })
            .map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={padding.top + graphHeight + 20}
                textAnchor="middle"
                className="text-[12px] sm:text-[11px] fill-text-muted font-bengali font-medium"
              >
                {p.data.label}
              </text>
            ))}
        </svg>

        {/* Edge-Safe Floating Glassmorphism Tooltip */}
        {currentHoverPoint && (
          <div
            className="absolute pointer-events-none transition-all duration-75 z-30"
            style={tooltipStyle}
          >
            <div className="bg-surface/95 backdrop-blur-md border border-border shadow-xl rounded-xl p-2.5 sm:p-3 text-xs min-w-[160px] sm:min-w-[180px] text-text">
              <div className="text-[10px] sm:text-[11px] text-text-muted font-bengali mb-1 border-b border-border/50 pb-1 flex items-center justify-between gap-1">
                <span className="truncate">{currentHoverPoint.data.fullDate}</span>
                {currentHoverPoint.data.isPeak && (
                  <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.2 rounded font-bold shrink-0">
                    শীর্ষ পিক
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-xs sm:text-sm">
                  <span className="text-text-muted font-bengali text-[11px]">দৈনিক আয়:</span>
                  <span className="text-primary font-sans">
                    {formatBDT(currentHoverPoint.data.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted font-bengali">ভর্তি শিক্ষার্থী:</span>
                  <span className="font-semibold text-secondary font-sans">
                    {toBengaliNumerals(currentHoverPoint.data.enrollments)} জন
                  </span>
                </div>
              </div>

              <div className="mt-1.5 pt-1 border-t border-border/40 text-[9px] text-text-muted font-bengali flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shrink-0" />
                <span className="truncate">
                  {hasRealData ? "ডাটাবেজ ভেরিফাইড অর্ডার" : "সিমুলেটেড ডেমো ভ্যালু"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Week Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-text-muted mt-4 pt-3 border-t border-border/70 font-bengali gap-2">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="text-[11px] sm:text-xs">কোর্স ফি পেমেন্ট ও এনরোলমেন্ট রাজস্ব</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[11px] sm:text-xs">SSLCommerz ও bKash রিয়েল-টাইম সিঙ্ক</span>
          </div>
        </div>

        <div className="text-[10px] sm:text-[11px] text-text-muted flex items-center gap-1">
          <span>টাইম জোন: BST (UTC+৬)</span>
        </div>
      </div>
    </div>
  );
}
