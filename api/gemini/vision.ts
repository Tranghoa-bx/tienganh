import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      apiKey: apiKey
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
          return res.status(200).json(parsed);
        }
      } catch (err: any) {
        console.error(`Lỗi Camera OCR với model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    return res.status(500).json({
      error: "Lỗi gọi AI",
      message: lastError?.message || "429 RESOURCE_EXHAUSTED"
    });

  } catch (error: any) {
    console.error("Lỗi Serverless /api/gemini/vision:", error);
    return res.status(500).json({
      error: "Lỗi máy chủ",
      message: error?.message || "Có lỗi xảy ra trên hệ thống."
    });
  }
}
