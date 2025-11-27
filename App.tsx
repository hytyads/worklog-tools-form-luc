import React, { useState } from 'react';
import { Calendar as CalendarIcon, FileText, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { ViewState } from './types';
import Calendar from './components/Calendar';
import DayView from './components/DayView';
import SummaryGenerator from './components/SummaryGenerator';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setCurrentView(ViewState.DAY_DETAIL);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        // Reuse DayView for "Today" but with Dashboard context
        return (
            <div className="flex flex-col h-full gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="opacity-90">Ready to log your achievements for today, {new Date().toLocaleDateString()}?</p>
                </div>
                <div className="flex-1">
                    <DayView 
                        date={new Date().toISOString().split('T')[0]} 
                        onBack={() => {}} // No back on dashboard
                    />
                </div>
            </div>
        );

      case ViewState.CALENDAR:
        return (
          <Calendar
            onSelectDate={handleSelectDate}
            onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
        );

      case ViewState.DAY_DETAIL:
        return (
          <DayView
            date={selectedDate}
            onBack={() => setCurrentView(ViewState.CALENDAR)}
          />
        );

      case ViewState.SUMMARY:
        return <SummaryGenerator onBack={() => setCurrentView(ViewState.DASHBOARD)} />;
      
      case ViewState.SETTINGS:
        return <Settings onBack={() => setCurrentView(ViewState.DASHBOARD)} />;

      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-100">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="
        fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around
        md:relative md:w-20 md:h-full md:flex-col md:border-t-0 md:border-r md:justify-start md:pt-8 md:gap-8
      ">
        <button
          onClick={() => setCurrentView(ViewState.DASHBOARD)}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${currentView === ViewState.DASHBOARD ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Today</span>
        </button>

        <button
          onClick={() => setCurrentView(ViewState.CALENDAR)}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${currentView === ViewState.CALENDAR || currentView === ViewState.DAY_DETAIL ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <CalendarIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">History</span>
        </button>

        <button
          onClick={() => setCurrentView(ViewState.SUMMARY)}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${currentView === ViewState.SUMMARY ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-medium">Report</span>
        </button>

        <button
          onClick={() => setCurrentView(ViewState.SETTINGS)}
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${currentView === ViewState.SETTINGS ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-hidden p-4 md:p-6 max-w-5xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;