import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, Flame, Volume2, Sparkles, RefreshCw, Award, Heart, Zap } from 'lucide-react';
import { ArenaQuestion } from '../types';

interface VocabArenaGameProps {
  onEarnPoints: (points: number) => void;
  studentGrade: string;
}

const SAMPLE_ARENA_POOL: ArenaQuestion[] = [
  {
    id: '1',
    word: 'environment',
    ipa: '/ɪnˈvaɪ.rən.mənt/',
    options: ['môi trường', 'chính phủ', 'phát triển', 'giáo dục'],
    correct: 'môi trường',
    hint: 'Nơi chúng ta hít thở và sinh sống mỗi ngày.'
  },
  {
    id: '2',
    word: 'congratulation',
    ipa: '/kənˌɡrætʃ.əˈleɪ.ʃən/',
    options: ['lời chúc mừng', 'sự thất bại', 'bài kiểm tra', 'thời gian biểu'],
    correct: 'lời chúc mừng',
    hint: 'Nói khi ai đó đạt điểm 10 hoặc chiến thắng.'
  },
  {
    id: '3',
    word: 'pronunciation',
    ipa: '/prəˌnʌn.siˈeɪ.ʃən/',
    options: ['cách phát âm', 'từ điển', 'ngữ pháp', 'bài luận'],
    correct: 'cách phát âm',
    hint: 'Kỹ năng nói sao cho chuẩn người bản xứ.'
  },
  {
    id: '4',
    word: 'experience',
    ipa: '/ɪkˈspɪə.ri.əns/',
    options: ['kinh nghiệm', 'thí nghiệm', 'bài tập về nhà', 'sân vận động'],
    correct: 'kinh nghiệm',
    hint: 'Những kiến thức tích lũy qua trải nghiệm thực tế.'
  },
  {
    id: '5',
    word: 'important',
    ipa: '/ɪmˈpɔː.tənt/',
    options: ['quan trọng', 'vui vẻ', 'khó khăn', 'đơn giản'],
    correct: 'quan trọng',
    hint: 'Thứ không thể bỏ qua hoặc thiếu được.'
  }
];

export default function VocabArenaGame({ onEarnPoints, studentGrade }: VocabArenaGameProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lives, setLives] = useState(3);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleWrongAnswer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState]);

  const playBeep = (freq = 600, duration = 150) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => osc.stop(), duration);
    } catch (e) {}
  };

  const startNewGame = () => {
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setTimeLeft(15);
    setSelectedOpt(null);
    playBeep(440, 200);
  };

  const currentQ = SAMPLE_ARENA_POOL[currentIdx % SAMPLE_ARENA_POOL.length];

  const handleSelectOption = (opt: string) => {
    if (selectedOpt) return;
    setSelectedOpt(opt);

    if (opt === currentQ.correct) {
      playBeep(880, 200);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(Math.max(maxCombo, newCombo));
      const earned = 10 + newCombo * 5;
      setScore(prev => prev + earned);
      onEarnPoints(earned);

      setTimeout(() => {
        setSelectedOpt(null);
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(15);
      }, 800);
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    playBeep(220, 300);
    setCombo(0);
    const newLives = lives - 1;
    setLives(newLives);
    setSelectedOpt('TIMEOUT_OR_WRONG');

    setTimeout(() => {
      if (newLives <= 0) {
        setGameState('gameover');
      } else {
        setSelectedOpt(null);
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(15);
      }
    }, 1000);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(currentQ.word);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  if (gameState === 'start') {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-2xl border border-indigo-500/30 space-y-6">
        <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-400/40 shadow-lg shadow-amber-500/10">
          <Gamepad2 className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            ĐẤU TRƯỜNG TỪ VỰNG THCS ⚔️
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            Trò chơi trắc nghiệm tốc độ 15 giây. Nhận chuỗi Combo liên tiếp để tích XP khổng lồ đổi quà tặng!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-xs py-2">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1 fill-rose-500" />
            <span className="font-bold">3 Mạng sống</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="font-bold">15s / Câu</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1 fill-orange-500" />
            <span className="font-bold">Streak Bonus</span>
          </div>
        </div>

        <button
          type="button"
          onClick={startNewGame}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
        >
          BẮT ĐẦU CHIẾN ĐẤU NGAY 🚀
        </button>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 text-center max-w-lg mx-auto shadow-2xl border border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black">Kết Thúc Lượt Chơi!</h3>
          <p className="text-slate-400 text-xs">Con đã chiến đấu rất dũng cảm ở Đấu trường Lớp {studentGrade}</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Tổng Điểm XP</span>
            <span className="text-2xl font-black text-amber-400">+{score}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Max Combo</span>
            <span className="text-2xl font-black text-orange-500">{maxCombo} 🔥</span>
          </div>
        </div>

        <button
          type="button"
          onClick={startNewGame}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Chơi Lại Vòng Khác</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-2xl border border-slate-800 text-left space-y-6">
      {/* Top Hud Bar */}
      <div className="flex items-center justify-between bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
        <div className="flex items-center space-x-1.5">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 transition-all ${
                i < lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-4 font-black">
          {combo > 1 && (
            <div className="text-orange-400 text-xs flex items-center space-x-1 animate-bounce">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>{combo}x COMBO</span>
            </div>
          )}
          <div className="text-amber-400 text-sm">
            🏆 {score} XP
          </div>
          <div className={`px-3 py-1 rounded-xl text-xs font-mono ${
            timeLeft <= 5 ? 'bg-rose-500 text-white animate-ping' : 'bg-slate-700 text-blue-300'
          }`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl border border-slate-700/80 text-center space-y-4 shadow-xl relative">
        <button onClick={speakWord} className="absolute right-4 top-4 text-blue-400 hover:text-blue-300 p-2 bg-slate-800 rounded-xl">
          <Volume2 className="w-5 h-5" />
        </button>

        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Câu hỏi #{currentIdx + 1}
        </span>

        <h3 className="text-3xl md:text-4xl font-black text-white tracking-wide">
          {currentQ.word}
        </h3>
        <p className="font-mono text-amber-300 font-bold text-sm">
          {currentQ.ipa}
        </p>

        <p className="text-xs text-slate-400 italic pt-2 max-w-sm mx-auto">
          💡 Gợi ý: {currentQ.hint}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt, i) => {
          let btnClass = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200';
          if (selectedOpt) {
            if (opt === currentQ.correct) {
              btnClass = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/20 scale-[1.02]';
            } else if (opt === selectedOpt && opt !== currentQ.correct) {
              btnClass = 'bg-rose-600 border-rose-400 text-white opacity-80';
            } else {
              btnClass = 'bg-slate-800/40 border-slate-800 text-slate-600';
            }
          }
          return (
            <button
              key={i}
              type="button"
              disabled={!!selectedOpt}
              onClick={() => handleSelectOption(opt)}
              className={`p-4 rounded-2xl border-2 text-sm font-extrabold transition-all text-center ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
