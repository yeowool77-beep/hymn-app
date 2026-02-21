import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PromptDisplay } from './components/PromptDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { BatchGenerator } from './components/BatchGenerator';
import { ProgressDashboard } from './components/ProgressDashboard';
import { PromptData, UserPreferences, HistoryItem, MultiCovers } from './types';
import { GLOBAL_HYMN_TREASURY, HymnDef } from './constants';
import { generateSunoPrompt, generateMultiLanguageArtSequential, updateStylePrompt } from './services/geminiService';
import { Cross, Menu, RefreshCw, CheckCircle, Grid, List, Zap } from 'lucide-react';

const DEFAULT_PREFS: UserPreferences = {
  hymnTheme: '',
  language: 'Korean',
  vibe: 'Auto (AI Recommended)',
  genre: 'Auto (AI Recommended)',
  complexity: 'Balanced',
  lyricsPreference: 'Generate Lyrics',
  era: 'Modern Lo-Fi',
  artistReference: '',
  focusMode: 'None',
  backgroundTexture: 'Rain & distant Thunder',
  neuroHook: false,
  introStrategy: 'Nature Start',
  viralContext: 'None',
  bpm: 'Auto (AI Recommended)'
};

const STORAGE_KEY = 'sacred_architect_v5_core';
const TREASURY_STORAGE_KEY = 'sacred_architect_treasury_v5';
const MAX_HISTORY = 100; // 645곡 전체를 위해 증가

