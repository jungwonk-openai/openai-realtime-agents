const readline = require('readline/promises');
const { stdin, stdout } = require('node:process');
const {
  FORTUNE_TOOL_DEFINITION,
  callFortuneTool,
} = require('./fortuneTool');

const DEFAULT_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini';

async function startChatLoop({ client, systemPrompt }) {
  // Replace readline with MicStreamer/StreamPlayer implementations to handle
  // realtime voice input/output when deploying an audio-capable client.
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const messages = [{ role: 'system', content: systemPrompt }];

  console.log('신한라이프 사주 봇이 준비됐습니다. 종료하려면 exit를 입력하세요.');

  try {
    // Initial greeting from the model
    const greeting = await createModelResponse(client, messages);
    if (greeting) {
      console.log(greeting);
    }

    while (true) {
      const userInput = await rl.question('> ');
      if (userInput.trim().toLowerCase() === 'exit') {
        break;
      }

      messages.push({ role: 'user', content: userInput });
      const reply = await createModelResponse(client, messages);

      if (reply) {
        console.log(reply);
      }
    }
  } finally {
    rl.close();
  }
}

async function createModelResponse(client, messages) {
  const completion = await client.chat.completions.create({
    model: DEFAULT_CHAT_MODEL,
    messages,
    tools: [FORTUNE_TOOL_DEFINITION],
    tool_choice: 'auto',
  });

  const [choice] = completion.choices;
  const message = choice.message;
  messages.push(message);

  if (message.tool_calls?.length) {
    for (const toolCall of message.tool_calls) {
      const { id, function: func } = toolCall;
      if (func.name !== 'fetch_todays_fortune') {
        messages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify({ error: `Unknown tool: ${func.name}` }),
        });
        continue;
      }

      let args;
      try {
        args = JSON.parse(func.arguments || '{}');
      } catch (error) {
        messages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify({ error: `Invalid arguments: ${error.message}` }),
        });
        continue;
      }

      try {
        const result = await callFortuneTool(args);
        messages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        messages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify({ error: error.message }),
        });
      }
    }

    return createModelResponse(client, messages);
  }

  return extractMessageText(message);
}

function extractMessageText(message) {
  if (!message) {
    return '';
  }

  if (typeof message.content === 'string') {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => part?.text)
      .filter(Boolean)
      .join('\n');
  }

  return '';
}

module.exports = {
  startChatLoop,
};
