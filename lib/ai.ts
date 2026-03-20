import OpenAI from 'openai'

export const ai = new OpenAI({
  baseURL: 'https://space.ai-builders.com/backend/v1',
  apiKey: process.env.AI_BUILDER_TOKEN!,
})
