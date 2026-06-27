import React, { useState } from 'react';
import { motion } from 'motion/react';
import { StudentProfile } from '../types';
import { GraduationCap, Award, Brain, Target, Sparkles } from 'lucide-react';

interface DiagnosticSurveyProps {
  onComplete: (profile: StudentProfile) => void;
}

export default function DiagnosticSurvey({ onComplete }: DiagnosticSurveyProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('6');
  const [currentLevel, setCurrentLevel] = useState('lost');
  const [goal, setGoal] = useState('average');
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsGenerating(true);
    // Simulate smart AI algorithm generating custom reading pathway
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        grade,
        currentLevel,
        goal,
        surveyCompleted: true
      });
      setIsGenerating(false);
    }, 2000);
  };

  const levels = [
    { id: 'lost', title: 'Mất gốc hoàn toàn', desc: 'Chưa biết cách phát âm, quên hết từ vựng cơ bản.', icon: Brain, color: 'text-red-500 bg-red-50' },
    { id: 'beginner', title: 'Biết một chút từ vựng', desc: 'Có biết vài từ nhưng không ghép được câu hay giao tiếp.', icon: Sparkles, color: 'text-amber-500 bg-amber-50' },
    { id: 'scared', title: 'Sợ nói / Sợ phát âm', desc: 'Biết ngữ pháp cơ bản nhưng rất ngại mở miệng đọc tiếng Anh.', icon: Award, color: 'text-blue-500 bg-blue-50' },
    { id: 'grammar', title: 'Yếu cả từ vựng & ngữ pháp', desc: 'Điểm số trên lớp thấp, sợ các bài kiểm tra nói và đọc.', icon: GraduationCap, color: 'text-purple-500 bg-purple-50' }
  ];

  const goals = [
    { id: 'average', title: 'Vượt qua nỗi sợ & Đạt điểm trung bình (5-6 điểm)', desc: 'Nhanh chóng bứt phá lấy lại căn bản để tự tin vượt qua các bài kiểm tra.', icon: Target },
    { id: 'good', title: 'Đạt điểm khá giỏi trở lên (7-8+ điểm)', desc: 'Phát âm chuẩn xác, tích lũy từ vựng phong phú để vươn lên top đầu của lớp.', icon: Award },
    { id: 'confident', title: 'Tự tin phát âm trôi chảy & giao tiếp tự nhiên', desc: 'Không chỉ thi cử tốt mà còn có thể đọc truyện, nói chuyện trôi chảy bằng tiếng Anh.', icon: Sparkles }
  ];

  return (
    <div className="max-w-xl mx-auto my-6 p-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {/* Top Banner Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">🎓 Khảo Sát Lập Lộ Trình</h2>
        <p className="text-blue-100 text-sm">Chỉ 1 phút thiết lập để AI kiến tạo lộ trình học phát âm và từ vựng cá nhân hóa cho riêng bạn!</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {isGenerating ? (
          <div className="text-center py-12 space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">AI Đang Phân Tích Khảo Sát...</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Hệ thống đang chuẩn bị giáo trình phát âm chuẩn IPA và ngân hàng câu hỏi phù hợp nhất với lớp {grade}!
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên của bạn:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Minh Anh, Khánh Linh..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bạn đang học lớp mấy?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['6', '7', '8', '9'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`py-3 rounded-lg border font-semibold text-center transition-all ${
                          grade === g
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Lớp {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    Tiếp tục →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Current English Level */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hiện trạng tiếng Anh hiện tại của bạn:</label>
                <div className="space-y-2">
                  {levels.map((lvl) => {
                    const Icon = lvl.icon;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setCurrentLevel(lvl.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                          currentLevel === lvl.id
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${lvl.color} shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{lvl.title}</h4>
                          <p className="text-slate-500 text-xs mt-0.5">{lvl.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                  >
                    Tiếp tục →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mục tiêu bạn muốn đạt được học kỳ này:</label>
                <div className="space-y-2">
                  {goals.map((g) => {
                    const Icon = g.icon;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                          goal === g.id
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{g.title}</h4>
                          <p className="text-slate-500 text-xs mt-0.5">{g.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="submit"
                    className="py-3 bg-gradient-to-r from-blue-600 to-amber-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                  >
                    Kích Hoạt Lộ Trình ✨
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
