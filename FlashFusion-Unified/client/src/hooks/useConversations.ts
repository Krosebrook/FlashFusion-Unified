import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversationService';
import type {
  Conversation,
  ConversationWithParticipants,
  CreateConversationRequest,
  UpdateConversationRequest,
} from '../types/conversation';

// Query keys
const QUERY_KEYS = {
  conversations: ['conversations'],
  conversation: (id: string) => ['conversations', id],
  participants: (id: string) => ['conversations', id, 'participants'],
} as const;

/**
 * Hook for managing user's conversations
 */
export function useConversations() {
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.conversations,
    queryFn: () => conversationService.getUserConversations(),
  });

  const createConversationMutation = useMutation({
    mutationFn: (request: CreateConversationRequest) =>
      conversationService.createConversation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationRequest }) =>
      conversationService.updateConversation(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversation(data.id) });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => conversationService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });

  const joinConversationMutation = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.joinConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });

  const leaveConversationMutation = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.leaveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });

  return {
    conversations,
    isLoading,
    error,
    refetch,
    createConversation: createConversationMutation.mutate,
    updateConversation: updateConversationMutation.mutate,
    deleteConversation: deleteConversationMutation.mutate,
    joinConversation: joinConversationMutation.mutate,
    leaveConversation: leaveConversationMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    isCreating: createConversationMutation.isPending,
    isUpdating: updateConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
  };
}

/**
 * Hook for managing a specific conversation
 */
export function useConversation(conversationId: string) {
  const queryClient = useQueryClient();

  const {
    data: conversation,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.conversation(conversationId),
    queryFn: () => conversationService.getConversation(conversationId),
    enabled: !!conversationId,
  });

  const addParticipantsMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      conversationService.addParticipants(conversationId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.participants(conversationId) });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (userId: string) =>
      conversationService.removeParticipant(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.participants(conversationId) });
    },
  });

  return {
    conversation,
    isLoading,
    error,
    addParticipants: addParticipantsMutation.mutate,
    removeParticipant: removeParticipantMutation.mutate,
    isAddingParticipants: addParticipantsMutation.isPending,
    isRemovingParticipant: removeParticipantMutation.isPending,
  };
}

/**
 * Hook for real-time conversation updates
 */
export function useConversationSubscription() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const subscription = conversationService.subscribeToConversations((payload) => {
      console.log('Conversation update:', payload);
      
      // Invalidate relevant queries when data changes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
      
      if (payload.table === 'conversations' && payload.new?.id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.conversation(payload.new.id.toString()) 
        });
      }
    });

    subscription.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { isConnected };
}