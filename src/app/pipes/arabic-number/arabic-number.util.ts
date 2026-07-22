const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';

export function toArabicNumerals(value: number | string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (typeof value === 'number') {
    const formatted = value.toLocaleString('en-US');
    return formatted.replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]).replace(/,/g, '٬');
  }
  // For strings: if purely numeric (no colons, spaces, letters), format with separators
  if (/^\d+(\.\d+)?$/.test(value)) {
    const num = Number(value);
    if (!isNaN(num)) {
      const formatted = num.toLocaleString('en-US');
      return formatted.replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]).replace(/,/g, '٬');
    }
  }
  // Otherwise (time strings, plate numbers, etc.), just replace digits
  return str.replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]);
}

export function formatArabicPrice(value: number | string | null | undefined): string {
  if (value == null) return '';
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.\-]/g, ''));
  if (isNaN(num)) return String(value);
  return toArabicNumerals(num);
}

export function formatArabicDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const str = d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  return str.replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]);
}

export function formatArabicTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '--:--';
  return timeStr.replace(/\d/g, d => ARABIC_INDIC[parseInt(d)]);
}
