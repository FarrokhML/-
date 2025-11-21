export enum Sender {
  USER = 'USER',
  BOT = 'BOT'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  poet?: string; // Optional author of the poem
  isError?: boolean; // If validation failed
  timestamp: number;
}

export interface GameState {
  isPlaying: boolean;
  requiredLetter: string | null; // The letter the user must start with
  score: number;
  loading: boolean;
  messages: Message[];
  gameOver: boolean;
}

export interface MushairaResponse {
  isValid: boolean;
  message: string; // Feedback to user
  botVerse?: string; // The verse bot recites
  botVersePoet?: string; // Poet name
  nextLetter?: string; // The letter user must use next
  isWinner?: boolean; // If bot gives up (rare) or user wins
}