import { TelegramResponseSchema } from '@/schemas/telegram.schema';
import axios from 'axios';

// API Configuration
const TELEGRAM_API_CONFIG = {
	baseURL: 'https://api.telegram.org',
	headers: {
		'Content-Type': 'application/json',
	},
};

// API Client
const telegramClient = axios.create(TELEGRAM_API_CONFIG);

// API Endpoints
export const telegramApi = {
	messages: {
		send: async (params: { token: string; chatId: string; message: string }) => {
			const { token, chatId, message } = params;
			const response = await telegramClient.post(`/bot${token}/sendMessage`, {
				chat_id: chatId,
				text: message,
				parse_mode: 'HTML',
			});
			return TelegramResponseSchema.parse(response.data);
		},
	},
};
