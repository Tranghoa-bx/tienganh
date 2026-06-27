import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = req.body || {};
    const clientApiKey = req.headers['x-api-key'] as string;
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Thiếu dữ liệu văn bản" });
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(200).json({
        ipa: "[Vui lòng nhập API Key]",
        vietnameseGuide: "[Xem mẹo phát âm]",
        translation: "Vui lòng cấu hình Gemini API Key để mở khóa phân tích phát âm và quy luật tách âm AI.",
        syllables: "-",
        phonicsDecoding: null
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey
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
- BẮT BUỘC trả về JSON thuần hợp lệ khớp schema trên. Không thêm lời dẫn hay khối mã markdown \`\`\`json.`;

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
          return res.status(200).json(parsed);
        }
      } catch (err: any) {
        console.error(`Lỗi API ngữ âm với model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    return res.status(500).json({
      error: "Lỗi gọi AI",
      message: lastError?.message || "429 RESOURCE_EXHAUSTED"
    });

  } catch (error: any) {
    console.error("Lỗi Serverless /api/gemini/ipa:", error);
    return res.status(500).json({
      error: "Lỗi máy chủ",
      message: error?.message || "Có lỗi xảy ra trên hệ thống."
    });
  }
}
