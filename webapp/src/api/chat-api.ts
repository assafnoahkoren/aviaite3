import { api } from './index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Assistant {
  id: string;
  name: string;
  label: string;
}

export interface Thread {
  id: string;
  userId: string;
  assistantId: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatDto {
  userId: string;
  assistantId: string;
  profileId: string;
}

// List all assistants
export async function listAssistants(): Promise<Assistant[]> {
  const res = await api.get('/api/chat/assistants');
  return res.data;
}

// Create a new chat (thread)
export async function createChat(dto: CreateChatDto): Promise<Thread> {
  const res = await api.post('/api/chat', dto);
  return res.data;
}

// List all chats (threads) for a user
export async function listChatsByUserId(userId: string): Promise<Thread[]> {
  const res = await api.get(`/api/chat/user/${userId}`);
  return res.data;
}

// React Query hooks
export function useQ_listAssistants() {
  return useQuery({
    queryKey: ['assistants'],
    queryFn: listAssistants,
  });
}

export function useQ_listChatsByUserId(userId: string) {
  return useQuery({
    queryKey: ['chats', userId],
    queryFn: () => listChatsByUserId(userId),
    enabled: !!userId,
  });
}

export function useM_createChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChat,
    onSuccess: (_data, variables) => {
      // Invalidate the user's chat list after creating a chat
      queryClient.invalidateQueries({ queryKey: ['chats', variables.userId] });
    },
  });
} 