import { supabase } from './supabase';
import type {
  Conversation,
  ConversationParticipant,
  ConversationWithParticipants,
  CreateConversationRequest,
  UpdateConversationRequest,
} from '../types/conversation';

export class ConversationService {
  /**
   * Get all conversations for the current user
   */
  async getUserConversations(): Promise<ConversationWithParticipants[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          id,
          user_id,
          joined_at,
          last_read_at
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data.map(conv => ({
      ...conv,
      participants: conv.conversation_participants || [],
      participant_count: conv.conversation_participants?.length || 0,
    }));
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<ConversationWithParticipants | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          id,
          user_id,
          joined_at,
          last_read_at
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    return {
      ...data,
      participants: data.conversation_participants || [],
      participant_count: data.conversation_participants?.length || 0,
    };
  }

  /**
   * Create a new conversation
   */
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: request.title,
        summary: request.summary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    // Add additional participants if specified
    if (request.participant_ids && request.participant_ids.length > 0) {
      await this.addParticipants(data.id, request.participant_ids);
    }

    return data;
  }

  /**
   * Update a conversation
   */
  async updateConversation(
    conversationId: string,
    request: UpdateConversationRequest
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .update(request)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  /**
   * Add participants to a conversation
   */
  async addParticipants(conversationId: string, userIds: string[]): Promise<ConversationParticipant[]> {
    const participants = userIds.map(userId => ({
      conversation_id: conversationId,
      user_id: userId,
    }));

    const { data, error } = await supabase
      .from('conversation_participants')
      .insert(participants)
      .select();

    if (error) {
      throw new Error(`Failed to add participants: ${error.message}`);
    }

    return data;
  }

  /**
   * Remove a participant from a conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove participant: ${error.message}`);
    }
  }

  /**
   * Leave a conversation (remove current user)
   */
  async leaveConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    await this.removeParticipant(conversationId, user.id);
  }

  /**
   * Join a conversation
   */
  async joinConversation(conversationId: string): Promise<ConversationParticipant> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to join conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Update last read timestamp for current user in a conversation
   */
  async markAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to mark conversation as read: ${error.message}`);
    }
  }

  /**
   * Get participants of a conversation
   */
  async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('joined_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch participants: ${error.message}`);
    }

    return data;
  }

  /**
   * Subscribe to conversation changes
   */
  subscribeToConversations(callback: (payload: any) => void) {
    return supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
        },
        callback
      )
      .subscribe();
  }
}

// Export a singleton instance
export const conversationService = new ConversationService();