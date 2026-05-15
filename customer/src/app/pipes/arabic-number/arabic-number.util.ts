const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';

export function toArabicNumerals(value: number | string | null | undefined): string {
  if (value == null) return '';
  return String(value).replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]);
}

export function formatArabicNumber(value: number | string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  const num = typeof value === 'number' ? value : Number(str.replace(/[^0-9.\-]/g, ''));
  if (isNaN(num)) return toArabicNumerals(str);
  const formatted = num.toLocaleString('en-US');
  return toArabicNumerals(formatted).replace(/,/g, '٬');
}

export function formatArabicDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const day = toArabicNumerals(d.getDate());
  const month = d.toLocaleDateString('ar-SA', { month: 'long' });
  const year = toArabicNumerals(d.getFullYear());
  return `${day} ${month} ${year}`;
}

export function formatArabicTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '--:--';
  if (timeStr.includes(':')) {
    return timeStr.replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]);
  }
  return timeStr;
}

export function formatArabicDateTime(dateStr: string | null | undefined, timeStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('ar-SA', { weekday: 'long' });
  const day = toArabicNumerals(d.getDate());
  const month = d.toLocaleDateString('ar-SA', { month: 'long' });
  const year = toArabicNumerals(d.getFullYear());
  return `${weekday}، ${day} ${month} ${year}`;
}
