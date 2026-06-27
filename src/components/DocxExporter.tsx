import React, { useState } from 'react';
import { FileText, Download, Sparkles, CheckSquare, Layers, CheckCircle2 } from 'lucide-react';
import { Question, Subject, WeakTopic } from '../types';

interface DocxExporterProps {
  studentName: string;
  studentGrade: string;
  questions: Question[];
  subjects: Subject[];
  weakTopics: WeakTopic[];
}

export default function DocxExporter({
  studentName,
  studentGrade,
  questions,
  subjects,
  weakTopics
}: DocxExporterProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const handleGenerateWordDoc = () => {
    setExporting(true);
    setTimeout(() => {
      // Filter questions
      let filtered = questions;
      if (selectedTopic !== 'all') {
        filtered = questions.filter(q => q.subjectId === selectedTopic);
      }
      
      const selectedQuestions = filtered.slice(0, questionCount);

      // Build HTML compatible with MS Word (.doc/.docx)
      const topicName = selectedTopic === 'all' ? 'Tổng hợp toàn diện' : (subjects.find(s => s.id === selectedTopic)?.name || 'Bài tập ôn luyện');

      let questionsHtml = '';
      let answersHtml = '';

      selectedQuestions.forEach((q, idx) => {
        questionsHtml += `
          <div style="margin-bottom: 18px; font-size: 14pt; line-height: 1.5;">
            <p><strong>Câu ${idx + 1}:</strong> ${q.content}</p>
            ${q.options ? `
              <ul style="list-style-type: none; padding-left: 20px;">
                ${q.options.map((opt, oIdx) => `
                  <li style="margin-bottom: 6px;">${String.fromCharCode(65 + oIdx)}. ${opt}</li>
                `).join('')}
              </ul>
            ` : `<p><em>Trả lời: ..................................................................................</em></p>`}
          </div>
        `;

        answersHtml += `
          <div style="margin-bottom: 14px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
            <p style="font-size: 13pt; color: #1e3a8a;"><strong>Câu ${idx + 1} - Đáp án đúng: <span style="color: #b91c1c;">${q.correctAnswer}</span></strong></p>
            ${includeExplanations ? `<p style="font-size: 12pt; color: #374151;"><em>💡 Giải thích từ Cô giáo AI:</em> ${q.explanation}</p>` : ''}
          </div>
        `;
      });

      const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Phiếu Bài Tập EnglishRoot</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 3cm 2cm 2cm 2cm; }
            h1 { color: #1d4ed8; font-size: 20pt; text-align: center; text-transform: uppercase; margin-bottom: 5px; }
            .meta { text-align: center; font-size: 13pt; color: #555; margin-bottom: 25px; }
            .box { border: 2px solid #1e40af; padding: 15px; border-radius: 8px; background-color: #f8fafc; margin-bottom: 20px; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>PHIẾU BÀI TẬP TIẾNG ANH THCS - LỚP ${studentGrade}</h1>
            <p class="meta"><strong>Chuyên đề ôn tập:</strong> ${topicName} • <strong>Học sinh:</strong> ${studentName || '................................'}</p>
            <p style="text-align: center; font-style: italic;">"Lộ trình cá nhân hóa lấy gốc kiến thức - EnglishRoot THCS"</p>
          </div>

          <h2 style="color: #1e3a8a; font-size: 16pt; border-bottom: 2px solid #1e3a8a; padding-bottom: 5px;">PHẦN I: CÂU HỎI & BÀI TẬP</h2>
          <div style="margin-top: 15px;">
            ${questionsHtml || '<p>Không có câu hỏi nào trong danh mục này.</p>'}
          </div>

          <!-- PAGE BREAK FOR ANSWERS AT THE END OF THE PAGE -->
          <br clear="all" style="page-break-before:always" />

          <div style="margin-top: 30px;">
            <div style="background-color: #fef2f2; border: 2px solid #ef4444; padding: 12px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #991b1b; font-size: 16pt; margin: 0;">PHẦN II: ĐÁP ÁN & LỜI GIÁI CHI TIẾT CÔ GIÁO AI</h2>
              <p style="font-size: 11pt; color: #7f1d1d; margin: 5px 0 0 0;">(Dành cho học sinh tự chấm điểm sau khi đã nỗ lực làm bài ở Trang trước)</p>
            </div>
            ${answersHtml}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Phieu_Bai_Tap_${studentName || 'HocSinh'}_Lop${studentGrade}_KemDapan.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-left max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-1.5">
            <span>Trình Tạo Phiếu Bài Tập Word (.docx)</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-slate-500 text-xs">Xuất đề thi in ấn offline kèm sẵn đáp án và giải thích chi tiết ở trang cuối</p>
        </div>
      </div>

      {/* Weak topics alert recommendations */}
      {weakTopics && weakTopics.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Gợi ý tạo phiếu theo Lỗ hổng kiến thức của con:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map((wt, i) => (
              <span key={i} className="bg-white text-amber-900 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200 shadow-sm">
                ⚠️ {wt.topic} ({wt.errorCount} lần sai)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chọn chủ đề ôn tập
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">🌟 Tổng hợp toàn bộ kiến thức</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Số lượng câu hỏi
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 câu (Bài ôn nhanh 10 phút)</option>
            <option value={10}>10 câu (Phiếu bài tập tiêu chuẩn)</option>
            <option value={20}>20 câu (Đề kiểm tra cuối tuần)</option>
          </select>
        </div>

        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="flex items-center space-x-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={includeExplanations}
              onChange={(e) => setIncludeExplanations(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-xs font-bold text-slate-800">Kèm Lời giải chi tiết trang cuối</span>
          </label>
        </div>
      </div>

      {/* Trigger button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center space-x-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Tự động chèn ngắt trang (Page Break) chuẩn trang cuối</span>
        </div>

        <button
          type="button"
          onClick={handleGenerateWordDoc}
          disabled={exporting}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center space-x-2"
        >
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tạo tệp Word...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Tải Xuống Phiếu Bài Tập (.doc) 🚀</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
