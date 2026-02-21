import React, { useState } from 'react';
import { HymnDef } from '../constants';
import { HistoryItem } from '../types';
import { Zap, Play, Pause, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { generateSunoPrompt } from '../services/geminiService';

interface BatchGeneratorProps {
    treasury: HymnDef[];
    history: HistoryItem[];
    onBatchComplete: (items: HistoryItem[]) => void;
}

export function BatchGenerator({ treasury, history, onBatchComplete }: BatchGeneratorProps) {
    const [selectedHymns, setSelectedHymns] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [generatedItems, setGeneratedItems] = useState<HistoryItem[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    const completedNos = new Set(history.map(h => {
        const hymn = treasury.find(t => t.ko === h.titles?.ko);
        return hymn?.no;
    }).filter(Boolean));

    const toggleHymn = (no: number) => {
        setSelectedHymns(prev =>
            prev.includes(no) ? prev.filter(n => n !== no) : [...prev, no]
        );
    };

    const selectRange = (start: number, end: number) => {
        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        setSelectedHymns(range);
    };

    const selectAll = () => {
        setSelectedHymns(treasury.map(h => h.no));
    };

    const selectUncompleted = () => {
        setSelectedHymns(treasury.filter(h => !completedNos.has(h.no)).map(h => h.no));
    };

    const startBatchGeneration = async () => {
        setIsGenerating(true);
        setProgress({ current: 0, total: selectedHymns.length });
        const newItems: HistoryItem[] = [];

        for (let i = 0; i < selectedHymns.length; i++) {
            if (isPaused) {
                await new Promise(resolve => {
                    const checkPause = setInterval(() => {
                        if (!isPaused) {
                            clearInterval(checkPause);
                            resolve(true);
                        }
                    }, 100);
                });
            }

            const hymnNo = selectedHymns[i];
            const hymn = treasury.find(h => h.no === hymnNo);
            if (!hymn) continue;

            try {
                const result = await generateSunoPrompt({
                    hymnTheme: hymn.ko,
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
                });

                const item: HistoryItem = {
                    ...result,
                    id: `batch-${Date.now()}-${hymnNo}`,
                    timestamp: Date.now(),
                    multiCovers: { ko: null, en: null, es: null }
                };

                newItems.push(item);
                setGeneratedItems(prev => [...prev, item]);
                setProgress({ current: i + 1, total: selectedHymns.length });

                // 서버 부하 방지
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to generate hymn ${hymnNo}:`, error);
            }
        }

        setIsGenerating(false);
        onBatchComplete(newItems);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-amber-500 mb-2">⚡ Batch Generator</h2>
                        <p className="text-zinc-400 text-sm">Generate multiple hymns at once - Rebirth all 645 hymns</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-white">{selectedHymns.length}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Selected</div>
                    </div>
                </div>
            </div>

            {/* Quick Selection */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Quick Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={selectAll} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all">
                        All 645
                    </button>
                    <button onClick={selectUncompleted} className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-sm font-bold text-amber-500 transition-all">
                        Uncompleted ({treasury.length - completedNos.size})
                    </button>
                    <button onClick={() => selectRange(1, 100)} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all">
                        1-100
                    </button>
                    <button onClick={() => selectRange(101, 200)} className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all">
                        101-200
                    </button>
                </div>
            </div>

            {/* Progress */}
            {isGenerating && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-emerald-500 animate-pulse" />
                            <span className="font-bold text-emerald-500">Generating...</span>
                        </div>
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                    </div>
                    <div className="mt-2 text-sm text-zinc-400 text-center">
                        {progress.current} / {progress.total} ({((progress.current / progress.total) * 100).toFixed(1)}%)
                    </div>
                </div>
            )}

            {/* Hymn Grid */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Select Hymns</h3>
                    <button
                        onClick={() => setSelectedHymns([])}
                        className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        Clear Selection
                    </button>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {treasury.slice(0, 100).map(hymn => {
                        const isSelected = selectedHymns.includes(hymn.no);
                        const isCompleted = completedNos.has(hymn.no);

                        return (
                            <button
                                key={hymn.no}
                                onClick={() => toggleHymn(hymn.no)}
                                className={`aspect-square rounded-lg font-bold text-sm transition-all relative ${isSelected
                                        ? 'bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/50'
                                        : isCompleted
                                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                {hymn.no}
                                {isCompleted && (
                                    <CheckCircle className="w-3 h-3 absolute top-1 right-1 text-emerald-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={startBatchGeneration}
                disabled={selectedHymns.length === 0 || isGenerating}
                className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-zinc-700 disabled:to-zinc-700 rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none flex items-center justify-center gap-3"
            >
                <Zap className="w-6 h-6" />
                {isGenerating ? 'Generating...' : `Generate ${selectedHymns.length} Hymns`}
            </button>
        </div>
    );
}
