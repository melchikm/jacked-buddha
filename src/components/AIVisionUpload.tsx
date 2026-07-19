import React, { useState, useRef } from "react";
import { Image, Sparkles, X, UploadCloud, RefreshCw, HelpCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sound } from "../utils/soundEngine";

interface AIVisionUploadProps {
  onAnalyzeComplete: (analysisResult: string, rawBase64: string) => void;
  theme: "bright" | "dark";
  mode: "general" | "nutrition" | "fitness" | "gmat" | "journal";
}

export default function AIVisionUpload({ onAnalyzeComplete, theme, mode }: AIVisionUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode-based prompts and quick suggest chips
  const modeConfigs = {
    general: {
      placeholder: "Scan anything... Buddha Core AI will extract coordinates.",
      suggestedPrompts: [
        { label: "Analyze Daily Schedule", text: "Extract my list of study and training tasks from this image and list them out." },
        { label: "Review Habit Journal", text: "Read the handwritten journal notes in this image and provide dynamic suggestions." }
      ]
    },
    nutrition: {
      placeholder: "Scan a meal or product nutrition label...",
      suggestedPrompts: [
        { label: "Estimate Macros (Protein)", text: "Estimate the calories, protein, carbs, and fats in this food. Is this high-protein and safe for Melchi's 180g target?" },
        { label: "Scan Nutrition Label", text: "Extract the nutrition table and highlight if there are any risks or excellent benefits." }
      ]
    },
    fitness: {
      placeholder: "Scan physical training logs or form pictures...",
      suggestedPrompts: [
        { label: "Review Training Log", text: "Extract exercises and sets from this log. Analyze my training volume against Spider-Man physique targets." },
        { label: "Rotator-Cuff Rehab Check", text: "Evaluate this posture/joint alignment. Ensure joint preservation protocols are active." }
      ]
    },
    gmat: {
      placeholder: "Scan a GMAT/CAT quant or verbal problem...",
      suggestedPrompts: [
        { label: "Solve GMAT Quant/Verbal", text: "Solve this GMAT problem step-by-step. Break down why the correct answer is correct and log any cognitive warnings." },
        { label: "Analyze Error Log Grid", text: "Review these incorrect questions. Provide a Ray Dalio believability-weighted reasoning to prevent repeating errors." }
      ]
    },
    journal: {
      placeholder: "Attach planning sheets or scenic travel pictures...",
      suggestedPrompts: [
        { label: "Synthesize Handwritten Notes", text: "Perform OCR image-to-text to transcribe these handwritten planning sheets and generate zen tactical instructions." },
        { label: "Assess Landscape & Mood", text: "Synthesize the aesthetic of this travel/scenery photo. Give me a mindful Zen koan based on it." }
      ]
    }
  };

  const config = modeConfigs[mode];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        const mime = file.type;
        resolve({ base64: resultStr, mimeType: mime });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("The Sanctuary only accepts image attachments for vision analysis.");
      sound.playWoodblock();
      return;
    }

    setErrorMessage(null);
    sound.playWoodblock();

    try {
      const { base64, mimeType: mime } = await convertFileToBase64(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageBase64(base64);
      setMimeType(mime);
    } catch (err) {
      setErrorMessage("Error converting file to readable image coordinates.");
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

  const triggerAnalyze = async (promptText: string) => {
    if (!imageBase64 || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    sound.playTingsha();

    try {
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          promptText
        })
      });

      const data = await response.json();
      if (data.success && data.text) {
        sound.playSingingBowl();
        onAnalyzeComplete(data.text, imageBase64);
        // Clear file after analysis to avoid stacking unless requested
        clearAttachment();
      } else {
        setErrorMessage(data.error || "Vision coordinates unstable. Let us breathe.");
        sound.playWoodblock();
      }
    } catch (err) {
      setErrorMessage("Communication latency on vision channel. Please retry.");
      sound.playWoodblock();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAttachment = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    sound.playWoodblock();
  };

  return (
    <div className={`p-4 rounded-3xl border transition-all ${
      theme === "bright" ? "bg-amber-500/5 border-amber-500/10" : "bg-white/2 border-white/5"
    }`} id={`ai-vision-upload-${mode}`}>
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
          <Image className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Sovereign Vision Assistant ({mode.toUpperCase()})</span>
        </span>
        <span className="text-[9px] font-mono text-slate-500 uppercase">Image-To-Text / OCR Mode</span>
      </div>

      <AnimatePresence mode="wait">
        {!previewUrl ? (
          /* Dropzone */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                : "border-white/10 hover:border-white/20 bg-white/1"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />
            <UploadCloud className="w-7 h-7 text-slate-400" />
            <div className="text-xs font-semibold text-slate-300">
              {config.placeholder}
            </div>
            <p className="text-[9px] text-slate-500 font-mono">
              Drag-and-drop or tap to select image files (PNG, JPG, WEBP)
            </p>
          </motion.div>
        ) : (
          /* Image Preview & Prompt Suggestions */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            <div className="flex gap-4 items-start bg-black/20 p-3 rounded-2xl border border-white/5 relative">
              <img
                src={previewUrl}
                alt="Vision Input Preview"
                className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 block uppercase tracking-wider">● Image Telemetry Locked</span>
                <p className="text-xs text-slate-300 leading-normal font-sans">
                  Choose a directive below to analyze this image instantly.
                </p>
                <span className="text-[9px] text-slate-500 font-mono block">MIME: {mimeType.toUpperCase()}</span>
              </div>
              <button
                onClick={clearAttachment}
                disabled={isAnalyzing}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Discard Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* suggestions */}
            <div className="space-y-1.5 border-t border-white/5 pt-2">
              <span className="text-[9px] font-mono text-indigo-300 uppercase tracking-widest block mb-1">
                🪄 Custom Analytical Directives
              </span>
              <div className="flex flex-col gap-2">
                {config.suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    disabled={isAnalyzing}
                    onClick={() => triggerAnalyze(prompt.text)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border cursor-pointer ${
                      theme === "bright"
                        ? "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        : "bg-white/3 border-white/5 hover:bg-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] text-indigo-400 block uppercase tracking-wider">{prompt.label}</span>
                        <span className="text-[10px] text-slate-400 font-sans block truncate max-w-xs md:max-w-md">{prompt.text}</span>
                      </div>
                    </div>
                    {isAnalyzing ? (
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono rounded-xl mt-3">
          ⚠️ {errorMessage}
        </div>
      )}

      {isAnalyzing && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded-xl mt-3 flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>Buddha Core synthesising visual telemetry... Please hold absolute stillness.</span>
        </div>
      )}
    </div>
  );
}
