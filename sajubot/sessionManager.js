const fs = require('fs/promises');
const path = require('path');
const OpenAI = require('openai');

const DEFAULT_REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17';

async function loadSystemPrompt() {
  const promptPath = path.resolve(__dirname, 'prompts.txt');
  return fs.readFile(promptPath, 'utf8');
}

async function createRealtimeSession() {
  const systemPrompt = await loadSystemPrompt();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.client.fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
    body: JSON.stringify({
      model: DEFAULT_REALTIME_MODEL,
      instructions: systemPrompt,
      // Voice support can be added by including `voice` and `modalities` fields here.
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create realtime session: ${response.status} ${errorText}`);
  }

  const session = await response.json();

  return {
    client,
    session,
    systemPrompt,
    model: session?.model || DEFAULT_REALTIME_MODEL,
  };
}

module.exports = {
  createRealtimeSession,
};
