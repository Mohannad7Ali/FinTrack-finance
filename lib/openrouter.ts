import { OpenAI } from 'openai';
if (!process.env.OPENROUTER_API_KEY) {
	throw new Error('Missing OPENROUTER_API_KEY environment variable');
}
export const openrouter = new OpenAI({
	apiKey: process.env.OPENROUTER_API_KEY,
	baseURL: 'https://openrouter.ai/api/v1',
	defaultHeaders: {
		'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://fintrack.app',
		'X-Title': 'FinTrack',
	},
});
