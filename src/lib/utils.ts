import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Парсит ISO строку с UTC временем и возвращает Date объект в локальном времени
 */
function parseUTCDate(dateString: string): Date {
  // Если строка уже содержит Z или timezone, используем стандартный парсер
  if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 10)) {
    return new Date(dateString);
  }
  // Если строка без timezone, предполагаем что это UTC и добавляем Z
  return new Date(dateString + 'Z');
}

export function formatDate(dateString: string): string {
  const date = parseUTCDate(dateString);
  return format(date, 'd MMMM, HH:mm', { locale: ru });
}

export function formatDateShort(dateString: string): string {
  const date = parseUTCDate(dateString);
  return format(date, 'd MMM, HH:mm', { locale: ru });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(username: string): string {
  return username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(username: string): string {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
  ];
  const index = username.length % colors.length;
  return colors[index];
}

