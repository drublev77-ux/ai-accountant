import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { createChatCompletion } from '@/sdk/api-clients/OpenAIGPTChat';
import type {
  CreateChatCompletionResponses,
  CreateChatCompletionErrors,
} from '@/sdk/api-clients/OpenAIGPTChat/types.gen';

/**
 * Chat message interface for conversation history
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Input interface for chat completion requests
 */
export interface ChatCompletionInput {
  /**
   * Conversation history including system prompts, user messages, and assistant responses
   */
  messages: ChatMessage[];
  /**
   * Model name - defaults to "MaaS_4.1" if not provided
   */
  model?: string;
}

/**
 * Successful chat completion response
 */
export interface ChatCompletionResponse {
  /**
   * Unique identifier for the chat completion
   */
  id: string;
  /**
   * The AI assistant's response message
   */
  message: string;
  /**
   * Reasoning content from the AI, if available
   */
  reasoningContent?: string | null;
  /**
   * Why the model stopped generating tokens
   */
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter' | 'null';
  /**
   * Usage statistics for token consumption
   */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
  /**
   * Model used for the completion
   */
  model: string;
  /**
   * Unix timestamp (in seconds) of when the completion was created
   */
  createdAt: number;
}

/**
 * React hook for OpenAI GPT Chat completions
 *
 * Use Cases:
 * - Financial Assistant Chat: Conversational AI for accounting questions and financial advice
 * - Tax Calculation & Recommendations: AI-powered tax estimates based on financial data
 * - Smart Financial Recommendations: AI-driven suggestions for tax optimization and planning
 * - Report Analysis: Analyze transaction history and generate insights
 *
 * @example
 * ```tsx
 * const chat = useChatCompletion();
 *
 * const handleAskQuestion = async () => {
 *   await chat.mutateAsync({
 *     messages: [
 *       { role: 'system', content: 'You are a helpful financial assistant.' },
 *       { role: 'user', content: 'What are the tax implications of selling stocks?' }
 *     ]
 *   });
 * };
 *
 * // With transaction context
 * const handleAnalyzeTransactions = async (transactions: string) => {
 *   await chat.mutateAsync({
 *     messages: [
 *       { role: 'system', content: 'You are a financial advisor analyzing transaction data.' },
 *       { role: 'user', content: `Analyze these transactions: ${transactions}` }
 *     ]
 *   });
 * };
 * ```
 */
export function useChatCompletion(): UseMutationResult<
  ChatCompletionResponse,
  Error,
  ChatCompletionInput
> {
  return useMutation({
    mutationFn: async (input: ChatCompletionInput): Promise<ChatCompletionResponse> => {
      // Validate input
      if (!input.messages || input.messages.length === 0) {
        throw new Error('At least one message is required');
      }

      // Validate each message has required fields
      for (const message of input.messages) {
        if (!message.role || !message.content) {
          throw new Error('Each message must have a role and content');
        }
        if (!['system', 'user', 'assistant'].includes(message.role)) {
          throw new Error('Message role must be "system", "user", or "assistant"');
        }
      }

      const response = await createChatCompletion({
        body: {
          model: input.model || 'MaaS_4.1',
          messages: input.messages,
        },
        headers: {
          'X-CREAO-API-NAME': 'OpenAIGPTChat',
          'X-CREAO-API-PATH': '/v1/ai/zWwyutGgvEGWwzSa/chat/completions',
          'X-CREAO-API-ID': '688a0b64dc79a2533460892c',
        },
      });

      if (response.error) {
        const errorMessage =
          typeof response.error === 'object' && response.error !== null && 'message' in response.error
            ? String((response.error as { message?: unknown }).message)
            : 'Chat completion failed';
        throw new Error(errorMessage);
      }

      if (!response.data) {
        throw new Error('No response data returned from chat completion');
      }

      const data = response.data as CreateChatCompletionResponses[200];

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No completion choices returned');
      }

      const firstChoice = data.choices[0];

      if (!firstChoice.message || !firstChoice.message.content) {
        throw new Error('No message content in completion response');
      }

      return {
        id: data.id,
        message: firstChoice.message.content,
        reasoningContent: firstChoice.message.reasoning_content,
        finishReason: firstChoice.finish_reason,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
          reasoningTokens: data.usage.completion_tokens_details?.reasoning_tokens,
        },
        model: data.model,
        createdAt: data.created,
      };
    },
  });
}

/**
 * Helper hook for building multi-turn conversations
 *
 * This hook helps manage conversation state for chat interfaces
 *
 * @example
 * ```tsx
 * const conversation = useConversation();
 * const chat = useChatCompletion();
 *
 * const handleSendMessage = async (userMessage: string) => {
 *   conversation.addMessage({ role: 'user', content: userMessage });
 *
 *   const response = await chat.mutateAsync({
 *     messages: conversation.messages
 *   });
 *
 *   conversation.addMessage({ role: 'assistant', content: response.message });
 * };
 * ```
 */
export function useConversation(systemPrompt?: string) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    return systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }]
      : [];
  });

  const addMessage = React.useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = React.useCallback(() => {
    setMessages(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []);
  }, [systemPrompt]);

  const updateLastMessage = React.useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      return updated;
    });
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    updateLastMessage,
    setMessages,
  };
}

// Re-export React for the helper hook
import * as React from 'react';
