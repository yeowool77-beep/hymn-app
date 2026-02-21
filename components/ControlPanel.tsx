
import React, { useState, useMemo } from 'react';
import { HYMN_GENRES, LANGUAGES, BPM_OPTIONS, HymnDef } from '../constants';
import { UserPreferences } from '../types';
import { Book, Globe, Sparkles, Zap, Disc, Library, CheckCircle2, Search, Trophy, X, SearchCode } from 'lucide-react';

interface ControlPanelProps {
  prefs: UserPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onGenerate: () => void;
  isLoading: boolean;
  completedTitles: string[];
  dynamicTreasury: HymnDef[]; // 추가: 동적 라이브러리
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  prefs, 
  setPrefs, 
  onGenerate, 
  isLoading, 
  completedTitles,
  dynamicTreasury 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTreasury = useMemo(() => {
    if (!searchTerm) return dynamicTreasury;
    const lower = searchTerm.toLowerCase();
    return dynamicTreasury.filter(h => 
      h.ko.toLowerCase().includes(lower) || 
      h.en.toLowerCase().includes(lower) || 
      h.es.toLowerCase().includes(lower) ||
      h.no?.toString().includes(lower)
    );
  }, [searchTerm, dynamicTreasury]);

  const progress = useMemo(() => {
    const total = 645; 
    const count = completedTitles.length;
    return { count, total, percent: Math.round((count / total) * 100) };
  }, [completedTitles]);

  const handleChange = (field: keyof UserPreferences, value: any) => {
    setPrefs(prev => ({ ...prev, [field]: value }));
  };

  const handleLibraryPick = (hymn: HymnDef) => {
    handleChange('hymnTheme', hymn.ko || hymn.en);
    setSearchTerm(hymn.ko || hymn.en);
  };

  const handleGlobalSearch = () => {
    if (!searchTerm) return;
    handleChange('hymnTheme', searchTerm);
    onGenerate();
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
            <Book className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Global Archive</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{progress.count} MASTERED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-3 min-h-0">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search library or enter ANY title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-4 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all placeholder:text-zinc-600 font-medium"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-700 rounded-full">
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {filteredTreasury.length > 0 ? (
            filteredTreasury.map(hymn => {
              const isCompleted = completedTitles.some(t => t === hymn.en || t === hymn.ko);
              const isSelected = prefs.hymnTheme === hymn.ko || prefs.hymnTheme === hymn.en;
              return (
                <button
                  key={hymn.id}
                  onClick={() => handleLibraryPick(hymn)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group relative overflow-hidden ${
                    isSelected 
                    ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/10' 
                    : 'bg-zinc-800/30 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border ${
                    isSelected ? 'bg-black/10 border-black/20 text-black' : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                  }`}>
                    {hymn.no || 'AI'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-black uppercase tracking-tight truncate ${isSelected ? 'text-black' : 'text-zinc-200'}`}>{hymn.ko}</div>
                    <div className={`text-[10px] font-bold opacity-60 truncate ${isSelected ? 'text-black/70' : 'text-zinc-500'}`}>
                      {hymn.en}
                    </div>
                  </div>
                  {isCompleted && <CheckCircle2 className={`w-5 h-5 ${isSelected ? 'text-black' : 'text-amber-500'} flex-shrink-0`} />}
                </button>
              );
            })
          ) : searchTerm.length > 1 ? (
            <button
              onClick={handleGlobalSearch}
              className="w-full p-6 border-2 border-dashed border-zinc-800 rounded-3xl text-center space-y-3 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-amber-500 group-hover:scale-110 transition-all">
                <SearchCode className="w-6 h-6 text-zinc-500 group-hover:text-black" />
              </div>
              <div>
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-white">Global AI Deep Search</p>
                <p className="text-[10px] text-zinc-600 font-medium">Analyze "{searchTerm}" via Web Database</p>
              </div>
            </button>
          ) : (
            <div className="text-center py-10 text-zinc-600">
              <Library className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Library Empty</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Genre
            </label>
            <select 
              value={prefs.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-xl p-2.5 text-[11px] font-bold focus:ring-2 focus:ring-amber-500 transition-all"
            >
              {HYMN_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3 h-3" /> BPM
            </label>
            <select 
              value={prefs.bpm}
              onChange={(e) => handleChange('bpm', e.target.value)}
              className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-xl p-2.5 text-[11px] font-bold"
            >
              {BPM_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading || !searchTerm}
          className={`w-full py-5 rounded-2xl font-black text-lg tracking-tighter flex items-center justify-center space-x-3 transition-all shadow-xl group ${
            isLoading || !searchTerm
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-br from-amber-400 to-amber-600 text-black hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <Disc className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>SEARCH & CONSTRUCT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
