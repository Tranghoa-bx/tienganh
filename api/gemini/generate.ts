import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      apiKey: apiKey
    });

    // Danh sách Fallback chuẩn theo AI_INSTRUCTIONS.md:
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
          return res.status(200).json({ text: response.text, model: modelName });
        }
      } catch (err: any) {
        console.error(`Lỗi API với model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    // Nếu thất bại toàn bộ danh sách model fallback -> trả về nguyên văn lỗi
    return res.status(500).json({
      error: "Lỗi gọi AI",
      message: lastError?.message || "429 RESOURCE_EXHAUSTED"
    });

  } catch (error: any) {
    console.error("Lỗi Serverless /api/gemini/generate:", error);
    return res.status(500).json({
      error: "Lỗi máy chủ",
      message: error?.message || "Có lỗi xảy ra trên hệ thống."
    });
  }
}
