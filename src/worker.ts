import { talentaApi } from '@/api/talenta.api';
import { log, sendTelegramNotification } from '@/services/logger';

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		const date = new Date(event.scheduledTime);
		const localeDateString = date.toLocaleDateString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			timeZone: 'Asia/Jakarta',
		});
		const isNotificationEnabled = env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID;

		log('Starting scheduled attendance process', { cron: event.cron, date: localeDateString });

		let eventType: string | undefined;
		try {
			const [_, type, latitude, longitude] = env.CRONS.find((cron) => cron[0] === event.cron) ?? [];
			eventType = type;
			if (!eventType) throw new Error('No matching event type found for cron pattern');
			if (!latitude || !longitude) throw new Error('Invalid coordinates found in cron pattern');

			log('Processing attendance', { eventType, latitude, longitude });

			const accessToken = await env.TALENTA.get('ACCESS_TOKEN');
			if (!accessToken) throw new Error('No access token found');

			const data = {
				latitude,
				longitude,
				event_type: eventType,
				notes: '',
				selfie_photo: null,
				organisation_user_id: env.USER_ID,
				source: 'mobileweb',
				schedule_date: localeDateString,
				attendance_office_hour_id: env.HOUR_ID,
			};

			log('Sending attendance request', data);
			const response = await talentaApi.attendance.clockIn({
				organizationId: env.ORGANIZATION_ID,
				accessToken,
				data,
			});

			log('Attendance response received', response);

			const refresh_token = await env.TALENTA.get('REFRESH_TOKEN');
			if (!refresh_token) throw new Error('No refresh token found');

			log('Refreshing access token');
			const tokenData = {
				grant_type: 'refresh_token',
				client_id: env.CLIENT_ID,
				refresh_token,
				code_verifier: env.CODE_VERIFIER,
			};

			const token = await talentaApi.auth.refreshToken(tokenData);

			if (!token.success && !token.data?.access_token) throw new Error('No access token received from refresh');

			await env.TALENTA.put('ACCESS_TOKEN', token.data.access_token);
			await env.TALENTA.put('REFRESH_TOKEN', token.data.refresh_token);
			log('Token successfully refreshed and stored');

			// Send success notification
			if (isNotificationEnabled) {
				await sendTelegramNotification(
					env.TELEGRAM_BOT_TOKEN,
					env.TELEGRAM_CHAT_ID,
					`✅ Attendance Success\n\nType: ${eventType}\nDate: ${localeDateString}`
				);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			log('Error in scheduled function', error);

			// Send error notification
			if (isNotificationEnabled) {
				await sendTelegramNotification(
					env.TELEGRAM_BOT_TOKEN,
					env.TELEGRAM_CHAT_ID,
					`❌ Attendance Failed\n\nType: ${eventType || 'Unknown'}\nDate: ${localeDateString}\nError: ${errorMessage}`
				);
			}
		}
	},
};
