import React, { useState } from 'react';
import { Copy, Check, FileCode, Layers, Cpu, Layout, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { FLUTTER_CODE_SNIPPETS, FlutterCodeSnippet } from '../data/flutterCodeSnippets';

export const FlutterCodeViewer: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(FLUTTER_CODE_SNIPPETS[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('All');

  const selectedSnippet =
    FLUTTER_CODE_SNIPPETS.find((s) => s.id === selectedSnippetId) || FLUTTER_CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layers = ['All', 'Domain', 'Data', 'Riverpod State', 'Presentation UI'];

  const filteredSnippets =
    activeLayerFilter === 'All'
      ? FLUTTER_CODE_SNIPPETS
      : FLUTTER_CODE_SNIPPETS.filter((s) => s.layer === activeLayerFilter);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Top Banner */}
      <div className="bg-slate-950 p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Flutter Clean Architecture & Riverpod 2.x
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                Production Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Implementasi modular fitur FoodMatch untuk proyek Flutter Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Kode Dart'}</span>
          </button>
        </div>
      </div>

      {/* Architecture Concept Badges */}
      <div className="bg-slate-900/90 px-5 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Filter Layer:
        </span>
        {layers.map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => setActiveLayerFilter(layer)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              activeLayerFilter === layer
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      {/* Main Body: File Selector & Code Display */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Sidebar: File List */}
        <div className="w-full md:w-72 bg-slate-950/60 border-r border-slate-800 p-3 overflow-y-auto space-y-1.5 shrink-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">
            Daftar File ({filteredSnippets.length})
          </div>

          {filteredSnippets.map((snippet) => {
            const isSelected = snippet.id === selectedSnippet.id;
            return (
              <button
                key={snippet.id}
                type="button"
                onClick={() => setSelectedSnippetId(snippet.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500/50 text-sky-200'
                    : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="truncate">{snippet.filename.split('/').pop()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{snippet.layer}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]">
                    Dart
                  </span>
                </div>
              </button>
            );
          })}

          {/* Clean Architecture Flow Guide */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-2">
            <span className="font-bold text-slate-300 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Alur Bersih (Data Flow)
            </span>
            <div className="space-y-1 text-slate-400 font-mono text-[10px]">
              <div>1. Open Food Facts API</div>
              <div className="text-sky-400">↓ RemoteDataSource (Dio)</div>
              <div>2. ProductModel (fromJson)</div>
              <div className="text-sky-400">↓ FoodRepositoryImpl</div>
              <div>3. Product Entity (Domain)</div>
              <div className="text-sky-400">↓ UseCases (Calc & Compat)</div>
              <div>4. Riverpod Notifier</div>
              <div className="text-sky-400">↓ ConsumerWidget UI</div>
              <div className="text-emerald-400 font-bold">5. Interactive Mobile App</div>
            </div>
          </div>
        </div>

        {/* Right Code Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117] overflow-hidden">
          {/* File Header Bar */}
          <div className="bg-[#161b22] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="truncate">{selectedSnippet.filename}</span>
            <span className="text-[11px] text-slate-500 font-sans">
              {selectedSnippet.layer}
            </span>
          </div>

          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs text-sky-300/90 font-medium">
            💡 {selectedSnippet.description}
          </div>

          {/* Code Body */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed no-scrollbar">
            <pre className="whitespace-pre">
              <code>{selectedSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
