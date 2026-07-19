import React, { useState, useRef } from "react";
import { HistoryLog } from "../types";
import { Sparkles, Send, FileUp, Clipboard, CheckCircle2, History, Trash2, HelpCircle, FileText, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { sound } from "../utils/soundEngine";
import AIVisionUpload from "./AIVisionUpload";

interface SovereignJournalViewProps {
  historyLogs: HistoryLog[];
  onUpdateHistory: (updatedHistory: HistoryLog[]) => void;
  theme: "bright" | "dark";
}

export default function SovereignJournalView({ historyLogs, onUpdateHistory, theme }: SovereignJournalViewProps) {
  const [journalText, setJournalText] = useState("");
  const [file, setFile] = useState<{ name: string; type: string; size: number; content?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestReflection, setLatestReflection] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [showImageVision, setShowImageVision] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter existing logs of type "journal"
  const journalLogs = historyLogs.filter((log) => log.type === "journal" || log.title.toLowerCase().includes("journal"));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (loadedFile: File) => {
    sound.playWoodblock();
    
    // Read text files directly to send as text snippet to Gemini
    const textTypes = ["text/plain", "text/markdown", "application/json", "text/csv"];
    if (textTypes.includes(loadedFile.type) || loadedFile.name.endsWith(".md") || loadedFile.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFile({
          name: loadedFile.name,
          type: loadedFile.type,
          size: loadedFile.size,
          content: event.target?.result as string
        });
      };
      reader.readAsText(loadedFile);
    } else {
      // General non-text file attachment
      setFile({
        name: loadedFile.name,
        type: loadedFile.type,
        size: loadedFile.size
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    sound.playWoodblock();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playTingsha();

    try {
      const res = await fetch("/api/journal/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: journalText,
          file: file
        })
      });
      const data = await res.json();
      if (data.success) {
        sound.playSingingBowl();
        setLatestReflection(data.reflection);
        setJournalText("");
        setFile(null);
        if (data.historyLogs) {
          onUpdateHistory(data.historyLogs);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-400 font-mono mb-1">
              <Clipboard className="w-4 h-4" /> Sovereign Consciousness
            </div>
            <h2 className={`text-2xl font-display font-bold tracking-tight ${theme === "bright" ? "text-stone-900" : "text-white"}`}>Sovereign Journal & Reflection</h2>
            <p className={`text-sm mt-0.5 ${theme === "bright" ? "text-stone-600" : "text-slate-400"}`}>
              Record raw logs, upload planning sheets, and receive elite life-synthesis feedback from Buddha Core AI.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Journal Composer & Drag Drop (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              Compose Entry
            </h3>

            <div>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors h-48 resize-none leading-relaxed"
                placeholder="What occurred in today's training blocks? Any cognitive bottlenecks in GMAT Verbal? Outline your thoughts, micro-wins, or concerns here..."
              />
            </div>

            {/* Image / OCR Vision Scanner Toggle */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-violet-400" />
                <span>Image-To-Text Scanner</span>
              </span>
              <button
                type="button"
                onClick={() => { setShowImageVision(!showImageVision); sound.playWoodblock(); }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                  showImageVision 
                    ? "bg-violet-600 border-violet-400 text-white" 
                    : theme === "bright" 
                      ? "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-violet-400" />
                <span>{showImageVision ? "Hide Scanner" : "Scan Image / Photo (OCR)"}</span>
              </button>
            </div>

            {showImageVision && (
              <div className="mb-4">
                <AIVisionUpload
                  theme={theme}
                  mode="journal"
                  onAnalyzeComplete={(resultText, base64) => {
                    setJournalText(prev => prev + (prev ? "\n\n" : "") + resultText);
                    setShowImageVision(false);
                    setFile({
                      name: "vision_scan_" + Date.now() + ".png",
                      type: "image/png",
                      size: Math.round(base64.length * 0.75),
                      content: resultText
                    });
                  }}
                />
              </div>
            )}

            {/* Drag & Drop File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 hover:border-white/20 bg-white/2"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <FileUp className="w-6 h-6 text-slate-400" />
              <div className="text-xs font-semibold text-slate-300">
                Drag and drop your study tracker, diet sheet, or log file here
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Supports TXT, MD, JSON, or other standard files (Max 5MB)
              </p>
            </div>

            {/* Attachment Detail Display */}
            {file && (
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block max-w-xs truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !journalText.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-display font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing Consciousness...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Commit & Request Reflection
                </>
              )}
            </button>
          </form>

          {/* Archive / History Logs list */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className={`text-sm font-display font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === "bright" ? "text-stone-900" : "text-white"}`}>
              <History className="w-4 h-4 text-slate-400" /> Historical Reflections
            </h3>

            {journalLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No journal entries recorded in the archives yet.</p>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {journalLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1.5">
                      <span className="text-violet-400 uppercase tracking-widest">Sovereign Journal Node</span>
                      <span className="text-slate-500">{log.date}</span>
                    </div>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                      {log.detail.substring(0, 500)}
                      {log.detail.length > 500 && "..."}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: AI Live Reflection output (5 cols) */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6 border-violet-500/15 h-[620px] overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-sm">
                🕉️
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase block">Buddha Core AI</h3>
                <span className="text-[10px] text-slate-500 font-mono">Central Consciousness Core</span>
              </div>
            </div>

            {latestReflection ? (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-mono rounded-lg w-max uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> Alignment Complete
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-sans markdown-body prose prose-invert">
                  <ReactMarkdown>{latestReflection}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 space-y-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-sm">
                  🧘
                </div>
                <h4 className="text-xs font-semibold text-white">Chamber is silent</h4>
                <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
                  Submit a daily journal entry or upload metric lists. Buddha Core AI will read the telemetry and generate deep, actionable alignment guidelines.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
