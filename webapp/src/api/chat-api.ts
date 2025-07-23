import { api } from './index';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {EventSource} from 'eventsource'
import { BiEvents } from '../mixpanel';

// Types
export interface Assistant {
  id: string;
  name: string;
  label: string;
  devAssistant: boolean;
  exampleQuestions: string[];
}

export interface Thread {
  id: string;
  name: string | null;
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

// Filter and pagination types
export interface ChatsFilter {
  userIds?: string[];
  fromCreatedAt?: string;
  toCreatedAt?: string;
}

export enum ChatsOrderBy {
  CREATED_AT_ASC = 'createdAt_asc',
  CREATED_AT_DESC = 'createdAt_desc',
  MESSAGE_COUNT_ASC = 'messageCount_asc',
  MESSAGE_COUNT_DESC = 'messageCount_desc',
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface GetChatsByFilterDto {
  filter?: ChatsFilter;
  orderBy?: ChatsOrderBy;
  pagination?: PaginationOptions;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ThreadWithCount extends Thread {
  _count?: {
    Messages: number;
  };
  User?: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

// List all assistants
export async function listAssistants(): Promise<Assistant[]> {
  const res = await api.get('/api/chat/assistants');
  return res.data;
}

// Create a new chat (thread)
export async function createChat(dto: CreateChatDto): Promise<Thread> {
  BiEvents.createChat(dto.assistantId);
  const res = await api.post('/api/chat', dto);
  return res.data;
}

// List all chats (threads) for the current user (guarded)
export async function listChatsByUserId(): Promise<Thread[]> {
  const res = await api.get('/api/chat/user');
  return res.data;
}

// Get chats by filter with pagination and ordering
export async function getChatsByFilter(dto: GetChatsByFilterDto): Promise<PaginatedResponse<ThreadWithCount>> {
  const res = await api.post('/api/chat/filter', dto);
  return res.data;
}

// Create a new message in a thread
export async function createMessage(dto: CreateMessageDto): Promise<Message> {
  const res = await api.post('/api/chat/message', dto);
  return res.data;
}

// Delete a chat
export async function deleteChat(threadId: string): Promise<Thread> {
  const res = await api.delete(`/api/chat/${threadId}`);
  return res.data;
}

// Get messages for a thread
export async function getChatMessages(threadId: string): Promise<Message[]> {
  const res = await api.get(`/api/chat/thread/${threadId}/messages`);
  return res.data;
}

// Generate a name for a chat
export async function generateChatName(
  threadId: string,
): Promise<{ name:string }> {
  const res = await api.post(`/api/chat/thread/${threadId}/generate-name`);
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
            case 'error':
                // Handle structured errors from SSE
                if (parsedData.code === 'SUBSCRIPTION_REQUIRED') {
                    const error = new Error(parsedData.value);
                    (error as any).response = {
                        data: {
                            code: 'SUBSCRIPTION_REQUIRED',
                            message: parsedData.value,
                            details: parsedData.details
                        }
                    };
                    eventHandlers.onError?.(error);
                } else {
                    eventHandlers.onError?.(new Error(parsedData.value));
                }
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

export function useQ_getChatsByFilter(dto: GetChatsByFilterDto) {
  return useQuery({
    queryKey: ['chats', 'filter', dto],
    queryFn: () => getChatsByFilter(dto),
    enabled: !!dto, // Only run query if dto is provided
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

export function useM_deleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
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

export function useM_generateChatName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateChatName,
    onSuccess: () => {
      // Invalidate the user's chat list to refetch with the new name
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}