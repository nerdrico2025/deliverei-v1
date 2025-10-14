/**
 * Helpers para operações com datas
 */

/**
 * Retorna o início do dia (00:00:00.000)
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Retorna o fim do dia (23:59:59.999)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Retorna o início da semana (domingo 00:00:00.000)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Retorna o fim da semana (sábado 23:59:59.999)
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Retorna o início do mês (dia 1, 00:00:00.000)
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Retorna o fim do mês (último dia, 23:59:59.999)
 */
export function getEndOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Adiciona dias a uma data
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtrai dias de uma data
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Adiciona meses a uma data
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Verifica se uma data está no passado
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Verifica se uma data está no futuro
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Verifica se uma data está entre duas outras datas
 */
export function isBetween(
  date: Date,
  startDate: Date,
  endDate: Date,
): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Formata uma data para ISO string sem timezone
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function diffInDays(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
