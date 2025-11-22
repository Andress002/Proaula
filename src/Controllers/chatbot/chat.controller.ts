// src/Controllers/chatbot/chat.controller.ts
import { Controller, Post, Get, Delete, Body } from '@nestjs/common';
import {
  ChatService,
  ChatResponse,
  ChatMessage,
} from '../../Services/chatbot/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Envía un mensaje al chatbot
   * POST /chat/message
   * Body: { message: string }
   */
  @Post('message')
  async sendMessage(@Body('message') message: string): Promise<ChatResponse> {
    return await this.chatService.sendMessage(message);
  }

  /**
   * Obtiene el historial de conversación
   * GET /chat/history
   */
  @Get('history')
  getHistory(): ChatMessage[] {
    return this.chatService.getHistory();
  }

  /**
   * Limpia el historial de conversación
   * DELETE /chat/history
   */
  @Delete('history')
  clearHistory(): { message: string } {
    this.chatService.clearHistory();
    return { message: 'Historial borrado correctamente.' };
  }
}
