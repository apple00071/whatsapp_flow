export interface Message {
  id: string;
  to: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
}

export interface BulkMessage {
  to: string;
  message: string;
  status?: string;
} 