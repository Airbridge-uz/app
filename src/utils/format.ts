import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format time as HH:mm
 */
export function formatTime(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, 'HH:mm');
    } catch {
        return dateString;
    }
}

/**
 * Format date as "Mon, Dec 8"
 */
export function formatDate(dateString: string): string {
    try {
        const date = parseISO(dateString);
        return format(date, 'EEE, MMM d');
    } catch {
        return dateString;
    }
}

/**
 * Format duration from minutes to "Xh Ym"
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
    return formatDistanceToNow(date, { addSuffix: true });
}
