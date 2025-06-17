const dotenv = require('dotenv');

function loadConfig() {
  dotenv.config();
}

function getConfig() {
  return {
    Environment: process.env.NODE_ENV || 'production',
    OpenAI: {
      APIKey: process.env.OPENAI_API_Key || '',
      Model: process.env.GPT_AI_MODEL || 'gpt-4.1-mini'
    }
  }
}

module.exports = {
  loadConfig,
  getConfig
}