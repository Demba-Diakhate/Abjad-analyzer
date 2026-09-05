export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export function formatNumber(value: number): string {
  return String(value);
}