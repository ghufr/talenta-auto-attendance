import { telegramApi } from '@/api/telegram.api';

export const log = (message: string, data: any = null): void => {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}`;
	console.log(logMessage);
	if (data) {
		console.log('Data:', JSON.stringify(data, null, 2));
	}
};

export const sendTelegramNotification = async (token: string, chatId: string, message: string): Promise<void> => {
	try {
		await telegramApi.messages.send({ token, chatId, message });
		log(`Telegram notification sent successfully`);
	} catch (error) {
		log(`Failed to send Telegram notification`, error);
	}
};
