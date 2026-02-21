
import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, Disc, Save, Globe } from 'lucide-react';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear }) => {
  
  const handleExport = () => {
    if (history.length === 0) return;
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sacred_architect_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur border-l border-zinc-800 w-full h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-zinc-400">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Session Log</span>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button onClick={handleExport} className="text-zinc-600 hover:text-amber-500 transition-colors p-1"><Save className="w-4 h-4" /></button>
              <button onClick={onClear} className="text-zinc-600 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center text-zinc-600 text-[10px] py-10 font-bold uppercase tracking-widest opacity-30">
            Archive Empty
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)}
              className="group bg-zinc-800/30 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-3 cursor-pointer transition-all flex gap-3 overflow-hidden relative"
            >
              {/* Thumbnail - Prefer EN cover, then legacy coverArt */}
              <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                {(item?.multiCovers?.en || item?.coverArt) ? (
                  <img src={item.multiCovers?.en || item.coverArt} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Disc className="w-6 h-6 text-zinc-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black text-white truncate group-hover:text-amber-500 transition-colors uppercase tracking-tight">
                  {item?.titles?.en || item?.title || "Untitled"}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[8px] font-black bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase">{item?.tags?.genre || "Hymn"}</span>
                  <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-tighter">{item?.tags?.key}</span>
                </div>
              </div>
              <Globe className="absolute top-1 right-1 w-2 h-2 text-zinc-700 opacity-50" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
