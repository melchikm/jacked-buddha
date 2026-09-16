import React, { useState } from "react";
import { Code, Database, Globe, Cpu, Terminal, Copy, Check, FileText } from "lucide-react";

export default function ArchitectStudio() {
  const [activeTab, setActiveTab] = useState<"flutter" | "firestore" | "backend" | "cicd">("flutter");
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const FLUTTER_CODE = `// main.dart - Vita Core OS
// Apple Human Interface & Android Material 3 Synergy

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:motion/motion.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const ProviderScope(child: VitaApp()));
}

class VitaApp extends StatelessWidget {
  const VitaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vita',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF09090E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF1E1E2A),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontFamily: 'SpaceGrotesk', fontWeight: FontWeight.bold),
          bodyMedium: TextStyle(fontFamily: 'Inter'),
        ),
      ),
      home: const MainMissionControl(),
    );
  }
}

// State Notifier for Multi-Agent AI Council
class CouncilMeetingNotifier extends StateNotifier<AsyncValue<List<CouncilMessage>>> {
  CouncilMeetingNotifier() : super(const AsyncValue.data([]));

  Future<void> queryCouncil(String query, List<String> agents) async {
    state = const AsyncValue.loading();
    try {
      final response = await http.post(
        Uri.parse('https://api.jackedbuddha.io/api/council/query'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'question': query,
          'chosenAgents': agents,
          'metricsContext': {'weight': 82.5, 'recovery': 85}
        }),
      );
      final data = jsonDecode(response.body);
      final list = (data['responses'] as List)
          .map((item) => CouncilMessage.fromJson(item))
          .toList();
      state = AsyncValue.data(list);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}
`;

  const FIRESTORE_SCHEMA = `{
  "firestore-blueprint.json": {
    "collections": {
      "users": {
        "documentId": "$USER_UID",
        "fields": {
          "name": "Authenticated User",
          "username": "user_chosen_handle",
          "email": "user@example.com",
          "created_at": "TIMESTAMP",
          "preferences": {
            "theme": "dark_obsidian",
            "voice_synthesizer": "Zephyr"
          }
        },
        "subcollections": {
          "metrics": {
            "documentId": "daily_date_YYYY-MM-DD",
            "fields": {
              "weight": 82.5,
              "bodyFat": 14.2,
              "protein": 180,
              "calories": 2800,
              "sleep": 7.5,
              "recovery": 85,
              "money": 450000,
              "meditation": 20,
              "mbaHours": 3.5,
              "hairGrowth": "Healthy Density"
            }
          },
          "logs": {
            "documentId": "unique_log_id",
            "fields": {
              "timestamp": "TIMESTAMP",
              "type": "fitness | nutrition | mba | career | music",
              "title": "Spider-Man Physique Workout Plan A",
              "detail": "Shoulder rehab 4x15, Barbell Squats 100kg"
            }
          }
        }
      }
    }
  },
  "firestore.rules": "service cloud.firestore { match /databases/{database}/documents { match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; } } }"
}`;

  const BACKEND_SERVICE = `// production_server.ts (Bundle output format: CommonJS)
import express from "express";
import { GoogleGenAI } from "@google/genai";
import admin from "firebase-admin";

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
admin.initializeApp({ credential: admin.credential.applicationDefault() });

app.post("/api/council/query", async (req, res) => {
  const { question, chosenAgents, metricsContext, userName } = req.body;
  const targetUser = userName || "Explorer";
  const systemInstruction = "Speak as the AI Council for " + targetUser + ": " + chosenAgents.join(", ");
  
  const result = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: question,
    config: { systemInstruction, responseMimeType: "application/json" }
  });
  
  res.json({ success: true, responses: JSON.parse(result.text) });
});
`;

  const CICD_PIPELINE = `# github_action_deploy.yml
name: Vita Production Release

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Java & Flutter SDK
      uses: subosito/flutter-action@v2
      with:
        channel: 'stable'
        flutter-version: '3.19.x'

    - name: Install Firebase CLI
      run: npm install -g firebase-tools

    - name: Compile Flutter Web & Android Bundle
      run: |
        flutter pub get
        flutter build appbundle --release --obfuscate --split-debug-info=build/app/outputs/symbols
        flutter build web --release

    - name: Deploy Firebase Cloud Functions & Rules
      run: firebase deploy --only functions,firestore,auth --token "\${{ secrets.FIREBASE_TOKEN }}"

    - name: Google Play Store Release
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: \${{ secrets.PLAY_STORE_JSON_KEY }}
        packageName: com.jackedbuddha.app
        releaseFiles: build/app/outputs/bundle/release/app-release.aab
        track: production
`;

  return (
    <div className="space-y-6">
      
      {/* Exporter Header */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-mono mb-1">
              <Cpu className="w-4 h-4 animate-spin-slow" /> Dev Console
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">Architect Blueprint Studio</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Access the production codebases, mobile configurations, and CI/CD parameters generated by your world-class engineering team.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        <button
          onClick={() => setActiveTab("flutter")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "flutter"
              ? "border-cyan-400 text-cyan-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Code className="w-4 h-4" />
          Flutter (Dart SDK)
        </button>

        <button
          onClick={() => setActiveTab("firestore")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "firestore"
              ? "border-cyan-400 text-cyan-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          Firestore Schema
        </button>

        <button
          onClick={() => setActiveTab("backend")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "backend"
              ? "border-cyan-400 text-cyan-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          Express Cloud Core
        </button>

        <button
          onClick={() => setActiveTab("cicd")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "cicd"
              ? "border-cyan-400 text-cyan-400 font-semibold"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="w-4 h-4" />
          CI/CD Pipeline
        </button>
      </div>

      {/* Code Area */}
      <div className="glass-panel rounded-3xl p-5 relative">
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-mono">UTF-8 SOURCE</span>
          <button
            onClick={() => {
              const textMap = { flutter: FLUTTER_CODE, firestore: FIRESTORE_SCHEMA, backend: BACKEND_SERVICE, cicd: CICD_PIPELINE };
              handleCopy(textMap[activeTab], activeTab);
            }}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          >
            {copiedText === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Source
              </>
            )}
          </button>
        </div>

        <pre className="text-xs text-cyan-300 font-mono overflow-x-auto max-h-[480px] leading-relaxed p-4 bg-slate-950/40 rounded-2xl border border-white/5">
          {activeTab === "flutter" && FLUTTER_CODE}
          {activeTab === "firestore" && FIRESTORE_SCHEMA}
          {activeTab === "backend" && BACKEND_SERVICE}
          {activeTab === "cicd" && CICD_PIPELINE}
        </pre>
      </div>

      {/* Deploy Steps Guide */}
      <div className="p-5 glass-panel rounded-3xl border border-cyan-500/10 space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-cyan-400 font-mono">Store Deployment Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div className="space-y-1">
            <h4 className="text-white font-semibold">1. App Store Requirements (iOS)</h4>
            <p>Ensure Apple Developer account enrollment, configure APNs certificates for Cloud Push Notifications, register App ID with health permissions bundle, and deploy utilizing Xcode Cloud or TestFlight.</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-semibold">2. Play Store Requirements (Android)</h4>
            <p>Verify Google Play Console developer credentials, sign release bundles with secure keystores, enable OAuth client signing, and publish utilizing the fast automation GitHub Action shown above.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