export default function App() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [currentPrompt, setCurrentPrompt] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [artLoadingState, setArtLoadingState] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'batch' | 'dashboard'>('single');
  const [batchMode, setBatchMode] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [dynamicTreasury, setDynamicTreasury] = useState<HymnDef[]>(() => {
    try {
      const saved = localStorage.getItem(TREASURY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : GLOBAL_HYMN_TREASURY;
      }
      return GLOBAL_HYMN_TREASURY;
    } catch (e) {
      return GLOBAL_HYMN_TREASURY;
    }
  });

  useEffect(() => {
    try {
      // 이미지 데이터 제외하고 저장 (LocalStorage 용량 초과 방지)
      const historyToSave = history.map(item => ({
        ...item,
        multiCovers: { ko: null, en: null, es: null } // 이미지는 저장 안 함
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyToSave.slice(0, MAX_HISTORY)));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      // 용량 초과 시 오래된 항목 삭제
      try {
        const reduced = history.slice(0, 10); // 최근 10개만 유지
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
      } catch (e2) {
        console.error('Failed to save even reduced history:', e2);
      }
    }
  }, [history]);

  useEffect(() => {
    localStorage.setItem(TREASURY_STORAGE_KEY, JSON.stringify(dynamicTreasury));
  }, [dynamicTreasury]);

  // Reactive Genre Update
  useEffect(() => {
    const handleGenreChangeEffect = async () => {
      if (!currentPrompt || currentPrompt.tags.genre === prefs.genre) return;

      console.log(`🎵 Genre changed to: ${prefs.genre}. Updating prompt...`);
      setLoadingStep(`Updating Style for ${prefs.genre}...`);

      try {
        const newStyle = await updateStylePrompt(
          currentPrompt.titles.ko || currentPrompt.title,
          prefs.genre,
          prefs.vibe
        );

        if (newStyle) {
          setCurrentPrompt(prev => prev ? {
            ...prev,
            stylePrompt: newStyle,
            tags: { ...prev.tags, genre: prefs.genre }
          } : null);

          setHistory(prev => prev.map(h =>
            (h.id === currentPrompt.id)
              ? { ...h, stylePrompt: newStyle, tags: { ...h.tags, genre: prefs.genre } }
              : h
          ));
        }
      } catch (error) {
        console.error("Genre Update Error:", error);
      } finally {
        setLoadingStep('');
      }
    };

    handleGenreChangeEffect();
  }, [prefs.genre, prefs.vibe]);

  const handleGenerate = async () => {
    if (!prefs.hymnTheme) return;

    setLoading(true);
    setLoadingStep('Grounding via Global AI Search...');

    try {
      const result = await generateSunoPrompt(prefs);

      // 검색 완료 후 리스트 업데이트
      const exists = dynamicTreasury.some(h =>
        h.ko.toLowerCase() === result.titles.ko.toLowerCase() ||
        h.en.toLowerCase() === result.titles.en.toLowerCase()
      );

      if (!exists) {
        const newHymn: HymnDef = {
          id: `ai-${Date.now()}`,
          no: 0,
          ko: result.titles.ko,
          en: result.titles.en,
          es: result.titles.es
        };
        setDynamicTreasury(prev => [newHymn, ...prev]);
      }

      const initialId = Date.now().toString();
      const initialItem: HistoryItem = {
        ...result,
        id: initialId,
        timestamp: Date.now(),
        multiCovers: { ko: null, en: null, es: null }
      };

      setCurrentPrompt(initialItem);
      setHistory(prev => [initialItem, ...prev].slice(0, MAX_HISTORY));

      setLoading(false);
      setLoadingStep('Analysis Complete. Rendering Visuals...');
      setTimeout(() => setLoadingStep(''), 3000);

      // 아트 생성
      const langs: (keyof MultiCovers)[] = ['ko', 'en', 'es'];
      for (const lang of langs) {
        handleRetryArt(lang, initialItem);
      }
    } catch (error: any) {
      console.error("Generate Error:", error);
      alert("Analysis failed. The model might be busy or connectivity is unstable.");
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleRetryArt = async (lang: keyof MultiCovers, targetItem?: PromptData) => {
    const item = targetItem || currentPrompt;
    if (!item) return;

    setArtLoadingState(prev => ({ ...prev, [lang]: true }));
    try {
      const artUrl = await generateMultiLanguageArtSequential(item, lang);
      if (artUrl) {
        setCurrentPrompt(prev => (prev && prev.title === item.title) ? {
          ...prev,
          multiCovers: { ...(prev.multiCovers || {}), [lang]: artUrl } as MultiCovers
        } : prev);

        setHistory(prev => prev.map(h =>
          (h.title === item.title)
            ? { ...h, multiCovers: { ...(h.multiCovers || {}), [lang]: artUrl } as MultiCovers }
            : h
        ));
      }
    } catch (e) {
      console.error(`Art failed for ${lang}`, e);
    } finally {
      setArtLoadingState(prev => ({ ...prev, [lang]: false }));
    }
  };

  const completedTitles = history.map(item => item?.titles?.en || item?.title).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-2xl shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Cross className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">SacredArchitect</h1>
              <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">645 Hymns Master v6.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 뷰 모드 전환 */}
            <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'single' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                <List className="w-4 h-4 inline mr-1" />
                Single
              </button>
              <button
                onClick={() => setViewMode('batch')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'batch' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Batch
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${viewMode === 'dashboard' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4 inline mr-1" />
                Progress
              </button>
            </div>

            {loadingStep && (
              <div className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all duration-500 ${loadingStep.includes('Complete') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse'}`}>
                {loadingStep.includes('Complete') ? <CheckCircle className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{loadingStep}</span>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-zinc-400 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"><Menu /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gradient-to-b from-transparent to-zinc-950/50">
          {viewMode === 'single' && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-full">
              <div className="lg:col-span-4 shrink-0">
                <ControlPanel
                  prefs={prefs}
                  setPrefs={setPrefs}
                  onGenerate={handleGenerate}
                  isLoading={loading}
                  completedTitles={completedTitles}
                  dynamicTreasury={dynamicTreasury}
                />
              </div>
              <div className="lg:col-span-8">
                <PromptDisplay
                  data={currentPrompt}
                  artLoadingState={artLoadingState}
                  onRetryArt={handleRetryArt}
                />
              </div>
            </div>
          )}

          {viewMode === 'batch' && (
            <div className="max-w-7xl mx-auto">
              <BatchGenerator
                treasury={dynamicTreasury}
                history={history}
                onBatchComplete={(newItems) => {
                  setHistory(prev => [...newItems, ...prev].slice(0, MAX_HISTORY));
                }}
              />
            </div>
          )}

          {viewMode === 'dashboard' && (
            <div className="max-w-7xl mx-auto">
              <ProgressDashboard
                treasury={dynamicTreasury}
                history={history}
                onSelectHymn={(hymn) => {
                  const existing = history.find(h => h.titles?.ko === hymn.ko);
                  if (existing) {
                    setCurrentPrompt(existing);
                    setViewMode('single');
                  }
                }}
              />
            </div>
          )}
        </main>
      </div>

      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-zinc-950 border-l border-white/5 transform transition-transform duration-500 ease-in-out md:relative md:transform-none ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <HistorySidebar history={history} onSelect={(item) => { setCurrentPrompt(item); setSidebarOpen(false); }} onClear={() => setHistory([])} />
      </div>
    </div>
  );
}
