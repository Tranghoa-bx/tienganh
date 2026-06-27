import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Subject, Question, Session } from '../types';
import {
  Volume2, Mic, MicOff, Check, X, Award, AlertCircle, Play,
  Sparkles, RotateCcw, ArrowRight, HelpCircle, HelpCircle as ExplIcon, Clock, Languages, ChevronRight, HelpCircle as LightBulb
} from 'lucide-react';

interface PracticePanelProps {
  subject: Subject;
  questions: Question[];
  apiKey: string;
  onCompleteSession: (session: Session, earnedPoints: number) => void;
}

export default function PracticePanel({
  subject,
  questions,
  apiKey,
  onCompleteSession
}: PracticePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes count down
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Speech Synthesis (TTS)
  const [speakingSpeed, setSpeakingSpeed] = useState<number>(0.85); // slower for clear syllables

  // Custom Vocabulary Reader (⭐ Có thể nhập từ vựng để app đọc mẫu)
  const [customWord, setCustomWord] = useState('');
  const [ipaResult, setIpaResult] = useState<{
    word: string;
    ipa: string;
    vietnameseGuide: string;
    translation: string;
    syllables: string;
    loading: boolean;
  } | null>(null);

  const [currentQuestionIpa, setCurrentQuestionIpa] = useState<{
    ipa: string;
    vietnameseGuide: string;
    translation: string;
    loading: boolean;
  } | null>(null);

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [recognizedWords, setRecognizedWords] = useState<{ word: string; correct: boolean }[]>([]);

  // AI Speech Feedback
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Fallback voice text simulator (for sandboxed browsers/iframes without mic)
  const [showSimInput, setShowSimInput] = useState(false);
  const [simText, setSimText] = useState('');

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const recognitionRef = useRef<any>(null);

  // Sound effects
  const playSound = (type: 'correct' | 'incorrect' | 'levelup') => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.1, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.35);
      } else if (type === 'incorrect') {
        osc.frequency.setValueAtTime(220, context.currentTime); // A3
        osc.frequency.setValueAtTime(147, context.currentTime + 0.1); // D3
        gain.gain.setValueAtTime(0.1, context.currentTime);
        osc.start();
        osc.stop(context.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio Context block', e);
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Load standard question pronunciation and translation details
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'pronunciation') {
      setCurrentQuestionIpa({
        ipa: '',
        vietnameseGuide: '',
        translation: '',
        loading: true
      });

      fetch('/api/gemini/ipa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ text: currentQuestion.content })
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch standard phonic translation');
      })
      .then(data => {
        setCurrentQuestionIpa({
          ipa: data.ipa || '',
          vietnameseGuide: data.vietnameseGuide || '',
          translation: data.translation || '',
          loading: false
        });
      })
      .catch(err => {
        console.error(err);
        setCurrentQuestionIpa(null);
      });
    } else {
      setCurrentQuestionIpa(null);
    }
  }, [currentIndex, currentQuestion]);

  // Load Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setMicError('Không có quyền truy cập Micro. Hãy nhấp chọn nút "Mô phỏng phát âm" ở dưới để thử nghiệm nhé!');
        } else {
          setMicError(`Lỗi ghi âm: ${e.error}. Vui lòng thử lại.`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        processSpokenText(resultText);
      };

      recognitionRef.current = rec;
    } else {
      setMicError('Trình duyệt không hỗ trợ Web Speech API trực tiếp. Hãy chọn mục mô phỏng bên dưới.');
    }
  }, [currentIndex]);

  // Speak Model Audio (TTS)
  const speakText = (text: string, slowMode = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = slowMode ? 0.65 : speakingSpeed;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en-')) ||
                           voices[0];

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Thiết bị không hỗ trợ phát âm đọc mẫu!");
    }
  };

  // Process Speech-to-Text Transcript and compare word-by-word
  const processSpokenText = (text: string) => {
    setSpokenText(text);
    const targetClean = currentQuestion.content.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const spokenClean = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    const targetWords = targetClean.split(/\s+/).filter(Boolean);
    const spokenWords = spokenClean.split(/\s+/).filter(Boolean);

    // Compute basic word matches
    const analyzed = targetWords.map(targetW => {
      // Check if user spoke this word (very basic comparison)
      const matches = spokenWords.includes(targetW);
      return { word: targetW, correct: matches };
    });

    setRecognizedWords(analyzed);

    const correctCount = analyzed.filter(w => w.correct).length;
    const matchPercentage = correctCount / targetWords.length;

    setIsAnswered(true);
    if (matchPercentage >= 0.7) {
      setIsCorrect(true);
      playSound('correct');
      setScore(prev => prev + 1);
    } else {
      setIsCorrect(false);
      playSound('incorrect');
    }
  };

  // Trigger speech recording
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setSpokenText('');
      setRecognizedWords([]);
      setAiFeedback(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Simulated Speaking Handler (For demo and compatibility)
  const handleSimulateSpeaking = () => {
    if (!simText.trim()) return;
    processSpokenText(simText.trim());
    setShowSimInput(false);
  };

  // AI Pronunciation Coach (Calls Gemini for correction tips)
  const handleRequestAiFeedback = async () => {
    if (!spokenText) return;
    setIsAiAnalyzing(true);
    setAiFeedback(null);

    const prompt = `
Hãy là một giáo viên dạy tiếng Anh THCS vô cùng tận tâm, thân thiện và ấm áp.
Học sinh của bạn đang bị "mất gốc" tiếng Anh và đang cố gắng cải thiện kỹ năng đọc chuẩn phát âm.

- Nội dung bài tập đọc mẫu: "${currentQuestion.content}"
- Bản text học sinh đã thực tế phát âm: "${spokenText}"
- Giải thích gốc của từ này: "${currentQuestion.explanation}"

Hãy phân tích và viết một bài phản hồi NGẮN GỌN (khoảng 3-4 gạch đầu dòng) bằng TIẾNG VIỆT để:
1. Động viên và khen ngợi sự nỗ lực của học sinh.
2. Chỉ ra điểm khác biệt mấu chốt giữa câu đọc mẫu và bản đọc của học sinh.
3. Hướng dẫn chi tiết cách phát âm các từ sai, vị trí đặt lưỡi, môi, hoặc cách bật âm đuôi (ending sounds) phù hợp cho lứa tuổi cấp 2 (THCS).
4. Khuyên khích luyện tập hàng ngày.

Giọng điệu: Động viên, vui tươi, sử dụng các từ ngữ gần gũi dễ hiểu. Tránh dùng từ quá chuyên môn ngữ âm học rắc rối.
`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          prompt,
          systemInstruction: 'You are an enthusiastic, child-friendly junior-high school English pronunciation coach.'
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setAiFeedback(data.text);
      } else {
        setAiFeedback("AI Tutor đang bận một chút. Bạn hãy thử bấm lại hoặc tiếp tục ôn tập từ vựng nhé!");
      }
    } catch (err) {
      console.error(err);
      setAiFeedback("Không kết nối được với AI Tutor. Vui lòng kiểm tra API Key.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Handle MCQ Choice Click
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playSound('correct');
      setScore(prev => prev + 1);
    } else {
      playSound('incorrect');
    }
  };

  // Handle Fill in the blank verification
  const handleCheckFillBlank = () => {
    if (isAnswered || !userAnswer.trim()) return;
    setIsAnswered(true);

    const cleanUser = userAnswer.trim().toLowerCase();
    const cleanCorrect = currentQuestion.correctAnswer.trim().toLowerCase();
    const correct = cleanUser === cleanCorrect;

    setIsCorrect(correct);
    if (correct) {
      playSound('correct');
      setScore(prev => prev + 1);
    } else {
      playSound('incorrect');
    }
  };

  // Handle next question
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      // Reset States
      setUserAnswer('');
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setSpokenText('');
      setRecognizedWords([]);
      setAiFeedback(null);
    } else {
      // Finished all questions! Complete the session
      setTimerActive(false);
      const earnedXP = score * 50 + 20; // 50 XP per correct + 20 bonus completion
      const completedSession: Session = {
        id: Math.random().toString(36).substr(2, 9),
        subjectId: subject.id,
        score: Math.round((score / totalQuestions) * 10),
        totalQuestions,
        correctAnswers: score,
        timeSpent: elapsedTime,
        date: new Date().toISOString().split('T')[0]
      };
      onCompleteSession(completedSession, earnedXP);
    }
  };

  // Custom vocab modeler helper (⭐ Có thể nhập từ vựng để app đọc mẫu)
  const fetchIpaResult = async (word: string) => {
    const textToAnalyze = word.trim();
    if (!textToAnalyze) return;

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

  const handleCustomSpeak = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWord.trim()) {
      speakText(customWord.trim(), false);
      fetchIpaResult(customWord);
    }
  };

  const handleCustomSpeakSlow = () => {
    if (customWord.trim()) {
      speakText(customWord.trim(), true);
      fetchIpaResult(customWord);
    }
  };

  // Format countdown clock
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Practice Card Area (2 columns on desktop) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Topic Header Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {subject.name}
            </span>
            <h2 className="text-lg font-extrabold text-slate-800">
              Câu {currentIndex + 1} / {totalQuestions}
            </h2>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full text-slate-700 font-mono text-sm font-bold shadow-sm">
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Thời gian: {formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Active Exercise Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          {/* Question Level Badge */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Dành cho học sinh lấy gốc lớp {currentQuestion.id.startsWith('pa') ? '6-9' : 'Cấp 2'}</span>
            <span className={`px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
              currentQuestion.difficulty === 'easy' ? 'text-emerald-600 bg-emerald-50' :
              currentQuestion.difficulty === 'medium' ? 'text-amber-600 bg-amber-50' :
              'text-rose-600 bg-rose-50'
            }`}>
              Độ khó: {currentQuestion.difficulty === 'easy' ? 'Dễ' : currentQuestion.difficulty === 'medium' ? 'Vừa' : 'Thách thức'}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Pronunciation Target block */}
            {currentQuestion.type === 'pronunciation' ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hãy lắng nghe đọc mẫu rồi nói vào mic:</p>

                  <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 inline-block w-full space-y-3">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug tracking-wide select-all">
                      {currentQuestion.content}
                    </h3>

                    {currentQuestionIpa && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {currentQuestionIpa.loading ? (
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang dịch nghĩa và phiên âm chuẩn AI...</span>
                          </div>
                        ) : (
                          <>
                            {currentQuestionIpa.ipa && (
                              <div className="px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-mono font-bold text-indigo-700">
                                <span>IPA: {currentQuestionIpa.ipa}</span>
                              </div>
                            )}
                            {currentQuestionIpa.vietnameseGuide && (
                              <div className="px-3 py-1 bg-amber-50 border border-amber-100/50 rounded-full text-xs font-bold text-amber-800">
                                <span>Mẹo đọc bồi: {currentQuestionIpa.vietnameseGuide}</span>
                              </div>
                            )}
                            {currentQuestionIpa.translation && (
                              <div className="px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full text-xs font-bold text-emerald-800">
                                <span>Dịch: {currentQuestionIpa.translation}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Audio Controls for target modeling */}
                  <div className="flex justify-center items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.content, false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                    >
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span>Đọc Mẫu Chuẩn</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.content, true)}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                    >
                      <Play className="w-4.5 h-4.5 text-amber-500" />
                      <span>Đọc Chậm Syllable (0.65x)</span>
                    </button>
                  </div>
                </div>

                {/* Microphone action area */}
                <div className="border-t border-slate-100 pt-6 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isListening
                          ? 'bg-rose-500 text-white ring-8 ring-rose-100 scale-105 animate-pulse'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 text-white hover:scale-105'
                      }`}
                    >
                      {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    {isListening ? 'Đang lắng nghe... Hãy nói ngay!' : 'Bấm Micro để bắt đầu luyện đọc giọng nói'}
                  </p>

                  {/* Mic Blocked / Error Alerts */}
                  {micError && (
                    <div className="text-center max-w-sm px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="leading-tight">{micError}</p>
                    </div>
                  )}

                  {/* Manual Voice Input Simulation Trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSimInput(!showSimInput)}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      {showSimInput ? '✖ Đóng bảng giả lập' : '⌨ Giả lập phát âm (Nếu thiếu Micro/Chạy iFrame)'}
                    </button>
                  </div>

                  {showSimInput && (
                    <div className="w-full max-w-md p-4 bg-slate-50 rounded-xl border border-slate-200 flex space-x-2 animate-in slide-in-from-top-1">
                      <input
                        type="text"
                        placeholder="Nhập câu bạn muốn giả lập nói (VD: the green sheep...)"
                        value={simText}
                        onChange={(e) => setSimText(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSimulateSpeaking}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Nói Giả Lập
                      </button>
                    </div>
                  )}
                </div>

                {/* Pronunciation Feedback Output */}
                {isAnswered && (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="text-center">
                      <span className={`px-4 py-1.5 rounded-full font-bold text-xs inline-flex items-center space-x-1.5 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>{isCorrect ? 'Phát âm Tuyệt Vời! +50 XP' : 'Hãy thử phát âm rõ ràng hơn nhé'}</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Từ vựng bạn phát âm được:</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {recognizedWords.length > 0 ? (
                          recognizedWords.map((item, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded font-bold text-sm ${
                                item.correct
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}
                            >
                              {item.word}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-bold text-slate-600 italic">"{spokenText}"</span>
                        )}
                      </div>
                    </div>

                    {/* AI Feedback trigger */}
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        disabled={isAiAnalyzing}
                        onClick={handleRequestAiFeedback}
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center space-x-2 mx-auto disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{isAiAnalyzing ? 'AI Cô Giáo Đang Sửa Lỗi...' : 'AI Sửa Lỗi Giọng Nói 📝'}</span>
                      </button>
                    </div>

                    {aiFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50 space-y-2"
                      >
                        <div className="flex items-center space-x-2 text-indigo-800 font-bold text-sm">
                          <Languages className="w-5 h-5 text-indigo-600" />
                          <span>AI Tutor Cô Giáo Sửa Lỗi:</span>
                        </div>
                        <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-line text-left pl-7">
                          {aiFeedback}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            ) : currentQuestion.type === 'multiple-choice' ? (
              // Multiple Choice
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                    {currentQuestion.content}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options?.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrectAnswer = option === currentQuestion.correctAnswer;
                    let buttonStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                    if (isAnswered) {
                      if (isCorrectAnswer) {
                        buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                      } else if (isSelected) {
                        buttonStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                      } else {
                        buttonStyle = 'opacity-50 border-slate-100 text-slate-400 bg-slate-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(option)}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${buttonStyle}`}
                      >
                        <span className="text-sm font-semibold">{option}</span>
                        {isAnswered && isCorrectAnswer && <Check className="w-4 h-4 text-emerald-600" />}
                        {isAnswered && isSelected && !isCorrectAnswer && <X className="w-4 h-4 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Fill-in-the-blank
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 leading-relaxed">
                    {currentQuestion.content}
                  </h3>
                </div>

                <div className="max-w-md mx-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    disabled={isAnswered}
                    placeholder="Điền từ đúng vào đây..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 bg-white"
                  />
                  <button
                    type="button"
                    disabled={isAnswered || !userAnswer.trim()}
                    onClick={handleCheckFillBlank}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
                  >
                    Kiểm tra
                  </button>
                </div>
              </div>
            )}

            {/* Answer feedback & Explanation block */}
            {isAnswered && (
              <div className="border-t border-slate-100 pt-5 space-y-4 text-left animate-in fade-in duration-200">
                <div className="flex items-start space-x-2.5">
                  <div className={`p-1.5 rounded-full shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className={`font-extrabold text-sm ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {isCorrect ? 'Đáp án hoàn toàn chính xác! +50 Điểm' : 'Rất tiếc, câu trả lời chưa đúng.'}
                    </h4>
                    {!isCorrect && (
                      <p className="text-xs text-slate-600 mt-1">
                        Đáp án đúng là: <strong className="text-emerald-600 font-bold">{currentQuestion.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-2.5">
                  <LightBulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-bold">💡 Học nhanh ngữ pháp:</strong> {currentQuestion.explanation}
                  </div>
                </div>

                {/* Next button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl text-sm flex items-center space-x-1.5 shadow-md shadow-blue-100"
                  >
                    <span>{currentIndex < totalQuestions - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài tập'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side tools (1 column on desktop) */}
      <div className="space-y-6">
        {/* ⭐ Có thể nhập từ vựng để app đọc mẫu (Interactive Any-word modeler tool) */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-lg space-y-4 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-amber-500/20 rounded-full blur-xl"></div>

          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-400 uppercase tracking-widest flex items-center space-x-1">
              <Volume2 className="w-4 h-4" />
              <span>Any-Word Audio Modeler</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-snug">
              Nhập bất kỳ từ vựng hoặc câu tiếng Anh nào dưới đây để nghe người bản xứ đọc mẫu tức thì.
            </p>
          </div>

          <form onSubmit={handleCustomSpeak} className="space-y-2">
            <input
              type="text"
              required
              placeholder="VD: environment, school yard, practice..."
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                className="py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold text-xs transition-colors"
              >
                Normal Speed
              </button>
              <button
                type="button"
                onClick={handleCustomSpeakSlow}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg font-semibold text-xs transition-colors"
              >
                Slow (0.65x)
              </button>
            </div>

            {/* Embedded IPA analysis result in sidebar */}
            {ipaResult && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2 text-left animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">Phiên âm & Dịch nghĩa AI</span>
                  <button 
                    type="button"
                    onClick={() => setIpaResult(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-1 hover:bg-slate-800 rounded transition-colors"
                  >
                    ×
                  </button>
                </div>

                {ipaResult.loading ? (
                  <div className="flex items-center space-x-2 py-1 text-slate-300">
                    <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px]">Đang tra cứu phát âm...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-slate-200">
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
                        <span className="text-[8px] text-slate-400 block font-bold uppercase">Phát âm (IPA)</span>
                        <span className="font-mono font-bold text-amber-300">{ipaResult.ipa}</span>
                      </div>
                      <div className="bg-amber-950/40 p-1.5 rounded border border-amber-900/30">
                        <span className="text-[8px] text-amber-400 block font-bold uppercase">Phát âm bồi</span>
                        <span className="font-bold text-amber-200">{ipaResult.vietnameseGuide}</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">Dịch nghĩa Việt</span>
                      <span className="font-medium text-slate-300">{ipaResult.translation}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Level Up Progress Indicator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Xếp Hạng Học Tập</span>
          </h3>
          <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Đạt điểm:</span>
              <span className="text-blue-600">{score} / {currentIndex + 1} đúng</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>XP Tích lũy phiên:</span>
              <span className="font-bold text-amber-600">+{score * 50} XP</span>
            </div>
          </div>
        </div>

        {/* Diagnostic path recommendation tip */}
        <div className="p-4 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed text-left">
            <strong>Mẹo hữu ích:</strong> Chương trình lấy gốc THCS chú trọng vào cách bật âm đuôi (như /s/, /z/, /t/, /d/) và hơi thở bụng. Luyện tập đều đặn 10 phút mỗi ngày sẽ tăng phản xạ nói lên 85%!
          </div>
        </div>
      </div>
    </div>
  );
}
