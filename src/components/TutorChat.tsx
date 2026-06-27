import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Bot, User, Trash2, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface TutorChatProps {
  apiKey: string;
  studentGrade: string;
  studentName: string;
}

export default function TutorChat({ apiKey, studentGrade, studentName }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Chào ${studentName || 'bạn học nhỏ'}! Thầy cô AI luôn sẵn sàng đồng hành cùng bạn học sinh lớp ${studentGrade || 'THCS'} lấy lại gốc tiếng Anh đây. Bạn cần thầy cô giải thích từ vựng, ngữ pháp, hay dịch câu nào nè? ❤️`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const prompt = `
Bạn là một thầy cô giáo dạy tiếng Anh trung học cơ sở (THCS - Lớp 6, 7, 8, 9) cực kỳ vui vẻ, thân thiện, kiên nhẫn và dùng ngôn từ vô cùng ngọt ngào, ấm áp để giảng bài cho một học sinh đang "mất gốc" tiếng Anh tên là ${studentName || 'Học sinh'} học lớp ${studentGrade || 'THCS'}.

- Câu hỏi của học sinh: "${userText}"

Hãy trả lời học sinh bằng tiếng Việt với cấu trúc chuẩn:
1. Mở đầu bằng lời chào mừng hoặc khích lệ dễ thương (ví dụ: "Chào con thân mến!", "Ôi câu hỏi này hay quá con ơi!", "Để thầy cô giúp con hiểu rõ từ này nhé!").
2. Giải thích kiến thức cực kỳ dễ hiểu, chia nhỏ bước, kèm ví dụ song ngữ Anh - Việt sinh động.
3. Nếu có từ vựng, hãy ghi kèm phiên âm IPA đơn giản và cách đọc cho học sinh dễ bắt chước.
4. Kết thúc bằng câu chúc động viên tiếp tục nỗ lực.

Phong cách: Trực quan, nhiều năng lượng tích cực, dùng icon cảm xúc ấm áp. Giữ phản hồi súc tích dễ hiểu đối với trẻ em 11-15 tuổi.
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
          systemInstruction: 'You are an exceptionally caring and clear junior-high school English teacher from Vietnam.'
        })
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok && data.text) {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'ai',
            text: data.text,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.message || 'Lỗi gọi AI');
      }
    } catch (err: any) {
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'ai',
          text: `Thầy cô AI vừa mất kết nối mạng một chút hoặc API Key bị gián đoạn. Con có thể thử hỏi lại hoặc bấm cài đặt lại mã API ở trên nhé!`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Con có muốn xóa lịch sử trò chuyện này không?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Đã dọn dẹp phòng học sạch sẽ! Chào mừng ${studentName || 'con'} quay lại. Con có câu hỏi mới nào không?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Sample quick templates
  const quickPrompts = [
    'Thế nào là Hiện tại đơn?',
    'Phát âm từ "beautiful" sao cho chuẩn?',
    'Mẹo phân biệt s và es?',
    'Cách dùng giới từ "in, on, at"?'
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg h-[550px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3.5 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/15 rounded-lg">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm flex items-center space-x-1">
              <span>Thầy Cô AI Lấy Gốc</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </h3>
            <p className="text-[10px] text-indigo-100">Hỏi bất cứ thứ gì về tiếng Anh THCS</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Xóa cuộc trò chuyện"
          className="text-indigo-200 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed text-left whitespace-pre-line shadow-sm ${
                  isAi
                    ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none font-medium'
                }`}
              >
                {msg.text}
              </div>
              {!isAi && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                  Con
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-600 animate-bounce" />
            </div>
            <div className="bg-white text-slate-500 rounded-2xl px-4 py-2.5 text-xs shadow-sm rounded-tl-none border border-slate-100 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts list */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">Gợi ý câu hỏi nhanh:</p>
          <div className="flex flex-wrap gap-1">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputValue(p)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-semibold rounded-full transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Hỏi thầy cô giải thích bài tập..."
          className="flex-1 px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
