import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDatesWithData } from '../services/storageService';

interface CalendarProps {
  onSelectDate: (date: string) => void;
  onBack: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onSelectDate, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveDates(new Set(getDatesWithData()));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const renderDays = () => {
    const days = [];
    // Empty cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 md:h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasData = activeDates.has(dateStr);

      days.push(
        <button
          key={day}
          onClick={() => onSelectDate(dateStr)}
          className={`
            relative h-14 md:h-24 border border-slate-100 rounded-lg flex flex-col items-start justify-start p-2 transition-all
            hover:border-blue-300 hover:shadow-md
            ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}
          `}
        >
          <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
            {day}
          </span>
          {hasData && (
            <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-blue-500"></span>
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-slate-50">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          &larr; Back
        </button>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-200 rounded-full">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 w-32 text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-200 rounded-full">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 text-center text-xs font-semibold text-slate-500 py-2">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      <div className="grid grid-cols-7 gap-2 p-2 overflow-y-auto flex-1 bg-slate-50">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;