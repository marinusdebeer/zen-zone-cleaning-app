/**
 * VISIT GENERATION UTILITY
 * 
 * Purpose:
 * Generates all visits for recurring jobs upfront.
 * Maximum 5 years or 1,825 visits to prevent infinite generation.
 * 
 * Functions:
 * - generateVisitsForJob: Main generation function
 * - calculateVisitCount: Preview how many visits will be created
 * - getVisitPreview: Get first N visit dates for preview
 * 
 * Business Logic:
 * - Supports patterns: daily, weekly, biweekly, monthly
 * - Respects recurringDays for weekly/biweekly patterns
 * - Generates from start date to end date (or +5 years max)
 * - Returns array of visit objects ready for Prisma creation
 * 
 * ⚠️ MODULAR DESIGN: Keep under 200 lines
 */

import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay } from 'date-fns';

interface JobSchedule {
  isRecurring: boolean;
  recurringPattern?: string | null; // 'daily', 'weekly', 'biweekly', 'monthly'
  recurringDays?: number[] | null; // [0,1,2,3,4,5,6] for days of week (0=Sunday)
  startDate?: Date | null;
  startTime?: string | null; // Time in HH:mm format (e.g., "14:00")
  recurringEndDate?: Date | null;
  duration?: number; // Duration in minutes (default 120 = 2 hours)
}

interface GeneratedVisit {
  scheduledAt: Date;
  duration: number; // in minutes
  status: string;
}

const MAX_YEARS = 5;
const MAX_VISITS = 1825; // 5 years * 365 days (safeguard for daily jobs)

/**
 * Generates all visits for a job based on its recurring pattern
 * @param jobSchedule - The job's schedule configuration
 * @returns Array of visit objects ready to be created
 */
export function generateVisitsForJob(jobSchedule: JobSchedule): GeneratedVisit[] {
  const duration = jobSchedule.duration || 120; // Default 2 hours
  
  // Helper function to apply time to a date
  const applyTimeToDate = (date: Date): Date => {
    const result = new Date(date);
    if (jobSchedule.startTime) {
      const [hours, minutes] = jobSchedule.startTime.split(':').map(Number);
      result.setHours(hours, minutes, 0, 0);
    }
    return result;
  };
  
  if (!jobSchedule.isRecurring || !jobSchedule.startDate) {
    // One-off job: single visit on start date with time
    const scheduledAt = applyTimeToDate(jobSchedule.startDate || new Date());
    return [{
      scheduledAt,
      duration,
      status: 'Scheduled'
    }];
  }

  const visits: GeneratedVisit[] = [];
  const startDate = startOfDay(new Date(jobSchedule.startDate));
  
  // Calculate end date (either specified or 5 years from start)
  const maxEndDate = addYears(startDate, MAX_YEARS);
  const endDate = jobSchedule.recurringEndDate 
    ? startOfDay(new Date(jobSchedule.recurringEndDate))
    : maxEndDate;
  
  // Ensure we don't exceed 5 year maximum
  const finalEndDate = isBefore(endDate, maxEndDate) ? endDate : maxEndDate;

  const pattern = jobSchedule.recurringPattern?.toLowerCase();
  
  // For biweekly, we need to track weeks
  let weekCounter = 0;
  let lastVisitDate = startDate;

  let currentDate = startDate;
  let visitCount = 0;

  while (isBefore(currentDate, finalEndDate) && visitCount < MAX_VISITS) {
    // Check if this date should have a visit based on recurring pattern
    const shouldGenerate = shouldGenerateVisitOnDate(
      currentDate, 
      jobSchedule, 
      startDate,
      pattern === 'biweekly' ? weekCounter : 0
    );
    
    if (shouldGenerate) {
      visits.push({
        scheduledAt: applyTimeToDate(new Date(currentDate)),
        duration,
        status: 'Scheduled'
      });
      visitCount++;
      
      // For biweekly, increment week counter when we generate a visit
      if (pattern === 'biweekly') {
        const weeksSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        weekCounter = Math.floor(weeksSinceStart / 2);
      }
    }

    // Move to next candidate date based on pattern
    currentDate = getNextCandidateDate(currentDate, jobSchedule);
  }

  return visits;
}

/**
 * Helper function to add years to a date
 */
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Determines if a visit should be generated on a specific date
 * @param date - The date to check
 * @param schedule - Job schedule configuration
 * @param startDate - The job's start date
 * @param biweeklyCounter - For biweekly jobs, track which 2-week cycle we're in
 */
function shouldGenerateVisitOnDate(
  date: Date, 
  schedule: JobSchedule, 
  startDate: Date,
  biweeklyCounter: number = 0
): boolean {
  if (!schedule.recurringPattern) return false;

  const pattern = schedule.recurringPattern.toLowerCase();
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

  switch (pattern) {
    case 'daily':
      // Generate every day
      return true;

    case 'weekly':
      // Check if this day of week is in the allowed days
      if (schedule.recurringDays && Array.isArray(schedule.recurringDays)) {
        return schedule.recurringDays.includes(dayOfWeek);
      }
      // If no specific days set, use the start date's day of week
      return dayOfWeek === startDate.getDay();

    case 'biweekly':
      // Calculate weeks since start date
      const weeksSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const isEvenWeek = Math.floor(weeksSinceStart / 2) * 2 === weeksSinceStart;
      
      // Only generate on even weeks (0, 2, 4, etc.)
      if (!isEvenWeek) return false;
      
      // Check if this day of week is in the allowed days
      if (schedule.recurringDays && Array.isArray(schedule.recurringDays)) {
        return schedule.recurringDays.includes(dayOfWeek);
      }
      // If no specific days set, use the start date's day of week
      return dayOfWeek === startDate.getDay();

    case 'monthly':
      // For monthly, only on the same day of month as start date
      const startDayOfMonth = startDate.getDate();
      const currentDayOfMonth = date.getDate();
      return currentDayOfMonth === startDayOfMonth;

    default:
      return false;
  }
}

/**
 * Gets the next candidate date based on the recurring pattern
 */
function getNextCandidateDate(currentDate: Date, schedule: JobSchedule): Date {
  const pattern = schedule.recurringPattern?.toLowerCase();

  switch (pattern) {
    case 'daily':
      return addDays(currentDate, 1);

    case 'weekly':
      return addDays(currentDate, 1); // Check every day, filter by recurringDays

    case 'biweekly':
      return addDays(currentDate, 1); // Check every day, apply biweekly logic

    case 'monthly':
      // For monthly, we need to maintain the same day of month
      const nextMonth = addMonths(currentDate, 1);
      // If the day doesn't exist in next month (e.g., Jan 31 -> Feb 28), use last day
      if (nextMonth.getDate() < currentDate.getDate()) {
        nextMonth.setDate(0); // Sets to last day of previous month
      }
      return nextMonth;

    default:
      return addDays(currentDate, 1);
  }
}

/**
 * Calculates the total number of visits that will be generated
 * Useful for showing preview before creating the job
 */
export function calculateVisitCount(jobSchedule: JobSchedule): number {
  return generateVisitsForJob(jobSchedule).length;
}

/**
 * Gets a preview of the first N visits
 */
export function getVisitPreview(jobSchedule: JobSchedule, count: number = 10): Date[] {
  const visits = generateVisitsForJob(jobSchedule);
  return visits.slice(0, count).map(v => v.scheduledAt);
}

