const dotenv = require('dotenv');

export function loadConfig() {
  dotenv.config();
}

export function getConfig() {
  return {
    Environment: process.env.NODE_ENV || 'production',
    OpenAI: {
      APIKey: process.env.OPENAI_API_Key || '',
      Model: process.env.GPT_AI_MODEL || 'gpt-4.1-mini'
    }
  }
}
