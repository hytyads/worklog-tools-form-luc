import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Download, Save, X } from 'lucide-react';
import { getRecordsByDate, addRecord, updateRecord, deleteRecord } from '../services/storageService';
import { WorkRecord } from '../types';
import Button from './Button';

interface DayViewProps {
  date: string;
  onBack: () => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onBack }) => {
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRecords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const loadRecords = () => {
    setRecords(getRecordsByDate(date));
  };

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newEntry.trim()) return;

    try {
      addRecord(date, newEntry.trim());
      setNewEntry('');
      loadRecords();
      // Keep focus
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleEditStart = (record: WorkRecord) => {
    setEditingId(record.id);
    setEditContent(record.content);
  };

  const handleEditSave = (id: string) => {
    if (!editContent.trim()) return;
    updateRecord(date, id, editContent.trim());
    setEditingId(null);
    loadRecords();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteRecord(date, id);
      loadRecords();
    }
  };

  const handleDownload = () => {
    if (records.length === 0) return;
    const content = records.map((r, i) => `${i + 1}. ${r.content}`).join('\n');
    const blob = new Blob([`Work Log for ${date}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-log-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
            &larr; Back
            </button>
            <h2 className="text-xl font-bold text-slate-800">{displayDate}</h2>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-1 rounded-full">
            {records.length} / 100
            </span>
            <Button variant="secondary" onClick={handleDownload} disabled={records.length === 0} title="Download TXT">
            <Download className="w-4 h-4" />
            </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-b border-slate-100">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="What did you do today?"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
          />
          <Button type="submit" disabled={!newEntry.trim()}>
            <Plus className="w-5 h-5" /> Add
          </Button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p className="text-lg">No records yet.</p>
            <p className="text-sm">Type above to start tracking.</p>
          </div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-start gap-3 group transition-all hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                {editingId === record.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                          if(e.key === 'Enter') handleEditSave(record.id);
                          if(e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                    <button onClick={() => handleEditSave(record.id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                        <Save className="w-4 h-4" />
                    </button>
                     <button onClick={() => setEditingId(null)} className="text-slate-500 hover:bg-slate-100 p-1 rounded">
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-800 break-words whitespace-pre-wrap leading-relaxed">{record.content}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>

              {editingId !== record.id && (
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditStart(record)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DayView;