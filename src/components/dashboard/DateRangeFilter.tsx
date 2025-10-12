import React, { useState } from "react";
import { Calendar } from "lucide-react";

export type DateRangeOption = 
  | "hoje" 
  | "ontem" 
  | "ultimos7dias" 
  | "esteMes" 
  | "esteAno" 
  | "personalizado";

export interface DateRange {
  startDate: Date;
  endDate: Date;
  option: DateRangeOption;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  className?: string;
}

const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "ontem", label: "Ontem" },
  { value: "ultimos7dias", label: "Últimos 7 dias" },
  { value: "esteMes", label: "Este Mês" },
  { value: "esteAno", label: "Este Ano" },
  { value: "personalizado", label: "Personalizado" },
];

/**
 * Calculate date range based on the selected option
 */
function calculateDateRange(option: DateRangeOption, customStart?: Date, customEnd?: Date): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (option) {
    case "hoje":
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        option,
      };
      
    case "ontem":
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        option,
      };
      
    case "ultimos7dias":
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      return {
        startDate: sevenDaysAgo,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        option,
      };
      
    case "esteMes":
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: firstDayOfMonth,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        option,
      };
      
    case "esteAno":
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: firstDayOfYear,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        option,
      };
      
    case "personalizado":
      return {
        startDate: customStart || today,
        endDate: customEnd || new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        option,
      };
      
    default:
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        option: "hoje",
      };
  }
}

export default function DateRangeFilter({ value, onChange, className = "" }: DateRangeFilterProps) {
  const [showCustomDates, setShowCustomDates] = useState(value.option === "personalizado");
  
  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOption = e.target.value as DateRangeOption;
    const isCustom = newOption === "personalizado";
    
    setShowCustomDates(isCustom);
    
    if (!isCustom) {
      const newRange = calculateDateRange(newOption);
      onChange(newRange);
    }
  };
  
  const handleCustomStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value);
    onChange({
      startDate: newStart,
      endDate: value.endDate,
      option: "personalizado",
    });
  };
  
  const handleCustomEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value);
    // Set to end of day
    newEnd.setHours(23, 59, 59, 999);
    onChange({
      startDate: value.startDate,
      endDate: newEnd,
      option: "personalizado",
    });
  };
  
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="text-[#4B5563]" size={20} />
        <select
          value={value.option}
          onChange={handleOptionChange}
          className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#D22630] focus:outline-none focus:ring-1 focus:ring-[#D22630]"
        >
          {dateRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {showCustomDates && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4B5563]">
              Data inicial
            </label>
            <input
              type="date"
              value={formatDateForInput(value.startDate)}
              onChange={handleCustomStartChange}
              className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#D22630] focus:outline-none focus:ring-1 focus:ring-[#D22630]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4B5563]">
              Data final
            </label>
            <input
              type="date"
              value={formatDateForInput(value.endDate)}
              onChange={handleCustomEndChange}
              max={formatDateForInput(new Date())}
              className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#D22630] focus:outline-none focus:ring-1 focus:ring-[#D22630]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Export helper function for use in other components
export { calculateDateRange };
