#!/usr/bin/env node
const { createRealtimeSession } = require('./sessionManager');
const { startChatLoop } = require('./chatLoop');

(async () => {
  try {
    const sessionContext = await createRealtimeSession();
    console.log(`Realtime session created. ID: ${sessionContext.session?.id || 'unknown'}`);
    console.log('OpenAI realtime endpoint is ready. Chat을 시작합니다.');

    await startChatLoop(sessionContext);

    // Future enhancement: plug MicStreamer/StreamPlayer here to support voice input/output
    // once realtime audio streaming is required by Vercel deployment.
  } catch (error) {
    console.error('Failed to start 신한라이프 사주 봇:', error);
    process.exitCode = 1;
  }
})();
