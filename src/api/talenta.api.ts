import { AttendanceResponseSchema, ClockData, ErrorResponseSchema, TokenData, TokenResponseSchema } from '@/schemas/talenta.schema';
import axios from 'axios';

// API Configuration
const TALENTA_API_CONFIG = {
	baseURL: 'https://api.mekari.com/internal/talenta-attendance-web/v1',
	headers: {
		accept: '*/*',
		'content-type': 'application/json',
		'cache-control': 'no-cache',
		pragma: 'no-cache',
	},
};

const ACCOUNT_API_CONFIG = {
	baseURL: 'https://account.mekari.com',
	headers: {
		accept: '*/*',
		'content-type': 'application/json',
		'cache-control': 'no-cache',
		pragma: 'no-cache',
		'accept-encoding': 'gzip',
		'user-agent': 'okhttp/4.11.0',
	},
};

// API Clients
const talentaClient = axios.create(TALENTA_API_CONFIG);
const accountClient = axios.create(ACCOUNT_API_CONFIG);

// Helper function for error handling
const handleApiError = (error: unknown) => {
	if (axios.isAxiosError(error) && error.response?.data) {
		return ErrorResponseSchema.parse(error.response.data);
	}
	throw error;
};

// API Endpoints
export const talentaApi = {
	attendance: {
		clockIn: (params: { organizationId: string; accessToken: string; data: ClockData }) => {
			const { organizationId, accessToken, data } = params;
			return talentaClient
				.post(`/organisations/${organizationId}/attendance_clocks`, data, {
					headers: {
						authorization: `Bearer ${accessToken}`,
						origin: 'https://hr.talenta.co',
						referer: 'https://hr.talenta.co/',
						'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
					},
				})
				.then((response) => AttendanceResponseSchema.safeParse(response.data))
				.catch(handleApiError);
		},
	},
	auth: {
		refreshToken: (data: TokenData) =>
			accountClient
				.post('/auth/oauth2/token', data)
				.then((response) => TokenResponseSchema.safeParse(response.data))
				.catch(handleApiError),
	},
};
