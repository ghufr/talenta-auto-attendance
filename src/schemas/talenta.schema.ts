import { z } from 'zod';

// Clock related schemas
export const ClockDataSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
	event_type: z.string(),
	notes: z.string(),
	selfie_photo: z.null(),
	organisation_user_id: z.string(),
	source: z.string(),
	schedule_date: z.string(),
	attendance_office_hour_id: z.string(),
});

export const ClockParamsSchema = z.object({
	accessToken: z.string(),
	organizationId: z.string(),
});

// Token related schemas
export const TokenDataSchema = z.object({
	grant_type: z.string(),
	client_id: z.string(),
	refresh_token: z.string(),
	code_verifier: z.string(),
});

export const ErrorResponseSchema = z
	.object({
		error: z.union([
			z.object({
				error: z.string(),
				error_description: z.string(),
			}),
			z.object({
				error_type: z.string(),
				status: z.number(),
				message: z.string(),
				data: z.object({
					latitude: z.number().optional(),
					longitude: z.number().optional(),
					schedule_date: z.string().optional(),
					description: z.string(),
					file: z.null(),
					radius: z
						.object({
							setting: z.number(),
							user: z.number(),
						})
						.optional(),
					status: z.string().optional(),
				}),
				is_portal_mode: z.boolean(),
				version: z.string(),
			}),
		]),
	})
	.catchall(z.any());

export const AttendanceResponseSchema = z
	.object({
		data: z.object({
			attributes: z.object({
				is_offline: z.boolean(),
				shift_changed: z.boolean(),
				processed_async: z.boolean(),
				event_type: z.enum(['clock_in', 'clock_out']),
				schedule_date: z.string(),
				notes: z.string(),
				approval_status: z.string(),
				source: z.string(),
				created_at: z.string(),
				updated_at: z.string(),
				location_setting_name: z.string(),
				location_name: z.string(),
				clock_time: z.string(),
				clock_date: z.string(),
				latitude: z.string(),
				longitude: z.string(),
				coordinate: z.string(),
				id: z.number(),
				organisation_user_id: z.number(),
				attendance_office_hour_id: z.number(),
			}),
			id: z.string(),
			type: z.literal('attendance_clock'),
		}),
		success: z.boolean().optional(),
	})
	.catchall(z.any());

export const TokenResponseSchema = z
	.object({
		access_token: z.string(),
		refresh_token: z.string(),
	})
	.catchall(z.any());

// Export inferred types
export type ClockData = z.infer<typeof ClockDataSchema>;
export type ClockParams = z.infer<typeof ClockParamsSchema>;
export type TokenData = z.infer<typeof TokenDataSchema>;
export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
