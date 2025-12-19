
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, EmotionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeTextEmotion = async (text: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following text for emotional content: "${text}"`,
    config: {
      systemInstruction: `You are an expert NLP Emotional Intelligence Analyst and Motivational Coach. 
      Your task is to:
      1. Identify the primary emotion from the text.
      2. Score the intensity of all core emotions (Joy, Sadness, Anger, Fear, Surprise, Neutral, Disgust) on a scale of 0 to 1.
      3. Determine the overall sentiment.
      4. If the sentiment is negative or the emotion is heavy (Sadness, Anger, Fear), provide a deeply empathetic, uplifting, and motivational response that encourages the user.
      5. If the emotion is positive, share in their joy and provide a brief encouraging reflection.
      
      Respond ONLY in JSON format following the provided schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryEmotion: {
            type: Type.STRING,
            description: "The dominant emotion detected.",
          },
          allEmotions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["label", "score"]
            }
          },
          sentiment: {
            type: Type.STRING,
            enum: ["positive", "negative", "neutral"]
          },
          motivation: {
            type: Type.STRING,
            description: "An empathetic and motivational response tailored to the mood."
          },
          reflection: {
            type: Type.STRING,
            description: "A short observation about the text's tone."
          }
        },
        required: ["primaryEmotion", "allEmotions", "sentiment", "motivation", "reflection"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Analysis failed");
  }
};
