import React, { useState } from 'react';
import { Sparkles, Copy, Download, Calendar as CalendarIcon } from 'lucide-react';
import { getRecordsInRange } from '../services/storageService';
import { generateWorkSummary } from '../services/geminiService';
import Button from './Button';

interface SummaryGeneratorProps {
  onBack: () => void;
}

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSummary(''); // Clear previous
    try {
      const records = getRecordsInRange(startDate, endDate);
      const result = await generateWorkSummary(records, startDate, endDate);
      setSummary(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    alert('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${startDate}-to-${endDate}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick range helpers
  const setRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
         <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          &larr; Back
        </button>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Summary Generator
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {/* Controls */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <button onClick={() => setRange(0)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Today</button>
            <button onClick={() => setRange(1)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Last 2 Days</button>
            <button onClick={() => setRange(6)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Last Week</button>
            <button onClick={() => setRange(29)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Last Month</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>
            <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating} 
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white"
            >
              Generate Summary
            </Button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
            <h3 className="font-semibold text-slate-700">Generated Report</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!summary} className="!p-1">
                <Copy className="w-4 h-4" />
              </Button>
               <Button variant="ghost" size="sm" onClick={handleDownload} disabled={!summary} className="!p-1">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm text-slate-700 leading-relaxed"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={isGenerating ? "AI is thinking..." : "Your generated summary will appear here. You can edit it manually after generation."}
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryGenerator;