import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, ShieldCheck, Sparkles, AlertCircle, Zap, Cpu, Globe } from 'lucide-react';

interface AIModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, model: string) => void;
  initialKey: string;
  initialModel: string;
}

export default function AIModelSettings({
  isOpen,
  onClose,
  onSave,
  initialKey,
  initialModel
}: AIModelSettingsProps) {
  const [apiKey, setApiKey] = useState(initialKey);
  const [selectedModel, setSelectedModel] = useState(initialModel || 'gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setApiKey(initialKey);
    setSelectedModel(initialModel || 'gemini-3-flash-preview');
  }, [initialKey, initialModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey, selectedModel);
    onClose();
  };

  const handleTestKey = async () => {
    setTestStatus('testing');
    setTestMessage('Đang kết nối thử nghiệm...');
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          prompt: 'Hi, return exactly "OK" if you hear me.',
          systemInstruction: 'You are a test helper.'
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setTestStatus('success');
        setTestMessage(`Kết nối thành công! Đã phản hồi từ model ${data.model || selectedModel}.`);
      } else {
        throw new Error(data.message || 'Mã lỗi từ API.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Không thể kết nối. Vui lòng kiểm tra lại khóa API.');
    }
  };

  const MODELS = [
    {
      id: 'gemini-3-flash-preview',
      title: 'Gemini 3 Flash Preview',
      badge: 'Default • Khuyên dùng',
      desc: 'Tốc độ phản hồi siêu nhanh, cân bằng xuất sắc cho tra cứu từ vựng và giải bài tập THCS.',
      icon: Zap,
      color: 'text-amber-500 bg-amber-50 border-amber-200'
    },
    {
      id: 'gemini-3-pro-preview',
      title: 'Gemini 3 Pro Preview',
      badge: 'Thông minh vượt trội',
      desc: 'Mô hình lập luận chuyên sâu nhất, tối ưu cho phân tích ngữ pháp khó và dịch bài văn dài.',
      icon: Cpu,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      id: 'gemini-2.5-flash',
      title: 'Gemini 2.5 Flash',
      badge: 'Dự phòng ổn định',
      desc: 'Tối ưu độ trễ thấp và khả năng đọc bồi đa ngôn ngữ Anh - Việt chính xác.',
      icon: Globe,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-400/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight flex items-center space-x-1.5">
                <span>Thiết Lập Model & API Key</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h3>
              <p className="text-slate-300 text-xs">Cấu hình kết nối trí tuệ nhân tạo Gemini Tutor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Free quota notice */}
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Cơ chế dùng thử & Quản lý API Key:</strong> Ứng dụng hỗ trợ sẵn <strong>5 lượt dùng thử miễn phí</strong> trước khi yêu cầu nhập API Key cá nhân. Trạng thái và khóa của bạn được lưu an toàn trong <code>localStorage</code> trình duyệt.
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                Khóa Cá Nhân (Gemini API Key)
              </label>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1"
              >
                <span>Nhận API Key miễn phí tại đây</span>
                <span>↗</span>
              </a>
            </div>
            <p className="text-slate-500 text-xs leading-normal">
              Việc nhập key ban đầu là cần thiết khi hết hạn mức dùng thử. Khóa có dạng <code>AIzaSy...</code>
            </p>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán API Key của bạn vào đây..."
                className="w-full pl-4 pr-11 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none text-sm font-medium text-slate-800 bg-slate-50/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Selection Cards following AI_INSTRUCTIONS.md */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Chọn Model Trí Tuệ Nhân Tạo (AI Model Cards)
            </label>
            <div className="grid grid-cols-1 gap-3">
              {MODELS.map((m) => {
                const IconComp = m.icon;
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-100'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${m.color} shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-slate-900">{m.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test connection Trigger */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestKey}
              className="px-4 py-2 border-2 border-indigo-100 hover:border-indigo-600 text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Kiểm tra kết nối AI ngay</span>
            </button>
            
            <span className="text-[11px] text-slate-400 font-medium italic">
              * Tự động Fallback sang model tiếp theo nếu gặp lỗi
            </span>
          </div>

          {testStatus !== 'idle' && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 animate-in fade-in duration-150 ${
                testStatus === 'testing'
                  ? 'bg-slate-50 text-slate-700 border-slate-200'
                  : testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testStatus === 'testing' && <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin shrink-0"></div>}
              {testStatus === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <div className="font-semibold">{testMessage}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-200"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
}
