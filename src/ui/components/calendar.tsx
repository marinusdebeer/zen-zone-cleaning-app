/**
 * ⚠️ MODULAR DESIGN REMINDER
 * This file is 567+ lines and should be refactored into smaller components.
 * See docs/MODULAR_DESIGN.md for guidelines.
 * Target: <300 lines per component
 * 
 * Suggested extractions:
 * - Calendar header navigation component
 * - Day/week/month view components
 * - Event card/block component
 * - Drag and drop logic into custom hook
 */

'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  client: string;
  address: string;
  startTime: Date;
  endTime: Date;
  assignee: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'pending';
  color?: string;
  visitData?: any; // Full visit data for modal
}

interface Client {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
  }[];
}

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Service {
  name: string;
  defaultPrice?: number;
}

interface CalendarProps {
  jobs: Job[];
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onJobCreate?: (job: any) => void;
  onVisitClick?: (visitId: string, visitData?: any) => void;
  clients: Client[];
  teamMembers: TeamMember[];
  services: Service[];
  orgId: string;
}

interface DragSelection {
  startDate: Date;
  endDate: Date;
  dayIndex?: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_INCREMENT = 15;
const SLOTS_PER_HOUR = 60 / MINUTES_INCREMENT; // 4 slots per hour

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-[var(--tenant-job-scheduled)] border-[var(--tenant-job-scheduled-border)]';
    case 'in-progress': return 'bg-[var(--tenant-job-in-progress)] border-[var(--tenant-job-in-progress-border)]';
    case 'completed': return 'bg-[var(--tenant-job-completed)] border-[var(--tenant-job-completed-border)]';
    case 'pending': return 'bg-[var(--tenant-job-pending)] border-[var(--tenant-job-pending-border)]';
    default: return 'bg-[var(--tenant-job-scheduled)] border-[var(--tenant-job-scheduled-border)]';
  }
};

export function Calendar({ jobs, view, currentDate, onDateChange, onViewChange, onJobCreate, onVisitClick, clients, teamMembers, services, orgId }: CalendarProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTimes, setModalTimes] = useState<{ start: Date; end: Date } | null>(null);
  const dragStartRef = useRef<{ hour: number; dayIndex: number; date: Date } | null>(null);

  // Calendar navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Get calendar days for month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get jobs for a specific date
  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.startTime);
      return (
        jobDate.getDate() === date.getDate() &&
        jobDate.getMonth() === date.getMonth() &&
        jobDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Drag handlers for creating jobs (15-minute increments)
  const handleMouseDown = (hour: number, minute: number, dayIndex: number, date: Date) => {
    console.log('🖱️ Mouse down:', { hour, minute, time: `${hour}:${minute.toString().padStart(2, '0')}` });
    setIsDragging(true);
    const startDate = new Date(date);
    startDate.setHours(hour, minute, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(hour, minute + MINUTES_INCREMENT, 0, 0);
    dragStartRef.current = { hour, dayIndex, date: startDate };
    setDragSelection({ startDate, endDate, dayIndex });
    console.log('✅ Start time set to:', startDate.toLocaleTimeString());
  };

  const handleMouseEnter = (hour: number, minute: number, dayIndex: number, date: Date) => {
    if (isDragging && dragStartRef.current) {
      const endDate = new Date(date);
      endDate.setHours(hour, minute + MINUTES_INCREMENT, 0, 0);
      setDragSelection({
        startDate: dragStartRef.current.date,
        endDate,
        dayIndex: dragStartRef.current.dayIndex
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragSelection) {
      setIsDragging(false);
      setModalTimes({
        start: dragSelection.startDate,
        end: dragSelection.endDate
      });
      setShowModal(true);
      setDragSelection(null);
      dragStartRef.current = null;
    }
  };

  const handleJobSave = (jobData: any) => {
    console.log('New job created:', jobData);
    if (onJobCreate) {
      onJobCreate(jobData);
    }
    setShowModal(false);
    setModalTimes(null);
  };

  const isSlotInSelection = (hour: number, minute: number, dayIndex: number) => {
    if (!dragSelection || dragSelection.dayIndex !== dayIndex) return false;
    const slotTime = hour * 60 + minute;
    const selectionStartMinutes = dragSelection.startDate.getHours() * 60 + dragSelection.startDate.getMinutes();
    const selectionEndMinutes = dragSelection.endDate.getHours() * 60 + dragSelection.endDate.getMinutes();
    return slotTime >= selectionStartMinutes && slotTime < selectionEndMinutes;
  };

  // Month View
  const renderMonthView = () => {
    const days = getMonthDays();

    return (
      <div className="bg-brand-bg h-full w-full flex flex-col overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {days.map((date, index) => {
            const dayJobs = date ? getJobsForDate(date) : [];
            const isToday = date && 
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`min-h-[100px] border-b border-r border-gray-200 dark:border-gray-700 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !date ? 'bg-gray-50 dark:bg-gray-900' : 'bg-brand-bg'
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'flex items-center justify-center w-7 h-7 bg-brand text-white rounded-full' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayJobs.slice(0, 3).map(job => (
                        <button
                          key={job.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onVisitClick?.(job.id, job.visitData);
                          }}
                          className={`block w-full text-left text-xs p-1.5 rounded ${getStatusColor(job.status)} text-white truncate hover:opacity-90 transition-opacity cursor-pointer`}
                        >
                          <div className="font-medium truncate">{job.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="truncate">{job.client}</div>
                        </button>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 pl-1.5">
                          +{dayJobs.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="bg-brand-bg h-full w-full flex flex-col overflow-hidden">
        {/* Time grid header */}
        <div className="flex border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
          <div className="w-12 flex-shrink-0 p-2 text-[10px] font-semibold text-gray-700 dark:text-gray-300 text-right pr-1.5 border-r border-gray-200 dark:border-gray-700">Time</div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={index} className={`p-2 text-center ${isToday ? 'bg-brand dark:bg-gray-700/70' : ''}`}>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{DAYS[day.getDay()]}</div>
                  <div className={`text-base font-bold ${isToday ? 'text-brand' : 'text-gray-900 dark:text-white'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time slots with 15-minute increments */}
        <div className="overflow-y-auto flex-1" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {HOURS.filter(h => h >= 6 && h <= 22).map(hour => (
            <div key={hour}>
              {Array.from({ length: SLOTS_PER_HOUR }).map((_, slotIndex) => {
                const minute = slotIndex * MINUTES_INCREMENT;
                const isFirstSlot = slotIndex === 0;
                const borderClass = isFirstSlot ? 'border-t-2 border-t-gray-300 dark:border-t-gray-600' : 'border-t border-t-gray-100 dark:border-t-gray-700';
                
                return (
                  <div key={`${hour}-${minute}`} className={`flex ${borderClass}`}>
                    {/* Time label column */}
                    <div className={`w-12 flex-shrink-0 p-1 text-[10px] text-gray-500 dark:text-gray-400 text-right pr-1.5 border-r border-gray-200 dark:border-gray-700 ${isFirstSlot ? 'font-medium' : ''}`}>
                      {isFirstSlot ? (
                        <span>{hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                      ) : (
                        <span className="text-gray-400">:{minute.toString().padStart(2, '0')}</span>
                      )}
                    </div>
                    
                    {/* Day columns - Equal width */}
                    <div className="flex-1 grid grid-cols-7">
                    {weekDays.map((day, dayIndex) => {
                      const dayJobs = getJobsForDate(day).filter(job => {
                        const jobHour = job.startTime.getHours();
                        const jobMinute = job.startTime.getMinutes();
                        return jobHour === hour && jobMinute === minute;
                      });
                      const isSelected = isSlotInSelection(hour, minute, dayIndex);

                      return (
                        <div 
                          key={dayIndex} 
                          className={`relative min-h-[15px] border-r border-gray-100 dark:border-gray-700 p-0.5 cursor-crosshair transition-colors ${
                            isSelected ? 'bg-brand/30 dark:bg-brand/20 border-l-2 border-brand' : 'hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent'
                          }`}
                          onMouseDown={() => handleMouseDown(hour, minute, dayIndex, day)}
                          onMouseEnter={() => handleMouseEnter(hour, minute, dayIndex, day)}
                        >
                          {dayJobs.map(job => {
                            const duration = (job.endTime.getTime() - job.startTime.getTime()) / (1000 * 60);
                            const height = Math.max(duration / 15 * 15, 30); // 15px per 15-min slot
                            
                            return (
                            <button
                              key={job.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onVisitClick?.(job.id, job.visitData);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className={`absolute top-0 left-0.5 right-0.5 ${getStatusColor(job.status)} text-white rounded p-1 text-[10px] hover:opacity-90 transition-opacity overflow-hidden shadow-sm z-10 cursor-pointer text-left`}
                              style={{ height: `${height}px` }}
                            >
                              <div className="font-semibold truncate leading-tight">{job.client}</div>
                              {job.title && <div className="text-[9px] opacity-90 truncate leading-tight">{job.title}</div>}
                            </button>
                            );
                          })}
                        </div>
                      );
                    })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayJobs = getJobsForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
      <div className="bg-brand-bg h-full w-full flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {DAYS[currentDate.getDay()]} {isToday && '• Today'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {dayJobs.length} jobs scheduled
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {HOURS.filter(h => h >= 6 && h <= 22).map(hour => (
            <div key={hour}>
              {Array.from({ length: SLOTS_PER_HOUR }).map((_, slotIndex) => {
                const minute = slotIndex * MINUTES_INCREMENT;
                const isFirstSlot = slotIndex === 0;
                const borderClass = isFirstSlot ? 'border-t-2 border-t-gray-300 dark:border-t-gray-600' : 'border-t border-t-gray-100 dark:border-t-gray-700';
                const slotJobs = dayJobs.filter(job => {
                  const jobHour = job.startTime.getHours();
                  const jobMinute = job.startTime.getMinutes();
                  return jobHour === hour && jobMinute === minute;
                });
                const isSelected = isSlotInSelection(hour, minute, 0);

                return (
                  <div key={`${hour}-${minute}`} className={`flex ${borderClass}`}>
                    <div className={`w-12 flex-shrink-0 p-1 text-[10px] text-gray-500 dark:text-gray-400 text-right pr-1.5 border-r border-gray-200 dark:border-gray-700 ${isFirstSlot ? 'font-medium' : ''}`}>
                      {isFirstSlot ? (
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">:{minute.toString().padStart(2, '0')}</span>
                      )}
                    </div>
                    <div 
                      className={`flex-1 p-1 min-h-[15px] cursor-crosshair transition-colors ${
                        isSelected ? 'bg-brand/30 dark:bg-brand/20 border-l-2 border-brand' : 'hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent'
                      }`}
                      onMouseDown={() => handleMouseDown(hour, minute, 0, currentDate)}
                      onMouseEnter={() => handleMouseEnter(hour, minute, 0, currentDate)}
                    >
                      {slotJobs.length === 0 ? (
                        <div className="h-full"></div>
                      ) : (
                        <div className="relative">
                          {slotJobs.map((job) => {
                            const duration = (job.endTime.getTime() - job.startTime.getTime()) / (1000 * 60);
                            const height = Math.max(duration / 15 * 15, 30); // 15px per 15-min slot
                            
                            return (
                              <button
                                key={job.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVisitClick?.(job.id, job.visitData);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={`block w-full text-left ${getStatusColor(job.status)} text-white rounded p-2 hover:opacity-90 transition-opacity shadow-sm mb-1 cursor-pointer`}
                                style={{ minHeight: `${height}px` }}
                              >
                                <div className="flex items-center space-x-1 mb-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs font-semibold">
                                    {job.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                    {job.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm">{job.client}</h4>
                                {job.title && <p className="text-xs opacity-90 mt-0.5">{job.title}</p>}
                                <p className="text-[10px] opacity-75 mt-0.5 truncate">{job.address}</p>
                                <div className="mt-1 flex items-center space-x-1">
                                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{job.assignee}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-brand-bg">
      {/* Ultra-Compact Calendar Controls */}
      <div className="flex items-center justify-between bg-brand-bg border-b-2 border-gray-300 dark:border-gray-600 px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-transparent"
          >
            Today
          </button>
          
          <div className="flex items-center">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {view === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
            {view === 'day' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
          </h2>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-1 focus:ring-brand focus:border-transparent bg-brand-bg text-gray-900 dark:text-white"
          >
            <option value="all">All Teams</option>
            <option value="team-a">Team A</option>
            <option value="team-b">Team B</option>
          </select>

          {/* View Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-0.5">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors capitalize ${
                  view === v
                    ? 'bg-brand-bg text-brand dark:text-brand shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center px-2 py-1 bg-brand text-white rounded hover:bg-brand transition-colors text-xs"
          >
            <Plus className="w-3 h-3 mr-0.5" />
            New
          </Link>
        </div>
      </div>

      {/* Calendar Views - Full Height */}
      <div className="flex-1 overflow-hidden">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Job Creation Modal */}
      {showModal && modalTimes && (
        <div className="fixed inset-0 top-16 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="bg-brand-bg rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Job</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Time slot selected: {modalTimes.start.toLocaleTimeString()} - {modalTimes.end.toLocaleTimeString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click below to create a new job with this time slot.
              </p>
              <div className="flex gap-3">
                <Link
                  href={`/jobs/new?startTime=${modalTimes.start.toISOString()}&endTime=${modalTimes.end.toISOString()}`}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:opacity-90 transition-opacity text-center"
                  onClick={() => {
                    setShowModal(false);
                    setModalTimes(null);
                  }}
                >
                  Go to Job Creation
                </Link>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setModalTimes(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
