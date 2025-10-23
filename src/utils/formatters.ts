/**
 * Brazilian number formatting utilities
 * Formats numbers and currency according to Brazilian locale (pt-BR)
 */

/**
 * Formats a number to Brazilian currency format
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(99.9) // "R$ 99,90"
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'R$ 0,00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Formats a number to Brazilian decimal format
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string (e.g., "1.234,56")
 * @example
 * formatNumber(1234.56) // "1.234,56"
 * formatNumber(1234.5, 1) // "1.234,5"
 */
export function formatNumber(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || value === '') return '0,00';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

/**
 * Formats a number to Brazilian decimal format without decimal places
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1.234")
 * @example
 * formatInteger(1234) // "1.234"
 */
export function formatInteger(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Parses a Brazilian formatted number string to a number
 * @param value - The formatted string to parse (e.g., "1.234,56")
 * @returns Parsed number
 * @example
 * parseBRNumber("1.234,56") // 1234.56
 * parseBRNumber("R$ 1.234,56") // 1234.56
 */
export function parseBRNumber(value: string): number {
  if (!value) return 0;
  
  // Remove currency symbol and spaces
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Replace thousands separator (.) with nothing
  cleanValue = cleanValue.replace(/\./g, '');
  
  // Replace decimal separator (,) with .
  cleanValue = cleanValue.replace(/,/g, '.');
  
  return parseFloat(cleanValue) || 0;
}

/**
 * Formats a percentage value to Brazilian format
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "12,34%")
 * @example
 * formatPercentage(0.1234) // "12,34%"
 * formatPercentage(12.34) // "12,34%"
 */
export function formatPercentage(value: number | string | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined || value === '') return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  // If value is between 0 and 1, assume it's already in decimal form (0.1234 = 12.34%)
  // If value is > 1, assume it's already in percentage form (12.34 = 12.34%)
  const percentValue = numValue < 1 && numValue > 0 ? numValue * 100 : numValue;
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percentValue) + '%';
}

/**
 * Formats a date to Brazilian format
 * @param date - The date to format
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2025-10-06')) // "06/10/2025"
 * formatDate(new Date('2025-10-06 14:30'), true) // "06/10/2025 14:30"
 */
export function formatDate(date: Date | string | null | undefined, includeTime: boolean = false): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  if (includeTime) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}
