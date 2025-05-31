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
  openaiThreadId: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatDto {
  userId: string;
  assistantId: string;
  profileId: string;
}

export interface CreateMessageDto {
  threadId: string;
  userId: string;
  content: string;
}

export interface Message {
  id: string;
  threadId: string;
  userId: string;
  content: string;
  createdAt: string;
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

// Create a new message in a thread
export async function createMessage(dto: CreateMessageDto): Promise<Message> {
  const res = await api.post('/api/chat/message', dto);
  return res.data;
}

// Get messages for a thread
export async function getChatMessages(threadId: string): Promise<Message[]> {
  const res = await api.get(`/api/chat/thread/${threadId}/messages`);
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

export function useM_createMessage() {
  return useMutation({
    mutationFn: createMessage,
  });
}

export function useQ_getChatMessages(threadId: string) {
  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => getChatMessages(threadId),
    enabled: !!threadId,
    // never refetch automatically
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}