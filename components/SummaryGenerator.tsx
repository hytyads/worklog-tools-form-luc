
import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Download, Calendar as CalendarIcon, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getRecordsInRange, getUserSettings, saveSummaryRecord, getSummaryHistory, deleteSummaryRecord } from '../services/storageService';
import { generateWorkSummary } from '../services/geminiService';
import { SummaryRecord } from '../types';
import Button from './Button';

interface SummaryGeneratorProps {
  onBack: () => void;
}

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({ onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  
  // Generate State
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // History State
  const [history, setHistory] = useState<SummaryRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getSummaryHistory());
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSummary(''); // Clear previous
    try {
      const records = getRecordsInRange(startDate, endDate);
      const settings = getUserSettings();
      // Pass full settings object now
      const result = await generateWorkSummary(
        records, 
        startDate, 
        endDate, 
        settings
      );
      
      setSummary(result);

      // Only save if result is valid and meaningful (basic check)
      if (result && !result.includes("Failed to generate") && !result.includes("发生错误")) {
        saveSummaryRecord({
          startDate,
          endDate,
          content: result
        });
        loadHistory(); // Refresh history
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDownload = (text: string, start: string, end: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${start}-to-${end}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Delete this saved summary?')) {
      deleteSummaryRecord(id);
      loadHistory();
    }
  };

  const handleViewHistoryItem = (record: SummaryRecord) => {
    setStartDate(record.startDate);
    setEndDate(record.endDate);
    setSummary(record.content);
    setActiveTab('generate'); // Switch back to view it
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
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('generate')}
             className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'generate' ? 'bg-white shadow text-purple-700' : 'text-slate-600 hover:text-slate-800'}`}
           >
             Generator
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white shadow text-purple-700' : 'text-slate-600 hover:text-slate-800'}`}
           >
             History
           </button>
        </div>
        <div className="w-10"></div>
      </div>

      {activeTab === 'generate' ? (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {/* Controls */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between mb-2">
                 <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    New Report
                 </h3>
                 <div className="flex gap-2">
                    <button onClick={() => setRange(0)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Today</button>
                    <button onClick={() => setRange(1)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Last 2 Days</button>
                    <button onClick={() => setRange(6)} className="text-xs bg-white border px-2 py-1 rounded hover:bg-slate-100">Last Week</button>
                 </div>
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
                Generate
              </Button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-semibold text-slate-700">Report Preview</h3>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => handleCopy(summary)} disabled={!summary} className="!p-1" title="Copy">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={() => handleDownload(summary, startDate, endDate)} disabled={!summary} className="!p-1" title="Download">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <textarea
              className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm text-slate-700 leading-relaxed"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={isGenerating ? "AI is thinking..." : "Your generated summary will appear here. \n\nNewly generated summaries are automatically saved to History."}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                Report History
            </h3>
            
            {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p>No saved reports yet.</p>
                    <p className="text-sm">Generate a summary to see it here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-2">
                                <div className="cursor-pointer" onClick={() => handleViewHistoryItem(item)}>
                                    <h4 className="font-semibold text-slate-800">
                                        {item.startDate} <span className="text-slate-400 mx-1">to</span> {item.endDate}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Generated: {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" className="!p-1.5 text-slate-400 hover:text-blue-600" onClick={() => handleDownload(item.content, item.startDate, item.endDate)} title="Download">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" className="!p-1.5 text-slate-400 hover:text-red-600" onClick={(e) => handleDeleteHistory(item.id, e)} title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div 
                                className="bg-slate-50 rounded p-3 text-xs text-slate-600 font-mono line-clamp-3 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleViewHistoryItem(item)}
                            >
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SummaryGenerator;
