'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, Clock } from 'lucide-react';
import Link from 'next/link';
import { JobModal } from './job-modal';

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
}

interface CalendarProps {
  jobs: Job[];
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onJobCreate?: (job: any) => void;
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
    case 'scheduled': return 'bg-blue-500 border-blue-600';
    case 'in-progress': return 'bg-yellow-500 border-yellow-600';
    case 'completed': return 'bg-green-500 border-green-600';
    case 'pending': return 'bg-gray-400 border-gray-500';
    default: return 'bg-blue-500 border-blue-600';
  }
};

export function Calendar({ jobs, view, currentDate, onDateChange, onViewChange, onJobCreate }: CalendarProps) {
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
      <div className="bg-white h-full w-full flex flex-col overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-700">
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
                className={`min-h-[100px] border-b border-r border-gray-200 p-1.5 hover:bg-gray-50 transition-colors ${
                  !date ? 'bg-gray-50' : ''
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'flex items-center justify-center w-7 h-7 bg-[#4a7c59] text-white rounded-full' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayJobs.slice(0, 3).map(job => (
                        <Link
                          key={job.id}
                          href={`/jobs/${job.id}`}
                          className={`block text-xs p-1.5 rounded ${getStatusColor(job.status)} text-white truncate hover:opacity-90 transition-opacity`}
                        >
                          <div className="font-medium truncate">{job.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="truncate">{job.client}</div>
                        </Link>
                      ))}
                      {dayJobs.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1.5">
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
      <div className="bg-white h-full w-full flex flex-col overflow-hidden">
        {/* Time grid header */}
        <div className="flex border-b-2 border-gray-300 bg-gray-50 sticky top-0 z-10">
          <div className="w-12 flex-shrink-0 p-2 text-[10px] font-semibold text-gray-700 text-right pr-1.5 border-r border-gray-200">Time</div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={index} className={`p-2 text-center ${isToday ? 'bg-[#f7faf7]' : ''}`}>
                  <div className="text-xs text-gray-600">{DAYS[day.getDay()]}</div>
                  <div className={`text-base font-bold ${isToday ? 'text-[#4a7c59]' : 'text-gray-900'}`}>
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
                const borderClass = isFirstSlot ? 'border-t-2 border-t-gray-300' : 'border-t border-t-gray-100';
                
                return (
                  <div key={`${hour}-${minute}`} className={`flex ${borderClass}`}>
                    {/* Time label column */}
                    <div className={`w-12 flex-shrink-0 p-1 text-[10px] text-gray-500 text-right pr-1.5 border-r border-gray-200 ${isFirstSlot ? 'font-medium' : ''}`}>
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
                          className={`relative min-h-[15px] border-r border-gray-100 p-0.5 cursor-crosshair transition-colors ${
                            isSelected ? 'bg-[#4a7c59]/30 border-l-2 border-[#4a7c59]' : 'hover:bg-gray-50'
                          }`}
                          onMouseDown={() => handleMouseDown(hour, minute, dayIndex, day)}
                          onMouseEnter={() => handleMouseEnter(hour, minute, dayIndex, day)}
                        >
                          {dayJobs.map(job => {
                            const duration = (job.endTime.getTime() - job.startTime.getTime()) / (1000 * 60);
                            const height = Math.max(duration / 15 * 15, 30); // 15px per 15-min slot
                            
                            return (
                              <Link
                                key={job.id}
                                href={`/jobs/${job.id}`}
                                className={`absolute top-0 left-0.5 right-0.5 ${getStatusColor(job.status)} text-white rounded p-1 text-[10px] hover:opacity-90 transition-opacity overflow-hidden shadow-sm z-10`}
                                style={{ height: `${height}px` }}
                              >
                                <div className="font-semibold truncate leading-tight">{job.client}</div>
                                <div className="text-[9px] opacity-90 truncate leading-tight">{job.title}</div>
                              </Link>
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
      <div className="bg-white h-full w-full flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">
                {DAYS[currentDate.getDay()]} {isToday && '• Today'}
              </p>
              <p className="text-sm text-gray-500">
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
                const borderClass = isFirstSlot ? 'border-t-2 border-t-gray-300' : 'border-t border-t-gray-100';
                const slotJobs = dayJobs.filter(job => {
                  const jobHour = job.startTime.getHours();
                  const jobMinute = job.startTime.getMinutes();
                  return jobHour === hour && jobMinute === minute;
                });
                const isSelected = isSlotInSelection(hour, minute, 0);

                return (
                  <div key={`${hour}-${minute}`} className={`flex ${borderClass}`}>
                    <div className={`w-12 flex-shrink-0 p-1 text-[10px] text-gray-500 text-right pr-1.5 border-r border-gray-200 ${isFirstSlot ? 'font-medium' : ''}`}>
                      {isFirstSlot ? (
                        <span className="text-xs text-gray-600">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">:{minute.toString().padStart(2, '0')}</span>
                      )}
                    </div>
                    <div 
                      className={`flex-1 p-1 min-h-[15px] cursor-crosshair transition-colors ${
                        isSelected ? 'bg-[#4a7c59]/30 border-l-2 border-[#4a7c59]' : 'hover:bg-gray-50'
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
                              <Link
                                key={job.id}
                                href={`/jobs/${job.id}`}
                                className={`block ${getStatusColor(job.status)} text-white rounded p-2 hover:opacity-90 transition-opacity shadow-sm mb-1`}
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
                                <p className="text-xs opacity-90 mt-0.5">{job.title}</p>
                                <p className="text-[10px] opacity-75 mt-0.5 truncate">{job.address}</p>
                                <div className="mt-1 flex items-center space-x-1">
                                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{job.assignee}</span>
                                </div>
                              </Link>
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
    <div className="flex flex-col h-full w-full bg-white">
      {/* Ultra-Compact Calendar Controls */}
      <div className="flex items-center justify-between bg-white border-b-2 border-gray-300 px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-gray-900">
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
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#4a7c59] focus:border-transparent"
          >
            <option value="all">All Teams</option>
            <option value="team-a">Team A</option>
            <option value="team-b">Team B</option>
          </select>

          {/* View Switcher */}
          <div className="flex bg-gray-100 rounded p-0.5">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors capitalize ${
                  view === v
                    ? 'bg-white text-[#4a7c59] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Link
            href="/jobs/new"
            className="inline-flex items-center px-2 py-1 bg-[#4a8c37] text-white rounded hover:bg-[#4a7c59] transition-colors text-xs"
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
      {modalTimes && (
        <JobModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setModalTimes(null);
          }}
          startTime={modalTimes.start}
          endTime={modalTimes.end}
          onSave={handleJobSave}
        />
      )}
    </div>
  );
}
