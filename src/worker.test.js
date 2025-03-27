import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import worker from './worker.js';

// Set up Jest's globals
globalThis.jest = jest;

// Mock fetch with a proper promise chain
global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({}),
	})
);

describe('Worker', () => {
	let mockEnv;
	let mockEvent;
	let mockCtx;

	beforeEach(() => {
		// Reset all mocks before each test
		jest.clearAllMocks();

		// Reset fetch mock default behavior
		global.fetch.mockImplementation(() =>
			Promise.resolve({
				json: () => Promise.resolve({}),
			})
		);

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
		it('should skip if no eventType is found', async () => {
			mockEvent.cron = 'invalid-cron';
			const consoleSpy = jest.spyOn(console, 'log');

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(consoleSpy).toHaveBeenCalledWith('SKIP: no eventType');
			expect(fetch).not.toHaveBeenCalled();
		});

		it('should post clock in successfully', async () => {
			const mockAccessToken = 'test-access-token';
			const mockResponse = { success: true };

			mockEnv.TALENTA.get.mockResolvedValue(mockAccessToken);
			global.fetch.mockResolvedValueOnce({
				json: () => Promise.resolve(mockResponse),
			});

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining('/attendance_clocks'),
				expect.objectContaining({
					method: 'POST',
					headers: expect.any(Object),
					body: expect.any(String),
				})
			);

			const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
			expect(requestBody).toMatchObject({
				event_type: 'clock_in',
				organisation_user_id: mockEnv.USER_ID,
				attendance_office_hour_id: mockEnv.HOUR_ID,
			});
		});

		it('should handle clock in failure and refresh token', async () => {
			const mockAccessToken = 'test-access-token';
			const mockRefreshToken = 'test-refresh-token';
			const mockTokenResponse = {
				access_token: 'new-access-token',
				refresh_token: 'new-refresh-token',
			};

			// Mock initial clock in failure
			mockEnv.TALENTA.get.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);

			global.fetch.mockRejectedValueOnce(new Error('Clock in failed')).mockResolvedValueOnce({
				json: () => Promise.resolve(mockTokenResponse),
			});

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			// Verify token refresh was attempted
			expect(fetch).toHaveBeenCalledWith(
				'https://account.mekari.com/auth/oauth2/token',
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining(mockRefreshToken),
				})
			);

			// Verify new tokens were stored
			expect(mockEnv.TALENTA.put).toHaveBeenCalledWith('ACCESS_TOKEN', mockTokenResponse.access_token);
			expect(mockEnv.TALENTA.put).toHaveBeenCalledWith('REFRESH_TOKEN', mockTokenResponse.refresh_token);
		});

		it('should skip if token refresh fails', async () => {
			const mockAccessToken = 'test-access-token';
			const mockRefreshToken = 'test-refresh-token';
			const consoleSpy = jest.spyOn(console, 'log');

			mockEnv.TALENTA.get.mockResolvedValueOnce(mockAccessToken).mockResolvedValueOnce(mockRefreshToken);

			global.fetch.mockRejectedValueOnce(new Error('Clock in failed')).mockResolvedValueOnce({
				json: () => Promise.resolve({}),
			});

			await worker.scheduled(mockEvent, mockEnv, mockCtx);

			expect(consoleSpy).toHaveBeenCalledWith('SKIP: no token');
			expect(mockEnv.TALENTA.put).not.toHaveBeenCalled();
		});
	});
});
