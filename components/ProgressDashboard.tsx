import React, { useMemo } from 'react';
import { HymnDef } from '../constants';
import { HistoryItem } from '../types';
import { TrendingUp, CheckCircle, Clock, AlertCircle, Download, Grid, BarChart3 } from 'lucide-react';

interface ProgressDashboardProps {
    treasury: HymnDef[];
    history: HistoryItem[];
    onSelectHymn: (hymn: HymnDef) => void;
}

export function ProgressDashboard({ treasury, history, onSelectHymn }: ProgressDashboardProps) {
    const stats = useMemo(() => {
        const completed = new Set(history.map(h => {
            const hymn = treasury.find(t => t.ko === h.titles?.ko);
            return hymn?.no;
        }).filter(Boolean));

        const total = 645;
        const completedCount = completed.size;
        const remaining = total - completedCount;
        const percentage = (completedCount / total) * 100;

        // 카테고리별 통계
        const categories = {
            '예배': { range: [1, 62], completed: 0 },
            '성부하나님': { range: [63, 79], completed: 0 },
            '성자예수님': { range: [80, 181], completed: 0 },
            '성령': { range: [182, 197], completed: 0 },
            '성경': { range: [198, 206], completed: 0 },
            '교회': { range: [207, 223], completed: 0 },
            '성례': { range: [224, 233], completed: 0 },
            '천국': { range: [234, 249], completed: 0 },
            '구원': { range: [250, 289], completed: 0 },
            '그리스도인의 삶': { range: [290, 545], completed: 0 },
            '전도와 선교': { range: [546, 575], completed: 0 },
            '행사와 절기': { range: [576, 645], completed: 0 }
        };

        completed.forEach(no => {
            for (const [name, cat] of Object.entries(categories)) {
                if (no >= cat.range[0] && no <= cat.range[1]) {
                    cat.completed++;
                }
            }
        });

        return { completed, completedCount, remaining, percentage, categories };
    }, [treasury, history]);

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs text-emerald-500 font-bold uppercase">Completed</span>
                    </div>
                    <div className="text-4xl font-black text-white">{stats.completedCount}</div>
                    <div className="text-xs text-zinc-500 mt-1">out of 645 hymns</div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span className="text-xs text-amber-500 font-bold uppercase">Remaining</span>
                    </div>
                    <div className="text-4xl font-black text-white">{stats.remaining}</div>
                    <div className="text-xs text-zinc-500 mt-1">hymns to generate</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <span className="text-xs text-purple-500 font-bold uppercase">Progress</span>
                    </div>
                    <div className="text-4xl font-black text-white">{stats.percentage.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500 mt-1">completion rate</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Grid className="w-5 h-5 text-blue-500" />
                        <span className="text-xs text-blue-500 font-bold uppercase">Categories</span>
                    </div>
                    <div className="text-4xl font-black text-white">12</div>
                    <div className="text-xs text-zinc-500 mt-1">hymn categories</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Overall Progress</h3>
                    <span className="text-2xl font-black text-white">{stats.completedCount} / 645</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-6 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-1000 flex items-center justify-end pr-3"
                        style={{ width: `${stats.percentage}%` }}
                    >
                        {stats.percentage > 10 && (
                            <span className="text-xs font-black text-white">{stats.percentage.toFixed(1)}%</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">Category Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(stats.categories).map(([name, cat]) => {
                        const categoryData = cat as { range: [number, number]; completed: number };
                        const total = categoryData.range[1] - categoryData.range[0] + 1;
                        const percentage = (categoryData.completed / total) * 100;

                        return (
                            <div key={name} className="bg-zinc-800/50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-white">{name}</span>
                                    <span className="text-xs text-zinc-500">{categoryData.completed}/{total}</span>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">{percentage.toFixed(0)}% complete</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hymn Grid */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">All 645 Hymns</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-500"></div>
                            <span className="text-zinc-500">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-zinc-700"></div>
                            <span className="text-zinc-500">Pending</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-10 md:grid-cols-20 gap-1 max-h-96 overflow-y-auto custom-scrollbar">
                    {Array.from({ length: 645 }, (_, i) => i + 1).map(no => {
                        const isCompleted = stats.completed.has(no);
                        const hymn = treasury.find(h => h.no === no);

                        return (
                            <button
                                key={no}
                                onClick={() => hymn && onSelectHymn(hymn)}
                                className={`aspect-square rounded text-[10px] font-bold transition-all ${isCompleted
                                    ? 'bg-emerald-500 text-black hover:scale-110 shadow-lg shadow-emerald-500/30'
                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                    }`}
                                title={hymn?.ko || `Hymn ${no}`}
                            >
                                {no}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Export Button */}
            <button
                onClick={() => {
                    const dataStr = JSON.stringify(history, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `찬송가_생성결과_${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                }}
                className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl font-black text-lg uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3"
            >
                <Download className="w-6 h-6" />
                Export All Generated Prompts ({history.length} hymns)
            </button>
        </div>
    );
}
