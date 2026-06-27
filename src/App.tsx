import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppDataState, Subject, Question, Session, StudentProfile } from './types';
import { INITIAL_SUBJECTS, INITIAL_QUESTIONS, AVAILABLE_GIFTS } from './data';
import DiagnosticSurvey from './components/DiagnosticSurvey';
import AIModelSettings from './components/AIModelSettings';
import PracticePanel from './components/PracticePanel';
import TutorChat from './components/TutorChat';
import GiftShop from './components/GiftShop';
import PhonicsMaster from './components/PhonicsMaster';
import CameraTranslator from './components/CameraTranslator';
import DocxExporter from './components/DocxExporter';
import VocabArenaGame from './components/VocabArenaGame';
import WritingDoctorAI from './components/WritingDoctorAI';
import {
  GraduationCap, Award, Sparkles, BookOpen, FileText, Volume2,
  Settings, Key, Download, Upload, History, TrendingUp, Bot, Trophy,
  Flame, ArrowLeft, RefreshCw, AlertTriangle, Play
} from 'lucide-react';

export default function App() {
  // Initialize state from LocalStorage or default
  const [appState, setAppState] = useState<AppDataState>(() => {
    const saved = localStorage.getItem('englishroot_data_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing local storage state', e);
      }
    }
    return {
      subjects: INITIAL_SUBJECTS,
      questions: INITIAL_QUESTIONS,
      sessions: [],
      progress: { totalAttempts: 0, averageScore: 0, streakDays: 1, weakTopics: [] },
      settings: { theme: 'light', soundEnabled: true, autoSave: true },
      profile: { name: '', grade: '6', currentLevel: 'lost', goal: 'average', surveyCompleted: false },
      points: 120, // free starting motivation points
      unlockedGifts: [],
      completedQuestions: []
    };
  });

  // Local API Key states
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key_custom') || '';
  });
  const [aiModel, setAiModel] = useState(() => {
    return localStorage.getItem('gemini_model_custom') || 'gemini-3.5-flash';
  });

  // Active views / modals states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'phonics' | 'camera' | 'word_export' | 'game_arena' | 'writing_doc' | 'tutor' | 'gifts' | 'stats'>('dashboard');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionSuccessModal, setSessionSuccessModal] = useState<{
    isOpen: boolean;
    session: Session | null;
    xpEarned: number;
  }>({
    isOpen: false,
    session: null,
    xpEarned: 0
  });

  // Custom vocabulary audio modeling toolbar (⭐ Có thể nhập từ vựng để app đọc mẫu)
  const [quickVocab, setQuickVocab] = useState('');
  const [ipaResult, setIpaResult] = useState<{
    word: string;
    ipa: string;
    vietnameseGuide: string;
    translation: string;
    syllables: string;
    loading: boolean;
  } | null>(null);

  // Persist state to local storage on change
  useEffect(() => {
    localStorage.setItem('englishroot_data_state', JSON.stringify(appState));
  }, [appState]);

  // Handle completing survey
  const handleCompleteSurvey = (profile: StudentProfile) => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...profile, surveyCompleted: true },
      points: prev.points + 50 // bonus points for completing diagnostic survey
    }));
  };

  // Handle saving Custom API Settings
  const handleSaveSettings = (savedKey: string, savedModel: string) => {
    setApiKey(savedKey);
    setAiModel(savedModel);
    localStorage.setItem('gemini_api_key_custom', savedKey);
    localStorage.setItem('gemini_model_custom', savedModel);
  };

  // Calculate student ranks based on score/points
  const calculateRank = (pts: number) => {
    if (pts < 300) return 'Tập Sự 🌟';
    if (pts < 800) return 'Chiến Binh ⚔️';
    if (pts < 1500) return 'Học Giả 📚';
    return 'Tinh Anh 💎';
  };

  // Completed Session Callback
  const handleCompletePracticeSession = (session: Session, earnedPoints: number) => {
    setAppState((prev) => {
      const updatedSessions = [session, ...prev.sessions];
      const newTotalAttempts = prev.progress.totalAttempts + 1;
      const totalScore = updatedSessions.reduce((acc, s) => acc + s.score, 0);
      const newAvgScore = Math.round(totalScore / updatedSessions.length);

      // Simple streak increment logic: if practiced today/yesterday, increase or maintain streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];

      let newStreak = prev.progress.streakDays;
      const lastSessionDate = prev.sessions[0]?.date;

      if (lastSessionDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastSessionDate !== todayStr) {
        // maintained or reset if too late
        newStreak = Math.max(1, newStreak);
      }

      // Record any weak topic if score was low
      const weakTopics = [...prev.progress.weakTopics];
      if (session.score < 6) {
        const subjectName = prev.subjects.find(s => s.id === session.subjectId)?.name || 'Bài tập';
        const existingWeak = weakTopics.find(t => t.topic === subjectName);
        if (existingWeak) {
          existingWeak.errorCount += 1;
        } else {
          weakTopics.push({ topic: subjectName, errorCount: 1 });
        }
      }

      return {
        ...prev,
        sessions: updatedSessions,
        points: prev.points + earnedPoints,
        progress: {
          totalAttempts: newTotalAttempts,
          averageScore: newAvgScore,
          streakDays: newStreak,
          weakTopics
        }
      };
    });

    // Reset subject select and show congrats modal
    setActiveSubject(null);
    setSessionSuccessModal({
      isOpen: true,
      session,
      xpEarned: earnedPoints
    });
  };

  // Gift redemption logic
  const handleRedeemGift = (giftId: string, cost: number) => {
    if (appState.points < cost) return;
    setAppState((prev) => ({
      ...prev,
      points: prev.points - cost,
      unlockedGifts: [...prev.unlockedGifts, giftId]
    }));
    alert(`🎉 Đổi quà thành công! Bạn đã đổi thành công vật phẩm ${AVAILABLE_GIFTS.find(g => g.id === giftId)?.name || 'quà tặng'}. Hãy check hòm thư hoặc tải xuống ngay!`);
  };

  // Earn Points from Phonics/Spelling practice
  const handleEarnPhonicsPoints = (earned: number) => {
    setAppState((prev) => ({
      ...prev,
      points: prev.points + earned
    }));
  };

  // Export Progress Data (JSON backup)
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `englishroot_data_${appState.profile.name || 'hocsinh'}_backup.json`;
    link.click();
  };

  // Import Progress Data (JSON restore)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.points !== undefined) {
          setAppState(parsed);
          alert('🎉 Khôi phục toàn bộ tiến trình học tập và điểm tích lũy thành công!');
        } else {
          alert('Tệp sao lưu không đúng định dạng của EnglishRoot THCS.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp. Vui lòng đảm bảo tệp JSON sao lưu chính xác.');
      }
    };
    reader.readAsText(file);
  };

  // Quick word read-out modeling (⭐ Có thể nhập từ vựng để app đọc mẫu)
  const handleSpeakQuickVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToAnalyze = quickVocab.trim();
    if (!textToAnalyze) return;

    // Speak instantly
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToAnalyze);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // slightly slower for precise syllables

      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
                      voices.find(v => v.lang.startsWith('en-'));
      if (usVoice) utterance.voice = usVoice;

      window.speechSynthesis.speak(utterance);
    }

    // Fetch phonetic transcription & translation via API
    setIpaResult({
      word: textToAnalyze,
      ipa: '',
      vietnameseGuide: '',
      translation: '',
      syllables: '',
      loading: true
    });

    try {
      const response = await fetch('/api/gemini/ipa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ text: textToAnalyze })
      });

      if (response.ok) {
        const data = await response.json();
        setIpaResult({
          word: textToAnalyze,
          ipa: data.ipa || '[N/A]',
          vietnameseGuide: data.vietnameseGuide || '[N/A]',
          translation: data.translation || '[N/A]',
          syllables: data.syllables || '-',
          phonicsDecoding: data.phonicsDecoding || null,
          loading: false
        });
      } else {
        setIpaResult(prev => prev ? { ...prev, loading: false, ipa: '[Chưa có IPA]' } : null);
      }
    } catch (err) {
      console.error(err);
      setIpaResult(prev => prev ? { ...prev, loading: false, ipa: '[Lỗi kết nối]' } : null);
    }
  };

  const currentRank = calculateRank(appState.points);

  // If survey not completed, force survey first
  if (!appState.profile.surveyCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        {/* Simple visual background items */}
        <div className="flex-1 flex items-center justify-center p-4">
          <DiagnosticSurvey onComplete={handleCompleteSurvey} />
        </div>
        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
          EnglishRoot THCS © 2026 • Lộ trình cá nhân hóa hoàn toàn miễn phí cho học sinh mất gốc
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between">
      {/* HEADER SECTION WITH KEY SETTINGS DISPLAY */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 z-30 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>EnglishRoot THCS</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lộ trình học lấy lại căn bản</p>
            </div>
          </div>

          {/* Quick Vocal Modeling Widget (⭐ Có thể nhập từ vựng để app đọc mẫu) */}
          <div className="relative w-full max-w-xs sm:max-w-xs">
            <form onSubmit={handleSpeakQuickVocab} className="flex items-center bg-slate-50 border border-slate-100 p-1.5 rounded-full w-full shadow-inner">
              <input
                type="text"
                placeholder="Nhập từ vựng/mẫu câu đọc mẫu..."
                value={quickVocab}
                onChange={(e) => setQuickVocab(e.target.value)}
                className="flex-1 bg-transparent px-3 text-xs focus:outline-none placeholder:text-slate-400 text-slate-700"
              />
              <button
                type="submit"
                title="Đọc mẫu ngay"
                className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-[10px] font-bold rounded-full transition-all shadow-sm flex items-center space-x-1 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Đọc mẫu</span>
              </button>
            </form>

            {/* Float translation and IPA results card */}
            {ipaResult && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur border border-slate-200/80 rounded-2xl p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">Kết quả phiên âm AI</span>
                  <button 
                    type="button"
                    onClick={() => setIpaResult(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-black px-1.5 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
                {ipaResult.loading ? (
                  <div className="flex items-center space-x-2 py-1">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-medium">Đang tra cứu ngữ âm...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xs font-extrabold text-slate-900 truncate">"{ipaResult.word}"</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100/50">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Phiên âm IPA</span>
                        <span className="font-mono font-bold text-indigo-700">{ipaResult.ipa}</span>
                      </div>
                      <div className="bg-amber-50/60 p-1.5 rounded-lg border border-amber-100/30">
                        <span className="text-[9px] text-amber-500 block font-bold uppercase">Mẹo phát âm bồi</span>
                        <span className="font-bold text-amber-800">{ipaResult.vietnameseGuide}</span>
                      </div>
                    </div>
                    <div className="text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100/50 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Dịch nghĩa</span>
                        <span className="font-medium text-slate-700">{ipaResult.translation}</span>
                      </div>
                      {ipaResult.syllables && ipaResult.syllables !== '-' && (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Âm tiết</span>
                          <span className="font-mono text-slate-600 font-bold">{ipaResult.syllables}</span>
                        </div>
                      )}
                    </div>

                    {/* Phonics & IPA Decoding Rules Widget */}
                    {ipaResult.phonicsDecoding && ipaResult.phonicsDecoding.ipaDecodingRules && (
                      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px] bg-purple-50/60 p-2 rounded-xl">
                        <span className="text-[9px] text-purple-700 font-black uppercase block">🎯 Quy luật đọc IPA & Trọng âm:</span>
                        <p className="text-slate-700 font-semibold leading-relaxed">{ipaResult.phonicsDecoding.ipaDecodingRules.ipaStressRule}</p>
                        <p className="text-[10px] text-slate-500 italic">{ipaResult.phonicsDecoding.ipaDecodingRules.ipaReadingGuide}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Progress Stats in Header */}
          <div className="flex items-center space-x-4">
            {/* Points block */}
            <div className="text-right shrink-0">
              <div className="flex items-center space-x-1 justify-end text-sm font-black text-amber-600">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{appState.points} XP</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentRank}</p>
            </div>

            {/* Streak block */}
            <div className="flex items-center space-x-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-amber-700 font-extrabold text-xs shrink-0">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{appState.progress.streakDays} ngày</span>
            </div>

            {/* API Settings Trigger */}
            {!apiKey && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black animate-pulse shadow-md hover:bg-rose-700 transition-all flex items-center space-x-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Lấy API key để sử dụng app</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 border border-slate-200 hover:border-blue-500 text-slate-500 hover:text-blue-600 rounded-xl bg-white hover:bg-blue-50 transition-colors shrink-0"
              title="Cài đặt API Key & Trí Tuệ Nhân Tạo"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* COMPONENT BANNER EXPLAINING MODELS FALLBACK AND CURRENT STATUS */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-1 text-center md:text-left">
          <span>
            🤖 Trí Tuệ Nhân Tạo: <strong>{aiModel}</strong> • Chế độ: <strong>Server Auto-Fallback Activated</strong>
          </span>
          <span className="text-slate-400 text-[11px]">
            Hệ thống tự động sử dụng máy chủ dự phòng khi tài khoản cá nhân quá tải
          </span>
        </div>
      </div>

      {/* MAIN VIEWPORT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {activeSubject ? (
          /* ACTIVE PRACTICE PANEL SESSIONS */
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setActiveSubject(null)}
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Quay lại lộ trình của bạn</span>
            </button>

            <PracticePanel
              subject={activeSubject}
              questions={appState.questions.filter(q => q.subjectId === activeSubject.id)}
              apiKey={apiKey}
              onCompleteSession={handleCompletePracticeSession}
            />
          </div>
        ) : (
          /* ALL OTHER TABS */
          <div className="space-y-6">
            {/* Header Greeting Dashboard Card */}
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-left">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Chào {appState.profile.name}! Chào mừng con đến với Lớp {appState.profile.grade} 🎯
                </h2>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-2xl">
                  Lộ trình học lấy gốc được thiết kế riêng dựa trên mục tiêu: <strong>{
                    appState.profile.goal === 'average' ? 'Đạt điểm trung bình (5-6 điểm)' :
                    appState.profile.goal === 'good' ? 'Đạt điểm khá giỏi trở lên (7-8+ điểm)' :
                    'Tự tin phát âm trôi chảy & giao tiếp tự nhiên'
                  }</strong>. Hãy kiên trì học 1 bài mỗi ngày nhé!
                </p>
              </div>

              {/* Reset Survey Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Học sinh có muốn thực hiện lại bài khảo sát lập lộ trình không?')) {
                    setAppState(prev => ({
                      ...prev,
                      profile: { ...prev.profile, surveyCompleted: false }
                    }));
                  }
                }}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs border border-slate-200 shrink-0 transition-colors"
              >
                Khảo sát lại lộ trình
              </button>
            </div>

            {/* TAB SELECTOR BAR */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Lộ Trình Cá Nhân Hóa 🗺️' },
                { id: 'phonics', label: 'Đánh Vần & Phát Âm 🗣️' },
                { id: 'camera', label: 'Camera OCR Dịch 📸' },
                { id: 'word_export', label: 'Xuất Phiếu Word 📝' },
                { id: 'game_arena', label: 'Đấu Trường ⚔️' },
                { id: 'writing_doc', label: 'Khám Viết Câu 🩺' },
                { id: 'tutor', label: 'Cô Giáo AI Sửa Lỗi 👩‍🏫' },
                { id: 'gifts', label: 'Đổi Quà Động Lực 🎁' },
                { id: 'stats', label: 'Báo Cáo Học Tập 📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-4 font-bold text-xs md:text-sm border-b-2 transition-all relative ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="animate-in fade-in duration-200">
              {/* DASHBOARD LESSON MAP */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Quick summary header banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appState.subjects.map((subj) => {
                      const completedCount = appState.sessions.filter(s => s.subjectId === subj.id).length;
                      return (
                        <div
                          key={subj.id}
                          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 transition-all text-left flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                {subj.id === 'pronunciation' ? <Volume2 className="w-5 h-5" /> :
                                 subj.id === 'vocabulary' ? <BookOpen className="w-5 h-5" /> :
                                 <FileText className="w-5 h-5" />}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Đã học: {completedCount} buổi
                              </span>
                            </div>

                            <h3 className="font-extrabold text-slate-800 text-sm">{subj.name}</h3>
                            <p className="text-slate-500 text-[11px] leading-relaxed">{subj.description}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-50 mt-4">
                            <button
                              type="button"
                              onClick={() => setActiveSubject(subj)}
                              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold rounded-lg text-xs shadow-sm transition-all text-center"
                            >
                              Bắt Đầu Luyện Tập 🚀
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Motivational booster text */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-900 leading-relaxed text-left">
                      <strong>Cơ chế Gamification tích cực:</strong> Mỗi buổi ôn tập thành công sẽ mang về cho con <strong>+50 XP</strong>. Hoàn thành 100% lộ trình hàng tuần để tăng hạng vinh danh và đổi những món quà tuyệt vời ở góc bên phải nhé!
                    </div>
                  </div>
                </div>
              )}

              {/* PHONICS & SPELLING WORKBENCH */}
              {activeTab === 'phonics' && (
                <PhonicsMaster onEarnPoints={handleEarnPhonicsPoints} />
              )}

              {/* CAMERA OCR TRANSLATOR */}
              {activeTab === 'camera' && (
                <CameraTranslator apiKey={apiKey} />
              )}

              {/* WORD DOCX EXPORTER */}
              {activeTab === 'word_export' && (
                <DocxExporter apiKey={apiKey} />
              )}

              {/* VOCAB ARENA GAME */}
              {activeTab === 'game_arena' && (
                <VocabArenaGame onEarnPoints={handleEarnPhonicsPoints} studentGrade={appState.profile.grade} />
              )}

              {/* WRITING DOCTOR AI */}
              {activeTab === 'writing_doc' && (
                <WritingDoctorAI apiKey={apiKey} />
              )}

              {/* TUTOR CHAT ROOM */}
              {activeTab === 'tutor' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-100/50 rounded-2xl text-left">
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      💡 <strong>Mẹo nhỏ:</strong> Nếu con làm bài thi nói, gặp cấu trúc câu phức tạp trên lớp hoặc muốn dịch nghĩa từ vựng, hãy thoải mái hỏi cô giáo AI ở dưới nhé. Cô sẽ giải thích bằng tiếng Việt cực kỳ chi tiết!
                    </p>
                  </div>
                  <TutorChat
                    apiKey={apiKey}
                    studentGrade={appState.profile.grade}
                    studentName={appState.profile.name}
                  />
                </div>
              )}

              {/* REWARDS GIFT STORE */}
              {activeTab === 'gifts' && (
                <GiftShop
                  gifts={AVAILABLE_GIFTS}
                  userPoints={appState.points}
                  unlockedGifts={appState.unlockedGifts}
                  onRedeem={handleRedeemGift}
                />
              )}

              {/* STATS AND BACKUP */}
              {activeTab === 'stats' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  {/* Left Column: Progress summary */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-800 text-sm">Chỉ số tiến bộ tổng quan</h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tổng số bài luyện</p>
                          <h4 className="text-xl font-black text-slate-800">{appState.progress.totalAttempts} bài</h4>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Điểm trung bình</p>
                          <h4 className="text-xl font-black text-blue-600">{appState.progress.averageScore} / 10</h4>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kỷ lục Chuỗi ngày</p>
                          <h4 className="text-xl font-black text-amber-600">{appState.progress.streakDays} ngày 🔥</h4>
                        </div>
                      </div>
                    </div>

                    {/* Practice Log history */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-1">
                        <History className="w-4 h-4 text-slate-500" />
                        <span>Nhật ký rèn luyện</span>
                      </h3>

                      {appState.sessions.length > 0 ? (
                        <div className="space-y-2.5">
                          {appState.sessions.map((sess) => {
                            const subj = appState.subjects.find(s => s.id === sess.subjectId);
                            return (
                              <div
                                key={sess.id}
                                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                              >
                                <div>
                                  <h4 className="font-bold text-slate-800 text-xs">{subj?.name || 'Bài ôn tập'}</h4>
                                  <p className="text-slate-500 text-[10px]">{sess.date} • Đọc đúng {sess.correctAnswers}/{sess.totalQuestions} từ</p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${
                                    sess.score >= 8 ? 'bg-emerald-100 text-emerald-800' :
                                    sess.score >= 5 ? 'bg-amber-100 text-amber-800' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {sess.score} / 10 Điểm
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic text-center py-6">Con chưa hoàn thành bài luyện tập nào. Hãy bắt đầu học ngay nhé!</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Backup and data management */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-slate-800 text-sm">Quản lý và Sao lưu Dữ liệu</h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Bạn có thể tải xuống file dữ liệu học tập (.json) làm kỷ niệm hoặc khôi phục tiến độ của mình khi học trên thiết bị khác!
                      </p>

                      <div className="space-y-2 pt-2">
                        {/* Export Button */}
                        <button
                          type="button"
                          onClick={handleExportBackup}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-200 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Xuất dữ liệu học tập (JSON)</span>
                        </button>

                        {/* Import Button Wrapper */}
                        <div className="relative">
                          <label className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 border border-slate-200 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            <span>Khôi phục dữ liệu từ File</span>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportBackup}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Focus warnings */}
                    {appState.progress.weakTopics.length > 0 && (
                      <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center space-x-1.5 text-rose-800">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                          <h4 className="font-extrabold text-xs uppercase tracking-wider">Lưu ý sửa lỗi (Weak Topics)</h4>
                        </div>
                        <p className="text-rose-700 text-[11px] leading-normal">
                          Con thường đạt điểm thấp ở các chủ đề sau. Hãy ưu tiên dành thời gian luyện tập thêm nhé!
                        </p>
                        <div className="space-y-1">
                          {appState.progress.weakTopics.map((topic, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-rose-800 font-semibold bg-rose-100/50 px-2 py-1 rounded">
                              <span>{topic.topic}</span>
                              <span>{topic.errorCount} lần điểm thấp</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER COOPERATIVE MESSAGE */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        EnglishRoot THCS © 2026 • Lộ trình cá nhân hóa hoàn toàn miễn phí cho học sinh mất gốc
      </footer>

      {/* MODAL SYSTEM SETTINGS */}
      <AIModelSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialKey={apiKey}
        initialModel={aiModel}
      />

      {/* CONGRATS POPUP MODAL AFTER SESSIONS */}
      <AnimatePresence>
        {sessionSuccessModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden text-center p-6 space-y-5"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Hoàn Thành Ôn Tập! 🎉</h3>
                <p className="text-slate-500 text-xs leading-normal">
                  Bạn vừa hoàn thành buổi học tiếng Anh một cách tuyệt vời! Hãy duy trì phong độ này nhé.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs grid grid-cols-2 gap-3 text-left">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Điểm rèn luyện</p>
                  <p className="font-extrabold text-slate-800 text-sm">{sessionSuccessModal.session?.score || 0} / 10 Điểm</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">XP Nhận được</p>
                  <p className="font-extrabold text-amber-600 text-sm">+{sessionSuccessModal.xpEarned} XP</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSessionSuccessModal({ isOpen: false, session: null, xpEarned: 0 })}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Nhận điểm & Tiếp tục học ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
