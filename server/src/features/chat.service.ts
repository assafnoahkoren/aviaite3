// chat.service.ts
// Service for handling chat logic

import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ENV } from '../env';

const assistants = [
	{
		id: 'asst_DBVI33JWzoqmwjT5HsyKrIcB',
		name: 'shirgal',
		label: 'Shirgal',
	},
	{
		id: 'asst_1ZN4h0qheVLr7rpqaibRiHw9',
		name: 'elal-7787',
		label: 'Elal 7787',
	},	
]

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });
  }

  async listAllAssistants() {
    // Returns a list of all assistants
    return assistants;
  }
} 