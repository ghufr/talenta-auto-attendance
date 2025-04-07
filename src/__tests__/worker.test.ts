import { talentaApi } from '@/api/talenta.api';
import worker from '@/worker';

const createMockResponse = (data: any) =>
	({
		json: () => Promise.resolve(data),
		ok: true,
		status: 200,
	} as Response);

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
(global as any).fetch = mockFetch;

jest.mock('../services/logger', () => ({
	log: jest.fn(),
	sendTelegramNotification: jest.fn(),
}));

jest.mock('@/api/talenta.api', () => ({
	talentaApi: {
		attendance: {
			clockIn: jest.fn(),
		},
		auth: {
			refreshToken: jest.fn(),
		},
	},
}));

describe('Worker', () => {
	let mockEnv: any;
	let mockEvent: any;
	let mockCtx: any;

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks();

		// Reset fetch mock default behavior
		mockFetch.mockImplementation(() => Promise.resolve(createMockResponse({})));

		// Mock environment variables
		mockEnv = {
			CRONS: [
				['0 9 * * *', 'clock_in', '-6.123456', '106.123456'],
				['0 17 * * *', 'clock_out', '-6.123456', '106.123456'],
			],
			USER_ID: '123',
			HOUR_ID: '456',
			ORGANIZATION_ID: '789',
			TALENTA: {
				get: jest.fn(),
				put: jest.fn(),
			},
			CLIENT_ID: 'test-client-id',
			CODE_VERIFIER: 'test-code-verifier',
			TELEGRAM_BOT_TOKEN: 'test-bot-token',
			TELEGRAM_CHAT_ID: 'test-chat-id',
		};

		// Mock event object
		mockEvent = {
			scheduledTime: '2024-03-25T09:00:00.000Z',
			cron: '0 9 * * *',
		};

		// Mock context object
		mockCtx = {};
	});

	describe('scheduled', () => {
		it('should handle invalid cron pattern', async () => {
			mockEvent.cron = 'invalid-cron';

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(talentaApi.attendance.clockIn).not.toHaveBeenCalled();
			expect(mockEnv.TALENTA.get).not.toHaveBeenCalled();
		});

		it('should handle missing access token', async () => {
			mockEnv.TALENTA.get.mockResolvedValue(null);

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(talentaApi.attendance.clockIn).not.toHaveBeenCalled();
			expect(mockEnv.TALENTA.get).toHaveBeenCalledWith('ACCESS_TOKEN');
		});

		it('should post clock in successfully and refresh token', async () => {
			const mockAccessToken = 'test-access-token';
			const mockRefreshToken = 'test-refresh-token';
			const mockAttendanceResponse = { success: true };
			const mockTokenResponse = {
				access_token: 'new-access-token',
				refresh_token: 'new-refresh-token',
			};

			mockEnv.TALENTA.get.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
			(talentaApi.attendance.clockIn as jest.Mock).mockResolvedValue(mockAttendanceResponse);
			(talentaApi.auth.refreshToken as jest.Mock).mockResolvedValue(mockTokenResponse);

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			// Verify attendance request
			expect(talentaApi.attendance.clockIn).toHaveBeenCalledWith({
				organizationId: mockEnv.ORGANIZATION_ID,
				accessToken: mockAccessToken,
				data: expect.objectContaining({
					event_type: 'clock_in',
					latitude: '-6.123456',
					longitude: '106.123456',
				}),
			});

			// Verify token refresh request
			expect(talentaApi.auth.refreshToken).toHaveBeenCalledWith({
				client_id: mockEnv.CLIENT_ID,
				code_verifier: mockEnv.CODE_VERIFIER,
				grant_type: 'refresh_token',
				refresh_token: mockRefreshToken,
			});

			// Verify new tokens were stored
			expect(mockEnv.TALENTA.put).toHaveBeenCalledWith('ACCESS_TOKEN', mockTokenResponse.access_token);
			expect(mockEnv.TALENTA.put).toHaveBeenCalledWith('REFRESH_TOKEN', mockTokenResponse.refresh_token);
		});

		it('should handle attendance failure and send error notification', async () => {
			const mockAccessToken = 'test-access-token';
			const error = new Error('Attendance failed');

			mockEnv.TALENTA.get.mockResolvedValue(mockAccessToken);
			(talentaApi.attendance.clockIn as jest.Mock).mockRejectedValue(error);

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(talentaApi.attendance.clockIn).toHaveBeenCalled();
			expect(mockEnv.TALENTA.put).not.toHaveBeenCalled();
		});

		it('should handle token refresh failure', async () => {
			const mockAccessToken = 'test-access-token';
			const mockRefreshToken = 'test-refresh-token';
			const mockAttendanceResponse = { success: true };
			const error = new Error('Token refresh failed');

			mockEnv.TALENTA.get.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);
			(talentaApi.attendance.clockIn as jest.Mock).mockResolvedValue(mockAttendanceResponse);
			(talentaApi.auth.refreshToken as jest.Mock).mockRejectedValue(error);

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(talentaApi.attendance.clockIn).toHaveBeenCalled();
			expect(talentaApi.auth.refreshToken).toHaveBeenCalled();
			expect(mockEnv.TALENTA.put).not.toHaveBeenCalled();
		});
	});
});
