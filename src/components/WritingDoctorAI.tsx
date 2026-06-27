import React, { useState } from 'react';
import { Stethoscope, Sparkles, Send, Volume2, CheckCircle2, AlertCircle, Award, RefreshCw, ThumbsUp } from 'lucide-react';
import { WritingDoctorResult } from '../types';

interface WritingDoctorAIProps {
  apiKey: string;
}

export default function WritingDoctorAI({ apiKey }: WritingDoctorAIProps) {
  const [inputSentence, setInputSentence] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<WritingDoctorResult | null>(null);

  const handleDiagnose = async () => {
    if (!inputSentence.trim()) return;
    setAnalyzing(true);
    setErrorMsg('');
    setResult(null);

    const prompt = `Hãy phân tích lỗi ngữ pháp và từ vựng trong câu tiếng Anh sau do học sinh THCS viết: "${inputSentence}"`;
    const systemInstruction = `Bạn là Bác Sĩ Ngữ Pháp AI EnglishRoot THCS thông thái và tận tâm.
Hãy chẩn đoán câu tiếng Anh của học sinh và trả về JSON chuẩn theo cấu trúc:
{
  "score": Điểm đánh giá độ chính xác từ 0 đến 10 (số nguyên hoặc thập phân),
  "correctedSentence": "Câu văn chuẩn người bản xứ đã được sửa lại hoàn hảo",
  "errors": [
    {
      "errorText": "Đoạn hoặc cụm từ bị sai",
      "correction": "Sửa lại thành",
      "explanation": "Giải thích luật ngữ pháp THCS bằng tiếng Việt thật dễ hiểu"
    }
  ],
  "compliment": "Một lời khen hoặc động viên ấm áp bằng tiếng Việt giúp học sinh không sợ viết"
}
LƯU Ý: Nếu câu viết đã hoàn hảo 10/10, mảng errors hãy để rỗng [].
BẮT BUỘC trả về duy nhất chuỗi JSON hợp lệ. Không viết thêm lời dẫn hay bọc trong markdown code block.`;

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({
          prompt: `${systemInstruction}\n\nYêu cầu phân tích:\n${prompt}`
        })
      });

      const data = await response.json();
      setAnalyzing(false);

      if (response.ok && data.text) {
        let cleanJson = data.text.trim();
        cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        const parsed: WritingDoctorResult = JSON.parse(cleanJson);
        setResult(parsed);
      } else {
        throw new Error(data.message || data.error || 'Lỗi phân tích từ máy chủ.');
      }
    } catch (err: any) {
      setAnalyzing(false);
      setErrorMsg(`Không thể khám câu văn: ${err.message || 'Tất cả các mô hình AI dự phòng đều bận. Vui lòng thử lại sau.'}`);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-left max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-1.5">
            <span>Phòng Khám Viết Câu AI (Writing Doctor)</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h2>
          <p className="text-slate-500 text-xs">Tự đặt câu tiếng Anh bất kỳ để Bác sĩ AI chỉ ra từng lỗi ngữ pháp chi tiết</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
          ✍️ Nhập câu tiếng Anh con muốn kiểm tra:
        </label>
        <div className="relative">
          <textarea
            value={inputSentence}
            onChange={(e) => setInputSentence(e.target.value)}
            placeholder="Ví dụ: Yesterday I go to school with my friend and we plays soccer..."
            rows={3}
            className="w-full p-4 border-2 border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-sm font-medium text-slate-800 bg-slate-50/40 transition-all resize-none shadow-inner"
          />
          <button
            type="button"
            onClick={handleDiagnose}
            disabled={analyzing || !inputSentence.trim()}
            className="absolute right-3.5 bottom-3.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang khám bệnh...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Chẩn Đoạn Lỗi Ngay</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 font-medium italic">
          * Đừng sợ viết sai! Càng sai nhiều Bác sĩ AI càng chữa được gốc rễ lỗ hổng cho con.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2.5 font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Box */}
      {result && (
        <div className="space-y-5 pt-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Score & Compliment Hud */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-black text-2xl text-emerald-400 shrink-0">
                {result.score}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">Sức Khỏe Câu Văn</span>
                <h4 className="font-extrabold text-base tracking-tight">{result.score >= 8 ? 'Tuyệt Vời! Rất chuẩn xác 🌟' : result.score >= 5 ? 'Vững vàng, cần tỉ mỉ thêm chút 💪' : 'Cần chữa trị lỗ hổng ngữ pháp 🩺'}</h4>
              </div>
            </div>

            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-emerald-100 flex items-center space-x-2 max-w-sm">
              <ThumbsUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium italic">"{result.compliment}"</span>
            </div>
          </div>

          {/* Corrected Sentence */}
          <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl space-y-1.5 relative">
            <button onClick={() => speak(result.correctedSentence)} className="absolute right-3.5 top-3.5 text-emerald-700 hover:text-emerald-900 p-1.5 bg-white rounded-lg shadow-sm">
              <Volume2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Câu Viết Chuẩn Bản Xứ Nên Đổi:</span>
            <p className="text-base font-black text-emerald-950 pr-8">{result.correctedSentence}</p>
          </div>

          {/* Breakdown of Errors */}
          <div className="space-y-2.5">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Phác Đồ Điều Trị Từng Lỗi Sai ({result.errors?.length || 0} lỗi):</span>
            </span>

            {result.errors && result.errors.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {result.errors.map((err, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md line-through">
                        "{err.errorText}"
                      </span>
                      <span>➔</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                        "{err.correction}"
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      💡 <strong>Giải thích:</strong> {err.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs font-bold flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Chúc mừng con! Câu viết hoàn toàn chính xác không có lỗi ngữ pháp nào.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
