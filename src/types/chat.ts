export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isPrivate?: boolean;
  recipientId?: string;
}

export interface ChatThread {
  id: string;
  messages: ChatMessage[];
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}