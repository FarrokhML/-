import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MushairaResponse } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Schema for structured output
const mushairaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValid: {
      type: Type.BOOLEAN,
      description: "Whether the user's input is a valid Persian verse matching the rules.",
    },
    message: {
      type: Type.STRING,
      description: "Feedback message to the user in Persian. Explain why if invalid.",
    },
    botVerse: {
      type: Type.STRING,
      description: "The next verse recited by the AI. Null if user input was invalid.",
    },
    botVersePoet: {
      type: Type.STRING,
      description: "Name of the poet of the bot's verse.",
    },
    nextLetter: {
      type: Type.STRING,
      description: "The last letter of the bot's verse, which the user must use to start.",
    },
    isWinner: {
      type: Type.BOOLEAN,
      description: "True if the bot cannot continue (rare) or admits defeat.",
    },
  },
  required: ["isValid", "message"],
};

export const startNewGame = async (): Promise<MushairaResponse> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    ما می‌خواهیم بازی مشاعره را شروع کنیم. 
    لطفاً یک بیت شعر زیبای فارسی از یک شاعر معروف (مثل حافظ، سعدی، مولانا) انتخاب کن و بازی را شروع کن.
    پاسخ تو باید در فرمت JSON باشد.
    مقادیر:
    isValid: true
    message: "سلام! بیایید مشاعره کنیم. من شروع می‌کنم."
    botVerse: (بیت شعر)
    botVersePoet: (نام شاعر)
    nextLetter: (حرف آخر بیت تو)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mushairaSchema,
        systemInstruction: "تو یک استاد ادبیات فارسی و عاشق مشاعره هستی. با لحنی مودبانه و ادیبانه صحبت کن.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as MushairaResponse;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
};

export const submitVerse = async (
  userVerse: string,
  requiredLetter: string | null
): Promise<MushairaResponse> => {
  const model = "gemini-2.5-flash";
  
  let instruction = `
    کاربر یک بیت شعر ارسال کرده است: "${userVerse}".
    قوانین:
    1. بررسی کن آیا این یک بیت یا مصرع معنادار فارسی است؟
    2. اگر 'requiredLetter' مقدار دارد (${requiredLetter || "ندارد"}), بررسی کن آیا بیت کاربر با حرف '${requiredLetter}' شروع شده است؟ (آ و ا یکی هستند).
    3. اگر نامعتبر است، isValid: false و دلیل را در message بنویس.
    4. اگر معتبر است، isValid: true. سپس خودت یک بیت شعر بگو که با حرف آخر بیت کاربر شروع شود.
    5. حرف آخر بیت خودت را در nextLetter بگذار.
    6. نام شاعر را در botVersePoet بگذار.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: instruction,
      config: {
        responseMimeType: "application/json",
        responseSchema: mushairaSchema,
        systemInstruction: "تو یک استاد سخت‌گیر اما مهربان مشاعره هستی. فقط ابیات واقعی فارسی را بپذیر. اگر کاربر تقلب کرد یا جمله معمولی گفت، قبول نکن.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as MushairaResponse;
  } catch (error) {
    console.error("Error submitting verse:", error);
    throw error;
  }
};