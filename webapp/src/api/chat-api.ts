import { api } from './index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {EventSource} from 'eventsource'

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
  assistantId: string;
  profileId: string;
}

export interface CreateMessageDto {
  threadId: string;
  content: string;
}

export interface Message {
  id: string;
  threadId: string;
  userId: string;
  content: string;
  createdAt: string;
  role: 'user' | 'assistant';
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

// List all chats (threads) for the current user (guarded)
export async function listChatsByUserId(): Promise<Thread[]> {
  const res = await api.get('/api/chat/user');
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

// Stream chat with Server-Sent Events
export function streamChat(threadId: string, eventHandlers: any) {
    const token = localStorage.getItem('auth_token');
    const baseURL = import.meta.env.VITE_SERVER_URL;
    const eventSource = new EventSource(`${baseURL}/api/chat/stream/${threadId}`, {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${token}`,
          },
        }),
    });

    eventSource.onmessage = (event: MessageEvent) => {
        const parsedData = JSON.parse(event.data);
        const { type, value } = parsedData;

        switch (type) {
            case 'textCreated':
                eventHandlers.onTextCreated?.(value);
                break;
            case 'textDelta':
                eventHandlers.onTextDelta?.(value);
                break;
            case 'toolCallCreated':
                eventHandlers.onToolCallCreated?.(value);
                break;
            case 'toolCallDelta':
                eventHandlers.onToolCallDelta?.(value);
                break;
            case 'end':
                eventHandlers.onEnd?.(value);
                eventSource.close();
                break;
            default:
                console.warn('Unhandled event type:', type);
        }
    };

    eventSource.onerror = (error: Event) => {
        eventHandlers.onError?.(error);
        eventSource.close();
    };

    return () => {
        eventSource.close();
    };
}

// React Query hooks
export function useQ_listAssistants() {
  return useQuery({
    queryKey: ['assistants'],
    queryFn: listAssistants,
  });
}

export function useQ_listChatsByUserId() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: listChatsByUserId,
  });
}

export function useM_createChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChat,
    onSuccess: (_data) => {
      // Invalidate the user's chat list after creating a chat
      queryClient.invalidateQueries({ queryKey: ['chats'] });
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