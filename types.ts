
export enum EmotionType {
  JOY = 'Joy',
  SADNESS = 'Sadness',
  ANGER = 'Anger',
  FEAR = 'Fear',
  SURPRISE = 'Surprise',
  NEUTRAL = 'Neutral',
  DISGUST = 'Disgust'
}

export interface EmotionScore {
  label: EmotionType;
  score: number; // 0 to 1
}

export interface AnalysisResult {
  primaryEmotion: EmotionType;
  allEmotions: EmotionScore[];
  sentiment: 'positive' | 'negative' | 'neutral';
  motivation: string;
  reflection: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult;
}

export interface MoodHistoryEntry {
  timestamp: Date;
  primaryEmotion: EmotionType;
  intensity: number;
}
