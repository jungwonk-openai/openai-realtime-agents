# Saju Bot

Sample code for a fortune-telling voice bot using OpenAI Realtime API.

Contents:
- `agentConfigs/saju.ts`: Realtime agent configuration with `get_todays_fortune` tool and Korean prompt.
- `agentConfigs/index.ts`: Scenario map exposing `saju` agent set.
- `api/todays_fortune/route.ts`: Next.js route bridging to the Python script.
- `todays_fortune.py`: Helper script invoking the external fortune API.
- `hooks/useRealtimeSession.ts`: Realtime session hook with model `gpt-4o-realtime-preview-2025-08-12`.
- `App.tsx`: Example app component with server VAD threshold `0.5`.

Run lint to validate:
```bash
npm test  # (no tests defined)
npm run lint
```
