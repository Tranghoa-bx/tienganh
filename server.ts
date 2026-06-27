import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Route for Gemini Generate
  app.post("/api/gemini/generate", async (req: any, res: any) => {
    try {
      const { prompt, systemInstruction } = req.body || {};
      const clientApiKey = req.headers['x-api-key'] as string;
      const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Thiếu API Key",
          message: "Vui lòng cấu hình Gemini API Key trong menu Cài đặt để sử dụng tính năng này."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
      let lastError: any = null;

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined
          });

          if (response && response.text) {
            return res.json({ text: response.text, model: modelName });
          }
        } catch (err: any) {
          console.error(`Lỗi với model ${modelName}:`, err?.message || err);
          lastError = err;
        }
      }

      res.status(500).json({
        error: "Lỗi gọi AI",
        message: lastError?.message || "429 RESOURCE_EXHAUSTED"
      });

    } catch (error: any) {
      console.error("Lỗi API Gemini:", error);
      res.status(500).json({
        error: "Lỗi máy chủ",
        message: error?.message || "Có lỗi xảy ra trên hệ thống."
      });
    }
  });

  // API Route for Phonics Transcription & Syllable Decoding Rules
  app.post("/api/gemini/ipa", async (req: any, res: any) => {
    try {
      const { text } = req.body || {};
      const clientApiKey = req.headers['x-api-key'] as string;
      const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Thiếu dữ liệu văn bản" });
      }

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          ipa: "[Vui lòng thêm API Key]",
          vietnameseGuide: "[Xem mẹo phát âm]",
          translation: "Vui lòng cấu hình Gemini API Key để mở khóa phân tích phát âm và quy luật tách âm.",
          syllables: "-",
          phonicsDecoding: null
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `Phân tích ngữ âm và quy luật đánh vần cho từ hoặc câu tiếng Anh sau: "${text}"`;
      const systemInstruction = `Bạn là một chuyên gia ngữ âm tiếng Anh chuyên dạy học sinh trung học cơ sở (THCS) tại Việt Nam.
Hãy phân tích từ/câu được cung cấp và trả về một đối tượng JSON chính xác theo cấu trúc sau:
{
  "ipa": "Phiên âm quốc tế chuẩn IPA (VD: /ɪnˈvaɪ.rən.mənt/)",
  "vietnameseGuide": "Cách đọc bồi dễ hiểu có gạch nối (VD: in-vai-rơn-mơn)",
  "translation": "Nghĩa tiếng Việt chuẩn THCS",
  "syllables": "Các âm tiết phân tách bằng gạch ngang (VD: en-vi-ron-ment, nếu là câu dài ghi 'Mẫu câu')",
  "phonicsDecoding": {
    "brokenSyllables": ["en", "vi", "ron", "ment"],
    "mainStressIndex": 2,
    "readingSteps": [
      "Bước 1 (Âm quan trọng nhất - Trọng âm): Đọc nhấn cao giọng âm tiết thứ 2 'vi' đọc như 'vái'",
      "Bước 2: Ghép âm đầu 'en' đọc lướt nhẹ nhàng xuống giọng 'ìn'",
      "Bước 3: Ghép các âm đuôi 'ron-ment' đọc lướt nhanh 'rơn-mờn'",
      "Bước 4: Ghép hoàn chỉnh đọc liền mạch: ìn - VÁI - rơn - mờn"
    ],
    "spellingRules": [
      "Quy tắc mặt chữ 1: Nhìn vào đuôi -ment biết ngay đây là hậu tố danh từ không nhận trọng âm.",
      "Quy tắc mặt chữ 2: Chữ 'i' khi nhận trọng âm đứng trước một phụ âm đơn thường phát âm thành /aɪ/ (ai)."
    ],
    "ipaDecodingRules": {
      "ipaBrokenSyllables": ["ɪn", "vaɪ", "rən", "mənt"],
      "ipaStressRule": "Dấu trọng âm chính ˈ đứng ngay trước ký hiệu vaɪ. Khi đọc phải lên giọng cao như thêm dấu sắc (vái). Các âm tiết không có dấu trọng âm ở trước đọc lướt nhẹ xuống giọng như thêm dấu huyền/ngang (ìn, rơn, mờn).",
      "ipaReadingGuide": "Nhìn vào phiên âm IPA /ɪnˈvaɪ.rən.mənt/, tách thành từng phần theo dấu chấm (.): /ɪn/ - /vaɪ/ - /rən/ - /mənt/. Đọc bắt đầu từ âm quan trọng có dấu phẩy trên cao ˈ đọc trước, sau đó mới ghép các âm đầu và âm đuôi vào sau."
    }
  }
}

LƯU Ý QUAN TRỌNG VỀ PHƯƠNG PHÁP TÁCH ÂM & TÁCH PHIÊN ÂM THCS:
- Nhìn vào mặt chữ hướng dẫn quy luật chi tiết, dễ hiểu để khi không có phiên âm con vẫn tự đọc được từ mới.
- Hướng dẫn quy luật tách phiên âm: bóc tách từng ký hiệu trong phiên âm (/.../), quy tắc đọc trọng âm khi thấy dấu ˈ (đọc lên giọng dấu sắc) và dấu ˌ (trọng âm phụ).
- Hướng dẫn đọc tách âm luôn luôn bắt đầu từ âm quan trọng (Trọng âm chính), đọc từng âm một rồi mới ghép lại.
- BẮT BUỘC trả về JSON thuần hợp lệ khớp schema trên. Không thêm lời dẫn hay khối mã markdown.`;

      const MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
      let lastError: any = null;

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json"
            }
          });

          if (response && response.text) {
            const parsed = JSON.parse(response.text.trim());
            return res.json(parsed);
          }
        } catch (err: any) {
          console.error(`Lỗi với model ${modelName} tại endpoint ipa:`, err?.message || err);
          lastError = err;
        }
      }

      res.status(500).json({
        error: "Lỗi gọi AI",
        message: lastError?.message || "429 RESOURCE_EXHAUSTED"
      });

    } catch (error: any) {
      console.error("Lỗi API /api/gemini/ipa:", error);
      res.status(500).json({
        error: "Lỗi máy chủ",
        message: error?.message || "Có lỗi xảy ra trên hệ thống."
      });
    }
  });

  // API Route for Vision OCR Translation
  app.post("/api/gemini/vision", async (req: any, res: any) => {
    try {
      const { imageBase64, mimeType, mode } = req.body || {};
      const clientApiKey = req.headers['x-api-key'] as string;
      const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

      if (!imageBase64) {
        return res.status(400).json({ error: "Thiếu dữ liệu ảnh đầu vào" });
      }

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Thiếu API Key",
          message: "Vui lòng cấu hình Gemini API Key trong Cài đặt để mở khóa tính năng Camera Quét & Dịch AI."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = mode === 'vi_to_en' 
        ? `Hãy quét văn bản tiếng Việt trong ảnh bài tập này, dịch chuẩn xác sang tiếng Anh THCS dễ hiểu. Đồng thời chọn ra 2 từ vựng quan trọng kèm IPA và hướng dẫn quy luật tách âm.`
        : `Hãy quét mặt chữ tiếng Anh trong ảnh bài tập này, dịch sang tiếng Việt thân thiện dễ hiểu, đồng thời giải thích cấu trúc ngữ pháp nổi bật cho học sinh mất gốc lớp 6-9.`;

      const systemInstruction = `Bạn là Cô giáo AI EnglishRoot THCS thông thái chuyên quét ảnh bài tập (OCR) và dịch thuật.
Hãy phân tích ảnh và trả về JSON chuẩn theo cấu trúc sau:
{
  "extractedText": "Văn bản gốc quét được từ hình ảnh",
  "translatedText": "Bản dịch song ngữ Anh-Việt chuẩn xác, tự nhiên",
  "grammarExplanation": "Giải thích chi tiết ngữ pháp, cấu trúc câu hoặc mẹo làm bài trong ảnh cho học sinh mất gốc",
  "keyVocabulary": [
    {
      "word": "Từ vựng nổi bật",
      "ipa": "/.../",
      "meaning": "Nghĩa tiếng Việt",
      "phonicsTip": "Hướng dẫn tách âm có quy luật nhìn mặt chữ tự đọc"
    }
  ]
}
BẮT BUỘC trả về thuần JSON hợp lệ. Không viết thêm lời dẫn hay bọc trong markdown code block.`;

      const MODELS = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
      let lastError: any = null;

      for (const modelName of MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              prompt,
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || "image/jpeg"
                }
              }
            ],
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json"
            }
          });

          if (response && response.text) {
            const parsed = JSON.parse(response.text.trim());
            return res.json(parsed);
          }
        } catch (err: any) {
          console.error(`Lỗi Camera OCR với model ${modelName}:`, err?.message || err);
          lastError = err;
        }
      }

      res.status(500).json({
        error: "Lỗi gọi AI",
        message: lastError?.message || "429 RESOURCE_EXHAUSTED"
      });

    } catch (error: any) {
      console.error("Lỗi API /api/gemini/vision:", error);
      res.status(500).json({
        error: "Lỗi máy chủ",
        message: error?.message || "Có lỗi xảy ra trên hệ thống."
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
