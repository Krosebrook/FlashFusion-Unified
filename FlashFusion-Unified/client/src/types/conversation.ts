export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  summary?: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;
}

export interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
  participant_count: number;
  unread_count?: number;
}

export interface CreateConversationRequest {
  title: string;
  summary?: string;
  participant_ids?: string[];
}

export interface UpdateConversationRequest {
  title?: string;
  summary?: string;
}