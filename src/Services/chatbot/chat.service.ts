// src/Services/chatbot/chat.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ChatResponse {
  response: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

@Injectable()
export class ChatService {
  private readonly pythonEndpoint =
    process.env.PYTHON_CHAT_URL || 'http://127.0.0.1:8000/chat';
  private conversationHistory: ChatMessage[] = [];

  constructor(private readonly http: HttpService) {}

  /**
   * Envía un mensaje al servidor Python y mantiene historial
   */
  async sendMessage(message: string): Promise<ChatResponse> {
    if (!message?.trim()) {
      throw new HttpException(
        { error: 'El mensaje no puede estar vacío.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Agregar mensaje del usuario al historial
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      // Enviar a Python
      const response = await firstValueFrom(
        this.http.post<{ response: string }>(this.pythonEndpoint, { message }),
      );

      const assistantMessage = response.data.response;

      // Agregar respuesta del asistente al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      });

      return { response: assistantMessage };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error en comunicación con Python:', errorMessage);

      throw new HttpException(
        { error: 'No se pudo conectar con el asistente.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtiene el historial de conversación
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Limpia el historial
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}
