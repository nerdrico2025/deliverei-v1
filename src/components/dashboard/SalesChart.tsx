import React, { useMemo } from "react";
import { Loading } from "../common/Loading";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface SalesDataPoint {
  data: string;
  total: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Custom tooltip component for the sales chart
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const date = new Date(data.data);
  const formattedDate = formatDate(date);
  const formattedValue = formatCurrency(data.total);

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-lg">
      <p className="text-xs text-[#6B7280]">{formattedDate}</p>
      <p className="text-sm font-semibold text-[#D22630]">{formattedValue}</p>
    </div>
  );
}

/**
 * Format X-axis labels based on date
 */
function formatXAxis(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Format Y-axis labels to Brazilian currency format (compact)
 */
function formatYAxis(value: number): string {
  if (value >= 1000000) {
    // Format millions with Brazilian decimal separator
    const millions = (value / 1000000).toFixed(1).replace('.', ',');
    return `R$ ${millions}M`;
  } else if (value >= 1000) {
    // Format thousands with Brazilian decimal separator
    const thousands = (value / 1000).toFixed(1).replace('.', ',');
    return `R$ ${thousands}K`;
  }
  return formatCurrency(value);
}

export default function SalesChart({ data, loading = false, error = null }: SalesChartProps) {
  // Sort data by date
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { total: 0, average: 0, max: 0, min: 0 };
    }

    const values = data.map(d => d.total);
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, average, max, min };
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex items-center gap-2 text-[#4B5563]">
          <Loading size="sm" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#EF4444]">{error}</p>
          <p className="mt-1 text-xs text-[#6B7280]">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#4B5563]">Nenhum dado de vendas encontrado</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Selecione outro período ou aguarde novos pedidos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Bar */}
      <div className="grid grid-cols-4 gap-3 rounded-lg bg-[#F9FAFB] p-3">
        <div className="text-center">
          <p className="text-xs text-[#6B7280]">Total</p>
          <p className="text-sm font-semibold text-[#1F2937]">
            {formatCurrency(stats.total)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#6B7280]">Média</p>
          <p className="text-sm font-semibold text-[#1F2937]">
            {formatCurrency(stats.average)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#6B7280]">Máximo</p>
          <p className="text-sm font-semibold text-[#16A34A]">
            {formatCurrency(stats.max)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#6B7280]">Mínimo</p>
          <p className="text-sm font-semibold text-[#F59E0B]">
            {formatCurrency(stats.min)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="data"
            tickFormatter={formatXAxis}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis
            tickFormatter={formatYAxis}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6B7280' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#D22630"
            strokeWidth={2}
            dot={{ fill: "#D22630", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
