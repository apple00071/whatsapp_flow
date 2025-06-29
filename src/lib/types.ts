export interface Message {
  id: string;
  body: string;
  from: string;
  timestamp: number;
  hasMedia: boolean;
  type: string;
} 