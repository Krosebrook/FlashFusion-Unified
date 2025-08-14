import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useConversations, useConversationSubscription } from "@/hooks/useConversations";
import { Plus, MessageCircle, Users, Calendar, Search } from "lucide-react";
import type { CreateConversationRequest } from "@/types/conversation";

const ConversationsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newConversation, setNewConversation] = useState<CreateConversationRequest>({
    title: '',
    summary: '',
  });

  const {
    conversations,
    isLoading,
    error,
    createConversation,
    deleteConversation,
    markAsRead,
    isCreating,
  } = useConversations();

  const { isConnected } = useConversationSubscription();

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversation.title.trim()) {
      createConversation(newConversation);
      setNewConversation({ title: '', summary: '' });
      setShowCreateForm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading conversations: {error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">
            Manage your FlashFusion conversations
            {isConnected && (
              <span className="ml-2 inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Live
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md"
        />
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Create New Conversation</h2>
          <form onSubmit={handleCreateConversation} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={newConversation.title}
                onChange={(e) => setNewConversation(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Enter conversation title"
                required
              />
            </div>
            <div>
              <label htmlFor="summary" className="block text-sm font-medium mb-1">
                Summary
              </label>
              <textarea
                id="summary"
                value={newConversation.summary}
                onChange={(e) => setNewConversation(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Brief description of the conversation"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Conversation'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Conversations List */}
      <div className="space-y-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first conversation to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Conversation
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{conversation.title}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {conversation.participant_count}
                    </span>
                  </div>
                  
                  {conversation.summary && (
                    <p className="text-muted-foreground mb-3">{conversation.summary}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created {formatDate(conversation.created_at)}
                    </span>
                    <span>
                      Updated {formatDate(conversation.updated_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(conversation.id)}
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this conversation?')) {
                        deleteConversation(conversation.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;