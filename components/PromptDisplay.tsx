
import React, { useState } from 'react';
import { PromptData, MultiCovers } from '../types';
import { Copy, Check, Disc, Mic2, Image as ImageIcon, Loader2, Download, Globe, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';

interface PromptDisplayProps {
  data: PromptData | null;
  artLoadingState?: Record<string, boolean>;
  onRetryArt?: (lang: keyof MultiCovers) => void;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ data, artLoadingState = {}, onRetryArt }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  if (!data) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-600 space-y-4 p-10 border border-zinc-800/50 rounded-3xl bg-zinc-900/20 backdrop-blur-sm border-dashed">
        <Globe className="w-16 h-16 opacity-10 animate-pulse" />
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Ready for Archiving</p>
          <p className="text-[10px] mt-2 opacity-30">Enter any hymn to search global databases and generate mastered assets.</p>
        </div>
      </div>
    );
  }

  const lyricsData = data.multiLyrics || { ko: '', en: '', es: '' };
  const titlesData = data.titles || { ko: data.title, en: data.title, es: data.title };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
  };

  const downloadArt = (url: string | null | undefined, lang: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titlesData.en.replace(/\s+/g, '_')}_${lang}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CoverCard = ({ lang, title, src, flag }: { lang: keyof MultiCovers, title: string, src?: string | null, flag: string }) => {
    const isLoading = artLoadingState[lang];
    const isFailed = !isLoading && !src;

    return (
      <div className="space-y-3 flex-1 min-w-[150px]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{flag}</span>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{lang}</span>
          </div>
          {src && !isLoading && (
            <button onClick={() => downloadArt(src, lang)} className="text-zinc-500 hover:text-amber-500 transition-colors">
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/50 relative group shadow-lg">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Graphic Designing...</span>
            </div>
          ) : src ? (
            <div
              className="relative w-full h-full cursor-pointer overflow-hidden group/image"
              onClick={() => onRetryArt?.(lang)}
              title={`Click to regenerate the ${lang.toUpperCase()} cover art`}
            >
              <img src={src} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105" />

              {/* 재생성 호버 오버레이 */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                <RefreshCw className="w-8 h-8 text-white mb-2" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/20">Regenerate</span>
              </div>
            </div>
          ) : isFailed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/40 p-4 text-center">
              <button onClick={() => onRetryArt?.(lang)} className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-full hover:bg-amber-500 transition-all group/btn mb-2">
                <RefreshCw className="w-5 h-5 text-amber-500 group-hover/btn:text-black" />
              </button>
              <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest">Retry Render</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-800/30 italic text-[9px] font-bold uppercase tracking-widest">Pending</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Search Grounding Sources */}
      {data.sources && data.sources.length > 0 && (
        <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-3xl shadow-inner">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] block mb-2">Verified Search Origins</span>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-h">
              {data.sources.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-[9px] text-zinc-400 hover:text-white transition-all whitespace-nowrap">
                  Source {i + 1} <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Global Visual Identity
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <CoverCard lang="ko" title={titlesData.ko} flag="🇰🇷" src={data.multiCovers?.ko} />
          <CoverCard lang="en" title={titlesData.en} flag="🇺🇸" src={data.multiCovers?.en} />
          <CoverCard lang="es" title={titlesData.es} flag="🇪🇸" src={data.multiCovers?.es} />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            <Mic2 className="w-4 h-4" /> Multi-Lingual Lyrics
          </span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Search-Grounded</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          {(Object.entries(lyricsData) as [string, string][]).map(([lang, lyrics]) => {
            const currentTitle = titlesData[lang as keyof typeof titlesData];
            return (
              <div key={lang} className="p-6 relative group hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{lang === 'ko' ? 'Korean' : lang === 'en' ? 'English' : 'Spanish'}</span>
                  <button onClick={() => copyToClipboard(`${currentTitle}\n\n${lyrics}`, lang)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded-lg">
                    {copiedStates[lang] ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-zinc-300 space-y-1 whitespace-pre-wrap h-80 overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
                  {/* 대가사 맨 위 제목 기입 요청 반영 */}
                  <div className="text-amber-500 font-black text-base mb-6 border-b-2 border-amber-500/20 pb-3 uppercase tracking-tight leading-tight">
                    {currentTitle}
                  </div>
                  {lyrics || "Fetching full accurate lyrics..."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
          <Disc className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-4">Optimized Audio Prompt</span>
          <p className="font-mono text-lg text-white italic leading-relaxed pr-10">"{data.stylePrompt || "Calculating musical signature..."}"</p>
          <div className="flex gap-4 mt-8">
            <button
              disabled={!data.stylePrompt}
              onClick={() => copyToClipboard(data.stylePrompt, 'style')}
              className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-2xl font-black text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-95"
            >
              {copiedStates['style'] ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              COPY TO SUNO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
