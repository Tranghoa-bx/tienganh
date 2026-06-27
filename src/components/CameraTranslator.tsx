import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Volume2, Sparkles, ArrowRightLeft, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VisionOCRResponse } from '../types';

interface CameraTranslatorProps {
  apiKey: string;
}

export default function CameraTranslator({ apiKey }: CameraTranslatorProps) {
  const [mode, setMode] = useState<'en_to_vi' | 'vi_to_en'>('en_to_vi');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [ocrResult, setOcrResult] = useState<VisionOCRResponse | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg('');
    setCapturedImage(null);
    setOcrResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera error', err);
      setErrorMsg('Không thể mở Camera. Vui lòng cấp quyền truy cập Camera hoặc sử dụng nút "Tải ảnh lên".');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setOcrResult(null);
    stopCamera();

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
      analyzeImage(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Img: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({
          imageBase64: base64Img,
          mode: mode
        })
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.extractedText) {
        setOcrResult(data);
      } else {
        throw new Error(data.message || data.error || 'Nhận dạng ảnh thất bại');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(`Lỗi AI Vision: ${err.message || 'Tất cả các mô hình AI đều gặp lỗi phản hồi. Vui lòng thử lại sau.'}`);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = mode === 'en_to_vi' ? 'en-US' : 'vi-VN';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left max-w-4xl mx-auto space-y-6 p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-100">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <span>Camera Quét & Dịch Thông Minh</span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-slate-500 text-xs">Chụp ảnh bài tập, sách giáo khoa để Cô giáo AI dịch và tách âm</p>
          </div>
        </div>

        {/* Mode switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setMode('en_to_vi'); setOcrResult(null); }}
            className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1 ${
              mode === 'en_to_vi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Anh 🇬🇧</span>
            <ArrowRightLeft className="w-3 h-3" />
            <span>Việt 🇻🇳</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('vi_to_en'); setOcrResult(null); }}
            className={`px-3 py-2 rounded-lg transition-all flex items-center space-x-1 ${
              mode === 'vi_to_en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Việt 🇻🇳</span>
            <ArrowRightLeft className="w-3 h-3" />
            <span>Anh 🇬🇧</span>
          </button>
        </div>
      </div>

      {/* Camera / Viewport Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Camera or Upload preview */}
        <div className="space-y-4">
          <div className="relative bg-slate-900 rounded-2xl aspect-video overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-200/80 shadow-inner">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain bg-black" />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Camera className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
                <p className="text-slate-400 text-xs max-w-xs mx-auto">
                  Hãy căn bài tập hoặc từ vựng vào giữa màn hình để AI quét rõ nét nhất
                </p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Spinner Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold animate-pulse">Cô giáo AI đang đọc mặt chữ & dịch...</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Mở Camera Quét Ngay</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCaptureFrame}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md animate-pulse transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Chụp & Bóc Tách Văn Bản 📸</span>
              </button>
            )}

            <label className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2 shrink-0">
              <Upload className="w-4 h-4" />
              <span>Tải ảnh từ máy</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {(capturedImage || isCameraActive) && (
              <button
                type="button"
                onClick={() => { stopCamera(); setCapturedImage(null); setOcrResult(null); setErrorMsg(''); }}
                className="py-3 px-3 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors"
                title="Đặt lại"
              >
                ×
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start space-x-2.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right: Results Display */}
        <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl min-h-[300px] flex flex-col justify-between space-y-4">
          {ocrResult ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Extracted vs Translated box */}
              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Văn bản gốc nhận dạng</span>
                    <button onClick={() => handleSpeak(ocrResult.extractedText)} className="text-blue-600 hover:text-blue-800 p-1">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 italic">"{ocrResult.extractedText}"</p>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-md space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-200 tracking-wider block">Bản Dịch Cô Giáo AI</span>
                  <p className="text-sm font-black leading-relaxed">{ocrResult.translatedText}</p>
                </div>
              </div>

              {/* Grammar explanation */}
              {ocrResult.grammarExplanation && (
                <div className="bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Giải thích ngữ pháp THCS:</span>
                  </span>
                  <p className="text-xs text-amber-900 leading-normal font-medium">{ocrResult.grammarExplanation}</p>
                </div>
              )}

              {/* Key vocabularies with Phonics Tips */}
              {ocrResult.keyVocabulary && ocrResult.keyVocabulary.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 text-indigo-600" />
                    <span>Từ vựng & Quy luật tách âm mặt chữ:</span>
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {ocrResult.keyVocabulary.map((v, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-indigo-700">{v.word}</span>
                          <span className="font-mono text-xs font-bold text-slate-400">{v.ipa}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">Nghĩa: {v.meaning}</p>
                        {v.phonicsTip && (
                          <div className="bg-indigo-50/70 p-2 rounded text-[11px] text-indigo-900 font-semibold">
                            💡 Mẹo tách âm: {v.phonicsTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 stroke-1 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Bản dịch, giải thích ngữ pháp và quy luật tách âm sẽ xuất hiện tại đây sau khi chụp ảnh.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
