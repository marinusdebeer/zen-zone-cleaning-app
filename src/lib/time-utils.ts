/**
 * TIME UTILITY FUNCTIONS
 * 
 * Purpose:
 * Reusable time formatting and calculation utilities
 */

/**
 * Format duration in minutes to "Xh Ym" format
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Parse duration string to minutes
 * @param duration - String like "2h 30m", "2h", or "30m"
 * @returns Duration in minutes
 */
export function parseDuration(duration: string): number {
  let totalMinutes = 0;
  
  const hoursMatch = duration.match(/(\d+)h/);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  const minutesMatch = duration.match(/(\d+)m/);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  return totalMinutes || 0;
}

/**
 * Calculate end time from start time and duration
 * @param startTime - ISO string or Date
 * @param durationMinutes - Duration in minutes
 * @returns End time as Date
 */
export function calculateEndTime(startTime: string | Date, durationMinutes: number): Date {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

