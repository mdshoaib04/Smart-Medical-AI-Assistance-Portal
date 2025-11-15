import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface AnimatedCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  className?: string;
}

export const AnimatedCalendar: React.FC<AnimatedCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabledDates = [],
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const today = new Date();
  const minDateObj = minDate ? new Date(minDate) : today;
  const maxDateObj = maxDate ? new Date(maxDate) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (date < minDateObj || date > maxDateObj) return true;
    if (disabledDates.includes(dateString)) return true;
    
    return false;
  };

  const isDateSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    if (!isDateDisabled(date)) {
      onDateSelect(dateString);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationDirection(direction);
    
    setTimeout(() => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1);
        } else {
          newMonth.setMonth(prev.getMonth() + 1);
        }
        return newMonth;
      });
      
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 150);
    }, 150);
  };

  const canNavigatePrev = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    return prevMonth >= new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    return nextMonth <= new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          disabled={!canNavigatePrev()}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        
        <button
          onClick={() => navigateMonth('next')}
          disabled={!canNavigateNext()}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 gap-1 transition-all duration-300 ${
        isAnimating ? (animationDirection === 'left' ? 'opacity-0 transform -translate-x-4' : 'opacity-0 transform translate-x-4') : 'opacity-100 transform translate-x-0'
      }`}>
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10"></div>;
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateString = date.toISOString().split('T')[0];
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105
                ${isDisabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : isSelected
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg scale-105'
                    : isTodayDate
                      ? 'bg-teal-100 text-teal-700 font-semibold hover:bg-teal-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${!isDisabled && !isSelected ? 'hover:shadow-md' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-teal-500 to-blue-500"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-teal-100"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-100"></div>
          <span className="text-gray-600">Available</span>
        </div>
      </div>
    </div>
  );
};
