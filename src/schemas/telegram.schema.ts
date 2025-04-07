import { z } from 'zod';

// Message related schemas
export const SendMessageSchema = z.object({
	chat_id: z.string(),
	text: z.string(),
	parse_mode: z.literal('HTML'),
});

// Response schemas
export const TelegramResponseSchema = z.object({
	ok: z.boolean(),
	result: z.object({
		message_id: z.number(),
		date: z.number(),
		text: z.string(),
	}),
});

export const ErrorResponseSchema = z.object({
	ok: z.literal(false),
	error_code: z.number(),
	description: z.string(),
});

// Export inferred types
export type SendMessage = z.infer<typeof SendMessageSchema>;
export type TelegramResponse = z.infer<typeof TelegramResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
