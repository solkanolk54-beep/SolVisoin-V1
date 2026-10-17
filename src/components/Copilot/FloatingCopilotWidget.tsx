import React, { useState } from 'react';
import { Bot, X, Maximize2, Sparkles, MessageSquare } from 'lucide-react';
import { Language, CopilotMapFocus } from '../../types';
import { SolAiCopilot } from './SolAiCopilot';

interface FloatingCopilotWidgetProps {
  lang: Language;
  onFocusMapLocation?: (focus: CopilotMapFocus) => void;
  onSwitchTab?: (tabId: string) => void;
}

export const FloatingCopilotWidget: React.FC<FloatingCopilotWidgetProps> = ({
  lang,
  onFocusMapLocation,
  onSwitchTab,
}) => {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 border border-emerald-300/40 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-slate-950" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-mono font-bold">
              {isAr ? 'SolAI Copilot (مساعد الذكاء الاصطناعي)' : 'SolAI Copilot'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950/20 font-mono">
              RAG
            </span>
          </button>
        )}
      </div>

      {/* Slide-over / Modal when open */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-xl h-[85vh] sm:h-[780px] bg-[#0F172A] border border-[#1E293B] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            {/* Modal top bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">SolAI Assistant</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-mono text-cyan-400">Live PostGIS & Sentinel-2</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onSwitchTab && onSwitchTab('copilot');
                  }}
                  className="p-1 hover:text-slate-200 text-slate-400 transition"
                  title={isAr ? 'فتح في تبويب كامل' : 'Expand to Full Tab'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                  title={isAr ? 'إغلاق' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Copilot */}
            <div className="flex-1 overflow-hidden">
              <SolAiCopilot
                lang={lang}
                onFocusMapLocation={(focus) => {
                  setIsOpen(false);
                  onFocusMapLocation && onFocusMapLocation(focus);
                }}
                onSwitchTab={(tabId) => {
                  setIsOpen(false);
                  onSwitchTab && onSwitchTab(tabId);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
